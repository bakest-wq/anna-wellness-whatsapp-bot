const { getSession, updateSession } = require("./sessionStore");

/**
 * Полный сброс активных сценариев — «новый разговор» с главным меню.
 * @param {object} session
 */
function resetConversationState(session) {
  session.booking = null;
  session.concierge = null;
  session.emotionalHold = false;
  session.emotionalHoldUntil = null;
  session.lastPracticeId = null;
  session.menuContext = "main";
  session.pendingStep = null;
  session.waitingForTime = false;
  session.waitingForDate = false;
  session.waitingForPhone = false;
  return session;
}

function resetConversationStateByUserId(userId) {
  const session = getSession(userId);
  resetConversationState(session);
  updateSession(userId, session);
  return session;
}

function syncBookingWaitFlags(session) {
  const step = session.booking?.active ? session.booking.step : null;
  session.waitingForDate = step === "day";
  session.waitingForTime = step === "time";
  session.waitingForPhone = step === "phone";
  session.pendingStep = step;
}

module.exports = {
  resetConversationState,
  resetConversationStateByUserId,
  syncBookingWaitFlags
};
