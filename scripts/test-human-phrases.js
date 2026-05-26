const { handleIncomingMessage } = require("../src/conversation");
const { getSession } = require("../src/sessionStore");

const logger = {
  info() {},
  warn() {},
  error() {},
  debug() {}
};

async function checkBookingPrefill() {
  const userId = `human-booking-${Date.now()}`;
  const reply = await handleIncomingMessage({
    userId,
    text: "Здравствуйте, хочу записаться завтра в 15:00 на EarthFlow",
    menuContext: "main",
    logger
  });
  const session = getSession(userId);

  if (session.currentFlow !== "booking") {
    console.error("Expected booking flow, got", session.currentFlow);
    process.exit(1);
  }
  if (session.selectedPractice !== "earthflow") {
    console.error("Expected earthflow prefill, got", session.selectedPractice);
    process.exit(1);
  }
  if (session.bookingDate !== "завтра" || session.bookingTime !== "15:00") {
    console.error("Expected date/time prefill, got", session.bookingDate, session.bookingTime);
    process.exit(1);
  }
  if (!/Как к вам обращаться|атыңыз/i.test(reply.reply || "")) {
    console.error("Expected next missing question (name), got", reply.reply);
    process.exit(1);
  }
}

async function checkBookingPartialPrefill() {
  const userId = `human-day-${Date.now()}`;
  const reply = await handleIncomingMessage({
    userId,
    text: "Здравствуйте, хочу записаться завтра",
    menuContext: "main",
    logger
  });
  const session = getSession(userId);

  if (session.currentFlow !== "booking" || session.bookingDate !== "завтра") {
    console.error("Expected booking with day prefilled, got", {
      flow: session.currentFlow,
      day: session.bookingDate
    });
    process.exit(1);
  }
  if (!/практик|сеанс|выберите/i.test(reply.reply || "")) {
    console.error("Expected service question after day prefill, got", reply.reply);
    process.exit(1);
  }
}

async function checkGreetingWithInfoIntent() {
  const priceUser = `human-price-${Date.now()}`;
  const price = await handleIncomingMessage({
    userId: priceUser,
    text: "Здравствуйте, сколько стоит?",
    menuContext: "main",
    logger
  });
  if (price.menuContext !== "after_price" || !/₸|цен|стоим/i.test(price.reply || "")) {
    console.error("Expected price route, got", price.menuContext, price.reply);
    process.exit(1);
  }

  const addressUser = `human-address-${Date.now()}`;
  const address = await handleIncomingMessage({
    userId: addressUser,
    text: "Здравствуйте, где вы находитесь?",
    menuContext: "main",
    logger
  });
  if (address.menuContext !== "after_address" || !/адрес|aktobe|актоб|мекен/i.test(address.reply || "")) {
    console.error("Expected address route, got", address.menuContext, address.reply);
    process.exit(1);
  }
}

async function checkGreetingWithEmotion() {
  const userId = `human-emotion-${Date.now()}`;
  const reply = await handleIncomingMessage({
    userId,
    text: "Здравствуйте, мне тревожно",
    menuContext: "main",
    logger
  });
  if (reply.menuContext !== "recommendation_card" || !/Access Bars|EarthFlow|Мягко записаться/i.test(reply.reply || "")) {
    console.error("Expected emotional recommendation, got", reply.menuContext, reply.reply);
    process.exit(1);
  }
}

async function run() {
  await checkBookingPrefill();
  await checkBookingPartialPrefill();
  await checkGreetingWithInfoIntent();
  await checkGreetingWithEmotion();
  console.log("human phrases OK");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
