const { detectClientIntent } = require("./intent");
const { detectLanguage } = require("./language");
const { getScenarioResponse } = require("./responses");
const { getAiReply } = require("./ai");
const { getSession, updateSession } = require("./sessionStore");
const { initBooking, processBookingMessage, buildLead, smartFill } = require("./booking");
const { isCancellation } = require("./validators");

const SCENARIO_INTENTS = [
  "greeting",
  "price",
  "five_continents",
  "address",
  "contraindications",
  "services",
  "schedule",
  "thanks",
  "master"
];

function trimHistory(history, max = 12) {
  return history.slice(-max);
}

function pushHistory(session, role, content) {
  session.history = trimHistory([...session.history, { role, content }]);
}

function welcomeMessage(session, language) {
  if (session.profile?.name && session.profile.visits > 0) {
    return language === "kz"
      ? `Қайта қош келдіңіз, ${session.profile.name} 🌿 Жағымды көру — әрқашан рахат. Практика туралы айтайын ба, әлде жазылғыңыз келе ме?`
      : `Рада снова видеть вас, ${session.profile.name} 🌿 Подскажите, рассказать о практике или записать на сеанс?`;
  }
  return getScenarioResponse("greeting", language);
}

async function handleIncomingMessage({ userId, text, openai, model, logger, notifyAdmin }) {
  const session = getSession(userId);
  const language = detectLanguage(text, session.language);
  session.language = language;

  if (isCancellation(text) && session.booking?.active) {
    session.booking = null;
    const reply = getScenarioResponse("booking_cancelled", language);
    pushHistory(session, "user", text);
    pushHistory(session, "assistant", reply);
    updateSession(userId, session);
    return reply;
  }

  if (session.booking?.active) {
    const result = processBookingMessage(session.booking, text, language);

    if (result.cancelled) {
      session.booking = null;
      pushHistory(session, "user", text);
      pushHistory(session, "assistant", result.reply);
      updateSession(userId, session);
      return result.reply;
    }

    if (result.done) {
      const lead = buildLead(session.booking, userId, language);
      await notifyAdmin(lead);
      session.profile.name = session.booking.data.name;
      session.profile.phone = session.booking.data.phone;
      session.profile.visits = (session.profile.visits || 0) + 1;
      session.booking = null;
      pushHistory(session, "user", text);
      pushHistory(session, "assistant", result.reply);
      updateSession(userId, session);
      logger.info("Booking completed", { userId, name: lead.payload.name });
      return result.reply;
    }

    pushHistory(session, "user", text);
    pushHistory(session, "assistant", result.reply);
    updateSession(userId, session);
    return result.reply;
  }

  const clientIntent = detectClientIntent(text, language);
  session.lastIntent = clientIntent.intent;
  logger.info("Client intent", {
    userId,
    intent: clientIntent.intent,
    confidence: clientIntent.confidence
  });

  if (clientIntent.intent === "booking") {
    session.booking = initBooking(language);
    smartFill(session.booking, text);
    const result = processBookingMessage(session.booking, text, language);
    if (result.done) {
      const lead = buildLead(session.booking, userId, language);
      await notifyAdmin(lead);
      session.profile.name = session.booking.data.name;
      session.profile.phone = session.booking.data.phone;
      session.profile.visits = (session.profile.visits || 0) + 1;
      session.booking = null;
      updateSession(userId, session);
      return result.reply;
    }
    const reply = result.reply || getScenarioResponse("booking_start", language);
    pushHistory(session, "user", text);
    pushHistory(session, "assistant", reply);
    updateSession(userId, session);
    return reply;
  }

  if (SCENARIO_INTENTS.includes(clientIntent.intent)) {
    const reply = getScenarioResponse(clientIntent.intent, language);
    pushHistory(session, "user", text);
    pushHistory(session, "assistant", reply);
    updateSession(userId, session);
    return reply;
  }

  if (!session.history.length) {
    const reply = welcomeMessage(session, language);
    pushHistory(session, "user", text);
    pushHistory(session, "assistant", reply);
    updateSession(userId, session);
    return reply;
  }

  pushHistory(session, "user", text);
  const aiText = await getAiReply({
    openai,
    model,
    text,
    language,
    history: session.history,
    intent: clientIntent.intent,
    profile: session.profile
  });
  pushHistory(session, "assistant", aiText);
  updateSession(userId, session);
  return aiText;
}

module.exports = { handleIncomingMessage };
