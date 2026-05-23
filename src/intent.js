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
  breathing_life: {
    patterns: [
      /\b(дыхание\s*жизни|дыхательн|дем\s*алу|өмір\s*демі)/i,
      /\b(как\s*проходит|сколько\s*длится|что\s*это)/i
    ],
    keywords: {
      ru: ["дыхание жизни", "дыхательная практика", "дыхательная", "как проходит дыхание"],
      kz: ["өмір демі", "дем алу", "тыныс алу"]
    },
    weight: 4
  },
  breathing_gaya_earthflow: {
    patterns: [
      /\b(gaya\s*touch|гайа\s*тач|earthflow|орсфлоу)/i,
      /\b(дыхание\s*жизни).*(gaya|earthflow|гайа)/i
    ],
    keywords: {
      ru: ["gaya touch", "гайа тач", "earthflow", "дыхание жизни gaya", "энергия earthflow"],
      kz: ["gaya touch", "earthflow", "өмір демі"]
    },
    weight: 5
  },
  five_comparison: {
    patterns: [
      /\b(разниц|отлича|чем лучше|что выбрать|какой выбрать)/i,
      /\b(огн.*бамбук|бамбук.*огн|банк.*огн)/i,
      /\b(айырмашылық|қайсысы жақсы)/i
    ],
    keywords: {
      ru: [
        "в чем разница",
        "чем отличается",
        "огонь или бамбук",
        "банки или огонь",
        "какой выбрать"
      ],
      kz: ["айырмашылығы", "от пен бамбук"]
    },
    weight: 4
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
  concierge: {
    patterns: [
      /\b(подобрать\s+практик|помочь\s+подобрать|что\s+мне\s+подойд|какую\s+практик)/i,
      /\b(практиканы\s+таңда|көмек\s+таңда)/i
    ],
    keywords: {
      ru: ["подобрать практику", "помочь подобрать", "что мне подойдет", "какую практику"],
      kz: ["практиканы таңдау", "таңдауға көмек", "қай практика жақсы"]
    },
    weight: 4
  },
  greeting: {
    patterns: [
      /\b(привет|здравств|добрый\s+(день|утро|вечер)|доброе\s+утро)\b/i,
      /\b(hello|hi|hey|good\s+(morning|afternoon|evening))\b/i,
      /\b(сәлем|салем|сәлеметсіз|ассалаумағалейкум|ассаламу\s*алейкум)\b/i,
      /\b(salam|salem|assalamu?\s*aleikum)\b/i
    ],
    keywords: {
      ru: [
        "привет",
        "здравствуйте",
        "здравствуй",
        "добрый день",
        "добрый вечер",
        "доброе утро"
      ],
      kz: ["сәлем", "салем", "сәлеметсіз бе", "ассалаумағалейкум"]
    },
    weight: 5
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

  const lang = language === "kz" ? "kz" : "ru";
  const kw = rule.keywords?.[lang] || [];
  for (const word of kw) {
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

  const greetingScore = scores.greeting || 0;
  if (greetingScore >= 2.5) {
    return {
      intent: "greeting",
      confidence: Math.min(1, greetingScore / 6),
      scores
    };
  }

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
