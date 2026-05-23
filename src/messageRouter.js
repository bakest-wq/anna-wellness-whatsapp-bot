/**
 * Единый маршрутизатор: global intent → reset → главное меню (ДО booking FSM).
 */

const { isMainMenuButtonIntent, getGlobalResetRoute } = require("./globalIntents");
const {
  isBookingFlowActive,
  isConciergeFlowActive,
  hardResetFlow
} = require("./sessionMemory");
const { saveSession } = require("./sessionStore");

const GLOBAL_EXACT = new Set([
  "здравствуйте",
  "здравствуй",
  "привет",
  "приветствую",
  "добрый день",
  "доброе утро",
  "добрый вечер",
  "салам",
  "салем",
  "сәлем",
  "сәлеметсіз бе",
  "hello",
  "hi",
  "hey",
  "ассаламу алейкум",
  "ассалаумағалейкум",
  "assalamu aleikum",
  "главное меню",
  "меню",
  "menu",
  "басты меню",
  "назад",
  "артқа",
  "back",
  "сначала",
  "начать заново",
  "заново",
  "отмена",
  "отменить",
  "отмен",
  "help",
  "помощь",
  "стоп",
  "stop",
  "подобрать практику",
  "помочь подобрать практику",
  "практиканы таңдауға көмек"
]);

function normalizeIncomingText(text) {
  return String(text || "")
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
    .replace(/[.!?,🌿🤍✨⬅️📅📍⚠️💰🌸]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Абсолютный приоритет: приветствие, навигация, отмена, concierge-entry.
 */
function isGlobalIntent(text, options = {}) {
  const { isButton = false, buttonId, menuContext = "main" } = options;
  const t = normalizeIncomingText(text);

  if (isButton && isMainMenuButtonIntent(buttonId, t, menuContext)) {
    return true;
  }

  if (!t) return false;
  if (GLOBAL_EXACT.has(t)) return true;

  if (t.length <= 56 && /^(здравств|привет|салам|салем|сәлем|hello|hi|help|menu|меню|ассалам|отмен)/i.test(t)) {
    return true;
  }

  if (/ассаламу?\s*алейкум|assalamu?\s*aleikum/i.test(t)) return true;
  if (/(главное\s*меню|(^|\s)назад(\s|$)|(^|\s)артқа(\s|$)|сначала|подобрать\s+практик|помочь\s+подобрать|отмен)/i.test(t)) {
    return true;
  }

  return false;
}

function logSessionBeforeReset(text, session) {
  console.log("GLOBAL INTENT:", text);
  console.log(
    "SESSION BEFORE RESET:",
    JSON.stringify({
      currentFlow: session.currentFlow,
      currentStep: session.currentStep,
      waitingForTime: session.waitingForTime,
      waitingForDate: session.waitingForDate,
      waitingForPhone: session.waitingForPhone,
      selectedPractice: session.selectedPractice,
      bookingDate: session.bookingDate,
      bookingTime: session.bookingTime
    })
  );
}

function applyGlobalReset(session, chatId) {
  hardResetFlow(session);
  session.booking = null;
  session.concierge = null;
  session.waitingForTime = false;
  session.waitingForDate = false;
  session.waitingForPhone = false;
  session.pendingStep = null;
  session.menuContext = "main";
  if (chatId) {
    saveSession(chatId, session, ["globalIntentReset"]);
  }
}

function buildMainMenuOutbound(session, language) {
  const { buildMainMenuOutbound: build } = require("./greetingReset");
  return build(session, language);
}

/**
 * Жёсткий сброс + главное меню. null если не global intent.
 */
function handleGlobalIntentFirst({
  chatId,
  session,
  text,
  language,
  isButton = false,
  buttonId,
  menuContext = "main"
}) {
  const normalized = normalizeIncomingText(text);
  if (!isGlobalIntent(normalized, { isButton, buttonId, menuContext })) {
    return null;
  }

  logSessionBeforeReset(normalized, session);
  console.log("GREETING RESET BEFORE BOOKING");

  applyGlobalReset(session, chatId);

  const menuRoute = isButton
    ? getGlobalResetRoute(buttonId, normalized, menuContext)
    : null;

  const outbound = buildMainMenuOutbound(session, language);

  return {
    handled: true,
    normalized,
    outbound,
    menuRoute: menuRoute || null,
    reason: "global_intent"
  };
}

/**
 * Первый блок после chatId + text: global intent, затем «чужой» текст в booking.
 */
function runGlobalIntentGate({
  chatId,
  session,
  text,
  language,
  isButton,
  buttonId,
  menuContext
}) {
  const normalized = normalizeIncomingText(text);

  const globalResult = handleGlobalIntentFirst({
    chatId,
    session,
    text,
    language,
    isButton,
    buttonId,
    menuContext
  });
  if (globalResult) {
    return globalResult;
  }

  if (isBookingFlowActive(session) && !isButton) {
    const { isValidBookingStepInput } = require("./flowControl");
    const valid = isValidBookingStepInput(text, session, language, {
      isButton,
      buttonId,
      menuContext
    });
    if (!valid) {
      logSessionBeforeReset(normalized, session);
      console.log("UNRELATED MESSAGE DURING BOOKING — RESET");
      applyGlobalReset(session, chatId);
      const outbound = buildMainMenuOutbound(session, language);
      return {
        handled: true,
        normalized,
        outbound,
        menuRoute: null,
        reason: "unrelated_booking_message"
      };
    }
  }

  return { handled: false, normalized };
}

module.exports = {
  normalizeIncomingText,
  isGlobalIntent,
  handleGlobalIntentFirst,
  runGlobalIntentGate,
  applyGlobalReset,
  logSessionBeforeReset
};
