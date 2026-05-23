const { getSession, saveSession } = require("../src/sessionStore");
const {
  startBookingFlow,
  getNextMissingBookingStep,
  hasResumableBooking,
  softResetFlow
} = require("../src/sessionMemory");
const { processBookingSession } = require("../src/booking");

const chatId = "test-user-1";
let s = getSession(chatId);

startBookingFlow(s, { language: "ru", practiceId: "five" });
console.log("step after start:", getNextMissingBookingStep(s));

let r = processBookingSession(s, "Здравствуйте", "ru", {});
console.log("greeting during booking should not advance:", s.bookingDate, r.reply?.slice(0, 40));

r = processBookingSession(s, "завтра", "ru", {});
console.log("after day:", s.bookingDate, "next:", getNextMissingBookingStep(s));

softResetFlow(s);
saveSession(chatId, s);
console.log("resumable:", hasResumableBooking(s));

s2 = getSession(chatId);
console.log("resume practice kept:", s2.selectedPractice, s2.bookingDate);

console.log("OK");
