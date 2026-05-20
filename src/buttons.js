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

const TEXT_TO_INTENT = {
  ru: {
    "узнать цены": "price",
    "цены": "price",
    "записаться": "booking",
    "запись": "booking",
    "адрес": "address",
    "противопоказания": "contraindications"
  },
  kz: {
    "бағаларды білу": "price",
    "бағалар": "price",
    "жазылу": "booking",
    "жазылғым": "booking",
    "мекенжай": "address",
    "қарсы көрсетілімдер": "contraindications"
  }
};

function getMenuBlocks(language) {
  const lang = language === "kz" ? "kz" : "ru";

  if (lang === "kz") {
    return {
      main: {
        header: "Sakina Beauty 🌿",
        message:
          "Сізді қуана қарсы аламыз.\n\nПрактика, баға немесе жазылу — төменнен таңдаңыз:",
        footer: `${SALON.master} · Ақтөбе`,
        buttons: [
          { buttonId: BUTTON_IDS.PRICE, buttonText: "💰 Бағалар" },
          { buttonId: BUTTON_IDS.BOOKING, buttonText: "📅 Жазылу" },
          { buttonId: BUTTON_IDS.ADDRESS, buttonText: "📍 Мекенжай" }
        ]
      },
      extra: {
        message: "Денсаулық туралы маңызды ақпарат 🌿",
        footer: "Абайлап таңдауға көмектесеміз",
        buttons: [{ buttonId: BUTTON_IDS.CONTRA, buttonText: "⚠️ Қарсы көрсетілім" }]
      }
    };
  }

  return {
    main: {
      header: "Sakina Beauty 🌿",
      message:
        "Рады приветствовать вас.\n\nВыберите, пожалуйста, что вас интересует:",
      footer: `${SALON.master} · Актобе`,
      buttons: [
        { buttonId: BUTTON_IDS.PRICE, buttonText: "💰 Узнать цены" },
        { buttonId: BUTTON_IDS.BOOKING, buttonText: "📅 Записаться" },
        { buttonId: BUTTON_IDS.ADDRESS, buttonText: "📍 Адрес" }
      ]
    },
    extra: {
      message: "Важно знать перед визитом 🌿",
      footer: "Подберём формат бережно",
      buttons: [{ buttonId: BUTTON_IDS.CONTRA, buttonText: "⚠️ Противопоказания" }]
    }
  };
}

function resolveButtonIntent(buttonId, buttonText) {
  if (buttonId && ID_TO_INTENT[buttonId]) return ID_TO_INTENT[buttonId];

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
  getMenuBlocks,
  resolveButtonIntent,
  enrichScenarioReply
};
