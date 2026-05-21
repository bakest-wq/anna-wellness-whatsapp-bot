const { BRAND, getMenuBody, getMenuFooter } = require("./brand");

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
  {
    id: BUTTON_IDS.PRICE,
    intent: "price",
    ru: "💰 Узнать цены",
    kz: "💰 Бағалар",
    descRu: "Прайс практик",
    descKz: "Практика бағасы"
  },
  {
    id: BUTTON_IDS.BOOKING,
    intent: "booking",
    ru: "📅 Записаться",
    kz: "📅 Жазылу",
    descRu: "Подбор сеанса",
    descKz: "Сеансқа жазылу"
  },
  {
    id: BUTTON_IDS.ADDRESS,
    intent: "address",
    ru: "📍 Адрес",
    kz: "📍 Мекенжай",
    descRu: "Как добраться",
    descKz: "Қалай жетуге болады"
  },
  {
    id: BUTTON_IDS.CONTRA,
    intent: "contraindications",
    ru: "⚠️ Противопоказания",
    kz: "⚠️ Қарсы көрсетілім",
    descRu: "Бережные рекомендации",
    descKz: "Абайлау керек жағдайлар"
  }
];

function getMenuButtons(language) {
  const lang = language === "kz" ? "kz" : "ru";
  return MENU_ITEMS.map((item) => ({
    buttonId: item.id,
    buttonText: item[lang],
    rowId: item.id,
    title: item[lang],
    description: lang === "kz" ? item.descKz : item.descRu
  }));
}

/** Одно сообщение: интерактивный список (4 пункта) или кнопки */
function getInteractiveMenuBlock(language) {
  const lang = language === "kz" ? "kz" : "ru";
  const buttons = getMenuButtons(language);

  return {
    header: BRAND.header,
    body: getMenuBody(language),
    footer: getMenuFooter(),
    listButtonText: lang === "kz" ? "Мәзір 🌿" : "Меню 🌿",
    sectionTitle: lang === "kz" ? "Бөлімдер" : "Разделы",
    buttons,
    sections: [
      {
        title: lang === "kz" ? "Sakina Wellness" : "Sakina Wellness",
        rows: buttons.map((b) => ({
          title: b.title,
          rowId: b.rowId,
          description: b.description
        }))
      }
    ]
  };
}

/** @deprecated — оставлено для совместимости; теперь одно сообщение */
function getInteractiveMenuParts(language) {
  return [getInteractiveMenuBlock(language)];
}

function getTextMenuFallback(language) {
  const lang = language === "kz" ? "kz" : "ru";
  const lines = MENU_ITEMS.map((item, i) => `${i + 1}. ${item[lang]}`).join("\n");

  if (lang === "kz") {
    return `${getMenuBody(language)}\n\n${lines}\n\nӨтінім, санды жіберіңіз (мысалы: 2) 🌿`;
  }

  return `${getMenuBody(language)}\n\n${lines}\n\nПожалуйста, отправьте цифру (например: 2) 🌿`;
}

function resolveNumericMenu(text) {
  const t = String(text || "").trim();
  const exact = t.match(/^([1-4])$/);
  if (exact) return ID_TO_INTENT[exact[1]];

  const withSuffix = t.match(/^([1-4])[\s.)-–]/);
  if (withSuffix) return ID_TO_INTENT[withSuffix[1]];

  return null;
}

function resolveButtonIntent(buttonId, buttonText) {
  if (buttonId && ID_TO_INTENT[buttonId]) return ID_TO_INTENT[buttonId];

  const normalized = String(buttonText || "")
    .trim()
    .replace(/^[\s💰📅📍⚠️]+/u, "")
    .toLowerCase();

  const map = {
    "узнать цены": "price",
    "цены": "price",
    "бағалар": "price",
    "записаться": "booking",
    "запись": "booking",
    "жазылу": "booking",
    "адрес": "address",
    "мекенжай": "address",
    "противопоказания": "contraindications",
    "қарсы көрсетілім": "contraindications"
  };

  if (map[normalized]) return map[normalized];

  return resolveNumericMenu(buttonText);
}

module.exports = {
  BUTTON_IDS,
  MENU_ITEMS,
  getInteractiveMenuBlock,
  getInteractiveMenuParts,
  getTextMenuFallback,
  resolveButtonIntent,
  resolveNumericMenu
};
