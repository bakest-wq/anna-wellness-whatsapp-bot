const { isCancellation } = require("../validators");
const { isConciergeFlowActive } = require("../sessionMemory");
const { recommendPractice } = require("./recommendationEngine");
const {
  EMOTIONS,
  OUTCOMES,
  CARD_ACTIONS,
  PRACTICE_ID_TO_ROUTE
} = require("./constants");
const {
  getEmotionQuestion,
  getOutcomeQuestion,
  getEmotionTransition,
  getMatchingTransition,
  buildRecommendationCard
} = require("./messages");

function initConcierge(language) {
  return {
    active: true,
    step: "emotion",
    emotion: null,
    outcome: null,
    practiceId: null,
    alternatives: [],
    language,
    startedAt: Date.now()
  };
}

function findByButtonOrIndex(list, text, buttonId, backIndex) {
  if (buttonId) {
    const byBtn = list.find((item) => item.buttonId === buttonId);
    if (byBtn) return byBtn.id;
    if (buttonId === "btn_concierge_back") return "back";
  }

  const raw = String(text || "").trim();
  const digit = raw.match(/^([0-9]+)[️⃣]?\s*$/u);
  if (digit) {
    const n = Number(digit[1]);
    if (n === backIndex) return "back";
    const item = list[n - 1];
    return item?.id || null;
  }

  const norm = raw.toLowerCase();
  for (const item of list) {
    if (
      norm.includes(item.labelRu.toLowerCase()) ||
      norm.includes(item.labelKz.toLowerCase())
    ) {
      return item.id;
    }
  }

  return null;
}

function startConciergeOutbound(language) {
  const text = getEmotionQuestion(language);
  return {
    reply: text,
    messages: [{ type: "text", text }],
    skipMenu: false,
    menuContext: "concierge_emotion",
    conciergeTyping: true
  };
}

/**
 * @returns {{ handled: boolean, outbound?: object, action?: string, practiceId?: string }}
 */
function ensureConciergeMirror(session, language) {
  if (session.concierge?.active) return session.concierge;
  session.concierge = initConcierge(language);
  session.concierge.emotion = session.emotionalState;
  session.concierge.outcome = session.desiredOutcome;
  session.concierge.practiceId = session.recommendedPractice;
  session.concierge.step = session.currentStep || "emotion";
  return session.concierge;
}

function persistConciergeToSession(session, concierge) {
  session.currentFlow = "concierge";
  session.currentStep = concierge.step;
  session.emotionalState = concierge.emotion;
  session.desiredOutcome = concierge.outcome;
  session.recommendedPractice = concierge.practiceId;
  if (concierge.practiceId) session.lastPracticeId = concierge.practiceId;
}

function processConciergeMessage(session, text, language, options = {}) {
  if (!isConciergeFlowActive(session) && !session.concierge?.active) {
    return { handled: false };
  }

  const concierge = ensureConciergeMirror(session, language);
  const lang = language === "kz" ? "kz" : "ru";

  if (isCancellation(text)) {
    session.concierge = null;
    return {
      handled: true,
      outbound: {
        reply:
          lang === "kz"
            ? "Әрине 🌿 Консьерж тоқтатылды. Қалаған уақытта қайта жаза аласыз."
            : "Конечно 🌿 Остановила подбор. Когда захотите — снова рядом, без спешки 🌿",
        messages: [],
        skipMenu: false,
        menuContext: "main"
      }
    };
  }

  if (concierge.step === "emotion") {
    const emotionId = findByButtonOrIndex(EMOTIONS, text, options.buttonId, EMOTIONS.length + 1);
    if (emotionId === "back") {
      session.concierge = null;
      return {
        handled: true,
        outbound: {
          reply: null,
          messages: [],
          skipMenu: false,
          menuContext: "main"
        }
      };
    }
    if (!emotionId) {
      return {
        handled: true,
        outbound: {
          reply: getEmotionQuestion(lang),
          skipMenu: false,
          menuContext: "concierge_emotion"
        }
      };
    }

    concierge.emotion = emotionId;
    concierge.step = "outcome";
    persistConciergeToSession(session, concierge);
    const reply = `${getEmotionTransition(lang)}\n\n${getOutcomeQuestion(lang)}`;
    return {
      handled: true,
      outbound: {
        reply,
        messages: [{ type: "text", text: reply }],
        skipMenu: false,
        menuContext: "concierge_outcome",
        conciergeTyping: true
      }
    };
  }

  if (concierge.step === "outcome") {
    const outcomeId = findByButtonOrIndex(OUTCOMES, text, options.buttonId, OUTCOMES.length + 1);
    if (outcomeId === "back") {
      concierge.step = "emotion";
      concierge.emotion = null;
      return {
        handled: true,
        outbound: {
          reply: getEmotionQuestion(lang),
          skipMenu: false,
          menuContext: "concierge_emotion"
        }
      };
    }
    if (!outcomeId) {
      return {
        handled: true,
        outbound: {
          reply: getOutcomeQuestion(lang),
          skipMenu: false,
          menuContext: "concierge_outcome"
        }
      };
    }

    concierge.outcome = outcomeId;
    const match = recommendPractice(concierge.emotion, outcomeId);
    concierge.practiceId = match.practiceId;
    concierge.alternatives = match.alternatives;
    concierge.step = "result";
    persistConciergeToSession(session, concierge);

    const reply = `${getMatchingTransition(lang)}\n\n${buildRecommendationCard(lang, match.practiceId)}`;
    return {
      handled: true,
      outbound: {
        reply,
        messages: [{ type: "text", text: reply }],
        skipMenu: false,
        menuContext: "concierge_card",
        conciergeTyping: true
      }
    };
  }

  if (concierge.step === "result") {
    const actionId = findByButtonOrIndex(CARD_ACTIONS, text, options.buttonId, 0);
    const practiceId = concierge.practiceId;

    if (actionId === "detail" || options.buttonId === "btn_concierge_detail") {
      const route = PRACTICE_ID_TO_ROUTE[practiceId];
      session.concierge = null;
      session.lastPracticeId = practiceId;
      return { handled: true, action: "practice_detail", route, practiceId };
    }

    if (actionId === "book" || options.buttonId === "btn_concierge_book") {
      session.concierge = null;
      return { handled: true, action: "book", practiceId };
    }

    if (actionId === "other" || options.buttonId === "btn_concierge_other") {
      session.concierge = null;
      return { handled: true, action: "other_practices" };
    }

    if (/^[1-3]$/.test(String(text).trim()) || /^[1-3][️⃣]?$/u.test(String(text).trim())) {
      const n = Number(String(text).trim()[0]);
      const fakeAction = CARD_ACTIONS[n - 1]?.id;
      if (fakeAction) {
        return processConciergeMessage(session, "", language, {
          buttonId: CARD_ACTIONS[n - 1].buttonId
        });
      }
    }

    return {
      handled: true,
      outbound: {
        reply: buildRecommendationCard(lang, practiceId),
        skipMenu: false,
        menuContext: "concierge_card"
      }
    };
  }

  return { handled: false };
}

module.exports = {
  initConcierge,
  startConciergeOutbound,
  processConciergeMessage
};
