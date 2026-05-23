const { saveSession } = require("./sessionStore");
const {
  softResetFlow,
  hardResetFlow,
  syncCurrentStep,
  isBookingFlowActive
} = require("./sessionMemory");

/**
 * Мягкий сброс flow (черновик записи сохраняется для продолжения <24ч).
 */
function resetConversationState(session, chatId) {
  softResetFlow(session);
  session.booking = null;
  session.concierge = null;
  if (chatId) {
    saveSession(chatId, session, ["softResetFlow"]);
  }
  return session;
}

function resetConversationStateByUserId(userId) {
  const { getSession } = require("./sessionStore");
  const session = getSession(userId);
  return resetConversationState(session, userId);
}

function syncBookingWaitFlags(session) {
  const step = isBookingFlowActive(session) ? session.currentStep : null;
  session.waitingForDate = step === "day";
  session.waitingForTime = step === "time";
  session.waitingForPhone = step === "phone";
  session.pendingStep = step;
  syncCurrentStep(session);
}

module.exports = {
  resetConversationState,
  resetConversationStateByUserId,
  hardResetFlow,
  syncBookingWaitFlags
};
