const { BRAND, getMenuBody, getMenuFooter } = require("./brand");

const ITEMS = {
  price: {
    id: "btn_price",
    route: "price",
    ru: "💰 Узнать цены",
    kz: "💰 Бағалар",
    descRu: "Прайс",
    descKz: "Бағалар"
  },
  booking: {
    id: "btn_booking",
    route: "booking",
    ru: "📅 Записаться",
    kz: "📅 Жазылу",
    descRu: "Подбор сеанса",
    descKz: "Жазылу"
  },
  address: {
    id: "btn_address",
    route: "address",
    ru: "📍 Адрес",
    kz: "📍 Мекенжай",
    descRu: "Как добраться",
    descKz: "Мекенжай"
  },
  contra: {
    id: "btn_contra",
    route: "contraindications",
    ru: "⚠️ Противопоказания",
    kz: "⚠️ Қарсы көрсетілім",
    descRu: "Рекомендации",
    descKz: "Абайлау"
  },
  practices: {
    id: "btn_practices",
    route: "practices",
    ru: "🌿 Подробнее о практиках",
    kz: "🌿 Практикалар",
    descRu: "Что мы делаем",
    descKz: "Практикалар"
  },
  session: {
    id: "btn_session",
    route: "session",
    ru: "🌿 Как проходит сеанс",
    kz: "🌿 Сеанс қалай",
    descRu: "Формат визита",
    descKz: "Формат"
  },
  back: {
    id: "btn_back",
    route: "back",
    ru: "⬅️ Назад",
    kz: "⬅️ Артқа",
    descRu: "Главное меню",
    descKz: "Басты мәзір"
  }
};

const MENU_CONTEXTS = {
  main: {
    bodyRu: "Выберите, что вас интересует 👇",
    bodyKz: "Не қызықтырады 👇",
    items: ["price", "booking", "address", "contra"]
  },
  after_price: {
    bodyRu: "Что подсказать дальше? 👇",
    bodyKz: "Әрі не айтайын? 👇",
    items: ["booking", "practices", "address", "back"]
  },
  after_address: {
    bodyRu: "Что подсказать дальше? 👇",
    bodyKz: "Әрі не айтайын? 👇",
    items: ["booking", "price", "session", "back"]
  },
  after_contra: {
    bodyRu: "Что подсказать дальше? 👇",
    bodyKz: "Әрі не айтайын? 👇",
    items: ["booking", "practices", "back"]
  },
  after_practices: {
    bodyRu: "Что подсказать дальше? 👇",
    bodyKz: "Әрі не айтайын? 👇",
    items: ["booking", "price", "address", "back"]
  },
  after_session: {
    bodyRu: "Что подсказать дальше? 👇",
    bodyKz: "Әрі не айтайын? 👇",
    items: ["booking", "price", "address", "back"]
  },
  default: {
    bodyRu: "Можно выбрать кнопкой 👇",
    bodyKz: "Түйме арқылы таңдаңыз 👇",
    items: ["price", "booking", "address", "contra"]
  }
};

const ID_TO_ROUTE = Object.fromEntries(Object.values(ITEMS).map((i) => [i.id, i.route]));

const ROUTE_TO_MENU = {
  price: "after_price",
  address: "after_address",
  contraindications: "after_contra",
  practices: "after_practices",
  services: "after_practices",
  session: "after_session",
  five_comparison: "after_practices",
  breathing_life: "after_practices",
  breathing_gaya_earthflow: "after_practices",
  five_continents: "after_practices",
  back: "main",
  booking: "main",
  greeting: "main",
  thanks: "main"
};

function getMenuContextForRoute(routeName) {
  return ROUTE_TO_MENU[routeName] || "default";
}

function getContextItems(context) {
  const cfg = MENU_CONTEXTS[context] || MENU_CONTEXTS.default;
  return cfg.items.map((key) => ITEMS[key]).filter(Boolean);
}

function buildMenuBlock(language, context, options = {}) {
  const lang = language === "kz" ? "kz" : "ru";
  const cfg = MENU_CONTEXTS[context] || MENU_CONTEXTS.default;
  const items = getContextItems(context);

  const buttons = items.map((item) => ({
    buttonId: item.id,
    buttonText: item[lang],
    rowId: item.id,
    title: item[lang],
    description: lang === "kz" ? item.descKz : item.descRu
  }));

  const body = options.fullBody
    ? getMenuBody(language)
    : lang === "kz"
      ? cfg.bodyKz
      : cfg.bodyRu;

  return {
    context,
    header: BRAND.header,
    body,
    footer: getMenuFooter(),
    listButtonText: lang === "kz" ? "Мәзір" : "Меню",
    sectionTitle: "Sakina Wellness",
    buttons,
    sections: [
      {
        title: "Sakina Wellness",
        rows: buttons.map((b) => ({
          title: b.title,
          rowId: b.rowId,
          description: b.description
        }))
      }
    ]
  };
}

function getTextMenuFallback(language, context = "main") {
  const lang = language === "kz" ? "kz" : "ru";
  const cfg = MENU_CONTEXTS[context] || MENU_CONTEXTS.default;
  const items = getContextItems(context);
  const lines = items.map((item, i) => `${i + 1}. ${item[lang]}`).join("\n");
  const body = lang === "kz" ? cfg.bodyKz : cfg.bodyRu;

  if (lang === "kz") {
    return `${body}\n\n${lines}\n\nСанды жіберіңіз (мысалы: 1) 🌿`;
  }
  return `${body}\n\n${lines}\n\nИли цифру (например: 1) 🌿`;
}

function normalizeLabel(text) {
  return String(text || "")
    .trim()
    .replace(/^[\s💰📅📍⚠️🌿⬅️]+/u, "")
    .toLowerCase()
    .replace(/\s+/g, " ");
}

const LABEL_TO_ROUTE = {};
for (const item of Object.values(ITEMS)) {
  LABEL_TO_ROUTE[normalizeLabel(item.ru)] = item.route;
  LABEL_TO_ROUTE[normalizeLabel(item.kz)] = item.route;
}
LABEL_TO_ROUTE["цены"] = "price";
LABEL_TO_ROUTE["запись"] = "booking";
LABEL_TO_ROUTE["назад"] = "back";
LABEL_TO_ROUTE["артқа"] = "back";
LABEL_TO_ROUTE["подробнее о практиках"] = "practices";
LABEL_TO_ROUTE["практикалар"] = "practices";
LABEL_TO_ROUTE["как проходит сеанс"] = "session";
LABEL_TO_ROUTE["сеанс қалай"] = "session";

function resolveMenuAction(buttonId, buttonText, menuContext = "main") {
  if (buttonId && ID_TO_ROUTE[buttonId]) return ID_TO_ROUTE[buttonId];

  const normalized = normalizeLabel(buttonText);
  if (LABEL_TO_ROUTE[normalized]) return LABEL_TO_ROUTE[normalized];

  const numeric = String(buttonText || "").trim().match(/^([1-4])$/);
  if (numeric) {
    const items = getContextItems(menuContext);
    const idx = Number(numeric[1]) - 1;
    if (items[idx]) return items[idx].route;
  }

  const withSuffix = String(buttonText || "")
    .trim()
    .match(/^([1-4])[\s.)-–]/);
  if (withSuffix) {
    const items = getContextItems(menuContext);
    const idx = Number(withSuffix[1]) - 1;
    if (items[idx]) return items[idx].route;
  }

  return null;
}

module.exports = {
  ITEMS,
  MENU_CONTEXTS,
  ID_TO_ROUTE,
  getMenuContextForRoute,
  buildMenuBlock,
  getTextMenuFallback,
  resolveMenuAction,
  getContextItems
};
