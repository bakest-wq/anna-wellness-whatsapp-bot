const { detectClientIntent } = require("./intent");
const { detectLanguage } = require("./language");
const { getScenarioResponse } = require("./responses");
const { getAiReply } = require("./ai");
const { getSession, updateSession } = require("./sessionStore");
const { initBooking, processBookingMessage, buildLead } = require("./booking");
const { isCancellation } = require("./validators");
const { routeIncomingText, getRouteReply, appendSoftBookingCta } = require("./router");

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
  return null;
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
  const incomingText = String(buttonText || text || "").trim();
  const session = getSession(userId);
  const language = detectLanguage(incomingText, session.language);
  session.language = language;

  if (isCancellation(incomingText) && session.booking?.active) {
    session.booking = null;
    const reply = getScenarioResponse("booking_cancelled", language);
    pushHistory(session, "user", incomingText);
    pushHistory(session, "assistant", reply);
    updateSession(userId, session);
    return { reply };
  }

  if (session.booking?.active) {
    const result = processBookingMessage(session.booking, incomingText, language);

    if (result.cancelled) {
      session.booking = null;
      pushHistory(session, "user", incomingText);
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
      pushHistory(session, "user", incomingText);
      pushHistory(session, "assistant", result.reply);
      updateSession(userId, session);
      logger.info("Booking completed", { userId, name: lead.payload.name });
      return { reply: result.reply };
    }

    pushHistory(session, "user", incomingText);
    pushHistory(session, "assistant", result.reply);
    updateSession(userId, session);
    return { reply: result.reply };
  }

  const routeName = routeIncomingText(incomingText, buttonId);

  if (routeName) {
    let reply = getRouteReply(routeName, language);

    if (routeName === "booking") {
      session.booking = initBooking(language);
    } else {
      reply = appendSoftBookingCta(reply, routeName, language);
    }

    pushHistory(session, "user", isButton ? `[кнопка] ${incomingText}` : incomingText);
    pushHistory(session, "assistant", reply);
    updateSession(userId, session);
    logger.info("Routed by menu", { userId, routeName, isButton });
    return { reply };
  }

  if (/^(меню|menu|басты меню)$/i.test(incomingText)) {
    return { withMenu: true, reply: null };
  }

  const clientIntent = detectClientIntent(incomingText, language);
  session.lastIntent = clientIntent.intent;
  logger.info("Client intent (AI path)", {
    userId,
    intent: clientIntent.intent,
    confidence: clientIntent.confidence
  });

  if (clientIntent.intent === "booking") {
    session.booking = initBooking(language);
    const reply = getRouteReply("booking", language);
    pushHistory(session, "user", incomingText);
    pushHistory(session, "assistant", reply);
    updateSession(userId, session);
    return { reply };
  }

  if (SCENARIO_INTENTS.includes(clientIntent.intent)) {
    let reply = getRouteReply(clientIntent.intent, language) || getScenarioResponse(clientIntent.intent, language);
    reply = appendSoftBookingCta(reply, clientIntent.intent, language);
    pushHistory(session, "user", incomingText);
    pushHistory(session, "assistant", reply);
    updateSession(userId, session);
    return { reply };
  }

  const isFirstContact = !session.history.length;
  const isGreeting =
    isFirstContact ||
    clientIntent.intent === "greeting" ||
    /^(привет|здравств|сәлем|салем)/i.test(incomingText);

  if (isGreeting) {
    const reply = welcomeMessage(session, language);
    pushHistory(session, "user", incomingText);
    if (reply) pushHistory(session, "assistant", reply);
    updateSession(userId, session);
    return { reply, withMenu: true };
  }

  pushHistory(session, "user", incomingText);
  const aiText = await getAiReply({
    openai,
    model,
    text: incomingText,
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
