const { detectClientIntent } = require("./intent");
const { resolveClientLanguage, normalizeLanguage } = require("./language");
const { getScenarioResponse } = require("./responses");
const { getAiReply } = require("./ai");
const { getSession, saveSession } = require("./sessionStore");
const {
  processBookingSession,
  buildLead,
  getBookingStartOutbound,
  getBookingAfterPreselectOutbound,
  getBookingAfterPackageOutbound,
  getResumeBookingOutbound
} = require("./booking");
const {
  startBookingFlow,
  startConciergeFlow,
  hasResumableBooking,
  isBookingFlowActive,
  isConciergeFlowActive,
  syncLegacyMirrors,
  softResetFlow,
  hardResetFlow,
  completeBookingFlow,
  clearConciergeFields
} = require("./sessionMemory");
const { parseWebsiteDeepLink } = require("./deepLinks");
const BOT_ID_TO_ROUTE = {
  five: "practice_five",
  five_fire: "practice_five_fire",
  five_bamboo: "practice_five_bamboo",
  mukaino: "practice_mukaino",
  breath: "practice_breath",
  earthflow: "practice_earthflow",
  bars: "practice_bars"
};
const {
  initConcierge,
  startConciergeOutbound,
  processConciergeMessage
} = require("./concierge");
const { isCancellation } = require("./validators");
const { routeIncomingText, getRouteReply, wrapOutbound } = require("./router");
const { resetConversationState, syncBookingWaitFlags } = require("./flowState");
const { evaluateActiveFlow } = require("./flowControl");
const {
  isGlobalResetIntent,
  getGlobalResetRoute
} = require("./globalIntents");
const { runGlobalIntentGate, isGlobalIntent } = require("./messageRouter");
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
  syncLegacyMirrors(session);
  syncBookingWaitFlags(session);
  saveSession(userId, session);
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

  if (
    isBookingFlowActive(session) &&
    (session.currentStep === "service" || session.booking?.step === "service")
  ) {
    return bookingOutbound(result.reply, {
      skipMenu: false,
      menuContext: "booking_service"
    });
  }

  return bookingOutbound(result.reply, { skipMenu: true, menuContext: "main" });
}

function startBooking(session, language, preselectedPracticeId = null, options = {}) {
  clearConciergeFields(session);
  session.concierge = null;

  if (
    hasResumableBooking(session) &&
    !preselectedPracticeId &&
    !options.packageName &&
    !options.forceNew
  ) {
    session.currentFlow = "booking";
    syncBookingWaitFlags(session);
    syncLegacyMirrors(session);
    return getResumeBookingOutbound(session, language);
  }

  startBookingFlow(session, {
    language,
    practiceId: preselectedPracticeId,
    packageName: options.packageName,
    source: options.source || "whatsapp",
    resetDraft: Boolean(options.forceNew)
  });
  syncBookingWaitFlags(session);
  syncLegacyMirrors(session);

  if (options.packageName) {
    return getBookingAfterPackageOutbound(session, language, options.packageName);
  }
  if (preselectedPracticeId) {
    return getBookingAfterPreselectOutbound(session, language);
  }
  return getBookingStartOutbound(language);
}

function handleDeepLink(session, userId, deep, language, incomingText, isButton) {
  const userLabel = isButton ? `[сайт] ${incomingText}` : incomingText;

  switch (deep.action) {
    case "concierge": {
      const outbound = startConcierge(session, language);
      pushHistory(session, "user", userLabel);
      pushHistory(session, "assistant", outbound.reply);
      return finish(session, userId, outbound);
    }
    case "booking": {
      const outbound = startBooking(session, language, deep.practiceId || null);
      pushHistory(session, "user", userLabel);
      pushHistory(session, "assistant", outbound.reply);
      return finish(session, userId, outbound);
    }
    case "package_booking": {
      const outbound = startBooking(session, language, null, {
        packageName: deep.packageName
      });
      pushHistory(session, "user", userLabel);
      pushHistory(session, "assistant", outbound.reply);
      return finish(session, userId, outbound);
    }
    case "practice_detail": {
      const route = deep.route || BOT_ID_TO_ROUTE[deep.practiceId];
      if (!route) break;
      const routeReply = getRouteReply(route, language);
      const outbound = wrapOutbound(routeReply, route, language);
      pushHistory(session, "user", userLabel);
      pushHistory(session, "assistant", outbound.reply || "");
      return finish(session, userId, outbound);
    }
    case "price": {
      const outbound = wrapOutbound(getRouteReply("price", language), "price", language);
      pushHistory(session, "user", userLabel);
      pushHistory(session, "assistant", outbound.reply || "");
      return finish(session, userId, outbound);
    }
    case "address": {
      const outbound = wrapOutbound(getRouteReply("address", language), "address", language);
      pushHistory(session, "user", userLabel);
      pushHistory(session, "assistant", outbound.reply || "");
      return finish(session, userId, outbound);
    }
    default:
      return null;
  }
  return null;
}

function startConcierge(session, language) {
  startConciergeFlow(session, language);
  syncLegacyMirrors(session);
  return startConciergeOutbound(language);
}

function buildMainMenuWelcome(session, language, options = {}) {
  const lang = language === "kz" ? "kz" : "ru";
  let prefix = "";

  if (options.reason === "greeting_or_menu") {
    prefix =
      lang === "kz"
        ? "Әрине 🌿 Жаңа хабарламадан бастайық.\n\n"
        : "Конечно 🌿 Начнём с чистого листа — без спешки.\n\n";
  } else if (
    options.reason === "invalid_booking_answer" ||
    options.reason === "invalid_concierge_answer"
  ) {
    prefix =
      lang === "kz"
        ? "Түсінемін — бұл қадамға жауап емес 🌿\n\n"
        : "Понимаю — это не ответ на текущий шаг 🌿\n\n";
  } else if (options.reason === "intent" || options.reason === "main_menu") {
    prefix =
      lang === "kz"
        ? "Жақсы 🌿\n\n"
        : "Хорошо 🌿\n\n";
  }

  const greeting =
    welcomeMessage(session, language) || getScenarioResponse("greeting", language);
  const reply = prefix + greeting;
  return {
    reply,
    messages: [{ type: "text", text: reply }],
    menuContext: "main",
    skipMenu: false
  };
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
  notifyAdmin,
  skipGlobalGate = false
}) {
  const incomingText = String(buttonText || text || "").trim();
  const session = getSession(userId);

  let pendingRoute = null;
  let language = normalizeLanguage(session.language);

  // ━━━ 1–3: normalize + global intent + reset (ДО language / booking / waitingFor*) ━━━
  if (!skipGlobalGate) {
    const gate = runGlobalIntentGate({
      chatId: userId,
      session,
      text: incomingText,
      language,
      isButton,
      buttonId,
      menuContext
    });

    if (gate.handled) {
      language = normalizeLanguage(
        resolveClientLanguage(incomingText, session.language, { isButton })
      );
      session.language = language;
      pushHistory(session, "user", isButton ? `[меню] ${incomingText}` : incomingText);
      pushHistory(session, "assistant", gate.outbound.reply);
      if (gate.menuRoute) {
        pendingRoute = gate.menuRoute;
      } else {
        return finish(session, userId, gate.outbound);
      }
    }
  }

  clearEmotionalHoldIfExpired(session);

  language = normalizeLanguage(
    resolveClientLanguage(incomingText, session.language, { isButton })
  );
  session.language = language;

  const deepLink = parseWebsiteDeepLink(incomingText);
  if (deepLink?.action) {
    const deepOutbound = handleDeepLink(
      session,
      userId,
      deepLink,
      language,
      incomingText,
      isButton
    );
    if (deepOutbound) return deepOutbound;
  }

  const distressed = detectEmotionalDistress(incomingText);
  const explicitBooking = isExplicitBookingRequest(incomingText);

  if (distressed) {
    markEmotionalHold(session);
    logger.info("Emotional distress detected", { userId });
  }

  if (
    isCancellation(incomingText) &&
    (isBookingFlowActive(session) || isConciergeFlowActive(session))
  ) {
    hardResetFlow(session);
    session.booking = null;
    session.concierge = null;
    const reply = getScenarioResponse("booking_cancelled", language);
    pushHistory(session, "user", incomingText);
    pushHistory(session, "assistant", reply);
    return finish(session, userId, {
      reply,
      messages: [{ type: "text", text: reply }],
      menuContext: "main",
      skipMenu: false
    });
  }

  // ━━━ PRIORITY 2: активный flow — только если не глобальный сброс ━━━
  syncLegacyMirrors(session);

  if (
    !pendingRoute &&
    (isBookingFlowActive(session) || isConciergeFlowActive(session))
  ) {
    const routeForEval = routeIncomingText(incomingText, buttonId, menuContext);
    const flowEval = evaluateActiveFlow(session, incomingText, language, {
      isButton,
      buttonId,
      menuContext,
      routeName: routeForEval
    });

    if (flowEval.mode === "soft_reset") {
      console.log("GLOBAL RESET TRIGGERED");
      console.log("CURRENT FLOW:", session.currentFlow);
      resetConversationState(session, userId);
      session.booking = null;
      session.concierge = null;
      pushHistory(session, "user", isButton ? `[меню] ${incomingText}` : incomingText);

      if (flowEval.route) {
        pendingRoute = flowEval.route;
      } else {
        const outbound = buildMainMenuWelcome(session, language, {
          reason: flowEval.reason
        });
        pushHistory(session, "assistant", outbound.reply);
        return finish(session, userId, outbound);
      }
    }
  }

  if (!pendingRoute && isConciergeFlowActive(session)) {
    const conciergeResult = processConciergeMessage(session, incomingText, language, {
      buttonId,
      buttonText,
      isButton
    });

    if (conciergeResult.handled) {
      if (conciergeResult.action === "practice_detail") {
        const routeReply = getRouteReply(conciergeResult.route, language);
        const outbound = wrapOutbound(routeReply, conciergeResult.route, language);
        pushHistory(session, "user", isButton ? `[меню] ${incomingText}` : incomingText);
        pushHistory(session, "assistant", outbound.reply || "");
        return finish(session, userId, outbound);
      }

      if (conciergeResult.action === "book") {
        const outbound = startBooking(session, language, conciergeResult.practiceId);
        pushHistory(session, "user", isButton ? `[меню] ${incomingText}` : incomingText);
        pushHistory(session, "assistant", outbound.reply);
        return finish(session, userId, outbound);
      }

      if (conciergeResult.action === "other_practices") {
        const routeReply = getRouteReply("practices", language);
        const outbound = wrapOutbound(routeReply, "practices", language);
        pushHistory(session, "user", isButton ? `[меню] ${incomingText}` : incomingText);
        pushHistory(session, "assistant", outbound.reply || "");
        return finish(session, userId, outbound);
      }

      if (conciergeResult.outbound) {
        pushHistory(session, "user", incomingText);
        pushHistory(session, "assistant", conciergeResult.outbound.reply || "");
        return finish(session, userId, conciergeResult.outbound);
      }
    }
  }

  if (!pendingRoute && isBookingFlowActive(session)) {
    const result = processBookingSession(session, incomingText, language, {
      chatId: userId,
      buttonId,
      buttonText,
      isButton,
      menuContext
    });

    if (result.globalReset) {
      pushHistory(session, "user", incomingText);
      pushHistory(session, "assistant", result.reply || "");
      return finish(session, userId, {
        reply: result.reply,
        messages: result.messages || [{ type: "text", text: result.reply }],
        menuContext: "main",
        skipMenu: false
      });
    }

    if (result.notInBookingFlow) {
      const outbound = buildMainMenuWelcome(session, language, {
        reason: "greeting_or_menu"
      });
      pushHistory(session, "user", incomingText);
      pushHistory(session, "assistant", outbound.reply);
      return finish(session, userId, outbound);
    }

    if (result.cancelled) {
      hardResetFlow(session);
      session.booking = null;
      pushHistory(session, "user", incomingText);
      pushHistory(session, "assistant", result.reply);
      return finish(session, userId, wrapBookingResult(result, session));
    }

    if (result.done) {
      const lead = buildLead(session, userId, language);
      await notifyAdmin(lead);
      if (session.clientName) session.profile.name = session.clientName;
      if (session.clientPhone) session.profile.phone = session.clientPhone;
      session.profile.visits = (session.profile.visits || 0) + 1;
      completeBookingFlow(session);
      session.booking = null;
      session.emotionalHold = false;
      pushHistory(session, "user", incomingText);
      pushHistory(session, "assistant", result.reply);
      logger.info("Booking completed", { userId, service: lead.payload.service });
      return finish(session, userId, wrapBookingResult(result, session));
    }

    syncLegacyMirrors(session);
    syncBookingWaitFlags(session);
    pushHistory(session, "user", incomingText);
    pushHistory(session, "assistant", result.reply);
    return finish(session, userId, wrapBookingResult(result, session));
  }

  const routeName = pendingRoute || routeIncomingText(incomingText, buttonId, menuContext);

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

    if (routeName === "concierge") {
      const outbound = startConcierge(session, language);
      pushHistory(session, "user", isButton ? `[меню] ${incomingText}` : incomingText);
      pushHistory(session, "assistant", outbound.reply);
      logger.info("Concierge started", { userId });
      return finish(session, userId, outbound);
    }

    if (
      routeName === "concierge_detail" ||
      routeName === "concierge_book" ||
      routeName === "concierge_other"
    ) {
      if (routeName === "concierge_book" && session.lastPracticeId) {
        const outbound = startBooking(session, language, session.lastPracticeId);
        pushHistory(session, "user", isButton ? `[меню] ${incomingText}` : incomingText);
        pushHistory(session, "assistant", outbound.reply);
        return finish(session, userId, outbound);
      }
      if (routeName === "concierge_other") {
        const outbound = wrapOutbound(getRouteReply("practices", language), "practices", language);
        pushHistory(session, "user", isButton ? `[меню] ${incomingText}` : incomingText);
        pushHistory(session, "assistant", outbound.reply || "");
        return finish(session, userId, outbound);
      }
    }

    if (routeName === "booking") {
      if (
        hasResumableBooking(session) &&
        !isButton &&
        !isGlobalIntent(incomingText, { isButton, buttonId, menuContext })
      ) {
        session.currentFlow = "booking";
        const outbound = getResumeBookingOutbound(session, language);
        pushHistory(session, "user", isButton ? `[меню] ${incomingText}` : incomingText);
        pushHistory(session, "assistant", outbound.reply);
        return finish(session, userId, outbound);
      }
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

  if (isGlobalResetIntent(incomingText, { isButton, buttonId, menuContext })) {
    resetConversationState(session, userId);
    session.booking = null;
    session.concierge = null;
    const outbound = buildMainMenuWelcome(session, language, { reason: "greeting_or_menu" });
    pushHistory(session, "user", incomingText);
    pushHistory(session, "assistant", outbound.reply);
    return finish(session, userId, outbound);
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

  if (clientIntent.intent === "concierge") {
    const outbound = startConcierge(session, language);
    pushHistory(session, "user", incomingText);
    pushHistory(session, "assistant", outbound.reply);
    return finish(session, userId, outbound);
  }

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

  if (isGreeting || isGlobalResetIntent(incomingText, { isButton, buttonId, menuContext })) {
    resetConversationState(session, userId);
    session.booking = null;
    session.concierge = null;
    const outbound = buildMainMenuWelcome(session, language, { reason: "greeting_or_menu" });
    pushHistory(session, "user", incomingText);
    pushHistory(session, "assistant", outbound.reply);
    return finish(session, userId, outbound);
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

module.exports = {
  handleIncomingMessage,
  buildMainMenuWelcome,
  resetConversationState
};
