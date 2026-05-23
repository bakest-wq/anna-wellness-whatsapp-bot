const { evaluateActiveFlow, isGreetingOrSocialText, isValidBookingDay } = require("../src/flowControl");
const { resetConversationState } = require("../src/flowState");
const { detectClientIntent } = require("../src/intent");

const session = {
  booking: { active: true, step: "day", data: {}, language: "ru" },
  concierge: null
};

const cases = [
  "Здравствуйте",
  "привет",
  "завтра",
  "15:00",
  "Hello",
  "Salam",
  "Ассаламу алейкум"
];

for (const t of cases) {
  const flow = evaluateActiveFlow(session, t, "ru", {
    isButton: false,
    menuContext: "main"
  });
  console.log({
    t,
    greeting: isGreetingOrSocialText(t),
    day: isValidBookingDay(t),
    flow: flow.mode,
    reason: flow.reason
  });
}

console.log("intent:", detectClientIntent("Здравствуйте", "ru").intent);

const s2 = { booking: { active: true, step: "time" }, concierge: null };
resetConversationState(s2);
console.log("after reset:", s2.booking, s2.waitingForTime);
