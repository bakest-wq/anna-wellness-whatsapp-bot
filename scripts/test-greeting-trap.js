const { getSession, saveSession } = require("../src/sessionStore");
const { tryGreetingResetBeforeBooking } = require("../src/greetingReset");
const { processBookingSession } = require("../src/booking");
const { syncLegacyMirrors } = require("../src/sessionMemory");

const chatId = "trap-test";

let s = getSession(chatId);
s.currentFlow = null;
s.booking = { active: true, step: "time", data: { day: "завтра" }, language: "ru" };
saveSession(chatId, s);

s = getSession(chatId);
console.log("After reload without currentFlow:", {
  currentFlow: s.currentFlow,
  bookingActive: s.booking?.active
});

const out = tryGreetingResetBeforeBooking({
  chatId,
  session: s,
  text: "Здравствуйте",
  language: "ru"
});
console.log("greeting reset reply starts with:", out?.reply?.slice(0, 50));
console.log("after reset flow:", s.currentFlow);

s = getSession(chatId);
s.currentFlow = "booking";
s.selectedPractice = "five";
s.bookingDate = "завтра";
s.currentStep = "time";
saveSession(chatId, s);

const r = processBookingSession(s, "Здравствуйте", "ru", { chatId });
console.log("processBooking globalReset:", r.globalReset);
console.log("reply has time question:", /Какое время/.test(r.reply || ""));

console.log("OK");
