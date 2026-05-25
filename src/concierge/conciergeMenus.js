const { EMOTIONS, OUTCOMES, CARD_ACTIONS } = require("./constants");

function buildNumberedMenu(items, language, options = {}) {
  const lang = language === "kz" ? "kz" : "ru";
  const labelKey = lang === "kz" ? "labelKz" : "labelRu";
  const lines = items.map((item, i) => `${i + 1}️⃣ ${item[labelKey]}`).join("\n");
  const footer = options.noFooter
    ? ""
    : options.footer ||
      (lang === "kz" ? "" : "");
  const backLabel = lang === "kz" ? "Артқа" : "Назад";
  const withBack = options.withBack
    ? `\n${items.length + 1}️⃣ ${backLabel}`
    : "";
  if (footer) return `${lines}${withBack}\n\n${footer}`;
  return `${lines}${withBack}`.trim();
}

function getConciergeEmotionMenu(language) {
  const lang = language === "kz" ? "kz" : "ru";
  const header =
    lang === "kz"
      ? "Қай күй жақын сезіледі? 🌿\n\n"
      : "Что сейчас ощущается ближе? 🌿\n\n";
  return header + buildNumberedMenu(EMOTIONS, language, { withBack: true, noFooter: true });
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
