const axios = require("axios");
const { normalizePhone } = require("./validators");

function extractGreenText(body) {
  const md = body?.messageData || {};
  return (
    md?.textMessageData?.textMessage ||
    md?.extendedTextMessageData?.text ||
    md?.extendedTextMessageData?.textMessage ||
    md?.quotedMessageData?.textMessage ||
    ""
  ).trim();
}

function parseIncomingFromGreen(body) {
  if (body?.typeWebhook !== "incomingMessageReceived") return null;
  if (body?.messageData?.typeMessage === "outgoing") return null;

  const sender = body?.senderData?.sender || body?.senderData?.chatId || "";
  const text = extractGreenText(body);
  if (!sender || !text) return null;

  const userId = String(sender).replace(/@c\.us$|@g\.us$/i, "");
  return {
    userId,
    text,
    messageId: body?.idMessage,
    chatId: sender.includes("@") ? sender : `${userId}@c.us`
  };
}

function parseIncomingFromCloud(body) {
  const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!message || message.type !== "text") return null;
  return {
    userId: message.from,
    text: message.text?.body || "",
    messageId: message.id
  };
}

async function sendWhatsAppGreen({ baseUrl, id, token, to, text, logger }) {
  const phone = normalizePhone(to).replace("+", "");
  const chatId = phone.includes("@") ? phone : `${phone}@c.us`;
  const url = `${baseUrl}/waInstance${id}/sendMessage/${token}`;
  const res = await axios.post(url, { chatId, message: text }, { timeout: 15000 });
  logger?.info?.("WhatsApp sent (Green)", { chatId, status: res.status });
}

async function sendWhatsAppCloud({ phoneNumberId, token, to, text, logger }) {
  await axios.post(
    `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
    {
      messaging_product: "whatsapp",
      to: normalizePhone(to).replace("+", ""),
      type: "text",
      text: { body: text }
    },
    {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 15000
    }
  );
  logger?.info?.("WhatsApp sent (Cloud)", { to });
}

async function sendWhatsApp({ config, to, text, logger }) {
  if (config.provider === "green") {
    return sendWhatsAppGreen({
      baseUrl: config.greenBase,
      id: config.greenId,
      token: config.greenToken,
      to,
      text,
      logger
    });
  }
  return sendWhatsAppCloud({
    phoneNumberId: config.cloudPhoneId,
    token: config.cloudToken,
    to,
    text,
    logger
  });
}

module.exports = {
  parseIncomingFromGreen,
  parseIncomingFromCloud,
  sendWhatsApp
};
