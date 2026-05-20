require("dotenv").config();

const express = require("express");
const axios = require("axios");
const OpenAI = require("openai");

const { logger } = require("./logger");
const { detectBookingIntent } = require("./intent");
const { verifyWhatsAppCloudSignature, verifyGreenWebhook } = require("./webhookAuth");
const { persistLead } = require("./sheets");

const app = express();

app.use(
  express.json({
    limit: "2mb",
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    }
  })
);

const PORT = process.env.PORT || 3000;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const WHATSAPP_PROVIDER = (process.env.WHATSAPP_PROVIDER || "green").toLowerCase();
const ADMIN_PHONE = process.env.ADMIN_PHONE || "+77711126089";
const WEBHOOK_REQUIRE_SIGNATURE = process.env.WEBHOOK_REQUIRE_SIGNATURE === "true";
const GREEN_API_ID = process.env.GREEN_API_ID_INSTANCE;
const GREEN_API_TOKEN =
  process.env.GREEN_API_TOKEN ||
  process.env.GREEN_API_TOKEN_INSTANCE;
const GREEN_API_BASE =
  process.env.GREEN_API_BASE_URL || "https://api.green-api.com";
const WEBHOOK_TEST_REPLY = process.env.WEBHOOK_TEST_REPLY === "true";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const sessions = new Map();

const SERVICES = [
  { name: "Массаж 5 континентов", duration: "2-2,5 часа", price: "30 000 ₸" },
  { name: "Массаж 5 континентов с огнем", duration: "2-2,5 часа", price: "35 000 ₸" },
  { name: "Массаж 5 континентов с бамбуковыми банками", duration: "2-2,5 часа", price: "33 000 ₸" },
  { name: "Mukaino M-Test", duration: "30-40 минут", price: "10 000 ₸" },
  { name: "Дыхательная практика", duration: "1 час", price: "20 000 ₸" },
  { name: "EarthFlow", duration: "1 час", price: "20 000 ₸" },
  { name: "Access Bars", duration: "1 час", price: "15 000 ₸" }
];

const FAQ = {
  fiveContinents: [
    "Что это? Глубокая wellness-практика с сочетанием мягких и динамичных техник по телу.",
    "Сколько длится? Обычно 2-2,5 часа.",
    "Для чего? Для расслабления, восстановления ресурса и снятия общего напряжения.",
    "Это не лечебная процедура и не заменяет консультацию врача."
  ],
  mukaino: [
    "Mukaino M-Test - мягкая телесная диагностическая оценка движения и баланса.",
    "Длительность: 30-40 минут.",
    "Помогает подобрать комфортный формат последующих практик."
  ],
  microcorn: [
    "Microcorn - локальная эстетическая/уходовая работа с зоной сухих уплотнений.",
    "План и частота определяются индивидуально после осмотра специалиста.",
    "При выраженной боли, воспалении или сомнениях лучше сначала обратиться к врачу."
  ],
  contraindications: [
    "Острые воспалительные состояния и температура.",
    "Тяжелые обострения хронических состояний.",
    "Свежие травмы, кровотечения, послеоперационный ранний период.",
    "Беременность и другие состояния обсуждаются индивидуально."
  ],
  preparation: [
    "За 1,5-2 часа не переедать.",
    "Пить воду в течение дня.",
    "Надеть комфортную одежду и сообщить о противопоказаниях заранее."
  ],
  afterSession: [
    "После сеанса чаще всего ощущаются расслабление и легкость.",
    "Возможна сонливость и потребность в восстановлении.",
    "Рекомендуется вода, спокойный режим и без интенсивных нагрузок в день практики."
  ]
};

function normalizePhone(phone) {
  return String(phone || "").replace(/[^\d+]/g, "");
}

function detectLanguage(text) {
  const t = String(text || "").toLowerCase();
  const kzMarkers = [
    "сәлем",
    "рахмет",
    "жазылайын",
    "жазылу",
    "қашан",
    "бағасы",
    "иә",
    "жоқ",
    "массаж",
    "жазылғым"
  ];
  const ruMarkers = ["здравствуйте", "привет", "запис", "сколько", "цена", "да", "нет"];

  const kzScore = kzMarkers.reduce((acc, m) => (t.includes(m) ? acc + 1 : acc), 0);
  const ruScore = ruMarkers.reduce((acc, m) => (t.includes(m) ? acc + 1 : acc), 0);

  if (kzScore > ruScore) return "kz";
  return "ru";
}

function getSession(userId) {
  if (!sessions.has(userId)) {
    sessions.set(userId, {
      language: "ru",
      history: [],
      booking: null
    });
  }
  return sessions.get(userId);
}

function initBooking(language) {
  return {
    active: true,
    step: "name",
    data: {
      name: "",
      phone: "",
      service: "",
      day: "",
      time: "",
      contraindications: "",
      comment: ""
    },
    language
  };
}

function nextBookingQuestion(booking) {
  const q = {
    ru: {
      name: "Подскажите, пожалуйста, как к вам обращаться?",
      phone: "Оставьте, пожалуйста, ваш номер телефона для подтверждения записи.",
      service: "На какую практику хотите записаться?",
      day: "На какой день вам удобно?",
      time: "Какое время вам комфортно? Работаем с 09:00 до 22:00, последняя запись в 20:00.",
      contraindications:
        "Подскажите, пожалуйста, есть ли противопоказания или состояния, о которых важно знать?"
    },
    kz: {
      name: "Өзіңізді қалай атаймыз?",
      phone: "Жазылуды растау үшін телефон нөміріңізді қалдырыңызшы.",
      service: "Қай практикаға жазылғыңыз келеді?",
      day: "Қай күн ыңғайлы?",
      time: "Қай уақыт ыңғайлы? Жұмыс уақыты: 09:00-22:00, соңғы жазылу 20:00.",
      contraindications: "Қарсы көрсетілімдер немесе ескеру керек жағдайлар бар ма?"
    }
  };

  return q[booking.language]?.[booking.step] || q.ru[booking.step];
}

function parseBookingStep(booking, message) {
  const text = String(message || "").trim();
  const lText = text.toLowerCase();
  if (!text) return;

  if (booking.step === "name") {
    booking.data.name = text;
    booking.step = "phone";
    return;
  }

  if (booking.step === "phone") {
    booking.data.phone = normalizePhone(text);
    booking.step = "service";
    return;
  }

  if (booking.step === "service") {
    booking.data.service = text;
    booking.step = "day";
    return;
  }

  if (booking.step === "day") {
    booking.data.day = text;
    booking.step = "time";
    return;
  }

  if (booking.step === "time") {
    booking.data.time = text;
    booking.step = "contraindications";
    return;
  }

  if (booking.step === "contraindications") {
    booking.data.contraindications = text;
    booking.data.comment = /нет|жоқ|no|none/i.test(lText) ? "" : text;
    booking.step = "done";
    booking.active = false;
  }
}

async function getAiReply({ text, language, history }) {
  const servicesText = SERVICES.map(
    (s, i) => `${i + 1}. ${s.name} - ${s.duration} - ${s.price}`
  ).join("\n");

  const systemPrompt = `
Вы - AI-администратор премиального wellness-салона мастера Анны Абдулрашидовны в Актобе.
Общаетесь мягко, женственно, спокойно, заботливо, на "вы", коротко.
Никогда не давите на клиента.
Сначала уточняете запрос, потом мягко ведете к записи.

Язык ответа:
- если язык клиента русский -> отвечайте на русском.
- если язык клиента казахский -> отвечайте на казахском.

Запрещено:
- обещать лечение болезней
- ставить диагнозы
- говорить "мы вас вылечим"
- давать медицинские гарантии

Адрес: Актобе, район Батыс, Ораз Татеулы 15
График: 09:00-22:00, последняя запись в 20:00

Услуги:
${servicesText}
`;

  const messages = [
    { role: "system", content: systemPrompt },
    ...history.slice(-8).map((h) => ({ role: h.role, content: h.content })),
    {
      role: "user",
      content: `Язык клиента: ${language}. Сообщение клиента: ${text}`
    }
  ];

  const completion = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    temperature: 0.6,
    max_tokens: 220,
    messages
  });

  return completion.choices?.[0]?.message?.content?.trim() || "";
}

function buildAdminLead(booking, clientPhone, language) {
  const d = booking.data;
  return {
    text: `🌿 Новая заявка с WhatsApp

Имя: ${d.name}
Телефон: ${d.phone || clientPhone}
Язык клиента: ${language === "kz" ? "Казахский" : "Русский"}
Услуга: ${d.service}
Желаемый день: ${d.day}
Желаемое время: ${d.time}
Противопоказания: ${d.contraindications}
Комментарий: ${d.comment || "-"}
Источник: WhatsApp AI-бот`,
    payload: {
      name: d.name,
      phone: d.phone || clientPhone,
      language: language === "kz" ? "Казахский" : "Русский",
      service: d.service,
      day: d.day,
      time: d.time,
      contraindications: d.contraindications,
      comment: d.comment || "-",
      source: "WhatsApp AI-бот"
    }
  };
}

async function sendTelegram(text) {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) return;
  const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
  await axios.post(url, {
    chat_id: process.env.TELEGRAM_CHAT_ID,
    text
  });
}

async function sendWhatsAppCloud(to, text) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_CLOUD_TOKEN;
  if (!phoneNumberId || !token) return;
  await axios.post(
    `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
    {
      messaging_product: "whatsapp",
      to: normalizePhone(to).replace("+", ""),
      type: "text",
      text: { body: text }
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    }
  );
}

async function sendWhatsAppGreen(to, text) {
  if (!GREEN_API_ID || !GREEN_API_TOKEN) {
    logger.error("Green API credentials missing", {
      hasId: Boolean(GREEN_API_ID),
      hasToken: Boolean(GREEN_API_TOKEN)
    });
    return;
  }

  const phone = normalizePhone(to).replace("+", "");
  const chatId = phone.includes("@") ? phone : `${phone}@c.us`;
  const url = `${GREEN_API_BASE}/waInstance${GREEN_API_ID}/sendMessage/${GREEN_API_TOKEN}`;

  const response = await axios.post(url, { chatId, message: text });
  logger.info("Green API message sent", { chatId, status: response.status });
}

async function sendWhatsApp(to, text) {
  if (WHATSAPP_PROVIDER === "green") return sendWhatsAppGreen(to, text);
  return sendWhatsAppCloud(to, text);
}

async function notifyAdmin(lead) {
  await Promise.allSettled([
    sendTelegram(lead.text),
    sendWhatsApp(ADMIN_PHONE, lead.text),
    persistLead({ ...lead.payload, userId: lead.userId }, logger)
  ]);
}

function parseIncomingFromCloud(body) {
  const entry = body?.entry?.[0];
  const change = entry?.changes?.[0];
  const value = change?.value;
  const message = value?.messages?.[0];
  if (!message || message.type !== "text") return null;

  return {
    userId: message.from,
    text: message.text?.body || "",
    messageId: message.id
  };
}

function extractGreenText(body) {
  const md = body?.messageData || {};
  return (
    md?.textMessageData?.textMessage ||
    md?.extendedTextMessageData?.text ||
    md?.extendedTextMessageData?.textMessage ||
    md?.quotedMessageData?.textMessage ||
    md?.templateMessageData?.text ||
    ""
  );
}

function parseIncomingFromGreen(body) {
  const typeWebhook = body?.typeWebhook;

  if (typeWebhook !== "incomingMessageReceived") {
    logger.debug("Green webhook ignored", { typeWebhook });
    return null;
  }

  const sender = body?.senderData?.sender || body?.senderData?.chatId || "";
  const text = extractGreenText(body).trim();

  if (!sender) {
    logger.warn("Green webhook: no sender", { idMessage: body?.idMessage });
    return null;
  }

  const userId = String(sender).replace(/@c\.us$|@g\.us$/i, "");

  if (!text) {
    logger.info("Green webhook: non-text message", {
      userId,
      messageType: body?.messageData?.typeMessage,
      idMessage: body?.idMessage
    });
    return null;
  }

  return {
    userId,
    text,
    messageId: body?.idMessage,
    chatId: sender.includes("@") ? sender : `${userId}@c.us`
  };
}

function verifyWebhookRequest(req) {
  if (WHATSAPP_PROVIDER === "cloud") {
    const result = verifyWhatsAppCloudSignature(
      req.rawBody || Buffer.from(""),
      req.headers["x-hub-signature-256"],
      process.env.WHATSAPP_APP_SECRET
    );
    if (!result.ok && !result.skipped) {
      return { ok: false, reason: result.reason };
    }
    return { ok: true, reason: result.reason || "cloud_ok" };
  }

  const result = verifyGreenWebhook(req, process.env.GREEN_WEBHOOK_SECRET);
  if (!result.ok && !result.skipped) {
    return { ok: false, reason: result.reason };
  }
  return { ok: true, reason: result.reason || "green_ok" };
}

async function handleIncomingMessage(userId, text) {
  const session = getSession(userId);
  session.language = detectLanguage(text) || session.language || "ru";
  const language = session.language;

  if (!session.booking) {
    const intent = await detectBookingIntent({
      text,
      language,
      openai,
      logger
    });

    if (intent.isBooking) {
      logger.info("Booking flow started", { userId, intent });
      session.booking = initBooking(language);
      return nextBookingQuestion(session.booking);
    }
  }

  if (session.booking?.active) {
    parseBookingStep(session.booking, text);

    if (session.booking.step === "done") {
      const lead = buildAdminLead(session.booking, userId, language);
      lead.userId = userId;
      await notifyAdmin(lead);
      session.booking = null;
      logger.info("Booking completed", { userId, phone: lead.payload.phone });
      return "Благодарю вас 🌿 Я передам вашу заявку администратору. Вам напишут и подтвердят удобное время.";
    }

    return nextBookingQuestion(session.booking);
  }

  session.history.push({ role: "user", content: text });
  const aiText = await getAiReply({ text, language, history: session.history });
  session.history.push({ role: "assistant", content: aiText });
  return aiText;
}

app.get("/", (_, res) => {
  res.json({
    ok: true,
    service: "Anna wellness WhatsApp AI bot",
    provider: WHATSAPP_PROVIDER
  });
});

app.get("/faq", (_, res) => {
  res.json(FAQ);
});

app.get("/services", (_, res) => {
  res.json({
    address: "Актобе, район Батыс, Ораз Татеулы 15",
    schedule: "09:00-22:00 (последняя запись 20:00)",
    services: SERVICES
  });
});

app.get("/webhook/whatsapp", (req, res) => {
  if (WHATSAPP_PROVIDER !== "cloud") return res.sendStatus(404);
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === verifyToken) {
    logger.info("WhatsApp webhook verified");
    return res.status(200).send(challenge);
  }
  logger.warn("WhatsApp webhook verification failed");
  return res.sendStatus(403);
});

async function processWebhook(req, res) {
  const auth = verifyWebhookRequest(req);
  if (!auth.ok) {
    logger.warn("Webhook signature rejected", { reason: auth.reason });
    if (WEBHOOK_REQUIRE_SIGNATURE) return res.sendStatus(401);
  }

  logger.info("Webhook received", {
    path: req.path,
    typeWebhook: req.body?.typeWebhook,
    messageId: req.body?.idMessage
  });
  logger.debug("Webhook body", { body: req.body });

  res.sendStatus(200);

  try {
    const payload =
      WHATSAPP_PROVIDER === "green"
        ? parseIncomingFromGreen(req.body)
        : parseIncomingFromCloud(req.body);

    if (!payload?.text || !payload?.userId) {
      return;
    }

    logger.info("Incoming message", {
      userId: payload.userId,
      text: payload.text,
      messageId: payload.messageId
    });

    let reply;

    if (WEBHOOK_TEST_REPLY) {
      reply =
        "Здравствуйте 🌿 Я получила ваше сообщение. Бот подключён и отвечает. Чем могу помочь?";
    } else {
      reply = await handleIncomingMessage(payload.userId, payload.text);
    }

    if (reply) {
      await sendWhatsApp(payload.userId, reply);
      logger.info("Reply sent to WhatsApp", {
        userId: payload.userId,
        preview: reply.slice(0, 80)
      });
    }
  } catch (err) {
    logger.error("Webhook processing error", {
      message: err.message,
      data: err?.response?.data
    });

    try {
      const payload = parseIncomingFromGreen(req.body);
      if (payload?.userId) {
        await sendWhatsApp(
          payload.userId,
          "Здравствуйте 🌿 Сейчас небольшая техническая пауза. Пожалуйста, напишите чуть позже."
        );
      }
    } catch (sendErr) {
      logger.error("Failed to send error fallback", { message: sendErr.message });
    }
  }
}

app.get("/webhook", (_, res) => {
  res.json({ ok: true, route: "/webhook", provider: WHATSAPP_PROVIDER });
});

app.post("/webhook", processWebhook);

app.get("/webhook/whatsapp", (req, res) => {
  if (WHATSAPP_PROVIDER !== "cloud") {
    return res.json({ ok: true, route: "/webhook/whatsapp", provider: WHATSAPP_PROVIDER });
  }
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === verifyToken) {
    logger.info("WhatsApp webhook verified");
    return res.status(200).send(challenge);
  }
  logger.warn("WhatsApp webhook verification failed");
  return res.sendStatus(403);
});

app.post("/webhook/whatsapp", processWebhook);

app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`, {
    provider: WHATSAPP_PROVIDER,
    routes: ["POST /webhook", "POST /webhook/whatsapp"],
    greenApi: Boolean(GREEN_API_ID && GREEN_API_TOKEN),
    sheets: process.env.GOOGLE_SHEETS_ENABLED === "true"
  });
});
