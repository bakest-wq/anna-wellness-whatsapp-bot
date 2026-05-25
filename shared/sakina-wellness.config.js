/**
 * Единый конфиг Sakina Wellness — сайт sakinawellness.kz + WhatsApp-бот.
 * Источник правды: услуги, цены, пекеджи, wa.me-тексты.
 */
const WHATSAPP_PHONE = process.env.WHATSAPP_PHONE || "77754368680";

const BRAND = {
  name: "Sakina Wellness",
  master: "Анна Абдулрашидовна",
  city: "Актобе",
  district: "район Батыс",
  street: "Ораз Татеулы 15",
  addressFull: "Актобе, район Батыс, Ораз Татеулы 15",
  website: "https://sakinawellness.kz",
  schedule: "09:00–22:00",
  lastBooking: "20:00",
  whatsappPhone: WHATSAPP_PHONE,
  subtitle: "wellness studio · body care · relaxation",
  tagline: "wellness studio · body care · relaxation · Aktobe"
};

/** Готовые тексты с сайта (deep links) */
const WA_MESSAGES = {
  concierge: "Здравствуйте, хочу подобрать практику 🌿",
  conciergeHelp: "Здравствуйте, помогите подобрать практику 🌿",
  prices: "Здравствуйте, хочу узнать цены на практики Sakina Wellness",
  address: "Здравствуйте, подскажите, пожалуйста, адрес Sakina Wellness",
  genericBook: "Здравствуйте, хочу записаться в Sakina Wellness",
  packagePick: "Здравствуйте, хочу выбрать пакет"
};

const SERVICES = [
  {
    botId: "five",
    siteId: "massage-5-continents",
    title: "Массаж «5 континентов»",
    essence: "Путешествие глубокого покоя",
    description:
      "Глубокое расслабление тела, нервной системы и эмоционального напряжения.",
    duration: "2,5 часа",
    durationMinutes: 150,
    price: "30 000 ₸",
    waBook: "Здравствуйте, хочу записаться на массаж «5 континентов»",
    waLearn: "Здравствуйте, хочу узнать подробнее про массаж «5 континентов»",
    aliases: ["5 континент", "пять континент", "массаж 5 континент"]
  },
  {
    botId: "five_fire",
    siteId: "massage-fire",
    title: "«5 континентов» с огнём",
    essence: "Тепло, которое восстанавливает",
    description:
      "Тепловая практика для глубокого расслабления и восстановления внутренней энергии.",
    duration: "2,5 часа",
    durationMinutes: 150,
    price: "35 000 ₸",
    waBook: "Здравствуйте, хочу записаться на «5 континентов» с огнём",
    waLearn: "Здравствуйте, хочу узнать подробнее про «5 континентов» с огнём",
    aliases: ["с огнём", "с огнем", "отпен"]
  },
  {
    botId: "five_bamboo",
    siteId: "massage-bamboo",
    title: "«5 континентов» с бамбуковыми банками",
    essence: "Освобождение и лёгкость тела",
    description:
      "Комбинация массажа и вакуумной терапии для снятия зажимов и улучшения циркуляции.",
    duration: "2,5 часа",
    durationMinutes: 150,
    price: "33 000 ₸",
    waBook: "Здравствуйте, хочу записаться на «5 континентов» с бамбуковыми банками",
    waLearn: "Здравствуйте, хочу узнать подробнее про «5 континентов» с бамбуковыми банками",
    aliases: ["бамбук", "банк"]
  },
  {
    botId: "mukaino",
    siteId: "mukaino-m-test",
    title: "Mukaino M-Test",
    essence: "Услышать тело без слов",
    description:
      "Оценка состояния тела через движение и мягкая коррекция с Microcorn.",
    duration: "40 минут",
    durationMinutes: 40,
    price: "10 000 ₸",
    waBook: "Здравствуйте, хочу записаться на Mukaino M-Test",
    waLearn: "Здравствуйте, хочу узнать подробнее про Mukaino M-Test",
    aliases: ["mukaino", "m-test", "мукайно"]
  },
  {
    botId: "breath",
    siteId: "breathing-practice",
    title: "Дыхательная практика «Дыхание Жизни»",
    essence: "Ритм тишины и вдоха",
    description:
      "Практика для снижения стресса, наполнения энергией и внутреннего успокоения.",
    duration: "1,5 часа",
    durationMinutes: 90,
    price: "20 000 ₸",
    waBook: "Здравствуйте, хочу записаться на дыхательную практику «Дыхание Жизни»",
    waLearn: "Здравствуйте, хочу узнать подробнее про «Дыхание Жизни»",
    aliases: ["дыхание жизни", "дыхательн", "дем алу"]
  },
  {
    botId: "earthflow",
    siteId: "earthflow",
    title: "EarthFlow",
    essence: "Заземление и внутренний центр",
    description:
      "Практика заземления, соединения с телом и восстановления внутреннего баланса.",
    duration: "1 час",
    durationMinutes: 60,
    price: "20 000 ₸",
    waBook: "Здравствуйте, хочу записаться на EarthFlow",
    waLearn: "Здравствуйте, хочу узнать подробнее про EarthFlow",
    aliases: ["earthflow", "эртфлоу"]
  },
  {
    botId: "bars",
    siteId: "access-bars",
    title: "Access Bars",
    essence: "Пространство для ясности ума",
    description:
      "Мягкая техника расслабления для освобождения от ментального напряжения и перегрузки.",
    duration: "1 час",
    durationMinutes: 60,
    price: "15 000 ₸",
    waBook: "Здравствуйте, хочу записаться на Access Bars",
    waLearn: "Здравствуйте, хочу узнать подробнее про Access Bars",
    aliases: ["access bars", "барс"]
  }
];

const PACKAGES = [
  {
    id: "sakina-relax",
    name: "Sakina Relax",
    tagline: "Мягкое погружение в покой",
    includes: ["Массаж «5 континентов»", "Дыхательная практика «Дыхание Жизни»"],
    result: "Глубокое расслабление, снятие напряжения, мягкое восстановление энергии.",
    price: "45 000 ₸",
    waBook: "Здравствуйте, хочу выбрать пакет Sakina Relax"
  },
  {
    id: "sakina-reset",
    name: "Sakina Reset",
    tagline: "Перезагрузка и заземление",
    includes: ["«5 континентов» с бамбуковыми банками", "EarthFlow"],
    result: "Перезагрузка тела, заземление, освобождение от накопленной усталости.",
    price: "48 000 ₸",
    waBook: "Здравствуйте, хочу выбрать пакет Sakina Reset"
  },
  {
    id: "sakina-deep",
    name: "Sakina Deep",
    tagline: "Глубина тела и ума",
    includes: ["«5 континентов» с огнём", "Access Bars"],
    result: "Глубокое расслабление тела и ума, ощущение внутренней лёгкости.",
    price: "47 000 ₸",
    waBook: "Здравствуйте, хочу выбрать пакет Sakina Deep"
  },
  {
    id: "sakina-balance",
    name: "Sakina Balance",
    tagline: "Возвращение к центру",
    includes: ["Mukaino M-Test", "Дыхательная практика «Дыхание Жизни»", "EarthFlow"],
    result:
      "Диагностика состояния, дыхательное восстановление и возвращение внутреннего баланса.",
    price: "45 000 ₸",
    waBook: "Здравствуйте, хочу выбрать пакет Sakina Balance"
  },
  {
    id: "sakina-premium-journey",
    name: "Sakina Premium Journey",
    tagline: "Полная wellness-перезагрузка",
    includes: ["Массаж «5 континентов»", "Mukaino M-Test", "EarthFlow", "Access Bars"],
    result:
      "Полная wellness-перезагрузка: тело, дыхание, энергия и внутреннее спокойствие.",
    price: "75 000 ₸",
    featured: true,
    waBook: "Здравствуйте, хочу выбрать пакет Sakina Premium Journey"
  }
];

function getServiceByBotId(botId) {
  return SERVICES.find((s) => s.botId === botId);
}

function getServiceBySiteId(siteId) {
  return SERVICES.find((s) => s.siteId === siteId);
}

function buildWaMeUrl(text, phone = WHATSAPP_PHONE) {
  const digits = String(phone).replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

module.exports = {
  BRAND,
  WA_MESSAGES,
  SERVICES,
  PACKAGES,
  WHATSAPP_PHONE,
  getServiceByBotId,
  getServiceBySiteId,
  buildWaMeUrl
};
