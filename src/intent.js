const INTENT_RULES = {
  booking: {
    patterns: [
      /\b(хочу|можно|могу|нужно|надо)\s+(запис|забронир|попасть)/i,
      /\b(запиш|записать|записаться|запись|бронь|бронир)/i,
      /\b(жазыл|жазылу|жазылғым|жазылғым\s+келеді)/i,
      /\b(уақыт\s+бар\s+ма|бос\s+уақыт|орын\s+бар\s+ма)/i
    ],
    keywords: {
      ru: ["записаться", "запись", "забронировать", "хочу запис", "свободное время"],
      kz: ["жазылу", "жазылғым", "жазылғым келеді", "жазып қойыңыз"]
    },
    weight: 4
  },
  price: {
    patterns: [/\b(цен|стоим|прайс|сколько\s+стоит|бағасы|қанша\s+тұрады)/i],
    keywords: {
      ru: ["цена", "стоимость", "сколько стоит", "прайс"],
      kz: ["бағасы", "қанша", "баға"]
    },
    weight: 3
  },
  five_continents: {
    patterns: [
      /\b(5\s*континент|пять\s*континент|континент)/i,
      /\b(отпен|бамбук|банка)/i
    ],
    keywords: {
      ru: ["5 континент", "пять континент", "массаж 5", "с огнем", "бамбук"],
      kz: ["5 континент", "континент", "отпен", "бамбук"]
    },
    weight: 3
  },
  address: {
    patterns: [/\b(адрес|где\s+наход|как\s+доехать|қайда|орналасқан|мекенжай)/i],
    keywords: {
      ru: ["адрес", "где вы", "как проехать", "где находитесь"],
      kz: ["мекенжай", "қайда", "орналасқан"]
    },
    weight: 3
  },
  contraindications: {
    patterns: [
      /\b(противопоказан|можно\s+ли\s+при|беременн|температур)/i,
      /\b(қарсы\s+көрсетілім|жүктілік)/i
    ],
    keywords: {
      ru: ["противопоказания", "можно ли", "беременность", "болезнь"],
      kz: ["қарсы көрсетілім", "жүктілік", "ауру"]
    },
    weight: 3
  },
  services: {
    patterns: [/\b(услуг|практик|что\s+есть|қызмет|практика)/i],
    keywords: {
      ru: ["услуги", "практики", "что есть", "какие практики", "mukaino", "earthflow", "access bars"],
      kz: ["қызмет", "практика", "не бар"]
    },
    weight: 2
  },
  schedule: {
    patterns: [/\b(график|режим|когда\s+работ|жұмыс\s+уақыты|со\s+скольки)/i],
    keywords: {
      ru: ["график", "во сколько", "когда работаете", "до скольки"],
      kz: ["жұмыс уақыты", "қашан жұмыс"]
    },
    weight: 2
  },
  greeting: {
    patterns: [/\b(привет|здравств|добрый|сәлем|салем|hello|hi)\b/i],
    keywords: {
      ru: ["привет", "здравствуйте", "добрый день", "добрый вечер"],
      kz: ["сәлем", "салем", "сәлеметсіз бе"]
    },
    weight: 2
  },
  thanks: {
    patterns: [/\b(спасибо|благодар|рахмет|thanks|thank you)\b/i],
    keywords: { ru: ["спасибо", "благодарю"], kz: ["рахмет", "спасибо"] },
    weight: 2
  },
  master: {
    patterns: [/\b(анна|абдулрашид|мастер|специалист|кто\s+вед)/i],
    keywords: {
      ru: ["анна", "мастер", "кто ведет", "специалист"],
      kz: ["анна", "маман", "шебер"]
    },
    weight: 2
  }
};

function scoreIntent(text, language, intentName, rule) {
  const t = String(text || "").toLowerCase();
  let score = 0;

  for (const pattern of rule.patterns || []) {
    if (pattern.test(t)) score += 3;
  }

  const kw = rule.keywords?.[language] || [];
  const kwAlt = rule.keywords?.[language === "kz" ? "ru" : "kz"] || [];
  for (const word of [...kw, ...kwAlt]) {
    if (t.includes(word.toLowerCase())) score += 2;
  }

  return score * (rule.weight || 1) / 4;
}

function detectClientIntent(text, language) {
  const scores = {};

  for (const [intent, rule] of Object.entries(INTENT_RULES)) {
    scores[intent] = scoreIntent(text, language, intent, rule);
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [topIntent, topScore] = sorted[0];
  const [, secondScore] = sorted[1] || ["general", 0];

  const intent = topScore >= 2 && topScore > secondScore + 0.5 ? topIntent : "general";

  return {
    intent,
    confidence: Math.min(1, topScore / 6),
    scores
  };
}

async function detectBookingIntent({ text, language, openai, logger }) {
  const result = detectClientIntent(text, language);
  return {
    isBooking: result.intent === "booking" && result.confidence >= 0.35,
    confidence: result.intent === "booking" ? result.confidence : 0,
    score: result.scores?.booking || 0,
    source: "local",
    intent: result.intent
  };
}

module.exports = {
  detectClientIntent,
  detectBookingIntent,
  INTENT_RULES
};
