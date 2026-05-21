const { WELLNESS } = require("./knowledge");

function normalizePhone(phone) {
  let p = String(phone || "").replace(/[^\d+]/g, "");
  if (p.startsWith("8") && p.length === 11) p = "+7" + p.slice(1);
  if (/^7\d{10}$/.test(p)) p = "+" + p;
  return p;
}

function isValidPhone(phone) {
  const p = normalizePhone(phone);
  return /^\+7\d{10}$/.test(p);
}

function parseTime(text) {
  const m = String(text || "").match(/(\d{1,2})[:.](\d{2})/);
  if (!m) {
    const h = String(text || "").match(/\b(\d{1,2})\s*(час|сағат)?\b/i);
    if (h) return { hour: parseInt(h[1], 10), minute: 0 };
    return null;
  }
  return { hour: parseInt(m[1], 10), minute: parseInt(m[2], 10) };
}

function isValidBookingTime(text) {
  const t = parseTime(text);
  if (!t) return { ok: false, reason: "format" };
  const minutes = t.hour * 60 + t.minute;
  const open = 9 * 60;
  const close = 20 * 60;
  if (minutes < open || minutes > close) {
    return { ok: false, reason: "range", schedule: WELLNESS };
  }
  return { ok: true, parsed: `${String(t.hour).padStart(2, "0")}:${String(t.minute).padStart(2, "0")}` };
}

function isCancellation(text) {
  return /\b(отмен|отмена|стоп|не надо|передумал|тоқтат|бас тарту|керек емес)\b/i.test(text);
}

module.exports = {
  normalizePhone,
  isValidPhone,
  parseTime,
  isValidBookingTime,
  isCancellation
};
