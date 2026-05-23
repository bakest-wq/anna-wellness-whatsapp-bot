const { runGlobalIntentGate } = require("../src/messageRouter");
const { getSession, saveSession } = require("../src/sessionStore");

const chatId = "router-test";

let s = getSession(chatId);
s.currentFlow = "booking";
s.currentStep = "time";
s.waitingForTime = true;
s.selectedPractice = "five";
s.bookingDate = "завтра";
saveSession(chatId, s);

const cases = ["Здравствуйте", "салем", "hello", "главное меню", "подобрать практику"];

for (const text of cases) {
  s = getSession(chatId);
  s.currentFlow = "booking";
  s.currentStep = "time";
  s.waitingForTime = true;
  const gate = runGlobalIntentGate({
    chatId,
    session: s,
    text,
    language: "ru",
    isButton: false
  });
  const hasTimeQ = /Какое время/.test(gate.outbound?.reply || "");
  console.log(text, "→ handled:", gate.handled, "timeQ:", hasTimeQ);
  if (!gate.handled || hasTimeQ) {
    console.error("FAIL:", text);
    process.exit(1);
  }
}

console.log("messageRouter gate OK");
