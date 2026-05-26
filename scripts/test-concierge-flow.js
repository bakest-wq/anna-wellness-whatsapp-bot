const { handleIncomingMessage } = require("../src/conversation");

const logger = {
  info() {},
  warn() {},
  error() {},
  debug() {}
};

async function run() {
  const userId = `concierge-flow-test-${Date.now()}`;

  const first = await handleIncomingMessage({
    userId,
    text: "1",
    menuContext: "main",
    logger
  });

  if (first.menuContext !== "concierge_emotion") {
    console.error("Expected concierge_emotion after main choice, got", first.menuContext);
    process.exit(1);
  }

  const recommendation = await handleIncomingMessage({
    userId,
    text: "4",
    menuContext: "concierge_emotion",
    logger
  });

  if (recommendation.menuContext !== "recommendation_card") {
    console.error(
      "Expected recommendation_card after emotion choice, got",
      recommendation.menuContext
    );
    process.exit(1);
  }

  if (/небольшая пауза/i.test(recommendation.reply || "")) {
    console.error("Unexpected pause fallback after emotion choice");
    process.exit(1);
  }

  if (!/1️⃣|подробнее|записаться|практик/i.test(recommendation.reply || "")) {
    console.error("Expected recommendation actions, got", recommendation.reply);
    process.exit(1);
  }

  const extraDigit = await handleIncomingMessage({
    userId,
    text: "4",
    menuContext: "recommendation_card",
    logger
  });

  if (extraDigit.menuContext !== "recommendation_card") {
    console.error("Expected recommendation_card after invalid card digit, got", extraDigit.menuContext);
    process.exit(1);
  }

  console.log("concierge flow OK");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
