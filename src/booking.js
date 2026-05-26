const { getScenarioResponse } = require("./responses");
const { SERVICES } = require("./knowledge");
const { matchService } = require("./serviceMatcher");
const {
  getBookingServiceIntro,
  resolveBookingServiceChoice,
  getServiceNameByPracticeId
} = require("./content/practices");
const {
  normalizePhone,
  isValidPhone,
  isValidBookingTime,
  isCancellation
} = require("./validators");
const {
  isValidBookingDay,
  isValidBookingName
} = require("./flowControl");
const {
  getNextMissingBookingStep,
  syncCurrentStep,
  prefillClientFromProfile,
  isBookingComplete,
  getResumeStepLabel,
  getSessionSnapshotForLead
} = require("./sessionMemory");
const { handleGlobalIntentFirst } = require("./messageRouter");

const STEPS = ["service", "day", "time", "name", "phone", "contraindications"];

function questionForStep(step, session, language) {
  const lang = language === "kz" ? "kz" : "ru";
  const q = {
    ru: {
      service: getBookingServiceIntro("ru"),
      day: "Какой день вам удобен? 🌿\n\nМожно написать: сегодня, завтра, послезавтра или дату.",
      time: "Какое время вам комфортно? Принимаем с 09:00 до 22:00, последний старт — 20:00 🌿",
      name: "Как к вам обращаться? 🤍",
      phone:
        "Оставьте, пожалуйста, номер для подтверждения записи 🤍\n\nФормат: +7XXXXXXXXXX",
      contraindications:
        "Есть ли особенности здоровья, о которых нам важно знать бережно? 🌿\n\nНапример: беременность, давление, аллергии.\n\nЕсли нет — можно написать «нет»."
    },
    kz: {
      service: getBookingServiceIntro("kz"),
      day: "Қай күн жайлы болар еді? 🌿\n\nМысалы: ертең, арғы күні немесе күн.",
      time: "Қай уақыт ыңғайлы? 09:00–22:00 🌿",
      name: "Сізге қалай жүгінейін? 🤍",
      phone: "Растау үшін телефон нөмірін жіберіңізші 🤍\n\nФормат: +7XXXXXXXXXX",
      contraindications:
        "Денсаулық ерекшеліктері бар ма — абайлап ескерейік 🌿\n\nМысалы: жүктілік, қысым, аллергия.\n\nЖоқ болса — «жоқ» деп жазсаңыз болады."
    }
  };
  return q[lang][step] || q.ru[step];
}

function buildResumeIntro(session, language) {
  const lang = language === "kz" ? "kz" : "ru";
  const step = getNextMissingBookingStep(session);
  const where = getResumeStepLabel(step, language);

  if (lang === "kz") {
    return `Сізбен жазылуды жалғастырамыз 🌿\nТоқтаған жер: ${where}.\n\n`;
  }
  return `Продолжим запись с того места, где остановились 🌿\nМы остановились на ${where}.\n\n`;
}

function getBookingStartOutbound(language) {
  const text = getBookingServiceIntro(language);
  return {
    reply: text,
    messages: [{ type: "text", text }],
    skipMenu: false,
    menuContext: "booking_service"
  };
}

function getRecommendationBookingDayQuestion(language) {
  const lang = language === "kz" ? "kz" : "ru";
  return lang === "kz"
    ? "🌿 Қай күні келу сізге жайлы болар еді?\n\nМысалы: бүгін, ертең, арғы күні немесе күн."
    : "🌿 Когда вам было бы комфортно прийти?\n\nМожно написать: сегодня, завтра, послезавтра или дату.";
}

function getBookingAfterPreselectOutbound(session, language, options = {}) {
  const lang = language === "kz" ? "kz" : "ru";
  const title = session.selectedPracticeTitle || "";
  const fromSite = session.source === "sakinawellness.kz";
  const fromRecommendation = options.fromRecommendation === true;
  const intro = fromRecommendation
    ? lang === "kz"
      ? `Керемет 🤍\n${title} бойынша жұмсақ жазылуды бастаймыз.\n\n`
      : `С удовольствием 🤍\nМягко оформим запись на ${title}.\n\n`
    : fromSite
      ? lang === "kz"
        ? `Керемет 🤍\n${title} бойынша жазылуды жалғастырамыз.\n\n`
        : `С удовольствием 🤍\nЗапись на ${title}.\n\n`
      : lang === "kz"
        ? `Керемет таңдау 🤍\n${title}\n\n`
        : `Прекрасный выбор 🤍\n${title}\n\n`;
  syncCurrentStep(session);
  const dayQ =
    fromRecommendation && session.currentStep === "day"
      ? getRecommendationBookingDayQuestion(language)
      : questionForStep(session.currentStep, session, language);
  const text = intro + dayQ;
  return {
    reply: text,
    messages: [{ type: "text", text }],
    skipMenu: true,
    menuContext: "main"
  };
}

function getBookingAfterPackageOutbound(session, language, packageName) {
  const lang = language === "kz" ? "kz" : "ru";
  const intro =
    lang === "kz"
      ? `Керемет 🤍\nПакет: ${packageName}\n\n`
      : `С удовольствием 🤍\nПакет: ${packageName}\n\n`;
  syncCurrentStep(session);
  const text = intro + questionForStep(session.currentStep, session, language);
  return {
    reply: text,
    messages: [{ type: "text", text }],
    skipMenu: true,
    menuContext: "main"
  };
}

function getResumeBookingOutbound(session, language) {
  syncCurrentStep(session);
  prefillClientFromProfile(session);
  syncCurrentStep(session);
  const text =
    buildResumeIntro(session, language) +
    questionForStep(session.currentStep, session, language);
  return {
    reply: text,
    messages: [{ type: "text", text }],
    skipMenu: session.currentStep !== "service",
    menuContext: session.currentStep === "service" ? "booking_service" : "main"
  };
}

function extractDay(text) {
  const t = text.toLowerCase();
  if (/завтра|ертең/.test(t)) return "завтра";
  if (/послезавтра|арғы күні/.test(t)) return "послезавтра";
  if (/сегодня|бүгін/.test(t)) return "сегодня";
  return text.trim();
}

function extractDayHint(text) {
  const raw = String(text || "");
  const patterns = [
    /послезавтра|арғы\s*күні/i,
    /завтра|ертең/i,
    /сегодня|бүгін/i,
    /\d{1,2}[.\-/]\d{1,2}(?:[.\-/]\d{2,4})?/,
    /\d{1,2}\s+(?:янв|фев|мар|апр|май|июн|июл|авг|сен|окт|ноя|дек|қаң|ақп|наур|мау|мамыр|шілде|тамыз|қырк|қазан|қараш|желтоқ)[а-яәіңғүұқөһ]*/i,
    /(?:в\s+)?(?:понедельник|вторник|среду|среда|четверг|пятницу|пятница|субботу|суббота|воскресенье|дүйсенбі|сейсенбі|сәрсенбі|бейсенбі|жұма|сенбі|жексенбі)/i
  ];
  for (const pattern of patterns) {
    const match = raw.match(pattern);
    if (match) return extractDay(match[0]);
  }
  return null;
}

function extractPracticeIdHint(text) {
  const matched = matchService(text);
  if (!matched) return null;
  const svc = SERVICES.find((s) => s.name === matched);
  return svc?.id || null;
}

function extractTimeHint(text) {
  const raw = String(text || "");
  const explicit = raw.match(/\b\d{1,2}[:.]\d{2}\b/);
  if (explicit) return explicit[0];

  const withPrefix = raw.match(/(?:\bв|\bк|\bна|сағат)\s*(\d{1,2})(?:\s*(?:час(?:ов|а)?|сағат))?\b/i);
  if (withPrefix) return withPrefix[1];

  const withUnit = raw.match(/\b(\d{1,2})\s*(?:час(?:ов|а)?|сағат)\b/i);
  if (withUnit) return withUnit[1];

  return null;
}

function applyBookingTextHints(session, text) {
  const source = String(text || "");
  let changed = false;

  const practiceId = extractPracticeIdHint(source);
  if (practiceId && !session.selectedPractice) {
    applyPracticeToSession(session, practiceId);
    changed = true;
  }

  const day = extractDayHint(source);
  if (day && !session.bookingDate) {
    session.bookingDate = day;
    changed = true;
  }

  const timeHint = extractTimeHint(source);
  const timeCheck = timeHint ? isValidBookingTime(timeHint) : { ok: false };
  if (timeCheck.ok && !session.bookingTime) {
    session.bookingTime = timeCheck.parsed;
    changed = true;
  }

  if (changed) syncCurrentStep(session);
  return changed;
}

function isNoContraindications(text, lang) {
  const t = String(text || "").trim().toLowerCase();
  return /^(нет|no|жоқ|жок|-|—|нету|жоқпын)$/i.test(t);
}

function applyPracticeToSession(session, practiceId) {
  session.selectedPractice = practiceId;
  session.selectedPracticeTitle = getServiceNameByPracticeId(practiceId);
  session.lastPracticeId = practiceId;
  syncCurrentStep(session);
}

function resolveServiceFromInput(session, text, options = {}) {
  const choice = resolveBookingServiceChoice(text, options.buttonId);
  if (choice?.cancelled) return { cancelled: true };
  if (choice?.practiceId) {
    applyPracticeToSession(session, choice.practiceId);
    return { ok: true };
  }

  const matched = matchService(text);
  if (matched) {
    const svc = SERVICES.find((s) => s.name === matched);
    if (svc) {
      applyPracticeToSession(session, svc.id);
      return { ok: true };
    }
    session.selectedPracticeTitle = matched;
    syncCurrentStep(session);
    return { ok: true };
  }

  return { ok: false };
}

/**
 * Запись через session state — спрашиваем только недостающие поля.
 */
function processBookingSession(session, text, language, options = {}) {
  const chatId = options.chatId || session.chatId;

  const globalHit = handleGlobalIntentFirst({
    chatId,
    session,
    text,
    language,
    isButton: options.isButton,
    buttonId: options.buttonId,
    menuContext: options.menuContext
  });
  if (globalHit) {
    console.log("GREETING RESET BEFORE BOOKING (processBookingSession)");
    return { globalReset: true, reply: globalHit.outbound?.reply, ...globalHit.outbound };
  }

  if (language === "kz" || language === "ru") {
    session.language = language;
  }
  const lang = session.language === "kz" ? "kz" : "ru";

  if (session.currentFlow !== "booking") {
    return { notInBookingFlow: true };
  }

  prefillClientFromProfile(session);
  syncCurrentStep(session);

  if (isCancellation(text)) {
    return { cancelled: true, reply: getScenarioResponse("booking_cancelled", lang) };
  }

  let step = getNextMissingBookingStep(session);

  if (step === "complete") {
    return {
      done: true,
      reply: getScenarioResponse("booking_complete", lang),
      skipMenu: false,
      menuContext: "main"
    };
  }

  session.currentStep = step;

  if (step === "service") {
    const resolved = resolveServiceFromInput(session, text, options);
    if (resolved.cancelled) {
      return { cancelled: true, reply: getScenarioResponse("booking_cancelled", lang) };
    }
    if (resolved.ok) {
      syncCurrentStep(session);
      return {
        reply: questionForStep(session.currentStep, session, language),
        skipMenu: session.currentStep !== "service",
        menuContext:
          session.currentStep === "service" ? "booking_service" : "main"
      };
    }
    return {
      reply: questionForStep("service", session, language),
      menuContext: "booking_service",
      skipMenu: false
    };
  }

  if (step === "day") {
    if (!isValidBookingDay(text)) {
      const hint =
        lang === "kz"
          ? "Күнді жазыңызшы 🌿\n\nМысалы: ертең, 25.05 немесе «дүйсенбі»."
          : "Напишите, пожалуйста, удобный день 🌿\n\nНапример: завтра, 25.05 или «в субботу».";
      return { reply: hint, skipMenu: true };
    }
    session.bookingDate = extractDay(text);
    syncCurrentStep(session);
    return {
      reply: questionForStep(session.currentStep, session, language),
      skipMenu: true
    };
  }

  if (step === "time") {
    const timeCheck = isValidBookingTime(text);
    if (!timeCheck.ok) {
      return { reply: getScenarioResponse("invalid_time", lang), skipMenu: true };
    }
    session.bookingTime = timeCheck.parsed;
    syncCurrentStep(session);
    return {
      reply: questionForStep(session.currentStep, session, language),
      skipMenu: true
    };
  }

  if (step === "name") {
    const name = text.trim();
    if (!isValidBookingName(name)) {
      const hint =
        lang === "kz"
          ? "Атыңызды жазыңызшы 🤍\n\n2–40 әріп, мысалы: Айгүл."
          : "Как к вам обращаться? 🤍\n\nИмя из 2–40 букв, например: Айгуль.";
      return { reply: hint, skipMenu: true };
    }
    session.clientName = name;
    if (session.profile) session.profile.name = name;
    syncCurrentStep(session);
    return {
      reply: questionForStep(session.currentStep, session, language),
      skipMenu: true
    };
  }

  if (step === "phone") {
    const phone = normalizePhone(text);
    if (!isValidPhone(phone)) {
      return { reply: getScenarioResponse("invalid_phone", lang), skipMenu: true };
    }
    session.clientPhone = phone;
    if (session.profile) session.profile.phone = phone;
    syncCurrentStep(session);
    return {
      reply: questionForStep(session.currentStep, session, language),
      skipMenu: true
    };
  }

  if (step === "contraindications") {
    session.contraindications = isNoContraindications(text, lang)
      ? lang === "kz"
        ? "жоқ"
        : "нет"
      : text.trim();
    session.currentFlow = null;
    session.currentStep = null;

    if (isBookingComplete(session)) {
      return {
        done: true,
        reply: getScenarioResponse("booking_complete", lang),
        skipMenu: true,
        menuContext: "after_booking"
      };
    }
  }

  return {
    reply: questionForStep(getNextMissingBookingStep(session), session, language),
    skipMenu: true
  };
}

function buildLead(session, userId, language) {
  const d = getSessionSnapshotForLead(session);
  const langLabel = language === "kz" ? "Казахский" : "Русский";
  const contraLine = d.contraindications
    ? `⚠️ Особенности: ${d.contraindications}\n`
    : "";
  return {
    text: `🌿 Заявка · Sakina Wellness

👤 Имя: ${d.name || "—"}
📞 Телефон: ${d.phone || userId}
🌍 Язык: ${langLabel}
💆 Практика: ${d.service}
📅 День: ${d.day}
🕐 Время: ${d.time}
${contraLine}📍 Источник: ${d.source || "Sakina Wellness · WhatsApp"}`,
    payload: {
      name: d.name || "—",
      phone: d.phone || userId,
      language: langLabel,
      service: d.service,
      serviceId: d.serviceId || "—",
      day: d.day,
      time: d.time,
      contraindications: d.contraindications || "—",
      comment: d.comment || "—",
      source: d.source || "Sakina Wellness · WhatsApp",
      userId
    }
  };
}

/** @deprecated — используйте startBookingFlow + processBookingSession */
function initBooking(language, preselectedPracticeId = null, options = {}) {
  return {
    active: true,
    step: preselectedPracticeId || options.packageName ? "day" : "service",
    startedAt: Date.now(),
    data: {
      name: "",
      phone: "",
      service: preselectedPracticeId
        ? getServiceNameByPracticeId(preselectedPracticeId)
        : options.packageName || "",
      serviceId: preselectedPracticeId || "",
      day: "",
      time: "",
      contraindications: "",
      comment: options.packageName ? `Пакет: ${options.packageName}` : ""
    },
    language
  };
}

/** @deprecated */
function processBookingMessage(booking, text, language, options = {}) {
  const session = {
    language,
    currentFlow: "booking",
    selectedPractice: booking.data.serviceId || null,
    selectedPracticeTitle: booking.data.service,
    bookingDate: booking.data.day || null,
    bookingTime: booking.data.time || null,
    clientName: booking.data.name || null,
    clientPhone: booking.data.phone || null,
    contraindications: booking.data.contraindications || null,
    bookingComment: booking.data.comment || null,
    profile: { name: "", phone: "", visits: 0 }
  };
  syncCurrentStep(session);
  const result = processBookingSession(session, text, language, options);
  booking.active = session.currentFlow === "booking";
  booking.step = session.currentStep || booking.step;
  booking.data.serviceId = session.selectedPractice || "";
  booking.data.service = session.selectedPracticeTitle || "";
  booking.data.day = session.bookingDate || "";
  booking.data.time = session.bookingTime || "";
  booking.data.name = session.clientName || "";
  booking.data.phone = session.clientPhone || "";
  booking.data.contraindications = session.contraindications || "";
  return result;
}

module.exports = {
  processBookingSession,
  processBookingMessage,
  buildLead,
  getBookingStartOutbound,
  getBookingAfterPreselectOutbound,
  getRecommendationBookingDayQuestion,
  getBookingAfterPackageOutbound,
  getResumeBookingOutbound,
  applyBookingTextHints,
  questionForStep,
  initBooking,
  STEPS
};
