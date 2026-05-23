const { saveSession } = require("./sessionStore");
const {
  softResetFlow,
  hardResetFlow,
  syncCurrentStep,
  isBookingFlowActive
} = require("./sessionMemory");

/**
 * Сброс активного flow → главное меню. Черновик записи (<24ч) сохраняется.
 */
function resetConversationState(session, chatId) {
  const previousFlow = session.currentFlow;

  softResetFlow(session);

  session.booking = null;
  session.concierge = null;
  session.waitingForTime = false;
  session.waitingForDate = false;
  session.waitingForPhone = false;
  session.pendingStep = null;

  if (chatId) {
    saveSession(chatId, session, ["resetConversationState"]);
  }

  if (previousFlow) {
    console.log("resetConversationState: cleared flow", previousFlow);
  }

  return session;
}

function resetConversationStateByUserId(userId) {
  const { getSession } = require("./sessionStore");
  const session = getSession(userId);
  return resetConversationState(session, userId);
}

function syncBookingWaitFlags(session) {
  if (!isBookingFlowActive(session)) {
    session.waitingForDate = false;
    session.waitingForTime = false;
    session.waitingForPhone = false;
    session.pendingStep = null;
    return session;
  }

  syncCurrentStep(session);
  const step = session.currentStep;
  session.waitingForDate = step === "day";
  session.waitingForTime = step === "time";
  session.waitingForPhone = step === "phone";
  session.pendingStep = step;
  return session;
}

module.exports = {
  resetConversationState,
  resetConversationStateByUserId,
  hardResetFlow,
  syncBookingWaitFlags
};
