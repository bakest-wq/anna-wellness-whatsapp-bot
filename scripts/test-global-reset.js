const { isGlobalResetIntent } = require("../src/globalIntents");
const { getSession, saveSession } = require("../src/sessionStore");
const { startBookingFlow } = require("../src/sessionMemory");
const { resetConversationState } = require("../src/flowState");
const { processBookingSession } = require("../src/booking");

const tests = [
  "Здравствуйте",
  "Привет",
  "Салам",
  "Hello",
  "Главное меню",
  "назад",
  "Помочь подобрать практику"
];

for (const t of tests) {
  console.log(t, "→", isGlobalResetIntent(t, { isButton: false }));
}

const chatId = "global-reset-test";
let s = getSession(chatId);
startBookingFlow(s, { language: "ru", practiceId: "five" });
s.bookingDate = "завтра";
s.currentStep = "time";
s.currentFlow = "booking";
saveSession(chatId, s);

console.log("\nBefore reset: flow=", s.currentFlow, "step=", s.currentStep);

const r = processBookingSession(s, "Здравствуйте", "ru", {});
console.log("processBooking globalReset:", r.globalReset);

resetConversationState(s, chatId);
console.log("After reset: flow=", s.currentFlow, "step=", s.currentStep, "waitingForTime=", s.waitingForTime);

console.log("\nOK");
