const { DISPLAY_NAMES, WHY_CHOSEN } = require("./constants");
const { getServiceMeta } = require("./recommendationEngine");
const { formatPracticeDetail } = require("../content/practices");

function t(language, ru, kz) {
  return language === "kz" ? kz : ru;
}

function getEmotionQuestion(language) {
  return t(
    language,
    "Что вы сейчас ощущаете больше всего? 🌿",
    "Қазір не сезінесіз? 🌿"
  );
}

function getOutcomeQuestion(language) {
  return t(
    language,
    "Что вам сейчас хотелось бы почувствовать? 🤍",
    "Қазір не сезінгіңіз келеді? 🤍"
  );
}

function getEmotionTransition(language) {
  return t(
    language,
    "Спасибо, что поделились 🤍\n\nЯ рядом — без спешки.",
    "Бөліскеніңіз үшін рахмет 🤍\n\nМұнда асықпай болады."
  );
}

function getMatchingTransition(language) {
  return t(
    language,
    "Слушаю вас бережно… подбираю практику 🌿",
    "Абайлап тыңдап, практиканы таңдап жатырмын 🌿"
  );
}

function getEmotionalLeadIn(language, practiceId) {
  const leads = {
    five: {
      ru: "Сейчас вашему состоянию может особенно подойти практика глубокого расслабления и мягкого восстановления 🌿",
      kz: "Қазіргі күйіңізге терең босану мен жұмсақ қалпына келу практикасы жақсы келуі мүмкін 🌿"
    },
    five_fire: {
      ru: "Вам может откликнуться тёплый ритуал с мягким огнём — для глубокого расслабления и уюта 🌿",
      kz: "Жұмсақ отпен жылы ритуал — терең босану мен жайлылық үшін 🌿"
    },
    five_bamboo: {
      ru: "Вам может подойти бережная работа с телом и снятие зажимов — в спокойном темпе 🌿",
      kz: "Денемен абайлап жұмыс және кернеуді жіберу — тыныш темпте 🌿"
    },
    mukaino: {
      ru: "Сейчас может быть уместен мягкий Mukaino M-Test — чтобы почувствовать тело и свой ритм 🌿",
      kz: "Mukaino M-Test — денені сезіну және өз ритміңізді табуға жұмсақ көмек 🌿"
    },
    breath: {
      ru: "Вашему состоянию может подойти дыхательная практика — для внутреннего выдоха и спокойствия 🌿",
      kz: "Дем алу практикасы — ішкі дем алу мен тыныштық үшін 🌿"
    },
    earthflow: {
      ru: "Сейчас может особенно поддержать EarthFlow — мягкий баланс и ощущение опоры 🌿",
      kz: "EarthFlow — жұмсақ баланс пен тірек сезімі үшін 🌿"
    },
    bars: {
      ru: "Вам может быть близок Access Bars — тихий отдых для нервной системы и головы 🌿",
      kz: "Access Bars — жүйке жүйесі мен ойға тыныш дем алу 🌿"
    }
  };
  const lang = language === "kz" ? "kz" : "ru";
  return leads[practiceId]?.[lang] || leads.earthflow[lang];
}

function getShortCardDescription(language, practiceId) {
  const detail = formatPracticeDetail(practiceId, language);
  if (!detail) return "";
  const lines = detail.split("\n").filter(Boolean);
  const whatLine = lines.find((l) => /^(Что это|Бұл не):/i.test(l));
  if (whatLine) {
    return whatLine.replace(/^(Что это|Бұл не):\s*/i, "").trim();
  }
  return lines.slice(1, 3).join(" ").slice(0, 220);
}

function buildRecommendationCard(language, practiceId) {
  const lang = language === "kz" ? "kz" : "ru";
  const meta = getServiceMeta(practiceId);
  const name = DISPLAY_NAMES[practiceId]?.[lang] || meta?.name || practiceId;
  const why = WHY_CHOSEN[practiceId]?.[lang] || "";
  const shortDesc = getShortCardDescription(language, practiceId);
  const duration = meta?.duration || "";
  const price = meta?.price || "";
  const lead = getEmotionalLeadIn(language, practiceId);

  if (lang === "kz") {
    return `${lead}

✨ ${name}

${shortDesc}

Жиі не үшін таңдайды: ${why}

⏳ ${duration}
💰 ${price}`;
  }

  return `${lead}

✨ ${name}

${shortDesc}

Для чего чаще выбирают: ${why}

⏳ ${duration}
💰 ${price}`;
}

module.exports = {
  getEmotionQuestion,
  getOutcomeQuestion,
  getEmotionTransition,
  getMatchingTransition,
  buildRecommendationCard
};
