const { getScenarioResponse } = require("./responses");
const { matchService } = require("./serviceMatcher");
const { servicesListText } = require("./knowledge");
const {
  normalizePhone,
  isValidPhone,
  isValidBookingTime,
  isCancellation
} = require("./validators");

const STEPS = ["service", "day", "time", "phone"];

function initBooking(language) {
  return {
    active: true,
    step: "service",
    startedAt: Date.now(),
    data: {
      name: "",
      phone: "",
      service: "",
      day: "",
      time: "",
      contraindications: "",
      comment: ""
    },
    language
  };
}

function nextQuestion(booking) {
  const lang = booking.language === "kz" ? "kz" : "ru";
  const q = {
    ru: {
      service: `Какая практика вам ближе по ощущению? 🌿\n\nМожно не спешить.\n\n${servicesListText("ru")}`,
      day: "На какой день вам было бы спокойно прийти?",
      time: "Какое время комфортно? Принимаем с 09:00 до 22:00 — без спешки.",
      phone: "Когда будете готовы — оставьте номер для мягкого подтверждения 🤍\n\nФормат: +7XXXXXXXXXX"
    },
    kz: {
      service: `Қай практика жақын сезіледі? 🌿\n\nАсықпай болады.\n\n${servicesListText("kz")}`,
      day: "Қай күн жайлы болар еді?",
      time: "Қай уақыт ыңғайлы? 09:00–22:00.",
      phone: "Дайын болғанда — растау үшін телефон нөмірін жіберіңізші 🤍\n\n+7XXXXXXXXXX"
    }
  };
  return q[lang][booking.step] || q.ru[booking.step];
}

function extractDay(text) {
  const t = text.toLowerCase();
  if (/завтра|ертең/.test(t)) return "завтра";
  if (/послезавтра|арғы күні/.test(t)) return "послезавтра";
  if (/сегодня|бүгін/.test(t)) return "сегодня";
  return text.trim();
}

function smartFill(booking, text) {
  const t = text.trim();
  if (!t) return;

  const phoneMatch = t.match(/(\+?7[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}|8\d{10})/);
  if (phoneMatch && booking.step === "phone" && !booking.data.phone) {
    booking.data.phone = normalizePhone(phoneMatch[0]);
  }

  const service = matchService(t);
  if (service && !booking.data.service && booking.step === "service") {
    booking.data.service = service;
  }

  const timeCheck = isValidBookingTime(t);
  if (timeCheck.ok && !booking.data.time && booking.step === "time") {
    booking.data.time = timeCheck.parsed;
  }

  if (
    booking.step === "day" &&
    /завтра|ертең|послезавтра|сегодня|бүгін|\d{1,2}[./]\d{1,2}/i.test(t) &&
    !booking.data.day
  ) {
    booking.data.day = extractDay(t);
  }

  if (booking.step === "name" && t.length >= 2 && t.length <= 40 && !/\d{5,}/.test(t)) {
    if (!booking.data.name && !phoneMatch) booking.data.name = t;
  }
}

function processBookingMessage(booking, text, language) {
  if (language === "kz" || language === "ru") {
    booking.language = language;
  }
  const lang = booking.language === "kz" ? "kz" : "ru";

  if (isCancellation(text)) {
    return { cancelled: true, reply: getScenarioResponse("booking_cancelled", lang) };
  }

  smartFill(booking, text);

  if (booking.step === "done") {
    booking.active = false;
    return { done: true, reply: getScenarioResponse("booking_complete", lang) };
  }

  if (booking.step === "service") {
    booking.data.service = matchService(text) || text.trim();
    if (!booking.data.service) {
      return { reply: nextQuestion(booking) };
    }
    booking.step = "day";
    return { reply: nextQuestion(booking) };
  }

  if (booking.step === "day") {
    if (!text.trim()) return { reply: nextQuestion(booking) };
    booking.data.day = extractDay(text);
    booking.step = "time";
    return { reply: nextQuestion(booking) };
  }

  if (booking.step === "time") {
    const timeCheck = isValidBookingTime(text);
    if (!timeCheck.ok) {
      return { reply: getScenarioResponse("invalid_time", lang) };
    }
    booking.data.time = timeCheck.parsed;
    booking.step = "phone";
    return { reply: nextQuestion(booking) };
  }

  if (booking.step === "phone") {
    const phone = normalizePhone(text);
    if (!isValidPhone(phone)) {
      return { reply: getScenarioResponse("invalid_phone", lang) };
    }
    booking.data.phone = phone;
    booking.step = "done";
    booking.active = false;
    return { done: true, reply: getScenarioResponse("booking_complete", lang) };
  }

  return { reply: nextQuestion(booking) };
}

function buildLead(booking, userId, language) {
  const d = booking.data;
  const langLabel = language === "kz" ? "Казахский" : "Русский";
  const nameLine = d.name ? `👤 Имя: ${d.name}\n` : "";
  return {
    text: `🌿 Заявка · Sakina Wellness

${nameLine}📞 Телефон: ${d.phone || userId}
🌍 Язык: ${langLabel}
💆 Практика: ${d.service}
📅 День: ${d.day}
🕐 Время: ${d.time}
📍 Источник: Sakina Wellness · WhatsApp`,
    payload: {
      name: d.name || "—",
      phone: d.phone || userId,
      language: langLabel,
      service: d.service,
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
  smartFill,
  nextQuestion,
  STEPS
};
