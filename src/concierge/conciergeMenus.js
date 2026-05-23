const { EMOTIONS, OUTCOMES, CARD_ACTIONS } = require("./constants");

function buildNumberedMenu(items, language, options = {}) {
  const lang = language === "kz" ? "kz" : "ru";
  const labelKey = lang === "kz" ? "labelKz" : "labelRu";
  const lines = items.map((item, i) => `${i + 1}️⃣ ${item[labelKey]}`).join("\n");
  const footer =
    options.footer ||
    (lang === "kz" ? "Санды жіберіңіз 🌿" : "Можно просто отправить цифру 🌿");
  const backLabel = lang === "kz" ? "Артқа" : "Назад";
  const withBack = options.withBack
    ? `\n${items.length + 1}️⃣ ${backLabel}`
    : "";
  return `${lines}${withBack}\n\n${footer}`;
}

function getConciergeEmotionMenu(language) {
  return buildNumberedMenu(EMOTIONS, language, { withBack: true });
}

function getConciergeOutcomeMenu(language) {
  return buildNumberedMenu(OUTCOMES, language, { withBack: true });
}

function getConciergeCardMenu(language) {
  return buildNumberedMenu(CARD_ACTIONS, language);
}

function buildConciergeButtons(items, language, max = 3) {
  const lang = language === "kz" ? "kz" : "ru";
  const labelKey = lang === "kz" ? "labelKz" : "labelRu";
  return items.slice(0, max).map((item) => ({
    buttonId: item.buttonId,
    buttonText: item[labelKey]
  }));
}

module.exports = {
  getConciergeEmotionMenu,
  getConciergeOutcomeMenu,
  getConciergeCardMenu,
  buildConciergeButtons,
  EMOTIONS,
  OUTCOMES,
  CARD_ACTIONS
};
