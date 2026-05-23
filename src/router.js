const { getScenarioResponse } = require("./responses");
const { getAddressMessages } = require("./addressContent");
const { resolveMenuAction, getMenuContextForRoute } = require("./menus");
const {
  getFiveContinentsDifference,
  isFiveContinentsComparisonQuestion
} = require("./content/fiveContinentsDifference");
const {
  getBreathingLifeInfo,
  getBreathingGayaEarthflowInfo,
  isBreathingLifeQuestion,
  isBreathingGayaEarthflowQuestion
} = require("./content/breathingLife");
const {
  getPracticesPickerReply,
  getPracticeDetailReply,
  PRACTICE_ROUTES
} = require("./content/practices");

function routeIncomingText(text, buttonId, menuContext = "main") {
  const raw = String(text || "").trim();
  console.log("INCOMING TEXT:", raw);

  const menuRoute = resolveMenuAction(buttonId, raw, menuContext);
  if (menuRoute) {
    console.log("ROUTE:", menuRoute);
    return menuRoute;
  }

  if (isFiveContinentsComparisonQuestion(raw)) {
    console.log("ROUTE:", "five_comparison");
    return "five_comparison";
  }

  if (isBreathingGayaEarthflowQuestion(raw)) {
    console.log("ROUTE:", "breathing_gaya_earthflow");
    return "breathing_gaya_earthflow";
  }

  if (isBreathingLifeQuestion(raw)) {
    console.log("ROUTE:", "breathing_life");
    return "breathing_life";
  }

  console.log("ROUTE:", "none");
  return null;
}

function getRouteReply(routeName, language) {
  if (PRACTICE_ROUTES.includes(routeName)) {
    return getPracticeDetailReply(routeName, language);
  }

  switch (routeName) {
    case "price":
      return getScenarioResponse("price", language);

    case "booking":
      return getScenarioResponse("booking_start", language);

    case "address":
      return { messages: getAddressMessages(language) };

    case "contraindications":
      return getScenarioResponse("contraindications", language);

    case "practices":
    case "services":
      return getPracticesPickerReply(language);

    case "session":
      return getScenarioResponse("session", language);

    case "admin_contact": {
      const { getAdminContactReply } = require("./emotionalRouting");
      return getAdminContactReply(language);
    }

    case "back":
      return getScenarioResponse("back", language);

    case "five_comparison":
      return getFiveContinentsDifference(language);

    case "breathing_life":
      return getBreathingLifeInfo(language);

    case "breathing_gaya_earthflow":
      return getBreathingGayaEarthflowInfo(language);

    default:
      return null;
  }
}

function wrapOutbound(routeReply, routeName, language, options = {}) {
  let menuContext = options.menuContext || getMenuContextForRoute(routeName);
  let messages = null;
  let replyText = routeReply;

  if (routeReply && typeof routeReply === "object") {
    if (routeReply.menuContext) menuContext = routeReply.menuContext;
    if (routeReply.messages) {
      return {
        reply: routeReply.messages.find((m) => m.type === "text")?.text || null,
        messages: routeReply.messages,
        menuContext
      };
    }
    replyText = routeReply.text || routeReply.reply || null;
  }

  if (!replyText && !messages) {
    return { reply: null, messages: [], menuContext };
  }

  if (messages) {
    return {
      reply: messages.find((m) => m.type === "text")?.text || null,
      messages,
      menuContext
    };
  }

  return {
    reply: replyText,
    messages: [{ type: "text", text: replyText }],
    menuContext
  };
}

module.exports = {
  routeIncomingText,
  getRouteReply,
  getMenuContextForRoute,
  wrapOutbound
};
