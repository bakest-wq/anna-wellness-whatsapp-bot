/**
 * Безопасный fallback: главное меню вместо «режима обслуживания».
 * Maintenance — только при реальных сбоях сервера / OpenAI.
 */

const { buildMainMenuOutbound } = require("./greetingReset");
const { normalizeLanguage } = require("./language");

const MAINTENANCE_RU =
  "Сейчас небольшая пауза. Напишите, пожалуйста, чуть позже — мы обязательно ответим.";
const MAINTENANCE_KZ =
  "Қазір қысқа үзіліс. Сәл кейінірек жазыңыз — міндетті түрде жауап береміз.";

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
  if (msg.includes("openai") || msg.includes("api key")) return true;
  if (err?.status === 401 || err?.status === 429 || err?.status === 503) return true;
  if (err?.code === "insufficient_quota") return true;
  return false;
}

/**
 * Maintenance только для неожиданных сбоев логики / OpenAI / сервера (не WhatsApp transport).
 */
function shouldSendMaintenanceToUser(err) {
  if (isWhatsAppDeliveryError(err)) return false;
  if (isOpenAiUnavailableError(err)) return true;
  return true;
}

function getMaintenanceMessage(language) {
  return normalizeLanguage(language) === "kz" ? MAINTENANCE_KZ : MAINTENANCE_RU;
}

function buildSafeMenuOutbound(session, language) {
  const lang = normalizeLanguage(language || session?.language);
  return buildMainMenuOutbound(session, lang);
}

module.exports = {
  MAINTENANCE_RU,
  MAINTENANCE_KZ,
  logFallbackTriggered,
  isWhatsAppDeliveryError,
  isOpenAiUnavailableError,
  shouldSendMaintenanceToUser,
  getMaintenanceMessage,
  buildSafeMenuOutbound
};
