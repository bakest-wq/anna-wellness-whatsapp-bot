const { SALON } = require("./knowledge");

const BUTTON_IDS = {
  PRICE: "btn_price",
  BOOKING: "btn_booking",
  ADDRESS: "btn_address",
  CONTRA: "btn_contra"
};

const ID_TO_INTENT = {
  [BUTTON_IDS.PRICE]: "price",
  [BUTTON_IDS.BOOKING]: "booking",
  [BUTTON_IDS.ADDRESS]: "address",
  [BUTTON_IDS.CONTRA]: "contraindications",
  "1": "price",
  "2": "booking",
  "3": "address",
  "4": "contraindications"
};

const MENU_ITEMS = [
  { id: BUTTON_IDS.PRICE, intent: "price", ru: "Узнать цены", kz: "Бағалар" },
  { id: BUTTON_IDS.BOOKING, intent: "booking", ru: "Записаться", kz: "Жазылу" },
  { id: BUTTON_IDS.ADDRESS, intent: "address", ru: "Адрес", kz: "Мекенжай" },
  { id: BUTTON_IDS.CONTRA, intent: "contraindications", ru: "Противопоказания", kz: "Қарсы көрсетілім" }
];

function getGreetingBody(language) {
  if (language === "kz") {
    return "Сәлеметсіз бе 🌿\nӨтінім, қызығушылық бөлімді таңдаңыз.";
  }
  return "Здравствуйте 🌿\nВыберите, пожалуйста, интересующий раздел.";
}

function getInteractiveMenu(language) {
  const lang = language === "kz" ? "kz" : "ru";
  const labels = MENU_ITEMS.map((item) => ({
    buttonId: item.id,
    buttonText: item[lang]
  }));

  return {
    header: "Sakina Beauty 🌿",
    body: getGreetingBody(language),
    footer: `${SALON.master} · wellness · Актобе`,
    buttons: labels
  };
}

function getInteractiveMenuParts(language) {
  const menu = getInteractiveMenu(language);
  return [
    {
      header: menu.header,
      body: menu.body,
      footer: menu.footer,
      buttons: menu.buttons.slice(0, 3)
    },
    {
      header: "Sakina Beauty 🌿",
      body: language === "kz" ? "Тағы бір бөлім 🌿" : "Ещё один раздел 🌿",
      footer: menu.footer,
      buttons: [menu.buttons[3]]
    }
  ];
}

function getTextMenuFallback(language) {
  const lang = language === "kz" ? "kz" : "ru";
  const lines = MENU_ITEMS.map((item, i) => `${i + 1} — ${item[lang]}`).join("\n");

  if (lang === "kz") {
    return `${getGreetingBody(language)}\n\n${lines}\n\nӨтінім, санды жіберіңіз (мысалы: 2).`;
  }

  return `${getGreetingBody(language)}\n\n${lines}\n\nПожалуйста, отправьте цифру (например: 2).`;
}

const TEXT_TO_INTENT = {
  ru: {
    "узнать цены": "price",
    "💰 узнать цены": "price",
    "цены": "price",
    "записаться": "booking",
    "📅 записаться": "booking",
    "запись": "booking",
    "адрес": "address",
    "📍 адрес": "address",
    "противопоказания": "contraindications",
    "⚠️ противопоказания": "contraindications"
  },
  kz: {
    "бағалар": "price",
    "жазылу": "booking",
    "мекенжай": "address",
    "қарсы көрсетілім": "contraindications"
  }
};

function resolveNumericMenu(text) {
  const t = String(text || "").trim();
  const exact = t.match(/^([1-4])$/);
  if (exact) return ID_TO_INTENT[exact[1]];

  const withSuffix = t.match(/^([1-4])[\s.)-–]/);
  if (withSuffix) return ID_TO_INTENT[withSuffix[1]];

  return null;
}

const INDEX_TO_INTENT = ["price", "booking", "address", "contraindications"];

function resolveButtonIntent(buttonId, buttonText) {
  if (buttonId && ID_TO_INTENT[buttonId]) return ID_TO_INTENT[buttonId];

  if (buttonId !== null && buttonId !== undefined && /^[0-3]$/.test(String(buttonId))) {
    return INDEX_TO_INTENT[parseInt(buttonId, 10)];
  }

  const numeric = resolveNumericMenu(buttonText || buttonId);
  if (numeric) return numeric;

  const t = String(buttonText || "").toLowerCase().trim();
  for (const map of [TEXT_TO_INTENT.ru, TEXT_TO_INTENT.kz]) {
    for (const [key, intent] of Object.entries(map)) {
      if (t.includes(key)) return intent;
    }
  }

  if (/цен|баға|price/i.test(t)) return "price";
  if (/запис|жазыл|book/i.test(t)) return "booking";
  if (/адрес|мекен|қайда/i.test(t)) return "address";
  if (/против|қарсы/i.test(t)) return "contraindications";

  return null;
}

function getBookingCta(language) {
  return language === "kz"
    ? "\n\nЖазылғыңыз келсе — қуана көмектесемін 🌿"
    : "\n\nЕсли захотите записаться — с радостью помогу 🌿";
}

function enrichScenarioReply(intent, reply, language) {
  if (!reply || intent === "booking" || intent === "greeting") return reply;
  if (reply.includes("запис") || reply.includes("жазыл")) return reply;
  return reply + getBookingCta(language);
}

module.exports = {
  BUTTON_IDS,
  getGreetingBody,
  getInteractiveMenu,
  getInteractiveMenuParts,
  getTextMenuFallback,
  resolveButtonIntent,
  resolveNumericMenu,
  enrichScenarioReply
};
