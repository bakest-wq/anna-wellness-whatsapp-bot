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

/** Smart map по ТЗ */
const ROUTING_RECOMMENDATIONS = {
  fatigue: { primary: "earthflow", alt: "five" },
  anxiety: { primary: "breath", alt: "bars" },
  body_tension: { primary: "five_bamboo", alt: "mukaino" },
  low_energy: { primary: "earthflow", alt: "five" },
  emotional_exhaustion: { primary: "earthflow", alt: "bars" },
  need_relaxation: { primary: "five", alt: "earthflow" },
  need_calm: { primary: "breath", alt: "bars" },
  heavy_distress: { primary: "earthflow", alt: "bars" }
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

const EMPATHY = {
  ru: {
    fatigue: "Понимаю вас 🤍\nКогда внутри много усталости, телу и нервной системе часто хочется тишины и бережного восстановления.",
    anxiety:
      "Понимаю вас 🤍\nТревога забирает много сил — телу нужна тишина и мягкая, спокойная опора.",
    body_tension:
      "Понимаю вас 🤍\nКогда тело держит напряжение, важен бережный контакт — без спешки и лишних ожиданий.",
    low_energy:
      "Понимаю вас 🤍\nКогда мало сил, телу нужен мягкий ритм — без давления на себя.",
    emotional_exhaustion:
      "Понимаю вас 🤍\nКогда внутри много усталости и опустошения, телу нужны тишина и бережное восстановление.",
    need_relaxation:
      "Понимаю вас 🤍\nЖелание расслабиться — очень естественное. Здесь можно в своём темпе.",
    need_calm:
      "Понимаю вас 🤍\nКогда хочется спокойствия, телу и нервной системе важны тишина и мягкий ритм.",
    heavy_distress:
      "Мне очень жаль, что вам сейчас так тяжело 🤍\nВы можете не спешить. Я рядом — мягко подскажу варианты заботы о себе."
  },
  kz: {
    fatigue:
      "Түсінемін 🤍\nІшкі шаршау жиналған кезде, денеге тыныштық пен жұмсақ қалпына келу керек болады.",
    anxiety:
      "Түсінемін 🤍\nМазасыздық күшті шаршатады — дене мен жүйкеге тыныштық керек.",
    body_tension:
      "Түсінемін 🤍\nДене кернеуді ұстап тұрғанда, асықпай, жұмсақ қамқорлық маңызды.",
    low_energy: "Түсінемін 🤍\nҚуаты аз болғанда, өзіңізден артық талап етпей-ақ, жұмсақ қалпына келу маңызды.",
    emotional_exhaustion:
      "Түсінемін 🤍\nІшкі шаршау мен босаңсу жиналғанда, денеге тыныштық керек.",
    need_relaxation: "Түсінемін 🤍\nБосанғыңыз келуі — өте табиғи. Мұнда өз ритміңізде болады.",
    need_calm: "Түсінемін 🤍\nТыныштық қажет болғанда, дене мен жүйкеге асықпай қарау маңызды.",
    heavy_distress:
      "Қазір сізге ауыр екенін түсінемін 🤍\nАсықпай ала беріңіз. Мен қасыңыздамын — жұмсақ қамқорлық нұсқаларын айтып беремін."
  }
};

const RECOMMEND_ACTIONS = {
  ru: `1️⃣ Подробнее
2️⃣ Записаться
3️⃣ Другой вариант`,
  kz: `1️⃣ Толығырақ
2️⃣ Жазылу
3️⃣ Басқа нұсқа`
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
4️⃣ Практиканы бірге таңдау`;
  }
  return `1️⃣ 🌸 Усталость / нет сил
2️⃣ 🌿 Тревога или напряжение
3️⃣ 🤍 Хочу расслабиться
4️⃣ Подобрать практику вместе`;
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
  const empathy =
    options.skipEmpathy === true
      ? ""
      : `${EMPATHY[lang][routingIntent] || EMPATHY[lang].fatigue}\n\n`;
  const primaryName = practiceDisplayName(primary, lang);
  const altName = practiceDisplayName(alt, lang);
  const bullets = (PRACTICE_BENEFITS[primary] || PRACTICE_BENEFITS.earthflow)[lang];
  const bulletLines = bullets.map((b) => `— ${b}`).join("\n");

  if (lang === "kz") {
    return `${empathy}Жағдайыңызға сай ${primaryName} 🌿
Оны жиі мына үшін таңдайды:
${bulletLines}

Жұмсақ нұсқа ретінде — ${altName}.

${RECOMMEND_ACTIONS.kz}`;
  }

  return `${empathy}Сейчас вашему состоянию может особенно подойти ${primaryName} 🌿
Её часто выбирают, когда хочется:
${bulletLines}

Если захотите мягче — также может откликнуться ${altName}.

${RECOMMEND_ACTIONS.ru}`;
}

function persistPremiumRecommendation(session, language, routingIntent) {
  const emotionId = mapRoutingToEmotionId(routingIntent);
  const { primary, alt } = recommendByRoutingIntent(routingIntent);
  session.emotionalState = emotionId;
  session.recommendedPractice = primary;
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
  const reply =
    lang === "kz"
      ? `Жұмсақ нұсқа ретінде — ${primaryName} 🌿
Оны жиі мына үшін таңдайды:
${bulletLines}

${RECOMMEND_ACTIONS.kz}`
      : `Мягкая альтернатива — ${primaryName} 🌿
Её часто выбирают, когда хочется:
${bulletLines}

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
  RECOMMEND_ACTIONS,
  recommendByRoutingIntent,
  mapRoutingToEmotionId,
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
