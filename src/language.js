const KZ_CHARS = /[әғқңөұүһі]/i;

const KZ_MARKERS = [
  "сәлем",
  "сәлеметсіз",
  "рахмет",
  "жазыл",
  "жазылу",
  "жазылғым",
  "қашан",
  "бағасы",
  "қанша",
  "иә",
  "жоқ",
  "ыңғайлы",
  "практика",
  "керек",
  "келеді",
  "мекенжай",
  "қайда"
];

const RU_MARKERS = [
  "здравствуйте",
  "привет",
  "спасибо",
  "запис",
  "сколько",
  "цена",
  "адрес",
  "хочу",
  "можно",
  "пожалуйста"
];

function detectLanguage(text, previous = "ru") {
  const t = String(text || "").toLowerCase();
  if (!t.trim()) return previous;

  if (KZ_CHARS.test(t)) return "kz";

  let kz = KZ_MARKERS.reduce((n, m) => (t.includes(m) ? n + 1 : n), 0);
  let ru = RU_MARKERS.reduce((n, m) => (t.includes(m) ? n + 1 : n), 0);

  if (kz > ru) return "kz";
  if (ru > kz) return "ru";
  return previous;
}

module.exports = { detectLanguage };
