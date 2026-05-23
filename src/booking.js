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

const STEPS = ["service", "day", "time", "name", "phone", "contraindications"];

function initBooking(language, preselectedPracticeId = null, options = {}) {
  const hasPackage = Boolean(options.packageName);
  const booking = {
    active: true,
    step: preselectedPracticeId || hasPackage ? "day" : "service",
    startedAt: Date.now(),
    data: {
      name: "",
      phone: "",
      service: "",
      serviceId: "",
      day: "",
      time: "",
      contraindications: "",
      comment: hasPackage ? `Пакет: ${options.packageName}` : ""
    },
    language
  };

  if (preselectedPracticeId) {
    booking.data.serviceId = preselectedPracticeId;
    booking.data.service = getServiceNameByPracticeId(preselectedPracticeId);
  } else if (hasPackage) {
    booking.data.service = options.packageName;
  }

  return booking;
}

function nextQuestion(booking) {
  const lang = booking.language === "kz" ? "kz" : "ru";
  const q = {
    ru: {
      service: getBookingServiceIntro("ru"),
      day: "На какой день вам было бы спокойно прийти? 🌿\n\nМожно написать, например: завтра, послезавтра или дату.",
      time: "Какое время вам комфортно? Принимаем с 09:00 до 22:00 — без спешки 🌿",
      name: "Как к вам обращаться? 🤍",
      phone:
        "Оставьте, пожалуйста, номер для мягкого подтверждения записи 🤍\n\nФормат: +7XXXXXXXXXX",
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
  return q[lang][booking.step] || q.ru[booking.step];
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

function getBookingAfterPreselectOutbound(language, booking) {
  const lang = language === "kz" ? "kz" : "ru";
  const intro =
    lang === "kz"
      ? `Керемет таңдау 🤍\n${booking.data.service}\n\n`
      : `Прекрасный выбор 🤍\n${booking.data.service}\n\n`;
  const text = intro + nextQuestion(booking);
  return {
    reply: text,
    messages: [{ type: "text", text }],
    skipMenu: true,
    menuContext: "main"
  };
}

function getBookingAfterPackageOutbound(language, booking, packageName) {
  const lang = language === "kz" ? "kz" : "ru";
  const intro =
    lang === "kz"
      ? `Керемет 🤍\nПакет: ${packageName}\n\n`
      : `С удовольствием 🤍\nПакет: ${packageName}\n\n`;
  const text = intro + nextQuestion(booking);
  return {
    reply: text,
    messages: [{ type: "text", text }],
    skipMenu: true,
    menuContext: "main"
  };
}

function extractDay(text) {
  const t = text.toLowerCase();
  if (/завтра|ертең/.test(t)) return "завтра";
  if (/послезавтра|арғы күні/.test(t)) return "послезавтра";
  if (/сегодня|бүгін/.test(t)) return "сегодня";
  return text.trim();
}

function isNoContraindications(text, lang) {
  const t = String(text || "").trim().toLowerCase();
  return /^(нет|no|жоқ|жок|-|—|нету|жоқпын)$/i.test(t);
}

function applyServiceChoice(booking, practiceId) {
  booking.data.serviceId = practiceId;
  booking.data.service = getServiceNameByPracticeId(practiceId);
  booking.step = "day";
}

function resolveServiceFromInput(booking, text, options = {}) {
  const choice = resolveBookingServiceChoice(text, options.buttonId);
  if (choice?.cancelled) return { cancelled: true };
  if (choice?.practiceId) {
    applyServiceChoice(booking, choice.practiceId);
    return { ok: true };
  }

  const matched = matchService(text);
  if (matched) {
    const svc = SERVICES.find((s) => s.name === matched);
    if (svc) {
      applyServiceChoice(booking, svc.id);
      return { ok: true };
    }
    booking.data.service = matched;
    booking.step = "day";
    return { ok: true };
  }

  return { ok: false };
}

function processBookingMessage(booking, text, language, options = {}) {
  if (language === "kz" || language === "ru") {
    booking.language = language;
  }
  const lang = booking.language === "kz" ? "kz" : "ru";

  if (isCancellation(text)) {
    booking.active = false;
    return { cancelled: true, reply: getScenarioResponse("booking_cancelled", lang) };
  }

  if (booking.step === "service") {
    const resolved = resolveServiceFromInput(booking, text, options);
    if (resolved.cancelled) {
      booking.active = false;
      return { cancelled: true, reply: getScenarioResponse("booking_cancelled", lang) };
    }
    if (resolved.ok) {
      return {
        reply: nextQuestion(booking),
        menuContext: null,
        skipMenu: true
      };
    }
    return {
      reply: nextQuestion(booking),
      menuContext: "booking_service",
      skipMenu: false
    };
  }

  if (booking.step === "day") {
    if (!isValidBookingDay(text)) {
      const hint =
        lang === "kz"
          ? "Күнді жазыңызшы 🌿\n\nМысалы: ертең, 25.05 немесе «дүйсенбі».\n\nБасқа сұрақ болса — «меню» деп жазсаңыз, басты мәзірге ораламыз."
          : "Напишите, пожалуйста, удобный день 🌿\n\nНапример: завтра, 25.05 или «в субботу».\n\nЕсли хотите начать сначала — напишите «меню».";
      return { reply: hint, skipMenu: true };
    }
    booking.data.day = extractDay(text);
    booking.step = "time";
    return { reply: nextQuestion(booking), skipMenu: true };
  }

  if (booking.step === "time") {
    const timeCheck = isValidBookingTime(text);
    if (!timeCheck.ok) {
      return { reply: getScenarioResponse("invalid_time", lang), skipMenu: true };
    }
    booking.data.time = timeCheck.parsed;
    booking.step = "name";
    return { reply: nextQuestion(booking), skipMenu: true };
  }

  if (booking.step === "name") {
    const name = text.trim();
    if (!isValidBookingName(name)) {
      const hint =
        lang === "kz"
          ? "Атыңызды жазыңызшы 🤍\n\n2–40 әріп, мысалы: Айгүл."
          : "Как к вам обращаться? 🤍\n\nИмя из 2–40 букв, например: Айгуль.";
      return { reply: hint, skipMenu: true };
    }
    booking.data.name = name;
    booking.step = "phone";
    return { reply: nextQuestion(booking), skipMenu: true };
  }

  if (booking.step === "phone") {
    const phone = normalizePhone(text);
    if (!isValidPhone(phone)) {
      return { reply: getScenarioResponse("invalid_phone", lang), skipMenu: true };
    }
    booking.data.phone = phone;
    booking.step = "contraindications";
    return { reply: nextQuestion(booking), skipMenu: true };
  }

  if (booking.step === "contraindications") {
    booking.data.contraindications = isNoContraindications(text, lang)
      ? lang === "kz"
        ? "жоқ"
        : "нет"
      : text.trim();
    booking.step = "done";
    booking.active = false;
    return {
      done: true,
      reply: getScenarioResponse("booking_complete", lang),
      skipMenu: false,
      menuContext: "main"
    };
  }

  return { reply: nextQuestion(booking), skipMenu: true };
}

function buildLead(booking, userId, language) {
  const d = booking.data;
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
${contraLine}📍 Источник: Sakina Wellness · WhatsApp`,
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
      source: "Sakina Wellness · WhatsApp",
      userId
    }
  };
}

module.exports = {
  initBooking,
  processBookingMessage,
  buildLead,
  getBookingStartOutbound,
  getBookingAfterPreselectOutbound,
  getBookingAfterPackageOutbound,
  nextQuestion,
  STEPS
};
