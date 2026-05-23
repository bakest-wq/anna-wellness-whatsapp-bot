/**
 * Единый маршрутизатор входящих сообщений.
 * Порядок: normalize → global intent → reset/menu → (далее language, booking…)
 */

const { isValidBookingStepInput } = require("./flowControl");
const { isMainMenuButtonIntent, getGlobalResetRoute } = require("./globalIntents");
const { resetConversationState } = require("./flowState");
const {
  isBookingFlowActive,
  isConciergeFlowActive
} = require("./sessionMemory");

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
  "back",
  "сначала",
  "начать заново",
  "заново",
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
    .trim()
    .toLowerCase()
    .replace(/[.!?,🌿🤍✨]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Глобальный intent — всегда сбрасывает активный FSM.
 */
function isGlobalIntent(text, options = {}) {
  const { isButton = false, buttonId, menuContext = "main" } = options;
  const t = normalizeIncomingText(text);

  if (isButton && isMainMenuButtonIntent(buttonId, t, menuContext)) {
    return true;
  }

  if (!t) return false;
  if (GLOBAL_EXACT.has(t)) return true;

  if (t.length <= 48 && /^(здравств|привет|салам|салем|сәлем|hello|hi|help|menu|меню|ассалам)/i.test(t)) {
    return true;
  }

  if (/ассаламу?\s*алейкум|assalamu?\s*aleikum/i.test(t)) return true;
  if (/(главное\s*меню|назад|сначала|подобрать\s+практик|помочь\s+подобрать)/i.test(t)) {
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
  resetConversationState(session, chatId);
  session.currentFlow = null;
  session.currentStep = null;
  session.booking = null;
  session.concierge = null;
  session.waitingForTime = false;
  session.waitingForDate = false;
  session.waitingForPhone = false;
  session.pendingStep = null;
}

/**
 * Шаг 1–3: normalize + global intent + reset + main menu.
 * @returns {{ handled: boolean, outbound?: object, normalized: string, menuRoute?: string|null }}
 */
function runGlobalIntentGate({ chatId, session, text, language, isButton, buttonId, menuContext }) {
  const normalized = normalizeIncomingText(text);

  const inActiveFsm =
    isBookingFlowActive(session) ||
    isConciergeFlowActive(session) ||
    Boolean(session.waitingForTime || session.waitingForDate);

  const isGlobal = isGlobalIntent(normalized, { isButton, buttonId, menuContext });

  let unrelatedDuringBooking = false;
  if (inActiveFsm && isBookingFlowActive(session) && !isButton && !isGlobal) {
    const valid = isValidBookingStepInput(normalized, session, language, {
      isButton,
      buttonId,
      menuContext
    });
    unrelatedDuringBooking = !valid;
  }

  if (!isGlobal && !unrelatedDuringBooking) {
    return { handled: false, normalized };
  }

  logSessionBeforeReset(normalized, session);
  console.log("GREETING RESET BEFORE BOOKING");

  applyGlobalReset(session, chatId);

  const menuRoute = isButton
    ? getGlobalResetRoute(buttonId, normalized, menuContext)
    : null;

  const { buildMainMenuOutbound } = require("./greetingReset");
  const outbound = buildMainMenuOutbound(session, language);

  return {
    handled: true,
    normalized,
    outbound,
    menuRoute: menuRoute || null,
    reason: isGlobal ? "global_intent" : "unrelated_booking_message"
  };
}

module.exports = {
  normalizeIncomingText,
  isGlobalIntent,
  runGlobalIntentGate,
  applyGlobalReset,
  logSessionBeforeReset
};
