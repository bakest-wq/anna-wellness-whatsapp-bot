/**
 * Mini-emotional routing: мягкий ответ + своё меню (без продажи и booking).
 * Срабатывает после global reset, до обычного меню / FSM.
 */

const { getMenuTextBlock } = require("./menus");
const { isExplicitBookingRequest } = require("./emotionalSupport");
const { WELLNESS } = require("./knowledge");

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

const REPLIES = {
  ru: {
    fatigue: `Понимаю вас 🤍
Когда внутри много усталости, телу и нервной системе часто хочется тишины и бережного восстановления.
Я могу мягко помочь подобрать практику под ваше состояние 🌿`,
    anxiety: `Понимаю вас 🤍
Тревога часто забирает много сил — телу и нервной системе нужна тишина и мягкая опора.
Я могу бережно подобрать практику под ваше состояние 🌿`,
    body_tension: `Понимаю вас 🤍
Когда тело держит напряжение, ему часто нужен спокойный, бережный контакт — без спешки.
Я могу мягко подсказать практику под ваше состояние 🌿`,
    low_energy: `Понимаю вас 🤍
Когда мало сил, важно не требовать от себя лишнего — только мягкое восстановление.
Я могу помочь подобрать практику в вашем ритме 🌿`,
    emotional_exhaustion: `Понимаю вас 🤍
Когда внутри много усталости и опустошения, телу нужны тишина и бережное восстановление.
Я могу мягко помочь подобрать практику под ваше состояние 🌿`,
    need_relaxation: `Понимаю вас 🤍
Желание расслабиться — очень естественное. Здесь можно без спешки подобрать мягкий формат 🌿`,
    need_calm: `Понимаю вас 🤍
Когда хочется спокойствия, телу и нервной системе важны тишина и бережный ритм.
Я могу мягко помочь подобрать практику 🌿`,
    heavy_distress: `Мне очень жаль, что вам сейчас так тяжело 🤍
Вы можете не спешить. Я рядом, чтобы мягко подсказать варианты заботы о себе.`
  },
  kz: {
    fatigue: `Түсінемін 🤍
Ішкі шаршау жиналған кезде, денеге тыныштық пен жұмсақ қалпына келу керек болады.
Сізге жағдайыңызға сай практиканы ақырын таңдауға көмектесейін 🌿`,
    anxiety: `Түсінемін 🤍
Мазасыздық күшті шаршатады — дене мен жүйкеге тыныштық пен жұмсақ қолдау керек.
Жағдайыңызға сай практиканы абайлап таңдауға көмектесейін 🌿`,
    body_tension: `Түсінемін 🤍
Дене кернеуді ұстап тұрғанда, асықпай, жұмсақ қамқорлық маңызды.
Жағдайыңызға сай практиканы ақырын таңдауға көмектесейін 🌿`,
    low_energy: `Түсінемін 🤍
Қуаты аз болғанда, өзіңізден артық талап етпей-ақ, жұмсақ қалпына келу маңызды.
Сіздің ритміңізге сай практиканы таңдауға көмектесейін 🌿`,
    emotional_exhaustion: `Түсінемін 🤍
Ішкі шаршау мен босаңсу жиналғанда, денеге тыныштық пен жұмсақ қалпына келу керек.
Жағдайыңызға сай практиканы ақырын таңдауға көмектесейін 🌿`,
    need_relaxation: `Түсінемін 🤍
Босанғыңыз келуі — өте табиғи. Мұнда асықпай, жұмсақ формат таңдауға болады 🌿`,
    need_calm: `Түсінемін 🤍
Тыныштық қажет болғанда, дене мен жүйкеге асықпай, абайлап қарау маңызды.
Жұмсақ практика таңдауға көмектесейін 🌿`,
    heavy_distress: `Қазір сізге ауыр екенін түсінемін 🤍
Асықпай ала беріңіз. Мен қасыңыздамын — өзіңізге жұмсақ қамқорлық нұсқаларын айтып беремін.`
  }
};

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

function getEmotionalReply(language, intent, tier) {
  const lang = language === "kz" ? "kz" : "ru";
  const key = tier === "heavy" ? "heavy_distress" : intent;
  return REPLIES[lang][key] || REPLIES[lang].fatigue;
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
function tryEmotionalRouting(text, language, options = {}) {
  if (options.isButton) return null;
  if (isExplicitBookingRequest(text)) return null;

  const detected = detectEmotionalIntent(text);
  if (!detected) return null;

  const lang = language === "kz" ? "kz" : "ru";
  const reply = getEmotionalReply(lang, detected.intent, detected.tier);
  const menuContext =
    detected.tier === "heavy" ? "emotional_heavy" : "emotional_light";
  const menu = getMenuTextBlock(lang, menuContext);
  const fullReply = `${reply}\n\n${menu}`;

  console.log("EMOTIONAL INTENT:", detected.intent);

  return {
    intent: detected.intent,
    tier: detected.tier,
    menuContext,
    outbound: {
      reply: fullReply,
      messages: [{ type: "text", text: fullReply }],
      menuContext,
      skipMenu: true
    }
  };
}

module.exports = {
  detectEmotionalIntent,
  tryEmotionalRouting,
  getEmotionalReply,
  getAdminContactReply
};
