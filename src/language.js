/** Казахские буквы, которых нет в русском */
const KZ_CHARS = /[әғқңөұүһіӘҒҚҢӨҰҮҺІ]/;

const KZ_STRONG_MARKERS = [
  "сәлеметсіз",
  "сәлем",
  "салем",
  "рахмет",
  "жазылу",
  "жазылғым",
  "жазыл",
  "қанша",
  "бағасы",
  "баға",
  "мекенжай",
  "қайда",
  "орналасқан",
  "жұмыс",
  "ыңғайлы",
  "қарсы көрсетілім",
  "ертең",
  "бүгін",
  "артқа",
  "жоқ",
  "иә",
  "қалай",
  "керек",
  "келеді",
  "шаршадым",
  "мазасыз",
  "үрей",
  "қинал",
  "ауыр күй"
];

const RU_STRONG_MARKERS = [
  "здравствуйте",
  "здравствуй",
  "привет",
  "спасибо",
  "пожалуйста",
  "записаться",
  "запишите",
  "запись",
  "запис",
  "сколько",
  "стоит",
  "цена",
  "цены",
  "прайс",
  "адрес",
  "противопоказания",
  "хочу",
  "можно",
  "практик",
  "услуг",
  "график",
  "завтра",
  "послезавтра",
  "сегодня",
  "назад",
  "меню"
];

const MENU_NUMERIC = /^([1-4])[️⃣]?\s*$/u;

function detectMessageLanguage(text) {
  const t = String(text || "").trim().toLowerCase();
  if (!t) return null;

  if (KZ_CHARS.test(t)) return "kz";

  let kz = 0;
  let ru = 0;

  for (const m of KZ_STRONG_MARKERS) {
    if (t.includes(m)) kz += 2;
  }
  for (const m of RU_STRONG_MARKERS) {
    if (t.includes(m)) ru += 2;
  }

  if (kz > ru && kz >= 2) return "kz";
  if (ru > kz && ru >= 2) return "ru";
  if (kz > 0 && ru === 0) return "kz";
  if (ru > 0 && kz === 0) return "ru";

  return null;
}

/**
 * Язык ответа: из текущего сообщения, иначе из сессии.
 * Переключение только при явных признаках другого языка.
 * Неясно → русский (или сохранённый в сессии).
 */
function resolveClientLanguage(text, sessionLanguage = "ru", options = {}) {
  const session = sessionLanguage === "kz" ? "kz" : "ru";
  const t = String(text || "").trim();

  if (options.isButton && (!t || MENU_NUMERIC.test(t))) {
    return session;
  }

  if (/^[1-4]$/.test(t)) {
    return session;
  }

  const detected = detectMessageLanguage(t);
  if (detected) return detected;

  return session;
}

/** @deprecated Используйте resolveClientLanguage */
function detectLanguage(text, previous = "ru") {
  return resolveClientLanguage(text, previous);
}

function normalizeLanguage(lang) {
  return lang === "kz" ? "kz" : "ru";
}

function hasKazakhScript(text) {
  return KZ_CHARS.test(String(text || ""));
}

module.exports = {
  detectMessageLanguage,
  resolveClientLanguage,
  detectLanguage,
  normalizeLanguage,
  hasKazakhScript,
  KZ_CHARS
};
