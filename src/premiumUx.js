/**
 * Premium wellness concierge — один элегантный ответ, меньше меню, guided recommendations.
 */

const { getReturningGreeting } = require("./brand");
const { DISPLAY_NAMES } = require("./concierge/constants");
const { getServiceMeta } = require("./concierge/recommendationEngine");

/** routing intent (emotionalRouting) → concierge emotion id */
const ROUTING_TO_EMOTION = {
  fatigue: "fatigue",
  anxiety: "anxiety",
  body_tension: "body_tension",
  low_energy: "no_energy",
  emotional_exhaustion: "emotional_exhaustion",
  need_relaxation: "want_relax",
  need_calm: "want_peace",
  heavy_distress: "emotional_exhaustion"
};

/** Emotional mapping → 1–2 guided practices (concierge, не каталог) */
const ROUTING_RECOMMENDATIONS = {
  fatigue: { primary: "earthflow", alt: "five" },
  anxiety: { primary: "bars", alt: "earthflow" },
  body_tension: { primary: "five_bamboo", alt: "mukaino" },
  low_energy: { primary: "earthflow", alt: "five" },
  emotional_exhaustion: { primary: "earthflow", alt: "bars" },
  need_relaxation: { primary: "five", alt: "five_fire" },
  need_calm: { primary: "earthflow", alt: "bars" },
  heavy_distress: { primary: "earthflow", alt: "bars" }
};

/** Concierge emotion id → routing intent */
const CONCIERGE_EMOTION_TO_ROUTING = {
  fatigue: "fatigue",
  anxiety: "anxiety",
  body_tension: "body_tension",
  no_energy: "low_energy",
  emotional_exhaustion: "emotional_exhaustion",
  want_relax: "need_relaxation",
  want_peace: "need_calm"
};

const WELCOME_FEELING_ROUTES = {
  fatigue: "__intent_fatigue__",
  anxiety: "__intent_anxiety__",
  need_relaxation: "__intent_need_relaxation__"
};

const PRACTICE_BENEFITS = {
  earthflow: {
    ru: ["замедлиться", "снять внутреннее напряжение", "почувствовать больше спокойствия"],
    kz: ["баяуласу", "ішкі кернеуді жіберу", "көбірек тыныштық сезіну"]
  },
  five: {
    ru: ["глубоко отдохнуть", "восстановить силы", "мягко выдохнуть"],
    kz: ["терең дем алу", "қуатты қалпына келтіру", "жұмсақ босану"]
  },
  breath: {
    ru: ["успокоить дыхание", "снизить тревожность", "вернуть внутренний ритм"],
    kz: ["демді тыныштандыру", "мазасыздықты жеңілдету", "ішкі ритмді табу"]
  },
  bars: {
    ru: ["дать отдых нервной системе", "отпустить напряжение в голове", "почувствовать лёгкость"],
    kz: ["жүйке жүйесіне дем алу", "бас кернеуін жіберу", "жеңілдік сезіну"]
  },
  five_bamboo: {
    ru: ["снять зажимы в теле", "улучшить подвижность", "почувствовать лёгкость"],
    kz: ["денедегі кернеуді жіберу", "қозғалысқа жеңілдік", "жеңіл сезіну"]
  },
  mukaino: {
    ru: ["лучше услышать тело", "мягко восстановить баланс", "без спешки и давления"],
    kz: ["денені сезіну", "балансты жұмсақ қалпына келтіру", "асықпай"]
  }
};

const INTERPRETATION = {
  ru: {
    fatigue:
      "Когда накапливается усталость, телу часто хочется замедлиться и мягко восстановить силы 🌿",
    anxiety:
      "Когда внутри накапливается напряжение, телу часто хочется замедлиться и почувствовать больше внутреннего спокойствия 🌿",
    body_tension:
      "Когда тело держит напряжение, важны бережный контакт и мягкое освобождение без спешки 🌿",
    low_energy:
      "Когда мало сил, телу нужен спокойный ритм и мягкая перезагрузка — без давления на себя 🌿",
    emotional_exhaustion:
      "Когда внутри много опустошения, телу и нервной системе важны тишина и бережное восстановление 🌿",
    need_relaxation:
      "Желание расслабиться — очень естественное. Телу хочется глубоко выдохнуть и отпустить лишнее 🌿",
    need_calm:
      "Когда хочется спокойствия, телу и нервной системе важны тишина и мягкий ритм 🌿",
    heavy_distress:
      "Сейчас может быть особенно тяжело — здесь можно не спешить и быть бережной к себе 🌿"
  },
  kz: {
    fatigue:
      "Шаршау жиналғанда, дене баяуласу мен жұмсақ қалпына келуді қалауы мүмкін 🌿",
    anxiety:
      "Ішкі кернеу жиналғанда, дене баяулап, көбірек тыныштық сезінгісі келуі мүмкін 🌿",
    body_tension:
      "Дене кернеуді ұстап тұрғанда, асықпай, жұмсақ қамқорлық маңызды 🌿",
    low_energy:
      "Қуаты аз болғанда, өзіңізден артық талап етпей-ақ, жұмсақ қалпына келу маңызды 🌿",
    emotional_exhaustion:
      "Ішкі шаршау мен босаңсу жиналғанда, денеге тыныштық керек 🌿",
    need_relaxation:
      "Босанғыңыз келуі — өте табиғи. Дене терең дем алуды қалауы мүмкін 🌿",
    need_calm:
      "Тыныштық қажет болғанда, дене мен жүйкеге асықпай қарау маңызды 🌿",
    heavy_distress:
      "Қазір ауыр болуы мүмкін — мұнда асықпай, өзіңізге жұмсақ болыңыз 🌿"
  }
};

const WHY_BULLETS = {
  ru: {
    fatigue: ["восстановить силы", "замедлиться", "почувствовать больше опоры"],
    anxiety: [
      "снизить внутреннее напряжение",
      "почувствовать лёгкость",
      "немного выдохнуть"
    ],
    body_tension: ["снять зажимы", "почувствовать лёгкость в теле", "двигаться свободнее"],
    low_energy: ["мягко восстановить энергию", "заземлиться", "не перегружать себя"],
    emotional_exhaustion: ["отдохнуть эмоционально", "почувствовать тишину", "бережно восстановиться"],
    need_relaxation: ["глубоко расслабиться", "выдохнуть", "отпустить накопившееся"],
    need_calm: ["успокоить нервную систему", "найти внутренний ритм", "почувствовать больше тишины"],
    heavy_distress: ["почувствовать безопасность", "замедлиться", "быть бережной к себе"]
  },
  kz: {
    fatigue: ["қуатты қалпына келтіру", "баяуласу", "тірек сезіну"],
    anxiety: ["ішкі кернеуді жеңілдету", "жеңілдік сезіну", "бір сауық дем алу"],
    body_tension: ["кернеуді жіберу", "денеде жеңілдік", "еркін қозғалу"],
    low_energy: ["қуатты жұмсақ қалпына келтіру", "жерге бекіну", "өзіңізді асырмай қамқор ету"],
    emotional_exhaustion: ["эмоциялық дем алу", "тыныштық", "абайлап қалпына келу"],
    need_relaxation: ["терең босану", "дем алу", "жиналғанды жіберу"],
    need_calm: ["жүйкені тыныштандыру", "ішкі ритм", "көбірек тыныштық"],
    heavy_distress: ["қауіпсіздік сезіну", "баяуласу", "өзіңізге жұмсақ болу"]
  }
};

const EMPATHY = {
  ru: {
    fatigue: "Понимаю 🤍",
    anxiety: "Понимаю 🤍",
    body_tension: "Понимаю 🤍",
    low_energy: "Понимаю 🤍",
    emotional_exhaustion: "Понимаю 🤍",
    need_relaxation: "Понимаю 🤍",
    need_calm: "Понимаю 🤍",
    heavy_distress: "Мне очень жаль, что вам сейчас так тяжело 🤍"
  },
  kz: {
    fatigue: "Түсінемін 🤍",
    anxiety: "Түсінемін 🤍",
    body_tension: "Түсінемін 🤍",
    low_energy: "Түсінемін 🤍",
    emotional_exhaustion: "Түсінемін 🤍",
    need_relaxation: "Түсінемін 🤍",
    need_calm: "Түсінемін 🤍",
    heavy_distress: "Қазір сізге ауыр екенін түсінемін 🤍"
  }
};

const RECOMMEND_ACTIONS = {
  ru: `1️⃣ Мягко записаться
2️⃣ Узнать подробнее
3️⃣ Посмотреть другой вариант`,
  kz: `1️⃣ Жұмсақ жазылу
2️⃣ Толығырақ білу
3️⃣ Басқа нұсқаны көру`
};

function langKey(language) {
  return language === "kz" ? "kz" : "ru";
}

function practiceDisplayName(practiceId, language) {
  const lang = langKey(language);
  return DISPLAY_NAMES[practiceId]?.[lang] || getServiceMeta(practiceId)?.name || practiceId;
}

function recommendByRoutingIntent(routingIntent) {
  return (
    ROUTING_RECOMMENDATIONS[routingIntent] || {
      primary: "earthflow",
      alt: "bars"
    }
  );
}

function mapRoutingToEmotionId(routingIntent) {
  return ROUTING_TO_EMOTION[routingIntent] || "fatigue";
}

function getPremiumWelcomeMessage(session, language) {
  const lang = langKey(language);
  if (session?.profile?.name && session.profile.visits > 0) {
    return `${getReturningGreeting(lang, session.profile.name)}\n\n${getWelcomeFeelingPrompt(lang)}`;
  }
  if (lang === "kz") {
    return `Сәлеметсіз бе 🤍
Sakina Wellness-ке жаздыңыз — жақсы.

Қазір сізге не жақын сезіледі? 🌿

${getWelcomeFeelingMenu("kz")}`;
  }
  return `Здравствуйте 🤍
Рада, что вы написали в Sakina Wellness.

Что вам сейчас ощущается ближе всего? 🌿

${getWelcomeFeelingMenu("ru")}`;
}

function getWelcomeFeelingPrompt(lang) {
  return lang === "kz"
    ? "Қазір сізге не жақын сезіледі? 🌿"
    : "Что вам сейчас ощущается ближе всего? 🌿";
}

function getWelcomeFeelingMenu(lang) {
  if (lang === "kz") {
    return `1️⃣ 🌸 Шаршау / қуат жоқ
2️⃣ 🌿 Мазасыздық немесе кернеу
3️⃣ 🤍 Босанғым келеді
4️⃣ 📅 Жазылу`;
  }
  return `1️⃣ 🌸 Усталость / нет сил
2️⃣ 🌿 Тревога или напряжение
3️⃣ 🤍 Хочу расслабиться
4️⃣ 📅 Записаться`;
}

function getCompactMainMenu(lang) {
  if (lang === "kz") {
    return `🌿 Қажет болса:

1️⃣ 🌸 Практика таңдау
2️⃣ 📅 Жазылу
3️⃣ 💰 Бағалар
4️⃣ 📍 Мекенжай`;
  }
  return `🌿 Если захотите:

1️⃣ 🌸 Подобрать практику
2️⃣ 📅 Записаться
3️⃣ 💰 Цены
4️⃣ 📍 Адрес`;
}

function getAfterBookingMessage(language) {
  const lang = langKey(language);
  if (lang === "kz") {
    return `Рахмет 🤍
Жазылымыңызды әкімшіге жеткіземін.
Sakina Wellness-тің тыныш кеңістігінде күтеміз 🌿

${getAfterBookingActions("kz")}`;
  }
  return `Благодарю вас 🤍
Передам запись администратору.
Будем ждать вас в спокойном пространстве Sakina Wellness 🌿

${getAfterBookingActions("ru")}`;
}

function getAfterBookingActions(lang) {
  if (lang === "kz") {
    return `1️⃣ 🌸 Тағы практика таңдау
2️⃣ 📍 Мекенжай
3️⃣ 💰 Бағалар`;
  }
  return `1️⃣ 🌸 Подобрать ещё практику
2️⃣ 📍 Адрес
3️⃣ 💰 Цены`;
}

/**
 * Guided recommendation — одно сообщение, 1 основная + 1 альтернатива.
 */
function buildPremiumRecommendationMessage(language, routingIntent, options = {}) {
  const lang = langKey(language);
  const { primary, alt } = recommendByRoutingIntent(routingIntent);
  const empathyLine = EMPATHY[lang][routingIntent] || EMPATHY[lang].fatigue;
  const interpret =
    INTERPRETATION[lang][routingIntent] || INTERPRETATION[lang].fatigue;
  const empathy =
    options.skipEmpathy === true ? "" : `${empathyLine}\n${interpret}\n\n`;
  const primaryName = practiceDisplayName(primary, lang);
  const altName = practiceDisplayName(alt, lang);
  const bullets = WHY_BULLETS[lang][routingIntent] || WHY_BULLETS[lang].fatigue;
  const bulletLines = bullets.map((b) => `• ${b}`).join("\n");

  if (lang === "kz") {
    return `${empathy}Мен сізге жұмсақ түрде ${primaryName} ұсынар едім.
Бұл практика көбіне мына кезде таңдалады:
${bulletLines}

Егер керек болса, ${altName} да жұмсақ балама бола алады.

${RECOMMEND_ACTIONS.kz}`;
  }

  return `${empathy}Я бы мягко предложила ${primaryName}.
Эту практику часто выбирают, когда хочется:
${bulletLines}

Если хочется другой формат, рядом есть мягкая альтернатива — ${altName}.

${RECOMMEND_ACTIONS.ru}`;
}

/**
 * Текст / цифра с welcome_feeling или concierge emotion → routing intent.
 */
function resolveEmotionalSelectionRoute(text, buttonId, menuContext = "main") {
  const { resolveMenuAction } = require("./menus");
  const route = resolveMenuAction(buttonId, text, menuContext);
  if (route?.startsWith("__intent_")) {
    return route.replace("__intent_", "").replace(/__$/, "");
  }

  const norm = String(text || "")
    .trim()
    .toLowerCase()
    .replace(/^[\s0-9️⃣🌸🌿🤍]+/u, "")
    .replace(/\s+/g, " ");

  const WELCOME_LABELS = [
    { keys: [/усталост|нет сил|шаршау|қуат жоқ/], intent: "fatigue" },
    { keys: [/тревог|напряжен|мазасыз|кернеу/], intent: "anxiety" },
    { keys: [/расслаб|босанғым|босану/], intent: "need_relaxation" }
  ];

  for (const row of WELCOME_LABELS) {
    if (row.keys.some((re) => re.test(norm))) return row.intent;
  }

  const { EMOTIONS } = require("./concierge/constants");
  if (buttonId) {
    const em = EMOTIONS.find((e) => e.buttonId === buttonId);
    if (em) return CONCIERGE_EMOTION_TO_ROUTING[em.id] || em.id;
  }
  for (const em of EMOTIONS) {
    const ru = em.labelRu.toLowerCase();
    const kz = em.labelKz.toLowerCase();
    if (norm.includes(ru) || norm.includes(kz)) {
      return CONCIERGE_EMOTION_TO_ROUTING[em.id] || em.id;
    }
  }

  return null;
}

function persistPremiumRecommendation(session, language, routingIntent) {
  const emotionId = mapRoutingToEmotionId(routingIntent);
  const { primary, alt } = recommendByRoutingIntent(routingIntent);
  session.emotionalState = emotionId;
  session.recommendedPractice = primary;
  session.recommendationFlow = true;
  session.lastPracticeId = primary;
  session.lastEmotionalIntent = routingIntent;
  session.currentFlow = "concierge";
  session.currentStep = "result";
  session.concierge = {
    active: true,
    step: "result",
    emotion: emotionId,
    outcome: "deep_relax",
    practiceId: primary,
    alternatives: [alt],
    language: langKey(language),
    startedAt: Date.now()
  };
  return { primary, alt, emotionId };
}

function buildPremiumRecommendationOutbound(session, language, routingIntent, options = {}) {
  persistPremiumRecommendation(session, language, routingIntent);
  const reply = buildPremiumRecommendationMessage(language, routingIntent, options);
  return {
    reply,
    messages: [{ type: "text", text: reply }],
    menuContext: "recommendation_card",
    skipMenu: true
  };
}

/** Контексты, где меню уже в тексте — не дублировать через enrichOutbound */
const NO_AUTO_MENU_APPEND = new Set([
  "recommendation_card",
  "concierge_card",
  "welcome_feeling",
  "emotional_light",
  "emotional_heavy",
  "after_booking",
  "booking_service",
  "practices_picker",
  "concierge_emotion",
  "concierge_outcome"
]);

function shouldAutoAppendMenu(menuContext, skipMenu) {
  if (skipMenu) return false;
  if (NO_AUTO_MENU_APPEND.has(menuContext)) return false;
  return menuContext === "main" || menuContext === "default";
}

function buildAlternativeRecommendationOutbound(session, language) {
  const alt = session.concierge?.alternatives?.[0] || session.recommendedPractice;
  const primary = alt || "earthflow";
  const routingIntent = session.lastEmotionalIntent || "fatigue";
  session.recommendedPractice = primary;
  session.lastPracticeId = primary;
  if (session.concierge) session.concierge.practiceId = primary;

  const lang = langKey(language);
  const primaryName = practiceDisplayName(primary, lang);
  const bullets = (PRACTICE_BENEFITS[primary] || PRACTICE_BENEFITS.earthflow)[lang];
  const bulletLines = bullets.map((b) => `— ${b}`).join("\n");
  const whyLines = (WHY_BULLETS[lang][routingIntent] || WHY_BULLETS[lang].fatigue)
    .map((b) => `• ${b}`)
    .join("\n");

  const reply =
    lang === "kz"
      ? `Басқа жұмсақ нұсқа — ${primaryName} 🌿
Оны жиі мына үшін таңдайды:
${whyLines}

${RECOMMEND_ACTIONS.kz}`
      : `Другой мягкий вариант — ${primaryName} 🌿
Её часто выбирают, когда хочется:
${whyLines}

${RECOMMEND_ACTIONS.ru}`;

  return {
    reply,
    messages: [{ type: "text", text: reply }],
    menuContext: "recommendation_card",
    skipMenu: true
  };
}

module.exports = {
  ROUTING_RECOMMENDATIONS,
  CONCIERGE_EMOTION_TO_ROUTING,
  WELCOME_FEELING_ROUTES,
  RECOMMEND_ACTIONS,
  recommendByRoutingIntent,
  mapRoutingToEmotionId,
  resolveEmotionalSelectionRoute,
  getPremiumWelcomeMessage,
  getWelcomeFeelingMenu,
  getCompactMainMenu,
  getAfterBookingMessage,
  getAfterBookingActions,
  buildPremiumRecommendationMessage,
  buildPremiumRecommendationOutbound,
  buildAlternativeRecommendationOutbound,
  persistPremiumRecommendation,
  shouldAutoAppendMenu,
  getWelcomeFeelingPrompt
};
