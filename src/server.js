require("dotenv").config();

const express = require("express");
const axios = require("axios");
const OpenAI = require("openai");

const { logger } = require("./logger");
const { verifyWhatsAppCloudSignature, verifyGreenWebhook } = require("./webhookAuth");
const { persistLead } = require("./sheets");
const { SALON, SERVICES, FAQ } = require("./knowledge");
const { handleIncomingMessage } = require("./conversation");
const { detectLanguage } = require("./language");
const { getSession } = require("./sessionStore");
const {
  parseIncomingFromGreen,
  parseIncomingFromCloud,
  sendWhatsApp,
  sendMainMenuButtons
} = require("./whatsapp");
const { isDuplicate } = require("./messageDedup");

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
const ADMIN_PHONE = process.env.ADMIN_PHONE || "+77754368680";
const WEBHOOK_REQUIRE_SIGNATURE = process.env.WEBHOOK_REQUIRE_SIGNATURE === "true";
const WEBHOOK_TEST_REPLY = process.env.WEBHOOK_TEST_REPLY === "true";

const waConfig = {
  provider: WHATSAPP_PROVIDER,
  greenId: process.env.GREEN_API_ID_INSTANCE,
  greenToken: process.env.GREEN_API_TOKEN || process.env.GREEN_API_TOKEN_INSTANCE,
  greenBase: process.env.GREEN_API_BASE_URL || "https://api.green-api.com",
  cloudPhoneId: process.env.WHATSAPP_PHONE_NUMBER_ID,
  cloudToken: process.env.WHATSAPP_CLOUD_TOKEN
};

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function sendTelegram(text) {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) return;
  await axios.post(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    { chat_id: process.env.TELEGRAM_CHAT_ID, text },
    { timeout: 10000 }
  );
}

async function notifyAdmin(lead) {
  await Promise.allSettled([
    sendTelegram(lead.text),
    sendWhatsApp({ config: waConfig, to: ADMIN_PHONE, text: lead.text, logger }),
    persistLead(lead.payload, logger)
  ]);
}

function verifyWebhookRequest(req) {
  if (WHATSAPP_PROVIDER === "cloud") {
    const result = verifyWhatsAppCloudSignature(
      req.rawBody || Buffer.from(""),
      req.headers["x-hub-signature-256"],
      process.env.WHATSAPP_APP_SECRET
    );
    if (!result.ok && !result.skipped) return { ok: false, reason: result.reason };
    return { ok: true };
  }

  const result = verifyGreenWebhook(req, process.env.GREEN_WEBHOOK_SECRET);
  if (!result.ok && !result.skipped) return { ok: false, reason: result.reason };
  return { ok: true };
}

async function processWebhook(req, res) {
  const auth = verifyWebhookRequest(req);
  if (!auth.ok) {
    logger.warn("Webhook rejected", { reason: auth.reason });
    if (WEBHOOK_REQUIRE_SIGNATURE) return res.sendStatus(401);
  }

  res.sendStatus(200);

  try {
    const payload =
      WHATSAPP_PROVIDER === "green"
        ? parseIncomingFromGreen(req.body)
        : parseIncomingFromCloud(req.body);

    if (!payload?.text || !payload?.userId) return;

    if (isDuplicate(payload.messageId)) {
      logger.debug("Duplicate message skipped", { messageId: payload.messageId });
      return;
    }

    logger.info("Incoming message", {
      userId: payload.userId,
      text: payload.text,
      messageId: payload.messageId
    });

    let result;

    if (WEBHOOK_TEST_REPLY) {
      result = {
        reply:
          "Здравствуйте 🌿 Рада вас видеть. Выберите, пожалуйста, пункт в меню ниже.",
        withMenu: true
      };
    } else {
      result = await handleIncomingMessage({
        userId: payload.userId,
        text: payload.text,
        buttonId: payload.buttonId,
        buttonText: payload.buttonText,
        isButton: payload.isButton,
        openai,
        model: OPENAI_MODEL,
        logger,
        notifyAdmin
      });
    }

    const reply = result?.reply || result;

    if (reply) {
      await sendWhatsApp({
        config: waConfig,
        to: payload.userId,
        text: reply,
        logger
      });
      logger.info("Reply sent", { userId: payload.userId, preview: String(reply).slice(0, 90) });
    }

    if (result?.withMenu && waConfig.provider === "green") {
      const session = getSession(payload.userId);
      await sendMainMenuButtons({
        config: waConfig,
        to: payload.userId,
        language: session.language || detectLanguage(payload.text),
        logger
      });
    }
  } catch (err) {
    logger.error("Webhook error", { message: err.message, data: err?.response?.data });
    try {
      const p = parseIncomingFromGreen(req.body);
      if (p?.userId) {
        await sendWhatsApp({
          config: waConfig,
          to: p.userId,
          text: "Здравствуйте 🌿 Сейчас небольшая пауза. Напишите, пожалуйста, чуть позже — мы обязательно ответим.",
          logger
        });
      }
    } catch (_) {}
  }
}

app.get("/", (_, res) => {
  res.json({
    ok: true,
    version: "pro",
    service: "Anna wellness WhatsApp AI bot",
    provider: WHATSAPP_PROVIDER,
    routes: ["POST /webhook", "POST /webhook/whatsapp"]
  });
});

app.get("/faq", (_, res) => res.json(FAQ));

app.get("/services", (_, res) => {
  res.json({
    master: SALON.master,
    address: SALON.address,
    schedule: `${SALON.schedule} (последняя запись ${SALON.lastBooking})`,
    services: SERVICES
  });
});

app.get("/webhook", (_, res) => {
  res.json({ ok: true, route: "/webhook", version: "pro", provider: WHATSAPP_PROVIDER });
});

app.post("/webhook", processWebhook);

app.get("/webhook/whatsapp", (req, res) => {
  if (WHATSAPP_PROVIDER !== "cloud") {
    return res.json({ ok: true, route: "/webhook/whatsapp", version: "pro" });
  }
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
  if (req.query["hub.mode"] === "subscribe" && req.query["hub.verify_token"] === verifyToken) {
    return res.status(200).send(req.query["hub.challenge"]);
  }
  return res.sendStatus(403);
});

app.post("/webhook/whatsapp", processWebhook);

app.listen(PORT, () => {
  logger.info(`Anna Wellness Bot PRO started on :${PORT}`, {
    provider: WHATSAPP_PROVIDER,
    green: Boolean(waConfig.greenId && waConfig.greenToken),
    openai: Boolean(process.env.OPENAI_API_KEY),
    telegram: Boolean(process.env.TELEGRAM_BOT_TOKEN)
  });
});
