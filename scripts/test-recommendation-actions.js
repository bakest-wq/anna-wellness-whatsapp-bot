const { buildPremiumRecommendationOutbound } = require("../src/premiumUx");
const { handleIncomingMessage } = require("../src/conversation");
const { getSession } = require("../src/sessionStore");
const { parseRecommendationAction } = require("../src/recommendationActions");

const session = getSession("rec-action-test");
buildPremiumRecommendationOutbound(session, "ru", "anxiety");

if (!session.recommendationFlow || session.recommendedPractice !== "bars") {
  console.error("FAIL session flags", session.recommendationFlow, session.recommendedPractice);
  process.exit(1);
}

if (parseRecommendationAction("2", null) !== "book") {
  console.error("FAIL parse 2");
  process.exit(1);
}

(async () => {
  session.menuContext = "main";
  const r = await handleIncomingMessage({
    userId: "rec-action-test",
    text: "2",
    isButton: false,
    menuContext: "main",
    openai: null,
    model: "x",
    logger: { info: () => {}, warn: () => {}, error: () => {}, debug: () => {} }
  });

  if (!r?.reply || /Выберите.*практику/i.test(r.reply)) {
    console.error("FAIL book reply", r?.reply);
    process.exit(1);
  }
  if (!/Когда вам было бы комфортно|комфортно прийти/i.test(r.reply)) {
    console.error("FAIL day question", r?.reply?.slice(0, 200));
    process.exit(1);
  }
  const after = getSession("rec-action-test");
  if (after.currentFlow !== "booking" || after.currentStep !== "day") {
    console.error("FAIL booking state", after.currentFlow, after.currentStep);
    process.exit(1);
  }
  console.log("recommendation actions OK");
})();
