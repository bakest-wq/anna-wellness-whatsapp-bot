const BOOKING_PATTERNS = [
  /\b(хочу|можно|могу|нужно|надо)\s+(запис|забронир|попасть|прийти|приехать)/i,
  /\b(запиш|записать|записаться|запись|бронь|бронир)/i,
  /\b(свободн|есть\s+мест|есть\s+время).*(запис|сегодня|завтра)/i,
  /\b(жазыл|жазылу|жазылғым|жазылғым\s+келеді|жазылғым\s+келе)/i,
  /\b(уақыт\s+бар\s+ма|бос\s+уақыт|орын\s+бар\s+ма)/i,
  /\b(book|booking|appointment)\b/i
];

const BOOKING_KEYWORDS = {
  ru: [
    { word: "записаться", weight: 4 },
    { word: "запись", weight: 3 },
    { word: "запишите", weight: 4 },
    { word: "записать", weight: 3 },
    { word: "забронировать", weight: 4 },
    { word: "бронь", weight: 3 },
    { word: "хочу запис", weight: 4 },
    { word: "можно запис", weight: 3 },
    { word: "свободное время", weight: 2 },
    { word: "есть место", weight: 2 },
    { word: "на завтра", weight: 1 },
    { word: "на сегодня", weight: 1 }
  ],
  kz: [
    { word: "жазылу", weight: 4 },
    { word: "жазылғым", weight: 4 },
    { word: "жазылғым келеді", weight: 5 },
    { word: "жазып", weight: 3 },
    { word: "жазып қойыңыз", weight: 4 },
    { word: "жазылуға", weight: 4 },
    { word: "бос уақыт", weight: 2 },
    { word: "орын бар ма", weight: 2 },
    { word: "ертеңге", weight: 1 },
    { word: "бүгінге", weight: 1 }
  ]
};

const NEGATIVE_PATTERNS = [
  /\b(не\s+хочу|не\s+надо|отмен|болезн|диагноз|лечени)/i,
  /\b(жазылмаймын|керек\s+емес)/i
];

function scoreKeywords(text, language) {
  const t = String(text || "").toLowerCase();
  const lists = [BOOKING_KEYWORDS.ru, BOOKING_KEYWORDS.kz];
  if (language === "kz") lists.unshift(BOOKING_KEYWORDS.kz);
  else lists.unshift(BOOKING_KEYWORDS.ru);

  let score = 0;
  for (const list of lists) {
    for (const item of list) {
      if (t.includes(item.word)) score += item.weight;
    }
  }
  return score;
}

function scorePatterns(text) {
  const t = String(text || "");
  let score = 0;
  for (const pattern of BOOKING_PATTERNS) {
    if (pattern.test(t)) score += 3;
  }
  for (const pattern of NEGATIVE_PATTERNS) {
    if (pattern.test(t)) score -= 4;
  }
  return score;
}

function detectBookingIntentLocal(text, language) {
  const keywordScore = scoreKeywords(text, language);
  const patternScore = scorePatterns(text);
  const total = keywordScore + patternScore;

  return {
    isBooking: total >= 3,
    confidence: Math.min(1, Math.max(0, total / 8)),
    score: total,
    source: "local"
  };
}

async function detectBookingIntentWithAi(openai, text, language) {
  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0,
    max_tokens: 20,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          'Определи намерение клиента wellness-салона. Ответь JSON: {"booking_intent": true|false, "confidence": 0..1}. booking_intent=true только если клиент хочет записаться/забронировать/узнать свободное время для визита.'
      },
      {
        role: "user",
        content: `Язык: ${language}. Сообщение: ${text}`
      }
    ]
  });

  const raw = completion.choices?.[0]?.message?.content || "{}";
  const parsed = JSON.parse(raw);
  return {
    isBooking: Boolean(parsed.booking_intent),
    confidence: Number(parsed.confidence) || 0.5,
    score: parsed.booking_intent ? 5 : 0,
    source: "openai"
  };
}

async function detectBookingIntent({ text, language, openai, logger }) {
  const local = detectBookingIntentLocal(text, language);

  if (local.isBooking && local.confidence >= 0.45) {
    logger?.debug?.("Booking intent detected (local)", local);
    return local;
  }

  if (!local.isBooking && local.score <= 0) {
    return local;
  }

  const useAi = process.env.BOOKING_INTENT_AI === "true" && openai;
  if (!useAi) {
    return local;
  }

  try {
    const ai = await detectBookingIntentWithAi(openai, text, language);
    const merged = {
      isBooking: ai.isBooking || local.isBooking,
      confidence: Math.max(local.confidence, ai.confidence),
      score: Math.max(local.score, ai.score),
      source: ai.isBooking ? "openai+local" : local.source
    };
    logger?.debug?.("Booking intent detected (merged)", merged);
    return merged;
  } catch (err) {
    logger?.warn?.("AI intent detection failed, fallback to local", {
      error: err.message
    });
    return local;
  }
}

module.exports = {
  detectBookingIntent,
  detectBookingIntentLocal
};
