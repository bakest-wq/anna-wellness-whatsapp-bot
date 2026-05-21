const { detectClientIntent } = require("./intent");
const { detectLanguage } = require("./language");
const { getScenarioResponse } = require("./responses");
const { getAiReply } = require("./ai");
const { getSession, updateSession } = require("./sessionStore");
const { initBooking, processBookingMessage, buildLead } = require("./booking");
const { isCancellation } = require("./validators");
const {
  routeIncomingText,
  getRouteReply,
  normalizeRouteReply
} = require("./router");
const { getReturningGreeting } = require("./brand");
const {
  detectEmotionalDistress,
  isExplicitBookingRequest,
  getEmotionalSupportReply,
  getSoftPriceReply,
  markEmotionalHold,
  clearEmotionalHoldIfExpired,
  shouldHoldSales
} = require("./emotionalSupport");

const SCENARIO_INTENTS = [
  "greeting",
  "price",
  "five_continents",
  "five_comparison",
  "breathing_life",
  "breathing_gaya_earthflow",
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
    return getReturningGreeting(language, session.profile.name);
  }
  return null;
}

function toOutbound(routeReply, routeName, language, session) {
  return normalizeRouteReply(routeReply, routeName, language, {
    holdSales: shouldHoldSales(session)
  });
}

function emotionalReply(incomingText, language, session, options = {}) {
  const text = getEmotionalSupportReply(incomingText, language, options);
  markEmotionalHold(session);
  return { reply: text, messages: [{ type: "text", text }] };
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
  clearEmotionalHoldIfExpired(session);

  const language = detectLanguage(incomingText, session.language);
  session.language = language;

  const distressed = detectEmotionalDistress(incomingText);
  const explicitBooking = isExplicitBookingRequest(incomingText);

  if (distressed) {
    markEmotionalHold(session);
    logger.info("Emotional distress detected", { userId });
  }

  if (isCancellation(incomingText) && session.booking?.active) {
    session.booking = null;
    const reply = getScenarioResponse("booking_cancelled", language);
    pushHistory(session, "user", incomingText);
    pushHistory(session, "assistant", reply);
    updateSession(userId, session);
    return { reply, messages: [{ type: "text", text: reply }] };
  }

  if (session.booking?.active) {
    const result = processBookingMessage(session.booking, incomingText, language);

    if (result.cancelled) {
      session.booking = null;
      pushHistory(session, "user", incomingText);
      pushHistory(session, "assistant", result.reply);
      updateSession(userId, session);
      return { reply: result.reply, messages: [{ type: "text", text: result.reply }] };
    }

    if (result.done) {
      const lead = buildLead(session.booking, userId, language);
      await notifyAdmin(lead);
      if (session.booking.data.name) session.profile.name = session.booking.data.name;
      if (session.booking.data.phone) session.profile.phone = session.booking.data.phone;
      session.profile.visits = (session.profile.visits || 0) + 1;
      session.booking = null;
      session.emotionalHold = false;
      pushHistory(session, "user", incomingText);
      pushHistory(session, "assistant", result.reply);
      updateSession(userId, session);
      logger.info("Booking completed", { userId, service: lead.payload.service });
      return { reply: result.reply, messages: [{ type: "text", text: result.reply }] };
    }

    pushHistory(session, "user", incomingText);
    pushHistory(session, "assistant", result.reply);
    updateSession(userId, session);
    return { reply: result.reply, messages: [{ type: "text", text: result.reply }] };
  }

  const routeName = routeIncomingText(incomingText, buttonId);

  if (distressed && !isButton) {
    if (routeName === "price") {
      const softPrice = getSoftPriceReply(language);
      pushHistory(session, "user", incomingText);
      pushHistory(session, "assistant", softPrice);
      updateSession(userId, session);
      return { reply: softPrice, messages: [{ type: "text", text: softPrice }] };
    }

    if (routeName === "booking" && !explicitBooking) {
      const outbound = emotionalReply(incomingText, language, session);
      pushHistory(session, "user", incomingText);
      pushHistory(session, "assistant", outbound.reply);
      updateSession(userId, session);
      return outbound;
    }

    if (!routeName || routeName === "contraindications") {
      const outbound = emotionalReply(incomingText, language, session, {
        explicitBooking: explicitBooking
      });
      pushHistory(session, "user", incomingText);
      pushHistory(session, "assistant", outbound.reply);
      updateSession(userId, session);
      return outbound;
    }
  }

  if (routeName) {
    let routeReply = getRouteReply(routeName, language);
    const outbound = toOutbound(routeReply, routeName, language, session);

    if (routeName === "booking") {
      if (distressed && !explicitBooking && !isButton) {
        const emo = emotionalReply(incomingText, language, session, { explicitBooking: true });
        pushHistory(session, "user", incomingText);
        pushHistory(session, "assistant", emo.reply);
        updateSession(userId, session);
        return emo;
      }
      session.booking = initBooking(language);
      const startText = getScenarioResponse("booking_start", language);
      outbound.reply = startText;
      outbound.messages = [{ type: "text", text: startText }];
    }

    if (routeName === "price" && shouldHoldSales(session)) {
      const softPrice = getSoftPriceReply(language);
      outbound.reply = softPrice;
      outbound.messages = [{ type: "text", text: softPrice }];
    }

    pushHistory(session, "user", isButton ? `[меню] ${incomingText}` : incomingText);
    pushHistory(session, "assistant", outbound.reply || incomingText);
    updateSession(userId, session);
    logger.info("Routed by menu", { userId, routeName, isButton });
    return outbound;
  }

  if (/^(меню|menu|басты меню)$/i.test(incomingText)) {
    return { withMenu: true, reply: null, messages: [] };
  }

  const clientIntent = detectClientIntent(incomingText, language);
  session.lastIntent = clientIntent.intent;

  if (distressed && clientIntent.intent === "booking" && !explicitBooking) {
    const outbound = emotionalReply(incomingText, language, session, { explicitBooking: true });
    pushHistory(session, "user", incomingText);
    pushHistory(session, "assistant", outbound.reply);
    updateSession(userId, session);
    return outbound;
  }

  if (distressed && !explicitBooking) {
    const outbound = emotionalReply(incomingText, language, session);
    pushHistory(session, "user", incomingText);
    pushHistory(session, "assistant", outbound.reply);
    updateSession(userId, session);
    return outbound;
  }

  logger.info("Client intent (AI path)", {
    userId,
    intent: clientIntent.intent,
    confidence: clientIntent.confidence
  });

  if (clientIntent.intent === "booking") {
    session.booking = initBooking(language);
    const startText = getScenarioResponse("booking_start", language);
    pushHistory(session, "user", incomingText);
    pushHistory(session, "assistant", startText);
    updateSession(userId, session);
    return { reply: startText, messages: [{ type: "text", text: startText }] };
  }

  if (clientIntent.intent === "address") {
    const outbound = toOutbound(getRouteReply("address", language), "address", language, session);
    pushHistory(session, "user", incomingText);
    pushHistory(session, "assistant", outbound.reply || "address");
    updateSession(userId, session);
    return outbound;
  }

  if (clientIntent.intent === "price" && shouldHoldSales(session)) {
    const softPrice = getSoftPriceReply(language);
    pushHistory(session, "user", incomingText);
    pushHistory(session, "assistant", softPrice);
    updateSession(userId, session);
    return { reply: softPrice, messages: [{ type: "text", text: softPrice }] };
  }

  if (SCENARIO_INTENTS.includes(clientIntent.intent)) {
    const outbound = toOutbound(
      getRouteReply(clientIntent.intent, language) ||
        getScenarioResponse(clientIntent.intent, language),
      clientIntent.intent,
      language,
      session
    );
    pushHistory(session, "user", incomingText);
    pushHistory(session, "assistant", outbound.reply || "");
    updateSession(userId, session);
    return outbound;
  }

  const isFirstContact = !session.history.length;
  const isGreeting =
    isFirstContact ||
    clientIntent.intent === "greeting" ||
    /^(привет|здравств|сәлем|салем)/i.test(incomingText);

  if (isGreeting) {
    const reply = welcomeMessage(session, language) || getScenarioResponse("greeting", language);
    pushHistory(session, "user", incomingText);
    pushHistory(session, "assistant", reply);
    updateSession(userId, session);
    return { reply, withMenu: true, messages: [{ type: "text", text: reply }] };
  }

  pushHistory(session, "user", incomingText);
  const aiText = await getAiReply({
    openai,
    model,
    text: incomingText,
    language,
    history: session.history,
    intent: clientIntent.intent,
    profile: session.profile,
    emotional: distressed || shouldHoldSales(session)
  });
  pushHistory(session, "assistant", aiText);
  updateSession(userId, session);
  return { reply: aiText, messages: [{ type: "text", text: aiText }] };
}

module.exports = { handleIncomingMessage };
