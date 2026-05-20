const { detectClientIntent } = require("./intent");
const { detectLanguage } = require("./language");
const { getScenarioResponse } = require("./responses");
const { getAiReply } = require("./ai");
const { getSession, updateSession } = require("./sessionStore");
const { initBooking, processBookingMessage, buildLead, smartFill } = require("./booking");
const { isCancellation } = require("./validators");
const { resolveButtonIntent, enrichScenarioReply } = require("./buttons");

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
      ? `Қайта қош келдіңіз, ${session.profile.name} 🌿`
      : `Рада снова видеть вас, ${session.profile.name} 🌿`;
  }
  return language === "kz"
    ? "Сәлеметсіз бе 🌿"
    : "Здравствуйте 🌿";
}

async function handleScenarioIntent(intent, session, userId, text, language, notifyAdmin, logger) {
  if (intent === "booking") {
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
      return { reply: result.reply };
    }
    return { reply: result.reply || getScenarioResponse("booking_start", language) };
  }

  const reply = enrichScenarioReply(
    intent,
    getScenarioResponse(intent, language),
    language
  );
  return { reply };
}

async function handleIncomingMessage({
  userId,
  text,
  buttonId,
  buttonText,
  isButton,
  openai,
  model,
  logger,
  notifyAdmin
}) {
  const session = getSession(userId);
  const language = detectLanguage(text || buttonText, session.language);
  session.language = language;

  if (isCancellation(text) && session.booking?.active) {
    session.booking = null;
    const reply = getScenarioResponse("booking_cancelled", language);
    pushHistory(session, "user", text);
    pushHistory(session, "assistant", reply);
    updateSession(userId, session);
    return { reply };
  }

  if (session.booking?.active) {
    const result = processBookingMessage(session.booking, text, language);

    if (result.cancelled) {
      session.booking = null;
      pushHistory(session, "user", text);
      pushHistory(session, "assistant", result.reply);
      updateSession(userId, session);
      return { reply: result.reply };
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
      return { reply: result.reply };
    }

    pushHistory(session, "user", text);
    pushHistory(session, "assistant", result.reply);
    updateSession(userId, session);
    return { reply: result.reply };
  }

  if (isButton) {
    const intent = resolveButtonIntent(buttonId, buttonText || text);
    logger.info("Button pressed", { userId, buttonId, buttonText, intent });

    if (intent) {
      const result = await handleScenarioIntent(
        intent,
        session,
        userId,
        text,
        language,
        notifyAdmin,
        logger
      );
      pushHistory(session, "user", `[кнопка] ${buttonText || text}`);
      pushHistory(session, "assistant", result.reply);
      updateSession(userId, session);
      return result;
    }
  }

  const clientIntent = detectClientIntent(text, language);
  session.lastIntent = clientIntent.intent;
  logger.info("Client intent", {
    userId,
    intent: clientIntent.intent,
    confidence: clientIntent.confidence
  });

  if (clientIntent.intent === "booking") {
    const result = await handleScenarioIntent(
      "booking",
      session,
      userId,
      text,
      language,
      notifyAdmin,
      logger
    );
    pushHistory(session, "user", text);
    pushHistory(session, "assistant", result.reply);
    updateSession(userId, session);
    return result;
  }

  if (SCENARIO_INTENTS.includes(clientIntent.intent)) {
    const result = await handleScenarioIntent(
      clientIntent.intent,
      session,
      userId,
      text,
      language,
      notifyAdmin,
      logger
    );
    pushHistory(session, "user", text);
    pushHistory(session, "assistant", result.reply);
    updateSession(userId, session);
    return result;
  }

  const isFirstContact = !session.history.length;
  const isGreeting =
    isFirstContact || clientIntent.intent === "greeting" || /^(привет|здравств|сәлем|салем)/i.test(text);

  if (isGreeting) {
    const reply = welcomeMessage(session, language);
    pushHistory(session, "user", text);
    pushHistory(session, "assistant", reply);
    updateSession(userId, session);
    return { reply, withMenu: true };
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
  return { reply: aiText };
}

module.exports = { handleIncomingMessage };
