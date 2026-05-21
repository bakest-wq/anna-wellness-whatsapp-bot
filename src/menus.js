const { BRAND, getMenuBody, getMenuFooter } = require("./brand");

const ITEMS = {
  price: {
    id: "btn_price",
    route: "price",
    ru: "💰 Узнать цены",
    kz: "💰 Бағалар",
    labelRu: "Узнать цены",
    labelKz: "Бағалар",
    descRu: "Прайс",
    descKz: "Бағалар"
  },
  booking: {
    id: "btn_booking",
    route: "booking",
    ru: "📅 Записаться",
    kz: "📅 Жазылу",
    labelRu: "Записаться",
    labelKz: "Жазылу",
    descRu: "Подбор сеанса",
    descKz: "Жазылу"
  },
  address: {
    id: "btn_address",
    route: "address",
    ru: "📍 Адрес",
    kz: "📍 Мекенжай",
    labelRu: "Адрес",
    labelKz: "Мекенжай",
    descRu: "Как добраться",
    descKz: "Мекенжай"
  },
  contra: {
    id: "btn_contra",
    route: "contraindications",
    ru: "⚠️ Противопоказания",
    kz: "⚠️ Қарсы көрсетілім",
    labelRu: "Противопоказания",
    labelKz: "Қарсы көрсетілім",
    descRu: "Рекомендации",
    descKz: "Абайлау"
  },
  practices: {
    id: "btn_practices",
    route: "practices",
    ru: "🌿 Подробнее о практиках",
    kz: "🌿 Практикалар",
    labelRu: "Подробнее о практиках",
    labelKz: "Практикалар",
    descRu: "Что мы делаем",
    descKz: "Практикалар"
  },
  session: {
    id: "btn_session",
    route: "session",
    ru: "🌿 Как проходит сеанс",
    kz: "🌿 Сеанс қалай",
    labelRu: "Как проходит сеанс",
    labelKz: "Сеанс қалай",
    descRu: "Формат визита",
    descKz: "Формат"
  },
  back: {
    id: "btn_back",
    route: "back",
    ru: "⬅️ Назад",
    kz: "⬅️ Артқа",
    labelRu: "Назад",
    labelKz: "Артқа",
    descRu: "Главное меню",
    descKz: "Басты мәзір"
  }
};

const MENU_CONTEXTS = {
  main: {
    items: ["price", "booking", "address", "contra"]
  },
  after_price: {
    items: ["booking", "practices", "address", "back"]
  },
  after_address: {
    items: ["booking", "price", "session", "back"]
  },
  after_contra: {
    items: ["booking", "practices", "back"]
  },
  after_practices: {
    items: ["booking", "price", "address", "back"]
  },
  after_session: {
    items: ["booking", "price", "address", "back"]
  },
  default: {
    items: ["price", "booking", "address", "contra"]
  }
};

const MAIN_NUMERIC = {
  1: "price",
  2: "booking",
  3: "address",
  4: "contraindications"
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
  const items = getContextItems(context);

  const buttons = items.map((item) => ({
    buttonId: item.id,
    buttonText: item[lang],
    rowId: item.id,
    title: item[lang],
    description: lang === "kz" ? item.descKz : item.descRu
  }));

  return {
    context,
    header: BRAND.header,
    body: options.fullBody ? getMenuBody(language) : "👇",
    footer: getMenuFooter(),
    buttons
  };
}

/** Текстовое меню с цифрами — всегда в теле сообщения */
function getMenuTextBlock(language, context = "main") {
  const lang = language === "kz" ? "kz" : "ru";

  if (context === "main" || context === "default") {
    if (lang === "ru") {
      return `Выберите, пожалуйста, что вам сейчас ближе:

1️⃣ Узнать цены
2️⃣ Записаться
3️⃣ Адрес
4️⃣ Противопоказания

Можно просто отправить цифру 🌿`;
    }

    return `Қазір не жақын?

1️⃣ Бағалар
2️⃣ Жазылу
3️⃣ Мекенжай
4️⃣ Қарсы көрсетілім

Санды жіберіңіз 🌿`;
  }

  const items = getContextItems(context);
  const prefix = lang === "ru" ? "Что подсказать дальше:" : "Әрі не айтайын:";
  const lines = items
    .map((item, i) => `${i + 1}️⃣ ${item[lang === "kz" ? "labelKz" : "labelRu"]}`)
    .join("\n");
  const footer = lang === "ru" ? "Можно отправить цифру 🌿" : "Санды жіберіңіз 🌿";

  return `${prefix}\n\n${lines}\n\n${footer}`;
}

function getTextMenuFallback(language, context = "main") {
  return getMenuTextBlock(language, context);
}

function messageAlreadyHasMenu(text) {
  if (!text) return false;
  return /[1-4]️⃣/.test(text) || /Можно просто отправить цифру|Санды жіберіңіз 🌿/.test(text);
}

function appendMenuToReply(reply, language, context = "main") {
  const menu = getMenuTextBlock(language, context);
  if (!reply || !String(reply).trim()) return menu;
  if (messageAlreadyHasMenu(reply)) return reply;
  return `${String(reply).trim()}\n\n${menu}`;
}

function enrichOutboundMessages(messages, language, context = "main") {
  if (!messages?.length) {
    return [{ type: "text", text: getMenuTextBlock(language, context) }];
  }

  let lastTextIdx = -1;
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i].type === "text") {
      lastTextIdx = i;
      break;
    }
  }

  if (lastTextIdx < 0) {
    return [...messages, { type: "text", text: getMenuTextBlock(language, context) }];
  }

  return messages.map((m, i) =>
    i === lastTextIdx ? { ...m, text: appendMenuToReply(m.text, language, context) } : m
  );
}

function normalizeLabel(text) {
  return String(text || "")
    .trim()
    .replace(/^[\s💰📅📍⚠️🌿⬅️1-4️⃣]+/u, "")
    .toLowerCase()
    .replace(/\s+/g, " ");
}

const LABEL_TO_ROUTE = {};
for (const item of Object.values(ITEMS)) {
  LABEL_TO_ROUTE[normalizeLabel(item.ru)] = item.route;
  LABEL_TO_ROUTE[normalizeLabel(item.kz)] = item.route;
  LABEL_TO_ROUTE[normalizeLabel(item.labelRu)] = item.route;
  LABEL_TO_ROUTE[normalizeLabel(item.labelKz)] = item.route;
}
LABEL_TO_ROUTE["цены"] = "price";
LABEL_TO_ROUTE["узнать цены"] = "price";
LABEL_TO_ROUTE["запись"] = "booking";
LABEL_TO_ROUTE["записаться"] = "booking";
LABEL_TO_ROUTE["адрес"] = "address";
LABEL_TO_ROUTE["противопоказания"] = "contraindications";
LABEL_TO_ROUTE["назад"] = "back";
LABEL_TO_ROUTE["артқа"] = "back";
LABEL_TO_ROUTE["подробнее о практиках"] = "practices";
LABEL_TO_ROUTE["практикалар"] = "practices";
LABEL_TO_ROUTE["как проходит сеанс"] = "session";
LABEL_TO_ROUTE["сеанс қалай"] = "session";

function parseNumericChoice(text, menuContext) {
  const raw = String(text || "").trim();
  const digit = raw.match(/^([1-4])[️⃣]?\s*$/u) || raw.match(/^([1-4])$/);
  if (!digit) return null;

  const n = Number(digit[1]);
  if (menuContext === "main" || menuContext === "default") {
    return MAIN_NUMERIC[n] || null;
  }

  const items = getContextItems(menuContext);
  return items[n - 1]?.route || null;
}

function resolveMenuAction(buttonId, buttonText, menuContext = "main") {
  if (buttonId && ID_TO_ROUTE[buttonId]) return ID_TO_ROUTE[buttonId];

  const raw = String(buttonText || "").trim();
  const numericRoute = parseNumericChoice(raw, menuContext);
  if (numericRoute) return numericRoute;

  const normalized = normalizeLabel(buttonText);
  if (LABEL_TO_ROUTE[normalized]) return LABEL_TO_ROUTE[normalized];

  const withSuffix = raw.match(/^([1-4])[️⃣]?[\s.)-–]/u);
  if (withSuffix) {
    const n = Number(withSuffix[1]);
    if (menuContext === "main" || menuContext === "default") {
      return MAIN_NUMERIC[n] || null;
    }
    const items = getContextItems(menuContext);
    return items[n - 1]?.route || null;
  }

  return null;
}

module.exports = {
  ITEMS,
  MENU_CONTEXTS,
  ID_TO_ROUTE,
  MAIN_NUMERIC,
  getMenuContextForRoute,
  buildMenuBlock,
  getMenuTextBlock,
  getTextMenuFallback,
  appendMenuToReply,
  enrichOutboundMessages,
  resolveMenuAction,
  getContextItems
};
