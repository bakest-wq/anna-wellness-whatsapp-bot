const BRAND = {
  name: "Sakina Wellness",
  emoji: "🌿",
  subtitle: "wellness studio · body care · relaxation",
  tagline: "wellness studio · body care · relaxation · Aktobe",
  header: "Sakina Wellness 🌿",
  footer: "Sakina Wellness 🌿"
};

const GREETING = {
  ru: `Здравствуйте 🤍
Рада, что вы написали в Sakina Wellness.

Это спокойное пространство для восстановления внутреннего состояния — бережно и без спешки.

Если захотите — мягко подскажу о практиках. Можно просто побыть в переписке.`,
  kz: `Сәлеметсіз бе 🤍
Sakina Wellness-ке жазыңыз — жақсы.

Бұл — ішкі күйді қалпына келтіруге арналған жайлы орын. Абайлап, асықпай.

Қалағанда — практикалар туралы жұмсақ айтып беремін.`
};

const RETURNING_GREETING = {
  ru: (name) =>
    `Рада снова видеть вас, ${name} 🤍\nДобро пожаловать в тихое пространство Sakina Wellness.`,
  kz: (name) =>
    `Қайта қош келдіңіз, ${name} 🤍\nSakina Wellness — тыныш орын.`
};

function getGreeting(language) {
  return language === "kz" ? GREETING.kz : GREETING.ru;
}

function getReturningGreeting(language, name) {
  const fn = language === "kz" ? RETURNING_GREETING.kz : RETURNING_GREETING.ru;
  return fn(name);
}

function getMenuFooter() {
  return BRAND.subtitle;
}

function getMenuBody(language) {
  return language === "kz"
    ? "Тыныш wellness-кеңістік 🤍 Абайлап, асықпай."
    : "Спокойное wellness-пространство 🤍 Бережно, без спешки.";
}

module.exports = {
  BRAND,
  GREETING,
  getGreeting,
  getReturningGreeting,
  getMenuFooter,
  getMenuBody
};
