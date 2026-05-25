const { handleIncomingMessage } = require("../src/conversation");

const logger = {
  info() {},
  warn() {},
  error() {},
  debug() {}
};

async function run() {
  const userId = "concierge-flow-test";

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

  const emotion = await handleIncomingMessage({
    userId,
    text: "4",
    menuContext: "concierge_emotion",
    logger
  });

  if (emotion.menuContext !== "concierge_outcome") {
    console.error("Expected concierge_outcome after emotion choice, got", emotion.menuContext);
    process.exit(1);
  }

  const outcome = await handleIncomingMessage({
    userId,
    text: "4",
    menuContext: "concierge_outcome",
    logger
  });

  if (outcome.menuContext !== "concierge_card") {
    console.error("Expected concierge_card after outcome choice, got", outcome.menuContext);
    process.exit(1);
  }

  if (!/Access Bars|Five|EarthFlow|Mukaino|дыхательная|Бары/i.test(outcome.reply || "")) {
    console.error("Expected recommendation card, got", outcome.reply);
    process.exit(1);
  }

  console.log("concierge flow OK");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
