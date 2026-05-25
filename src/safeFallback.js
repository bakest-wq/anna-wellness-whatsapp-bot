/**
 * Безопасный fallback: главное меню вместо «режима обслуживания».
 * Maintenance — только при реальных сбоях сервера / OpenAI (последний резерв).
 */

const { buildMainMenuOutbound } = require("./greetingReset");
const { normalizeLanguage } = require("./language");
const { isGreetingReset, normalizeGreetingInput } = require("./greetingReset");

const MAINTENANCE_RU =
  "Сейчас небольшая пауза. Напишите, пожалуйста, чуть позже — мы обязательно ответим.";
const MAINTENANCE_KZ =
  "Қазір қысқа үзіліс. Сәл кейінірек жазыңыз — міндетті түрде жауап береміз.";

const GREETING_OR_MENU_EXACT = new Set([
  "здравствуйте",
  "здравствуй",
  "привет",
  "приветствую",
  "салам",
  "салем",
  "сәлем",
  "hello",
  "hi",
  "меню",
  "menu",
  "главное меню",
  "басты меню"
]);

function logFallbackTriggered(err, context = {}) {
  console.error("FALLBACK TRIGGERED:", err?.message || err);
  if (err?.stack) console.error(err.stack);
  if (Object.keys(context).length) {
    console.error("FALLBACK CONTEXT:", JSON.stringify(context));
  }
}

/** Ошибка доставки в WhatsApp — не повод показывать maintenance клиенту. */
function isWhatsAppDeliveryError(err) {
  const msg = String(err?.message || "").toLowerCase();
  const code = err?.code;
  if (code === "ERR_INVALID_URL" || msg.includes("invalid url")) return true;
  if (msg.includes("green api") || msg.includes("graph.facebook")) return true;
  if (err?.response?.status >= 400 && err?.response?.status < 600) return true;
  if (msg.includes("econnrefused") || msg.includes("etimedout") || msg.includes("network")) {
    return true;
  }
  return false;
}

function isOpenAiUnavailableError(err) {
  const msg = String(err?.message || "").toLowerCase();
  const code = String(err?.code || "").toLowerCase();
  if (code === "openai_unavailable" || code === "insufficient_quota") return true;
  if (msg.includes("openai") && (msg.includes("unavailable") || msg.includes("api key"))) {
    return true;
  }
  if (err?.status === 401 || err?.status === 429 || err?.status === 503) return true;
  return false;
}

/** Ошибки маршрутизации / интентов / сессии — показываем меню, не maintenance. */
function isRecoverableBotError(err) {
  if (!err) return true;
  if (isWhatsAppDeliveryError(err)) return true;

  const msg = String(err?.message || "").toLowerCase();
  const name = String(err?.name || "");

  if (
    name === "TypeError" ||
    name === "ReferenceError" ||
    name === "SyntaxError" ||
    msg.includes("cannot read propert") ||
    msg.includes("is not a function") ||
    msg.includes("is not defined")
  ) {
    return true;
  }

  if (
    msg.includes("intent") ||
    msg.includes("route") ||
    msg.includes("menu") ||
    msg.includes("session") ||
    msg.includes("booking") ||
    msg.includes("concierge") ||
    msg.includes("invalid") ||
    msg.includes("validation")
  ) {
    return true;
  }

  return false;
}

function isGreetingOrMenuInteraction(text) {
  const normalized = normalizeGreetingInput(text);
  if (!normalized) return false;
  if (GREETING_OR_MENU_EXACT.has(normalized)) return true;
  if (isGreetingReset(text)) return true;
  if (/^(здравств|привет|салам|салем|сәлем|hello|hi|menu|меню)/i.test(normalized)) {
    return true;
  }
  return false;
}

/**
 * Maintenance только для OpenAI/инфра — никогда для обычных ошибок приложения.
 */
function shouldSendMaintenanceToUser(err, context = {}) {
  if (isWhatsAppDeliveryError(err)) return false;
  if (context.incomingText && isGreetingOrMenuInteraction(context.incomingText)) return false;
  if (context.forceMenu === true) return false;
  if (isOpenAiUnavailableError(err)) return true;
  if (isRecoverableBotError(err)) return false;
  return false;
}

function getMaintenanceMessage(language) {
  return normalizeLanguage(language) === "kz" ? MAINTENANCE_KZ : MAINTENANCE_RU;
}

function buildSafeMenuOutbound(session, language) {
  const lang = normalizeLanguage(language || session?.language);
  return buildMainMenuOutbound(session, lang);
}

/**
 * Единая стратегия восстановления: сначала меню; maintenance — последний резерв.
 */
function resolveWebhookRecoveryPlan(err, session, language, options = {}) {
  const incomingText = options.incomingText || "";
  const lang = normalizeLanguage(language || session?.language);
  const menuOutbound = buildSafeMenuOutbound(session, lang);
  const forceMenu =
    options.forceMenu === true ||
    isGreetingOrMenuInteraction(incomingText) ||
    (isRecoverableBotError(err) && !isOpenAiUnavailableError(err));

  return {
    menuOutbound,
    sendMaintenance: !forceMenu && shouldSendMaintenanceToUser(err, {
      incomingText,
      forceMenu
    }),
    forceMenu
  };
}

module.exports = {
  MAINTENANCE_RU,
  MAINTENANCE_KZ,
  logFallbackTriggered,
  isWhatsAppDeliveryError,
  isOpenAiUnavailableError,
  isRecoverableBotError,
  isGreetingOrMenuInteraction,
  shouldSendMaintenanceToUser,
  getMaintenanceMessage,
  buildSafeMenuOutbound,
  resolveWebhookRecoveryPlan
};
