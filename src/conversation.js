const { detectClientIntent } = require("./intent");
const { resolveClientLanguage, normalizeLanguage } = require("./language");
const { getScenarioResponse } = require("./responses");
const { getAiReply } = require("./ai");
const { getSession, updateSession } = require("./sessionStore");
const {
  initBooking,
  processBookingMessage,
  buildLead,
  getBookingStartOutbound
} = require("./booking");
const { isCancellation } = require("./validators");
const { routeIncomingText, getRouteReply, wrapOutbound } = require("./router");
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

function finish(session, userId, outbound) {
  updateSession(userId, session);
  return outbound;
}

function emotionalOutbound(incomingText, language, session, options = {}) {
  const text = getEmotionalSupportReply(incomingText, language, options);
  markEmotionalHold(session);
  return {
    reply: text,
    messages: [{ type: "text", text }],
    menuContext: "main",
    skipMenu: false
  };
}

function bookingOutbound(reply, options = {}) {
  const skipMenu = options.skipMenu !== false;
  const menuContext =
    options.menuContext !== undefined
      ? options.menuContext
      : skipMenu
        ? "main"
        : "booking_service";

  return {
    reply,
    messages: [{ type: "text", text: reply }],
    skipMenu,
    menuContext
  };
}

function wrapBookingResult(result, session) {
  if (result.cancelled || result.done) {
    return bookingOutbound(result.reply, { skipMenu: false, menuContext: "main" });
  }

  if (session.booking?.active && session.booking.step === "service") {
    return bookingOutbound(result.reply, {
      skipMenu: false,
      menuContext: "booking_service"
    });
  }

  return bookingOutbound(result.reply, { skipMenu: true, menuContext: "main" });
}

function startBooking(session, language) {
  session.booking = initBooking(language);
  return getBookingStartOutbound(language);
}

async function handleIncomingMessage({
  userId,
  text,
  buttonId,
  buttonText,
  isButton,
  menuContext = "main",
  openai,
  model,
  logger,
  notifyAdmin
}) {
  const incomingText = String(buttonText || text || "").trim();
  const session = getSession(userId);
  clearEmotionalHoldIfExpired(session);

  const language = normalizeLanguage(
    resolveClientLanguage(incomingText, session.language, { isButton })
  );
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
    return finish(session, userId, {
      reply,
      messages: [{ type: "text", text: reply }],
      menuContext: "main"
    });
  }

  if (session.booking?.active) {
    const result = processBookingMessage(session.booking, incomingText, language, {
      buttonId,
      buttonText,
      isButton
    });

    if (result.cancelled) {
      session.booking = null;
      pushHistory(session, "user", incomingText);
      pushHistory(session, "assistant", result.reply);
      return finish(session, userId, wrapBookingResult(result, session));
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
      logger.info("Booking completed", { userId, service: lead.payload.service });
      return finish(session, userId, wrapBookingResult(result, session));
    }

    pushHistory(session, "user", incomingText);
    pushHistory(session, "assistant", result.reply);
    return finish(session, userId, wrapBookingResult(result, session));
  }

  const routeName = routeIncomingText(incomingText, buttonId, menuContext);

  if (distressed && !isButton) {
    if (routeName === "price") {
      const softPrice = getSoftPriceReply(language);
      pushHistory(session, "user", incomingText);
      pushHistory(session, "assistant", softPrice);
      return finish(session, userId, {
        reply: softPrice,
        messages: [{ type: "text", text: softPrice }],
        menuContext: "after_price"
      });
    }

    if (routeName === "booking" && !explicitBooking) {
      const outbound = emotionalOutbound(incomingText, language, session);
      pushHistory(session, "user", incomingText);
      pushHistory(session, "assistant", outbound.reply);
      return finish(session, userId, outbound);
    }

    if (!routeName || routeName === "contraindications") {
      const outbound = emotionalOutbound(incomingText, language, session, {
        explicitBooking: explicitBooking
      });
      pushHistory(session, "user", incomingText);
      pushHistory(session, "assistant", outbound.reply);
      return finish(session, userId, outbound);
    }
  }

  if (routeName) {
    if (routeName === "back") {
      const reply = getScenarioResponse("back", language);
      pushHistory(session, "user", isButton ? `[меню] ${incomingText}` : incomingText);
      pushHistory(session, "assistant", reply);
      return finish(session, userId, {
        reply,
        messages: [{ type: "text", text: reply }],
        menuContext: "main"
      });
    }

    if (routeName === "booking") {
      if (distressed && !explicitBooking && !isButton) {
        const outbound = emotionalOutbound(incomingText, language, session, {
          explicitBooking: true
        });
        pushHistory(session, "user", incomingText);
        pushHistory(session, "assistant", outbound.reply);
        return finish(session, userId, outbound);
      }
      const outbound = startBooking(session, language);
      pushHistory(session, "user", isButton ? `[меню] ${incomingText}` : incomingText);
      pushHistory(session, "assistant", outbound.reply);
      logger.info("Routed by menu", { userId, routeName, isButton });
      return finish(session, userId, outbound);
    }

    let routeReply = getRouteReply(routeName, language);

    if (routeName === "price" && shouldHoldSales(session)) {
      routeReply = getSoftPriceReply(language);
    }

    const outbound = wrapOutbound(routeReply, routeName, language);

    pushHistory(session, "user", isButton ? `[меню] ${incomingText}` : incomingText);
    pushHistory(session, "assistant", outbound.reply || incomingText);
    logger.info("Routed by menu", { userId, routeName, isButton });
    return finish(session, userId, outbound);
  }

  if (/^(меню|menu|басты меню)$/i.test(incomingText)) {
    return finish(session, userId, {
      reply: null,
      messages: [],
      menuContext: "main"
    });
  }

  const clientIntent = detectClientIntent(incomingText, language);
  session.lastIntent = clientIntent.intent;

  if (distressed && clientIntent.intent === "booking" && !explicitBooking) {
    const outbound = emotionalOutbound(incomingText, language, session, { explicitBooking: true });
    pushHistory(session, "user", incomingText);
    pushHistory(session, "assistant", outbound.reply);
    return finish(session, userId, outbound);
  }

  if (distressed && !explicitBooking) {
    const outbound = emotionalOutbound(incomingText, language, session);
    pushHistory(session, "user", incomingText);
    pushHistory(session, "assistant", outbound.reply);
    return finish(session, userId, outbound);
  }

  logger.info("Client intent (AI path)", {
    userId,
    intent: clientIntent.intent,
    confidence: clientIntent.confidence
  });

  if (clientIntent.intent === "booking") {
    const outbound = startBooking(session, language);
    pushHistory(session, "user", incomingText);
    pushHistory(session, "assistant", outbound.reply);
    return finish(session, userId, outbound);
  }

  if (clientIntent.intent === "address") {
    const outbound = wrapOutbound(getRouteReply("address", language), "address", language);
    pushHistory(session, "user", incomingText);
    pushHistory(session, "assistant", outbound.reply || "address");
    return finish(session, userId, outbound);
  }

  if (clientIntent.intent === "price" && shouldHoldSales(session)) {
    const softPrice = getSoftPriceReply(language);
    pushHistory(session, "user", incomingText);
    pushHistory(session, "assistant", softPrice);
    return finish(session, userId, {
      reply: softPrice,
      messages: [{ type: "text", text: softPrice }],
      menuContext: "after_price"
    });
  }

  if (SCENARIO_INTENTS.includes(clientIntent.intent)) {
    const routeKey =
      clientIntent.intent === "services" ? "practices" : clientIntent.intent;
    const outbound = wrapOutbound(
      getRouteReply(routeKey, language) || getScenarioResponse(clientIntent.intent, language),
      routeKey,
      language
    );
    pushHistory(session, "user", incomingText);
    pushHistory(session, "assistant", outbound.reply || "");
    return finish(session, userId, outbound);
  }

  const isFirstContact = !session.history.length;
  const isGreeting =
    isFirstContact ||
    clientIntent.intent === "greeting" ||
    /^(привет|здравств|сәлем|салем)/i.test(incomingText);

  if (isGreeting) {
    const reply =
      welcomeMessage(session, language) || getScenarioResponse("greeting", language);
    pushHistory(session, "user", incomingText);
    pushHistory(session, "assistant", reply);
    return finish(session, userId, {
      reply,
      messages: [{ type: "text", text: reply }],
      menuContext: "main"
    });
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
  return finish(session, userId, {
    reply: aiText,
    messages: [{ type: "text", text: aiText }],
    menuContext: "main"
  });
}

module.exports = { handleIncomingMessage };
