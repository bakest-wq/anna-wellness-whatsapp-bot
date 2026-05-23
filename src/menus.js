const { BRAND, getMenuBody, getMenuFooter } = require("./brand");
const {
  PRACTICE_PICKER,
  getPracticePickerMenuBlock,
  resolvePracticePickerChoice,
  registerPracticeLabels
} = require("./content/practices");
const {
  getConciergeEmotionMenu,
  getConciergeOutcomeMenu,
  getConciergeCardMenu,
  buildConciergeButtons,
  EMOTIONS,
  OUTCOMES,
  CARD_ACTIONS
} = require("./concierge/conciergeMenus");

const ITEMS = {
  concierge: {
    id: "btn_concierge",
    route: "concierge",
    ru: "🌿 Помочь подобрать практику",
    kz: "🌿 Практиканы таңдауға көмек",
    labelRu: "Помочь подобрать практику",
    labelKz: "Практиканы таңдауға көмек",
    descRu: "Мягкий подбор",
    descKz: "Жұмсақ таңдау"
  },
  price: {
    id: "btn_price",
    route: "price",
    ru: "💰 Цены",
    kz: "💰 Бағалар",
    labelRu: "Цены",
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
    ru: "🌸 Подробнее о практиках",
    kz: "🌸 Практикалар",
    labelRu: "Подробнее о практиках",
    labelKz: "Практикалар",
    descRu: "Что мы делаем",
    descKz: "Практикалар"
  },
  practices_more: {
    id: "btn_practices_more",
    route: "practices",
    ru: "🌿 Другие практики",
    kz: "🌿 Басқа практикалар",
    labelRu: "Другие практики",
    labelKz: "Басқа практикалар",
    descRu: "Список практик",
    descKz: "Практикалар тізімі"
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
    items: ["concierge", "booking", "price", "address", "contra", "practices"],
    maxChoice: 6
  },
  concierge_emotion: {
    type: "concierge_list",
    list: "emotions",
    maxChoice: 8
  },
  concierge_outcome: {
    type: "concierge_list",
    list: "outcomes",
    maxChoice: 7
  },
  concierge_card: {
    type: "concierge_list",
    list: "card",
    maxChoice: 3
  },
  practices_picker: {
    type: "practice_picker",
    maxChoice: 8
  },
  booking_service: {
    type: "practice_picker",
    maxChoice: 8
  },
  after_practice_detail: {
    items: ["booking", "contra", "practices_more", "back"],
    maxChoice: 4
  },
  after_price: {
    items: ["booking", "practices", "address", "back"],
    maxChoice: 4
  },
  after_address: {
    items: ["booking", "price", "session", "back"],
    maxChoice: 4
  },
  after_contra: {
    items: ["booking", "practices", "back"],
    maxChoice: 4
  },
  after_practices: {
    items: ["booking", "price", "address", "back"],
    maxChoice: 4
  },
  after_session: {
    items: ["booking", "price", "address", "back"],
    maxChoice: 4
  },
  default: {
    items: ["concierge", "booking", "price", "address", "contra", "practices"],
    maxChoice: 6
  }
};

const MAIN_NUMERIC = {
  1: "concierge",
  2: "booking",
  3: "price",
  4: "address",
  5: "contraindications",
  6: "practices"
};

const ID_TO_ROUTE = Object.fromEntries(Object.values(ITEMS).map((i) => [i.id, i.route]));
for (const p of PRACTICE_PICKER) {
  ID_TO_ROUTE[p.buttonId] = p.route;
}
for (const e of EMOTIONS) {
  ID_TO_ROUTE[e.buttonId] = "concierge_emotion_pick";
}
for (const o of OUTCOMES) {
  ID_TO_ROUTE[o.buttonId] = "concierge_outcome_pick";
}
for (const c of CARD_ACTIONS) {
  ID_TO_ROUTE[c.buttonId] = c.route;
}

const ROUTE_TO_MENU = {
  price: "after_price",
  address: "after_address",
  contraindications: "after_contra",
  practices: "practices_picker",
  services: "practices_picker",
  practice_five: "after_practice_detail",
  practice_five_fire: "after_practice_detail",
  practice_five_bamboo: "after_practice_detail",
  practice_mukaino: "after_practice_detail",
  practice_breath: "after_practice_detail",
  practice_earthflow: "after_practice_detail",
  practice_bars: "after_practice_detail",
  session: "after_session",
  five_comparison: "after_practices",
  breathing_life: "after_practices",
  breathing_gaya_earthflow: "after_practices",
  five_continents: "after_practices",
  back: "main",
  concierge: "concierge_emotion",
  concierge_detail: "after_practice_detail",
  concierge_book: "main",
  concierge_other: "practices_picker",
  booking: "booking_service",
  greeting: "main",
  thanks: "main"
};

function getMenuContextForRoute(routeName) {
  return ROUTE_TO_MENU[routeName] || "default";
}

function getContextMaxChoice(context) {
  const cfg = MENU_CONTEXTS[context] || MENU_CONTEXTS.default;
  return cfg.maxChoice || 4;
}

function getContextItems(context) {
  const cfg = MENU_CONTEXTS[context] || MENU_CONTEXTS.default;
  if (cfg.type === "practice_picker") return [];
  return cfg.items.map((key) => ITEMS[key]).filter(Boolean);
}

function buildMenuBlock(language, context, options = {}) {
  const lang = language === "kz" ? "kz" : "ru";

  if (context === "concierge_emotion") {
    return {
      context,
      header: BRAND.header,
      body: "👇",
      footer: getMenuFooter(),
      buttons: buildConciergeButtons(EMOTIONS, lang, 3)
    };
  }

  if (context === "concierge_outcome") {
    return {
      context,
      header: BRAND.header,
      body: "👇",
      footer: getMenuFooter(),
      buttons: buildConciergeButtons(OUTCOMES, lang, 3)
    };
  }

  if (context === "concierge_card") {
    return {
      context,
      header: BRAND.header,
      body: "👇",
      footer: getMenuFooter(),
      buttons: buildConciergeButtons(CARD_ACTIONS, lang, 3)
    };
  }

  if (context === "practices_picker" || context === "booking_service") {
    const buttons = [
      ...PRACTICE_PICKER.map((p) => ({
        buttonId: p.buttonId,
        buttonText: lang === "kz" ? p.labelKz : p.labelRu
      })),
      {
        buttonId: "btn_practices_back",
        buttonText: lang === "kz" ? "⬅️ Артқа" : "⬅️ Назад"
      }
    ];
    return {
      context,
      header: BRAND.header,
      body: options.fullBody ? getMenuBody(language) : "👇",
      footer: getMenuFooter(),
      buttons
    };
  }

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

function getMenuTextBlock(language, context = "main") {
  const lang = language === "kz" ? "kz" : "ru";

  if (context === "practices_picker" || context === "booking_service") {
    return getPracticePickerMenuBlock(language);
  }

  if (context === "concierge_emotion") {
    return getConciergeEmotionMenu(language);
  }

  if (context === "concierge_outcome") {
    return getConciergeOutcomeMenu(language);
  }

  if (context === "concierge_card") {
    return getConciergeCardMenu(language);
  }

  if (context === "main" || context === "default") {
    const items = getContextItems(context);
    const intro =
      lang === "ru"
        ? "Выберите, пожалуйста, что вам сейчас ближе:"
        : "Қазір не жақын?";
    const lines = items.map((item, i) => `${i + 1}️⃣ ${item[lang]}`).join("\n");
    const footer =
      lang === "ru" ? "Можно просто отправить цифру 🌿" : "Санды жіберіңіз 🌿";
    return `${intro}\n\n${lines}\n\n${footer}`;
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
  return (
    /[1-8]️⃣/.test(text) ||
    /Можно просто отправить цифру|Санды жіберіңіз 🌿|Можно отправить цифру 🌿/.test(text)
  );
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
    .replace(/^[\s💰📅📍⚠️🌿⬅️0-9️⃣]+/u, "")
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
LABEL_TO_ROUTE["цена"] = "price";
LABEL_TO_ROUTE["узнать цены"] = "price";
LABEL_TO_ROUTE["бағалар"] = "price";
LABEL_TO_ROUTE["баға"] = "price";
LABEL_TO_ROUTE["запись"] = "booking";
LABEL_TO_ROUTE["записаться"] = "booking";
LABEL_TO_ROUTE["адрес"] = "address";
LABEL_TO_ROUTE["противопоказания"] = "contraindications";
LABEL_TO_ROUTE["назад"] = "back";
LABEL_TO_ROUTE["артқа"] = "back";
LABEL_TO_ROUTE["подробнее о практиках"] = "practices";
LABEL_TO_ROUTE["практикалар"] = "practices";
LABEL_TO_ROUTE["помочь подобрать практику"] = "concierge";
LABEL_TO_ROUTE["практиканы таңдауға көмек"] = "concierge";
LABEL_TO_ROUTE["подобрать практику"] = "concierge";
LABEL_TO_ROUTE["как проходит сеанс"] = "session";
LABEL_TO_ROUTE["сеанс қалай"] = "session";
registerPracticeLabels(LABEL_TO_ROUTE, normalizeLabel);

function parseNumericChoice(text, menuContext) {
  const raw = String(text || "").trim();
  const max = getContextMaxChoice(menuContext);
  const digitRe = new RegExp(`^([1-${max}])[️⃣]?\\s*$`, "u");
  const digit = raw.match(digitRe) || raw.match(new RegExp(`^([1-${max}])$`));
  if (!digit) return null;

  const n = Number(digit[1]);

  if (menuContext === "concierge_card") {
    const action = CARD_ACTIONS[n - 1];
    return action?.route || null;
  }

  if (menuContext === "practices_picker" || menuContext === "booking_service") {
    if (n === 8) return "back";
    return PRACTICE_PICKER[n - 1]?.route || null;
  }

  if (menuContext === "main" || menuContext === "default") {
    return MAIN_NUMERIC[n] || null;
  }

  const items = getContextItems(menuContext);
  return items[n - 1]?.route || null;
}

function resolveMenuAction(buttonId, buttonText, menuContext = "main") {
  if (buttonId && ID_TO_ROUTE[buttonId]) return ID_TO_ROUTE[buttonId];

  if (menuContext === "practices_picker" || menuContext === "booking_service") {
    const picked = resolvePracticePickerChoice(buttonText, buttonId);
    if (picked) return picked;
  }

  const raw = String(buttonText || "").trim();
  const numericRoute = parseNumericChoice(raw, menuContext);
  if (numericRoute) return numericRoute;

  const normalized = normalizeLabel(buttonText);
  if (LABEL_TO_ROUTE[normalized]) return LABEL_TO_ROUTE[normalized];

  const max = getContextMaxChoice(menuContext);
  const withSuffix = raw.match(new RegExp(`^([1-${max}])[️⃣]?[\\s.)-–]`, "u"));
  if (withSuffix) {
    const n = Number(withSuffix[1]);
    if (menuContext === "practices_picker" || menuContext === "booking_service") {
      if (n === 8) return "back";
      return PRACTICE_PICKER[n - 1]?.route || null;
    }
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
