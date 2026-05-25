/**
 * Mini-emotional routing: мягкий ответ + своё меню (без продажи и booking).
 * Срабатывает после global reset, до обычного меню / FSM.
 */

const { isExplicitBookingRequest } = require("./emotionalSupport");
const { WELLNESS } = require("./knowledge");
const { buildPremiumRecommendationOutbound } = require("./premiumUx");

const HEAVY_PATTERNS = [
  /(мне\s+)?(очень\s+)?плохо/i,
  /я\s+в\s+депресс/i,
  /депрессия/i,
  /(не\s+)?хочу\s+жить/i,
  /жылағым\s+келеді/i,
  /өмірден\s+шаршадым/i,
  /(всё|барлығы)\s+бессмысл/i,
  /накрывает\s+так\s+что/i,
  /не\s+выдерживаю/i
];

const INTENT_RULES = [
  {
    intent: "anxiety",
    patterns: [
      /(тревог|тревож|паник|беспоко)/i,
      /(уайым|мазасыз|үрей|қорқамын)/i,
      /мазам\s+жоқ/i
    ]
  },
  {
    intent: "need_relaxation",
    patterns: [
      /(расслаб|отдохнут|босанғым\s+келеді|босану\s+керек)/i,
      /(хочу\s+)?отдох/i
    ]
  },
  {
    intent: "need_calm",
    patterns: [
      /(спокойств|тишин|успоко|тыныштық|тыныш)/i,
      /(хочу\s+)?поко/i
    ]
  },
  {
    intent: "body_tension",
    patterns: [
      /(напряжен|напряжён|зажат|кернеу|қысылған|дене.*ауыр)/i,
      /(шея|спин).*(болит|батыр)/i
    ]
  },
  {
    intent: "low_energy",
    patterns: [
      /(нет\s+сил|без\s+сил|сил\s+нет|энергия\s+жоқ|энергиясы\s+жоқ)/i,
      /(обессилен|ослаблен)/i
    ]
  },
  {
    intent: "emotional_exhaustion",
    patterns: [
      /(всё\s+надоело|надоело\s+всё|эмоциональн.*истощ|ішім\s+шаршады)/i,
      /(пусто\s+внутри|выгорел|выгорела|күйзеліс)/i,
      /всё\s+надоело/i
    ]
  },
  {
    intent: "fatigue",
    patterns: [
      /(устал|устала|усталость|измотан|истощен)/i,
      /(шаршадым|шаршаған|шаршады)/i
    ]
  }
];

function normalize(text) {
  return String(text || "")
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/**
 * @returns {{ intent: string, tier: 'light'|'heavy' }|null}
 */
function detectEmotionalIntent(text) {
  const t = normalize(text);
  if (t.length < 4) return null;

  if (HEAVY_PATTERNS.some((re) => re.test(t))) {
    return { intent: "heavy_distress", tier: "heavy" };
  }

  for (const rule of INTENT_RULES) {
    if (rule.patterns.some((re) => re.test(t))) {
      return { intent: rule.intent, tier: "light" };
    }
  }

  return null;
}

function getAdminContactReply(language) {
  const phone = WELLNESS.whatsappPhone || process.env.ADMIN_PHONE || "";
  const display = phone.replace(/^\+/, "");
  if (language === "kz") {
    return `Әкімшімен байланысуға болады 🤍

Телефон / WhatsApp: ${phone || "админге хабарласыңыз"}

Асықпай жазыңыз — сізге жұмсақ жауап береді.`;
  }
  return `Можно связаться с администратором 🤍

Телефон / WhatsApp: ${phone || "уточним у администратора"}

Пишите без спешки — вам мягко ответят.`;
}

/**
 * @param {string} text
 * @param {string} language
 * @param {{ isButton?: boolean }} [options]
 * @returns {null|{ intent: string, tier: string, menuContext: string, outbound: object }}
 */
function tryEmotionalRouting(text, language, session, options = {}) {
  if (options.isButton) return null;
  if (isExplicitBookingRequest(text)) return null;

  const detected = detectEmotionalIntent(text);
  if (!detected) return null;

  console.log("EMOTIONAL INTENT:", detected.intent);

  const routingIntent =
    detected.tier === "heavy" ? "heavy_distress" : detected.intent;

  const outbound = buildPremiumRecommendationOutbound(
    session,
    language,
    routingIntent
  );

  return {
    intent: routingIntent,
    tier: detected.tier,
    menuContext: outbound.menuContext,
    outbound
  };
}

module.exports = {
  detectEmotionalIntent,
  tryEmotionalRouting,
  getAdminContactReply
};
