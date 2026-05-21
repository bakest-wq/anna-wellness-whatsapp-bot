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
      return getScenarioResponse("services", language);

    case "session":
      return getScenarioResponse("session", language);

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
  const menuContext = options.menuContext || getMenuContextForRoute(routeName);

  if (!routeReply) {
    return { reply: null, messages: [], menuContext };
  }

  if (routeReply.messages) {
    return {
      reply: routeReply.messages.find((m) => m.type === "text")?.text || null,
      messages: routeReply.messages,
      menuContext
    };
  }

  return {
    reply: routeReply,
    messages: [{ type: "text", text: routeReply }],
    menuContext
  };
}

module.exports = {
  routeIncomingText,
  getRouteReply,
  getMenuContextForRoute,
  wrapOutbound
};
