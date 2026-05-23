const { detectClientIntent } = require("./intent");
const { isValidBookingTime, isCancellation } = require("./validators");
const { resolveBookingServiceChoice } = require("./content/practices");
const {
  isBookingFlowActive,
  isConciergeFlowActive,
  getNextMissingBookingStep,
  isSoftResetCommand
} = require("./sessionMemory");
const { isGlobalResetIntent } = require("./globalIntents");

const GREETING_PATTERNS = [
  /^(здравствуйте|здравствуй|привет|приветствую|доброго\s+времени|добрый\s+(день|утро|вечер)|доброе\s+утро)\b/i,
  /^(hello|hi|hey|good\s+(morning|afternoon|evening))\b/i,
  /^(сәлем|салем|сәлеметсіз\s+бе|ассалаумағалейкум|ассаламу\s*алейкум|ассалаумалейкум)\b/i,
  /^(salam|salem|assalamu?\s*aleikum)\b/i,
  /^(здравствуйте|сәлеметсіз\s+бе)[\s!.,🤍🌿]*$/iu
];

const MENU_RESET_PATTERNS =
  /^(меню|menu|басты\s*меню|начать\s+заново|с\s+начала|заново|reset|restart|стоп)$/i;

const INTERRUPT_INTENTS = new Set([
  "greeting",
  "thanks",
  "price",
  "address",
  "services",
  "schedule",
  "master",
  "concierge",
  "five_continents",
  "five_comparison",
  "breathing_life",
  "breathing_gaya_earthflow",
  "contraindications"
]);

const BOOKING_MENU_CONTEXTS = new Set(["booking_service"]);

const MAIN_MENU_ROUTES = new Set([
  "concierge",
  "booking",
  "price",
  "address",
  "contraindications",
  "practices",
  "services",
  "session",
  "five_comparison",
  "breathing_life",
  "breathing_gaya_earthflow"
]);

function normalizeText(text) {
  return String(text || "")
    .trim()
    .replace(/\s+/g, " ");
}

function isGreetingOrSocialText(text) {
  const t = normalizeText(text);
  if (!t) return false;
  if (GREETING_PATTERNS.some((re) => re.test(t))) return true;
  if (t.length <= 48 && /^(привет|здравств|сәлем|салем|hello|hi|salam|ассалам)/i.test(t)) {
    return true;
  }
  if (/ассаламу?\s*алейкум|assalamu?\s*aleikum/i.test(t)) return true;
  return false;
}

function isMenuResetCommand(text) {
  return MENU_RESET_PATTERNS.test(normalizeText(text));
}

function shouldForceFlowReset(text, options = {}) {
  if (options.isButton) return false;
  const t = normalizeText(text);
  if (!t) return false;
  if (isSoftResetCommand(t) || isMenuResetCommand(t)) return true;
  if (isGreetingOrSocialText(t)) return true;
  return false;
}

/** Мягкий сброс: в меню, данные клиента не теряются */
function shouldSoftFlowReset(text, options = {}) {
  if (options.isButton) return false;
  const t = normalizeText(text);
  if (!t) return false;
  if (isSoftResetCommand(t)) return true;
  if (isGreetingOrSocialText(t)) return true;
  if (isMenuResetCommand(t)) return true;
  return false;
}

function isInterruptIntent(intent, confidence = 0) {
  if (!INTERRUPT_INTENTS.has(intent)) return false;
  if (intent === "greeting" || intent === "thanks") return true;
  return confidence >= 0.3;
}

function isMainMenuNavigation(routeName, menuContext) {
  if (!routeName || routeName === "back") return false;
  if (MAIN_MENU_ROUTES.has(routeName)) return true;
  if (String(routeName).startsWith("practice_")) return true;
  if (BOOKING_MENU_CONTEXTS.has(menuContext) && routeName === "booking") return false;
  return false;
}

function isValidBookingDay(text) {
  const t = normalizeText(text).toLowerCase();
  if (!t || t.length > 80) return false;
  if (isGreetingOrSocialText(t)) return false;
  if (/\?/.test(t)) return false;
  if (/(цена|стоим|адрес|прайс|график|услуг|практик|записаться|хочу\s+узнать)/i.test(t)) return false;
  if (/завтра|послезавтра|сегодня|ертең|бүгін|арғы\s*күні/i.test(t)) return true;
  if (/\d{1,2}[.\-/]\d{1,2}([.\-/]\d{2,4})?/.test(t)) return true;
  if (
    /(понедельник|вторник|сред|четверг|пятниц|суббот|воскресенье|дүйсенбі|сейсенбі|сәрсенбі|бейсенбі|жұма|сенбі|жексенбі)/i.test(
      t
    )
  ) {
    return true;
  }
  if (
    /\d{1,2}\s+(янв|фев|мар|апр|май|июн|июл|авг|сен|окт|ноя|дек|қаң|ақп|наур|мау|мамыс|шілде|тамыз|қырк|қазан|қараш|желтоқ)/i.test(
      t
    )
  ) {
    return true;
  }
  return false;
}

function isValidBookingName(text) {
  const t = normalizeText(text);
  if (t.length < 2 || t.length > 40) return false;
  if (isGreetingOrSocialText(t)) return false;
  if (/\d{5,}/.test(t)) return false;
  if (!/[a-zA-Zа-яА-ЯәіңғүұқөһӘІҢҒҮҰҚӨҺ]/.test(t)) return false;
  if (/(цена|адрес|запис|практик|услуг)/i.test(t)) return false;
  return true;
}

function isValidBookingStepInput(text, sessionOrBooking, language, options = {}) {
  const { isGlobalIntent, normalizeIncomingText } = require("./messageRouter");
  if (isGlobalIntent(normalizeIncomingText(text), options)) {
    return false;
  }

  const step =
    sessionOrBooking?.currentStep ||
    sessionOrBooking?.step ||
    getNextMissingBookingStep(sessionOrBooking || {});
  const raw = normalizeText(text);
  if (!raw && step !== "contraindications") return false;

  if (step === "service") {
    if (options.isButton && BOOKING_MENU_CONTEXTS.has(options.menuContext)) return true;
    const choice = resolveBookingServiceChoice(raw, options.buttonId);
    if (choice?.practiceId || choice?.cancelled) return true;
    if (/^[1-8][️⃣]?\s*$/u.test(raw)) return true;
    return false;
  }

  if (step === "day") return isValidBookingDay(raw);

  if (step === "time") {
    return isValidBookingTime(raw).ok;
  }

  if (step === "name") return isValidBookingName(raw);

  if (step === "phone") {
    const digits = raw.replace(/\D/g, "");
    return digits.length >= 10;
  }

  if (step === "contraindications") {
    return raw.length >= 1 && raw.length <= 500;
  }

  return false;
}

function looksLikeConciergeStepInput(text, concierge, options = {}) {
  if (!concierge?.active) return false;
  if (options.isButton) return true;
  const raw = normalizeText(text);
  if (/^[1-9][️⃣]?\s*$/u.test(raw)) return true;
  if (concierge.step === "result") {
    return /^(подробнее|записаться|другие|толығырақ|жазыл)/i.test(raw);
  }
  return raw.length >= 2 && raw.length <= 120;
}

/**
 * Решает: продолжать FSM, сбросить в главное меню или сбросить и открыть маршрут с кнопки.
 */
function evaluateActiveFlow(session, incomingText, language, options = {}) {
  const bookingActive = isBookingFlowActive(session) || Boolean(session.booking?.active);
  const conciergeActive =
    isConciergeFlowActive(session) || Boolean(session.concierge?.active);
  if (!bookingActive && !conciergeActive) {
    return { mode: "free" };
  }

  const { isButton, buttonId, menuContext, routeName } = options;

  if (isGlobalResetIntent(incomingText, { isButton, buttonId, menuContext })) {
    return { mode: "soft_reset", reason: "global_intent", route: routeName || null };
  }

  if (isCancellation(incomingText)) {
    return { mode: "cancel" };
  }

  if (isMainMenuNavigation(routeName, menuContext)) {
    return { mode: "soft_reset", route: routeName, reason: "main_menu" };
  }

  if (shouldSoftFlowReset(incomingText, { isButton })) {
    return { mode: "soft_reset", reason: "greeting_or_menu" };
  }

  const intentResult = detectClientIntent(incomingText, language);
  const { intent, confidence } = intentResult;

  if (bookingActive) {
    const bookingCtx = session.booking?.active
      ? session.booking
      : { ...session, step: session.currentStep };

    if (isValidBookingStepInput(incomingText, bookingCtx, language, options)) {
      return { mode: "continue_booking" };
    }

    if (!isButton && isInterruptIntent(intent, confidence)) {
      return { mode: "soft_reset", reason: "intent", intent };
    }

    if (!isButton) {
      return { mode: "soft_reset", reason: "invalid_booking_answer" };
    }

    return { mode: "continue_booking" };
  }

  if (conciergeActive) {
    if (looksLikeConciergeStepInput(incomingText, session.concierge, options)) {
      return { mode: "continue_concierge" };
    }

    if (!isButton && (isInterruptIntent(intent, confidence) || isGreetingOrSocialText(incomingText))) {
      return { mode: "soft_reset", reason: "intent", intent };
    }

    if (!isButton) {
      return { mode: "soft_reset", reason: "invalid_concierge_answer" };
    }

    return { mode: "continue_concierge" };
  }

  return { mode: "free" };
}

function hasActiveFlow(session) {
  return (
    isBookingFlowActive(session) ||
    isConciergeFlowActive(session) ||
    Boolean(session.booking?.active || session.concierge?.active)
  );
}

module.exports = {
  evaluateActiveFlow,
  shouldForceFlowReset,
  shouldSoftFlowReset,
  isGlobalResetIntent,
  isGreetingOrSocialText,
  isValidBookingStepInput,
  isValidBookingDay,
  isValidBookingName,
  hasActiveFlow,
  isMainMenuNavigation,
  GREETING_PATTERNS
};
