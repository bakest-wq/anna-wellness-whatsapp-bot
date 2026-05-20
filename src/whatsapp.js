const axios = require("axios");
const { normalizePhone } = require("./validators");
const { getMenuBlocks } = require("./buttons");

function toChatId(to) {
  const phone = normalizePhone(to).replace("+", "");
  return phone.includes("@") ? phone : `${phone}@c.us`;
}

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

function extractGreenButton(body) {
  const md = body?.messageData || {};
  const type = md?.typeMessage;

  if (type === "buttonsResponseMessage" && md?.buttonsResponseMessage) {
    const b = md.buttonsResponseMessage;
    return {
      buttonId: b.selectedButtonId,
      buttonText: b.selectedButtonText,
      text: b.selectedButtonText
    };
  }

  if (type === "templateButtonReplyMessage" && md?.templateButtonReplyMessage) {
    const b = md.templateButtonReplyMessage;
    return {
      buttonId: b.selectedId,
      buttonText: b.selectedDisplayText,
      text: b.selectedDisplayText
    };
  }

  return null;
}

function parseIncomingFromGreen(body) {
  if (body?.typeWebhook !== "incomingMessageReceived") return null;
  if (body?.messageData?.typeMessage === "outgoing") return null;

  const sender = body?.senderData?.sender || body?.senderData?.chatId || "";
  if (!sender) return null;

  const userId = String(sender).replace(/@c\.us$|@g\.us$/i, "");
  const button = extractGreenButton(body);
  const text = button?.text || extractGreenText(body);

  if (!text && !button) return null;

  return {
    userId,
    text: text || "",
    messageId: body?.idMessage,
    chatId: sender.includes("@") ? sender : `${userId}@c.us`,
    buttonId: button?.buttonId || null,
    buttonText: button?.buttonText || null,
    isButton: Boolean(button)
  };
}

function parseIncomingFromCloud(body) {
  const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!message || message.type !== "text") return null;

  const interactive = message?.interactive?.button_reply;
  return {
    userId: message.from,
    text: interactive?.title || message.text?.body || "",
    messageId: message.id,
    buttonId: interactive?.id || null,
    buttonText: interactive?.title || null,
    isButton: Boolean(interactive)
  };
}

async function postGreen(config, endpoint, payload, logger) {
  const url = `${config.greenBase}/waInstance${config.greenId}/${endpoint}/${config.greenToken}`;
  const res = await axios.post(url, payload, { timeout: 15000 });
  logger?.info?.(`Green API ${endpoint}`, { chatId: payload.chatId, status: res.status });
  return res.data;
}

async function sendButtonsMessage(config, block, chatId, logger) {
  const messageText = block.header ? `${block.header}\n\n${block.message}` : block.message;

  const payload = {
    chatId,
    message: messageText,
    footer: block.footer,
    buttons: block.buttons
  };

  try {
    return await postGreen(config, "sendButtons", payload, logger);
  } catch (err) {
    const status = err?.response?.status;
    logger?.warn?.("sendButtons failed, fallback to sendInteractiveButtonsReply", {
      status,
      message: err.message
    });

    const interactivePayload = {
      chatId,
      header: block.header || "Sakina Beauty 🌿",
      body: block.message,
      footer: block.footer || "",
      buttons: block.buttons.map((b) => ({
        buttonId: b.buttonId,
        buttonText: b.buttonText
      }))
    };

    return await postGreen(config, "sendInteractiveButtonsReply", interactivePayload, logger);
  }
}

async function sendWhatsAppGreen({ config, to, text, logger }) {
  const chatId = toChatId(to);
  await postGreen(config, "sendMessage", { chatId, message: text }, logger);
}

async function sendMainMenuButtons({ config, to, language, logger }) {
  const chatId = toChatId(to);
  const blocks = getMenuBlocks(language);

  await sendButtonsMessage(config, blocks.main, chatId, logger);
  await new Promise((r) => setTimeout(r, 600));
  await sendButtonsMessage(config, blocks.extra, chatId, logger);

  logger?.info?.("Main menu buttons sent", { chatId, language });
}

async function sendWhatsAppCloud({ config, to, text, logger }) {
  await axios.post(
    `https://graph.facebook.com/v21.0/${config.cloudPhoneId}/messages`,
    {
      messaging_product: "whatsapp",
      to: normalizePhone(to).replace("+", ""),
      type: "text",
      text: { body: text }
    },
    {
      headers: { Authorization: `Bearer ${config.cloudToken}` },
      timeout: 15000
    }
  );
  logger?.info?.("WhatsApp sent (Cloud)", { to });
}

async function sendWhatsApp({ config, to, text, logger }) {
  if (config.provider === "green") {
    return sendWhatsAppGreen({ config, to, text, logger });
  }
  return sendWhatsAppCloud({ config, to, text, logger });
}

module.exports = {
  parseIncomingFromGreen,
  parseIncomingFromCloud,
  sendWhatsApp,
  sendMainMenuButtons
};
