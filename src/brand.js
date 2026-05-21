const BRAND = {
  name: "Sakina Wellness",
  emoji: "🌿",
  subtitle: "wellness studio · body care · relaxation",
  tagline: "wellness studio · body care · relaxation · Aktobe",
  header: "Sakina Wellness 🌿",
  footer: "Sakina Wellness 🌿",
  sanctuaryLine: "Вас здесь не осудят и не будут торопить 🌿"
};

const GREETING = {
  ru: `Здравствуйте 🤍
Рада, что вы написали в Sakina Wellness.

Это спокойное пространство для восстановления внутреннего состояния — бережно и без спешки.

${BRAND.sanctuaryLine}

Если захотите — мягко подскажу о практиках. Можно просто побыть в переписке.`,
  kz: `Сәлеметсіз бе 🤍
Sakina Wellness-ке жазыңыз — жақсы.

Бұл — ішкі күйді қалпына келтіруге арналған жайлы орын. Абайлап, асықпай.

Мұнда сізді соттамайды және асықтырмайды 🌿

Қалағанда — практикалар туралы жұмсақ айтып беремін.`
};

const RETURNING_GREETING = {
  ru: (name) =>
    `Рада снова видеть вас, ${name} 🤍\nДобро пожаловать в тихое пространство Sakina Wellness.\n\nМожно не спешить 🌿`,
  kz: (name) =>
    `Қайта қош келдіңіз, ${name} 🤍\nSakina Wellness — тыныш орын.\n\nАсықпай болады 🌿`
};

function getGreeting(language) {
  return language === "kz" ? GREETING.kz : GREETING.ru;
}

function getReturningGreeting(language, name) {
  const fn = language === "kz" ? RETURNING_GREETING.kz : RETURNING_GREETING.ru;
  return fn(name);
}

function getMenuFooter() {
  return `${BRAND.subtitle}\n${BRAND.sanctuaryLine}`;
}

function getMenuBody(language) {
  const short =
    language === "kz"
      ? "Тыныш wellness-кеңістік 🤍 Асықпай, абайлап."
      : "Спокойное wellness-пространство 🤍 Бережно, без спешки.";
  return `${short}\n\n${BRAND.sanctuaryLine}`;
}

module.exports = {
  BRAND,
  GREETING,
  getGreeting,
  getReturningGreeting,
  getMenuFooter,
  getMenuBody
};
