const { handleGlobalIntentFirst } = require("../src/messageRouter");
const { getSession, saveSession } = require("../src/sessionStore");
const { startBookingFlow } = require("../src/sessionMemory");

const chatId = "nazad-test";
let s = getSession(chatId);
startBookingFlow(s, { language: "ru", practiceId: "five", resetDraft: true });
s.bookingDate = "завтра";
s.currentStep = "time";
saveSession(chatId, s);

for (const text of ["назад", "⬅️ Назад", "Назад", "главное меню", "отмена"]) {
  s = getSession(chatId);
  s.currentFlow = "booking";
  s.currentStep = "time";
  const hit = handleGlobalIntentFirst({ chatId, session: s, text, language: "ru" });
  const hasTime = /Какое время/.test(hit?.outbound?.reply || "");
  const hasMenu = /1️⃣/.test(hit?.outbound?.reply || "") && /4️⃣/.test(hit?.outbound?.reply || "");
  console.log(text, "→", hit ? "reset" : "FAIL", "timeQ:", hasTime, "menu4:", hasMenu);
  if (!hit || hasTime || !hasMenu) process.exit(1);
}

console.log("nazad reset OK");
