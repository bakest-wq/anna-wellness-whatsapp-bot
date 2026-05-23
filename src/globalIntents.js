/**
 * Глобальные intent'ы — ВСЕГДА выше booking/concierge FSM.
 * Приоритет: global → deep link (сайт) → active flow.
 */

const GREETING_PATTERNS = [
  /^(здравствуйте|здравствуй|привет|приветствую|доброго\s+времени)\b/i,
  /^(добрый\s+(день|утро|вечер)|доброе\s+утро)\b/i,
  /^(hello|hi|hey|good\s+(morning|afternoon|evening))\b/i,
  /^(сәлем|салем|салам|сәлеметсіз\s+бе)\b/i,
  /^(salam|salem)\b/i,
  /^(ассалаумағалейкум|ассаламу\s*алейкум|ассалаумалейкум)\b/i,
  /^(assalamu?\s*aleikum)\b/i
];

const NAV_RESET_PATTERNS =
  /^(главное\s*меню|меню|menu|басты\s*меню|назад|back|сначала|начать\s+заново|с\s+начала|заново|reset|restart|стоп|stop)$/i;

const CONCIERGE_RESET_PATTERN =
  /(помочь\s+подобрать\s+практик\w*|подобрать\s+практик\w*|практиканы\s+таңдауға\s+көмек)/i;

/** ID кнопок главного меню WhatsApp */
const MAIN_MENU_BUTTON_IDS = new Set([
  "btn_concierge",
  "btn_price",
  "btn_booking",
  "btn_address",
  "btn_contra",
  "btn_practices",
  "btn_practices_more",
  "btn_session",
  "btn_back"
]);

const BUTTON_ID_TO_ROUTE = {
  btn_concierge: "concierge",
  btn_price: "price",
  btn_booking: "booking",
  btn_address: "address",
  btn_contra: "contraindications",
  btn_practices: "practices",
  btn_practices_more: "practices",
  btn_session: "session",
  btn_back: "back"
};

function normalizeText(text) {
  return String(text || "")
    .trim()
    .replace(/\s+/g, " ");
}

function isGreetingText(text) {
  const t = normalizeText(text);
  if (!t) return false;
  if (GREETING_PATTERNS.some((re) => re.test(t))) return true;
  if (t.length <= 56 && /^(привет|здравств|сәлем|салем|салам|hello|hi|salam|ассалам)/i.test(t)) {
    return true;
  }
  if (/ассаламу?\s*алейкум|assalamu?\s*aleikum/i.test(t)) return true;
  return false;
}

function isNavResetText(text) {
  return NAV_RESET_PATTERNS.test(normalizeText(text));
}

function isConciergeEntryReset(text) {
  return CONCIERGE_RESET_PATTERN.test(normalizeText(text));
}

/**
 * Клик по кнопке главного меню (не ответ на шаг записи).
 */
function isMainMenuButtonIntent(buttonId, _text, menuContext) {
  if (!buttonId || !MAIN_MENU_BUTTON_IDS.has(buttonId)) return false;
  if (menuContext === "booking_service" && buttonId === "btn_booking") return false;
  return true;
}

/**
 * Глобальный сброс: приветствие, навигация, concierge-entry, кнопка главного меню.
 * @param {string} text
 * @param {{ isButton?: boolean, buttonId?: string, menuContext?: string }} [options]
 */
function isGlobalResetIntent(text, options = {}) {
  const { isButton = false, buttonId, menuContext = "main" } = options;
  const raw = normalizeText(text);

  if (isButton && isMainMenuButtonIntent(buttonId, raw, menuContext)) {
    return true;
  }

  if (!raw) return false;

  if (isGreetingText(raw)) return true;
  if (isNavResetText(raw)) return true;
  if (isConciergeEntryReset(raw)) return true;

  return false;
}

function getGlobalResetRoute(buttonId, _text, menuContext) {
  if (!buttonId) return null;
  if (menuContext === "booking_service" && buttonId === "btn_booking") return null;
  return BUTTON_ID_TO_ROUTE[buttonId] || null;
}

module.exports = {
  isGlobalResetIntent,
  isGreetingText,
  isNavResetText,
  isMainMenuButtonIntent,
  getGlobalResetRoute,
  MAIN_MENU_BUTTON_IDS,
  BUTTON_ID_TO_ROUTE
};
