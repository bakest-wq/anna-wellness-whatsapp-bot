const { getScenarioResponse } = require("./responses");
const { BUTTON_IDS } = require("./buttons");
const { getAddressMessages } = require("./addressContent");
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

const EXACT_MENU_RU = {
  "узнать цены": "price",
  "💰 узнать цены": "price",
  "записаться": "booking",
  "📅 записаться": "booking",
  "адрес": "address",
  "📍 адрес": "address",
  "противопоказания": "contraindications",
  "⚠️ противопоказания": "contraindications"
};

const EXACT_MENU_KZ = {
  "бағалар": "price",
  "💰 бағалар": "price",
  "жазылу": "booking",
  "📅 жазылу": "booking",
  "мекенжай": "address",
  "📍 мекенжай": "address",
  "қарсы көрсетілім": "contraindications",
  "⚠️ қарсы көрсетілім": "contraindications"
};

const BUTTON_ID_TO_ROUTE = {
  [BUTTON_IDS.PRICE]: "price",
  [BUTTON_IDS.BOOKING]: "booking",
  [BUTTON_IDS.ADDRESS]: "address",
  [BUTTON_IDS.CONTRA]: "contraindications"
};

function stripEmoji(text) {
  return String(text || "")
    .trim()
    .replace(/^[\s💰📅📍⚠️]+/u, "")
    .trim();
}

function normalizeText(text) {
  return stripEmoji(text).toLowerCase().replace(/\s+/g, " ");
}

function routeIncomingText(text, buttonId) {
  const raw = String(text || "").trim();
  console.log("INCOMING TEXT:", raw);

  if (buttonId && BUTTON_ID_TO_ROUTE[buttonId]) {
    const routeName = BUTTON_ID_TO_ROUTE[buttonId];
    console.log("ROUTE:", routeName);
    return routeName;
  }

  const normalized = normalizeText(raw);

  if (EXACT_MENU_RU[normalized]) {
    console.log("ROUTE:", EXACT_MENU_RU[normalized]);
    return EXACT_MENU_RU[normalized];
  }

  if (EXACT_MENU_KZ[normalized]) {
    console.log("ROUTE:", EXACT_MENU_KZ[normalized]);
    return EXACT_MENU_KZ[normalized];
  }

  const numeric = raw.match(/^([1-4])$/);
  if (numeric) {
    const map = { 1: "price", 2: "booking", 3: "address", 4: "contraindications" };
    const routeName = map[numeric[1]];
    console.log("ROUTE:", routeName);
    return routeName;
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

function appendGentleClosing(reply, routeName, language, holdSales) {
  if (!reply || typeof reply !== "string" || holdSales) return reply;
  if (routeName === "booking" || routeName === "contraindications") return reply;
  if (/осудят|асықпай|не спешить|қауіпсіз|мягко подскажу|жұмсақ айтып/i.test(reply)) return reply;

  const closing =
    language === "kz"
      ? "\n\nҚалағанда — жұмсақ айтып беремін 🤍"
      : "\n\nЕсли захотите — мягко подскажу 🤍";
  return reply + closing;
}

function normalizeRouteReply(routeReply, routeName, language, options = {}) {
  if (!routeReply) return { reply: null, messages: [] };
  const holdSales = options.holdSales;

  if (routeReply.messages) {
    const msgs = [...routeReply.messages];
    const last = msgs[msgs.length - 1];
    if (last?.type === "text") {
      last.text = appendGentleClosing(last.text, routeName, language, holdSales);
    }
    return { reply: msgs.find((m) => m.type === "text")?.text || null, messages: msgs };
  }

  const text = appendGentleClosing(routeReply, routeName, language, holdSales);
  return { reply: text, messages: [{ type: "text", text }] };
}

module.exports = {
  routeIncomingText,
  getRouteReply,
  appendGentleClosing,
  normalizeRouteReply
};
