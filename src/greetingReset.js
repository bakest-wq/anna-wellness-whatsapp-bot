/**
 * Жёсткий сброс при приветствии — ДО любого booking / waitingFor* / FSM.
 */

const { getPremiumWelcomeMessage } = require("./premiumUx");
const { hardResetFlow } = require("./sessionMemory");
const { saveSession } = require("./sessionStore");

const GREETING_EXACT = new Set([
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
  "assalamu aleikum"
]);

function normalizeGreetingInput(text) {
  return String(text || "")
    .trim()
    .toLowerCase()
    .replace(/[.!?,🌿🤍✨]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Явная проверка приветствия (как в ТЗ).
 */
function isGreetingReset(text) {
  const t = normalizeGreetingInput(text);
  if (!t) return false;
  if (GREETING_EXACT.has(t)) return true;
  if (/^(здравств|привет|салам|салем|сәлем|hello|hi|ассалам)/i.test(t) && t.length <= 40) {
    return true;
  }
  return false;
}

function buildMainMenuOutbound(session, language) {
  const reply = getPremiumWelcomeMessage(session, language);
  return {
    reply,
    messages: [{ type: "text", text: reply }],
    menuContext: "welcome_feeling",
    skipMenu: true
  };
}

/**
 * Сброс FSM + главное меню. null если не приветствие.
 */
function tryGreetingResetBeforeBooking({ chatId, session, text, language }) {
  if (!isGreetingReset(text)) return null;

  console.log("GREETING RESET BEFORE BOOKING");
  console.log("CURRENT FLOW:", session.currentFlow);
  console.log("CURRENT STEP:", session.currentStep);
  console.log("waitingForTime:", session.waitingForTime);
  console.log("INCOMING:", text);

  hardResetFlow(session);
  session.booking = null;
  session.concierge = null;
  session.menuContext = "main";

  saveSession(chatId, session, ["greetingReset"]);

  return buildMainMenuOutbound(session, language);
}

module.exports = {
  isGreetingReset,
  tryGreetingResetBeforeBooking,
  buildMainMenuOutbound,
  normalizeGreetingInput
};
