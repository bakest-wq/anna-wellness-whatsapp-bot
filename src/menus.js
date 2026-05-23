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

/** Premium главное меню — только текст (fallback), без смешения языков */
const MAIN_MENU_TEXT = {
  ru: `🌿 Что вам сейчас ближе?

1️⃣ 🌸 Помочь подобрать практику
2️⃣ 📅 Записаться
3️⃣ 💰 Цены
4️⃣ 📍 Адрес
5️⃣ ⚠️ Противопоказания
6️⃣ 🌿 Подробнее о практиках

Можно просто отправить цифру 🤍`,
  kz: `🌿 Қазір сізге не жақын?

1️⃣ 🌸 Практика таңдауға көмектесу
2️⃣ 📅 Жазылу
3️⃣ 💰 Бағалар
4️⃣ 📍 Мекенжай
5️⃣ ⚠️ Қарсы көрсетілімдер
6️⃣ 🌿 Практикалар туралы

Жай ғана санды жіберсеңіз болады 🤍`
};

const EMOTIONAL_LIGHT_MENU_TEXT = {
  ru: `1️⃣ 🌸 Помочь подобрать практику
2️⃣ 🌿 Подробнее о практиках
3️⃣ 📅 Записаться
4️⃣ 💰 Цены

Можно просто отправить цифру 🤍`,
  kz: `1️⃣ 🌸 Практика таңдауға көмектесу
2️⃣ 🌿 Практикалар туралы
3️⃣ 📅 Жазылу
4️⃣ 💰 Бағалар

Жай ғана санды жіберсеңіз болады 🤍`
};

const EMOTIONAL_HEAVY_MENU_TEXT = {
  ru: `1️⃣ 🌿 Мягко подобрать практику
2️⃣ 🤍 Просто узнать, как проходит сеанс
3️⃣ 📞 Связаться с администратором

Можно просто отправить цифру 🤍`,
  kz: `1️⃣ 🌿 Жұмсақ практика таңдау
2️⃣ 🤍 Сеанс қалай өтетінін білу
3️⃣ 📞 Әкімшімен байланысу

Жай ғана санды жіберсеңіз болады 🤍`
};

const ITEMS = {
  concierge: {
    id: "btn_concierge",
    route: "concierge",
    ru: "🌸 Помочь подобрать практику",
    kz: "🌸 Практика таңдауға көмектесу",
    labelRu: "Помочь подобрать практику",
    labelKz: "Практика таңдауға көмектесу",
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
    kz: "⚠️ Қарсы көрсетілімдер",
    labelRu: "Противопоказания",
    labelKz: "Қарсы көрсетілімдер",
    descRu: "Рекомендации",
    descKz: "Абайлау"
  },
  practices: {
    id: "btn_practices",
    route: "practices",
    ru: "🌿 Подробнее о практиках",
    kz: "🌿 Практикалар туралы",
    labelRu: "Подробнее о практиках",
    labelKz: "Практикалар туралы",
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
  },
  emotional_concierge: {
    id: "btn_emotional_concierge",
    route: "concierge",
    ru: "🌿 Мягко подобрать практику",
    kz: "🌿 Жұмсақ практика таңдау",
    labelRu: "Мягко подобрать практику",
    labelKz: "Жұмсақ практика таңдау",
    descRu: "Бережный подбор",
    descKz: "Абайлап таңдау"
  },
  admin_contact: {
    id: "btn_admin_contact",
    route: "admin_contact",
    ru: "📞 Связаться с администратором",
    kz: "📞 Әкімшімен байланысу",
    labelRu: "Связаться с администратором",
    labelKz: "Әкімшімен байланысу",
    descRu: "Живой контакт",
    descKz: "Тікелей байланыс"
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
  },
  emotional_light: {
    items: ["concierge", "practices", "booking", "price"],
    maxChoice: 4
  },
  emotional_heavy: {
    items: ["emotional_concierge", "session", "admin_contact"],
    maxChoice: 3
  }
};

const EMOTIONAL_LIGHT_NUMERIC = {
  1: "concierge",
  2: "practices",
  3: "booking",
  4: "price"
};

const EMOTIONAL_HEAVY_NUMERIC = {
  1: "concierge",
  2: "session",
  3: "admin_contact"
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
  admin_contact: "main",
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
    return MAIN_MENU_TEXT[lang];
  }

  if (context === "emotional_light") {
    return EMOTIONAL_LIGHT_MENU_TEXT[lang];
  }

  if (context === "emotional_heavy") {
    return EMOTIONAL_HEAVY_MENU_TEXT[lang];
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

function isMainMenuContext(context) {
  return context === "main" || context === "default";
}

function isEmotionalMenuContext(context) {
  return context === "emotional_light" || context === "emotional_heavy";
}

function messageAlreadyHasMenu(text) {
  if (!text) return false;
  return (
    /Что вам сейчас ближе|Қазір сізге не жақын/.test(text) ||
    /Можно просто отправить цифру 🤍|Жай ғана санды жіберсеңіз болады 🤍/.test(text) ||
    (/[1-6]️⃣/.test(text) && /Помочь подобрать|Практика таңдау|Записаться|Жазылу/.test(text)) ||
    /Мягко подобрать практику|Жұмсақ практика таңдау|Связаться с администратором|Әкімшімен байланысу/.test(
      text
    )
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
LABEL_TO_ROUTE["практика таңдауға көмектесу"] = "concierge";
LABEL_TO_ROUTE["практиканы таңдауға көмек"] = "concierge";
LABEL_TO_ROUTE["подобрать практику"] = "concierge";
LABEL_TO_ROUTE["практикалар туралы"] = "practices";
LABEL_TO_ROUTE["қарсы көрсетілімдер"] = "contraindications";
LABEL_TO_ROUTE["жазылу"] = "booking";
LABEL_TO_ROUTE["мекенжай"] = "address";
LABEL_TO_ROUTE["мягко подобрать практику"] = "concierge";
LABEL_TO_ROUTE["жұмсақ практика таңдау"] = "concierge";
LABEL_TO_ROUTE["связаться с администратором"] = "admin_contact";
LABEL_TO_ROUTE["әкімшімен байланысу"] = "admin_contact";
LABEL_TO_ROUTE["просто узнать, как проходит сеанс"] = "session";
LABEL_TO_ROUTE["сеанс қалай өтетінін білу"] = "session";
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

  if (menuContext === "emotional_light") {
    return EMOTIONAL_LIGHT_NUMERIC[n] || null;
  }

  if (menuContext === "emotional_heavy") {
    return EMOTIONAL_HEAVY_NUMERIC[n] || null;
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
    if (menuContext === "emotional_light") {
      return EMOTIONAL_LIGHT_NUMERIC[n] || null;
    }
    if (menuContext === "emotional_heavy") {
      return EMOTIONAL_HEAVY_NUMERIC[n] || null;
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
  MAIN_MENU_TEXT,
  EMOTIONAL_LIGHT_MENU_TEXT,
  EMOTIONAL_HEAVY_MENU_TEXT,
  ID_TO_ROUTE,
  MAIN_NUMERIC,
  EMOTIONAL_LIGHT_NUMERIC,
  EMOTIONAL_HEAVY_NUMERIC,
  getMenuContextForRoute,
  buildMenuBlock,
  getMenuTextBlock,
  getTextMenuFallback,
  appendMenuToReply,
  enrichOutboundMessages,
  resolveMenuAction,
  getContextItems,
  isMainMenuContext,
  isEmotionalMenuContext,
  messageAlreadyHasMenu
};
