/**
 * Действия после AI-рекомендации: 1 подробнее · 2 запись · 3 другой вариант.
 */

const { PRACTICE_ID_TO_ROUTE } = require("./concierge/constants");
const { CARD_ACTIONS } = require("./concierge/constants");
const { buildRecommendationCard } = require("./concierge/messages");
const {
  buildAlternativeRecommendationOutbound,
  RECOMMEND_ACTIONS
} = require("./premiumUx");

function isInRecommendationFlow(session, menuContext = "main") {
  if (session?.recommendationFlow === true) return true;
  if (menuContext === "recommendation_card") return true;
  if (
    session?.currentFlow === "concierge" &&
    (session?.currentStep === "result" || session?.concierge?.step === "result")
  ) {
    return true;
  }
  return false;
}

/**
 * @returns {'detail'|'book'|'alt'|null}
 */
function parseRecommendationAction(text, buttonId) {
  if (buttonId) {
    if (buttonId === "btn_concierge_detail") return "detail";
    if (buttonId === "btn_concierge_book") return "book";
    if (buttonId === "btn_concierge_other") return "alt";
    const card = CARD_ACTIONS.find((c) => c.buttonId === buttonId);
    if (card?.id) return card.id;
  }

  const raw = String(text || "").trim();
  const norm = raw
    .toLowerCase()
    .replace(/^[\s0-9️⃣]+/u, "")
    .replace(/\s+/g, " ");

  if (/^[1][️⃣]?\s*$/u.test(raw) || /^1$/.test(raw)) return "detail";
  if (/^[2][️⃣]?\s*$/u.test(raw) || /^2$/.test(raw)) return "book";
  if (/^[3][️⃣]?\s*$/u.test(raw) || /^3$/.test(raw)) return "alt";

  if (/подробнее|узнать подробнее|толығырақ|толығырақ/i.test(norm)) return "detail";
  if (
    /записаться|мягко записаться|жазылу|жазыл/i.test(norm) ||
    /запись/i.test(norm)
  ) {
    return "book";
  }
  if (/другой вариант|другие практик|басқа нұсқа|посмотреть другой/i.test(norm)) {
    return "alt";
  }

  return null;
}

function clearRecommendationFlow(session) {
  session.recommendationFlow = false;
}

function getRecommendationFallbackOutbound(session, language) {
  const lang = language === "kz" ? "kz" : "ru";
  const hint =
    lang === "kz"
      ? "Түсінемін 🌿 Төмендегі нұсқалардың бірін жіберіңіз:\n\n"
      : "Понимаю 🌿 Можно выбрать один из вариантов ниже:\n\n";
  return {
    reply: hint + (RECOMMEND_ACTIONS[lang] || RECOMMEND_ACTIONS.ru),
    messages: [
      {
        type: "text",
        text: hint + (RECOMMEND_ACTIONS[lang] || RECOMMEND_ACTIONS.ru)
      }
    ],
    menuContext: "recommendation_card",
    skipMenu: true
  };
}

/**
 * @param {object} session
 * @param {'detail'|'book'|'alt'} action
 * @param {string} language
 * @param {{ startBooking: Function, wrapOutbound: Function, getRouteReply: Function }} deps
 */
function handleRecommendationAction(session, action, language, deps) {
  const practiceId =
    session.recommendedPractice ||
    session.concierge?.practiceId ||
    session.lastPracticeId;

  if (action === "detail") {
    if (!practiceId) {
      return getRecommendationFallbackOutbound(session, language);
    }
    const route = PRACTICE_ID_TO_ROUTE[practiceId];
    session.lastPracticeId = practiceId;
    const cardText = buildRecommendationCard(language, practiceId);
    return {
      reply: cardText,
      messages: [{ type: "text", text: cardText }],
      menuContext: "after_practice_detail",
      skipMenu: true
    };
  }

  if (action === "book") {
    if (!practiceId) {
      return getRecommendationFallbackOutbound(session, language);
    }
    clearRecommendationFlow(session);
    session.concierge = null;
    const outbound = deps.startBookingFromRecommendation(session, language, practiceId);
    return outbound;
  }

  if (action === "alt") {
    const outbound = buildAlternativeRecommendationOutbound(session, language);
    session.recommendationFlow = true;
    session.menuContext = "recommendation_card";
    if (session.concierge) {
      session.concierge.step = "result";
      session.concierge.practiceId = session.recommendedPractice;
    }
    return outbound;
  }

  return getRecommendationFallbackOutbound(session, language);
}

/**
 * @returns {object|null} outbound or null if not in recommendation flow
 */
function tryRecommendationAction(session, incomingText, language, menuContext, options, deps) {
  if (!isInRecommendationFlow(session, menuContext)) return null;

  console.log("RECOMMENDATION ACTION:", incomingText);

  const action = parseRecommendationAction(
    incomingText,
    options.buttonId
  );

  if (!action) {
    console.log("RECOMMENDATION ACTION: no match → fallback menu");
    return getRecommendationFallbackOutbound(session, language);
  }

  console.log("RECOMMENDATION ACTION: resolved →", action);
  return handleRecommendationAction(session, action, language, deps);
}

module.exports = {
  isInRecommendationFlow,
  parseRecommendationAction,
  handleRecommendationAction,
  tryRecommendationAction,
  clearRecommendationFlow,
  getRecommendationFallbackOutbound
};
