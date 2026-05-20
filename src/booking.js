const { getScenarioResponse } = require("./responses");
const { matchService } = require("./serviceMatcher");
const {
  normalizePhone,
  isValidPhone,
  isValidBookingTime,
  isCancellation
} = require("./validators");

const STEPS = ["name", "phone", "service", "day", "time", "contraindications"];

function initBooking(language) {
  return {
    active: true,
    step: "name",
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
      name: "Подскажите, пожалуйста, как к вам обращаться?",
      phone: "Благодарю 🌿 Оставьте номер телефона для подтверждения записи.",
      service: "На какую практику записать вас?",
      day: "На какой день вам удобно?",
      time: "Какое время комфортно? Работаем 09:00–22:00, последняя запись — в 20:00.",
      contraindications:
        "Есть ли противопоказания или особенности, о которых важно знать?"
    },
    kz: {
      name: "Өзіңізді қалай атаймыз?",
      phone: "Рахмет 🌿 Жазылуды растау үшін телефон нөміріңізді жіберіңізші.",
      service: "Қай практикаға жазайын?",
      day: "Қай күн ыңғайлы?",
      time: "Қай уақыт ыңғайлы? 09:00–22:00, соңғы жазылу — 20:00.",
      contraindications: "Қарсы көрсетілімдер немесе ескеру керек жағдайлар бар ма?"
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
  if (phoneMatch && !booking.data.phone) {
    booking.data.phone = normalizePhone(phoneMatch[0]);
  }

  const service = matchService(t);
  if (service && !booking.data.service) booking.data.service = service;

  const timeCheck = isValidBookingTime(t);
  if (timeCheck.ok && !booking.data.time) booking.data.time = timeCheck.parsed;

  if (/завтра|ертең|послезавтра|сегодня|бүгін|\d{1,2}[./]\d{1,2}/i.test(t) && !booking.data.day) {
    booking.data.day = extractDay(t);
  }

  if (booking.step === "name" && t.length >= 2 && t.length <= 40 && !/\d{5,}/.test(t)) {
    if (!booking.data.name && !phoneMatch) booking.data.name = t;
  }
}

function advanceBooking(booking) {
  while (STEPS.includes(booking.step)) {
    const field = booking.step;
    const val = booking.data[field === "contraindications" ? "contraindications" : field];
    if (!val || String(val).trim() === "") break;
    const idx = STEPS.indexOf(booking.step);
    booking.step = STEPS[idx + 1] || "done";
  }
  if (booking.step === "done") booking.active = false;
}

function processBookingMessage(booking, text, language) {
  if (isCancellation(text)) {
    return { cancelled: true, reply: getScenarioResponse("booking_cancelled", language) };
  }

  smartFill(booking, text);
  advanceBooking(booking);
  const lText = text.toLowerCase().trim();

  if (booking.step === "done") {
    booking.active = false;
    return { done: true, reply: getScenarioResponse("booking_complete", language) };
  }

  if (booking.step === "name") {
    if (!booking.data.name) {
      if (text.length >= 2 && text.length <= 50 && !/запис|жазыл|хочу|массаж/i.test(lText)) {
        booking.data.name = text.trim();
      }
      advanceBooking(booking);
      if (booking.step === "name") return { reply: nextQuestion(booking) };
    }
    booking.step = booking.data.name ? "phone" : "name";
    advanceBooking(booking);
    return { reply: nextQuestion(booking) };
  }

  if (booking.step === "phone") {
    const phone = normalizePhone(text);
    if (!isValidPhone(phone)) {
      return { reply: getScenarioResponse("invalid_phone", language) };
    }
    booking.data.phone = phone;
    booking.step = "service";
    advanceBooking(booking);
    return { reply: nextQuestion(booking) };
  }

  if (booking.step === "service") {
    booking.data.service = matchService(text) || text.trim();
    booking.step = "day";
    advanceBooking(booking);
    return { reply: nextQuestion(booking) };
  }

  if (booking.step === "day") {
    booking.data.day = extractDay(text);
    booking.step = "time";
    advanceBooking(booking);
    return { reply: nextQuestion(booking) };
  }

  if (booking.step === "time") {
    const timeCheck = isValidBookingTime(text);
    if (!timeCheck.ok) {
      return { reply: getScenarioResponse("invalid_time", language) };
    }
    booking.data.time = timeCheck.parsed;
    booking.step = "contraindications";
    return { reply: nextQuestion(booking) };
  }

  if (booking.step === "contraindications") {
    booking.data.contraindications = text.trim();
    booking.data.comment = /нет|жоқ|no|none|жоқ емес/i.test(lText) ? "" : text.trim();
    booking.step = "done";
    booking.active = false;
    return { done: true, reply: getScenarioResponse("booking_complete", language) };
  }

  return { reply: nextQuestion(booking) };
}

function buildLead(booking, userId, language) {
  const d = booking.data;
  const langLabel = language === "kz" ? "Казахский" : "Русский";
  return {
    text: `🌿 Новая заявка с WhatsApp

👤 Имя: ${d.name}
📞 Телефон: ${d.phone || userId}
🌍 Язык: ${langLabel}
💆 Услуга: ${d.service}
📅 День: ${d.day}
🕐 Время: ${d.time}
⚠️ Противопоказания: ${d.contraindications}
💬 Комментарий: ${d.comment || "—"}
📍 Источник: WhatsApp AI-бот`,
    payload: {
      name: d.name,
      phone: d.phone || userId,
      language: langLabel,
      service: d.service,
      day: d.day,
      time: d.time,
      contraindications: d.contraindications,
      comment: d.comment || "—",
      source: "WhatsApp AI-бот",
      userId
    }
  };
}

module.exports = {
  initBooking,
  processBookingMessage,
  buildLead,
  smartFill,
  advanceBooking,
  nextQuestion
};
