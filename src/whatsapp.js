const axios = require("axios");
const path = require("path");
const fs = require("fs");
const { BRAND } = require("./brand");
const { normalizePhone } = require("./validators");
const { getTypingDelayMs } = require("./ux");
const {
  getInteractiveMenuBlock,
  getTextMenuFallback
} = require("./buttons");

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

function pickButtonFields(obj) {
  if (!obj || typeof obj !== "object") return null;

  const buttonId =
    obj.selectedButtonId ||
    obj.selectedId ||
    obj.buttonId ||
    obj.id ||
    obj.singleSelectReply ||
    (obj.selectedIndex !== undefined ? String(obj.selectedIndex) : null);

  const buttonText =
    obj.selectedButtonText ||
    obj.selectedDisplayText ||
    obj.title ||
    obj.buttonText ||
    obj.text ||
    "";

  if (!buttonId && !buttonText) return null;

  return {
    buttonId: buttonId ? String(buttonId) : null,
    buttonText: String(buttonText).trim(),
    text: String(buttonText).trim()
  };
}

function extractGreenButton(body) {
  const md = body?.messageData || {};
  const type = md.typeMessage;

  const dataByType = {
    buttonsResponseMessage: md.buttonsResponseMessage,
    templateButtonReplyMessage: md.templateButtonReplyMessage || md.templateButtonsReplyMessage,
    templateButtonsReplyMessage: md.templateButtonReplyMessage || md.templateButtonsReplyMessage,
    interactiveResponseMessage: md.interactiveResponseMessage,
    interactiveButtonsResponse: md.interactiveButtonsResponse,
    interactiveButtonReplyMessage: md.interactiveButtonReplyMessage,
    interactiveButtonsReplyMessage: md.interactiveButtonsReplyMessage,
    listResponseMessage: md.listResponseMessage
  };

  if (type === "listResponseMessage" && md.listResponseMessage) {
    const lr = md.listResponseMessage;
    const rowId = lr.singleSelectReply || lr.selectedRowId;
    const title = lr.title || "";
    return {
      buttonId: rowId ? String(rowId) : null,
      buttonText: String(title).trim(),
      text: String(title).trim(),
      typeMessage: type
    };
  }

  if (type && dataByType[type]) {
    const picked = pickButtonFields(dataByType[type]);
    if (picked) return { ...picked, typeMessage: type };
  }

  const fallbackKeys = [
    "listResponseMessage",
    "templateButtonReplyMessage",
    "templateButtonsReplyMessage",
    "buttonsResponseMessage",
    "interactiveResponseMessage",
    "interactiveButtonsResponse",
    "interactiveButtonReplyMessage",
    "interactiveButtonsReplyMessage"
  ];

  for (const key of fallbackKeys) {
    const picked = pickButtonFields(md[key]);
    if (picked) {
      return { ...picked, typeMessage: type || key };
    }
  }

  return null;
}

function parseIncomingFromGreen(body) {
  if (body?.typeWebhook !== "incomingMessageReceived") return null;

  const typeMessage = body?.messageData?.typeMessage;
  if (typeMessage === "outgoing" || typeMessage === "outgoingMessageReceived") {
    return null;
  }

  const sender = body?.senderData?.sender || body?.senderData?.chatId || "";
  if (!sender) return null;

  const userId = String(sender).replace(/@c\.us$|@g\.us$/i, "");
  const button = extractGreenButton(body);
  const text = (button?.text || extractGreenText(body) || "").trim();

  if (!text && !button) return null;

  return {
    userId,
    text,
    messageId: body?.idMessage,
    chatId: sender.includes("@") ? sender : `${userId}@c.us`,
    buttonId: button?.buttonId || null,
    buttonText: button?.buttonText || text,
    isButton: Boolean(button),
    typeMessage: button?.typeMessage || typeMessage || "text"
  };
}

function parseIncomingFromCloud(body) {
  const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!message) return null;

  const listReply = message?.interactive?.list_reply;
  const interactive = message?.interactive?.button_reply || listReply;
  const text = (interactive?.title || message?.text?.body || "").trim();
  if (!text && !interactive) return null;

  return {
    userId: message.from,
    text,
    messageId: message.id,
    buttonId: interactive?.id || null,
    buttonText: interactive?.title || text,
    isButton: Boolean(interactive),
    typeMessage: interactive ? (listReply ? "list_reply" : "button_reply") : message.type
  };
}

function parseIncomingMessage(body, provider = "green") {
  if (provider === "green") return parseIncomingFromGreen(body);
  return parseIncomingFromCloud(body);
}

async function postGreen(config, endpoint, payload, logger) {
  const url = `${config.greenBase}/waInstance${config.greenId}/${endpoint}/${config.greenToken}`;
  const res = await axios.post(url, payload, { timeout: 15000 });
  logger?.info?.(`Green API ${endpoint}`, { chatId: payload.chatId, status: res.status });
  return res.data;
}

async function sendTypingGreen(config, chatId, ms, logger) {
  try {
    await postGreen(
      config,
      "sendTyping",
      { chatId, typingTime: Math.min(Math.max(ms, 1000), 20000) },
      logger
    );
  } catch (err) {
    logger?.debug?.("sendTyping skipped", { message: err.message });
  }
}

async function sendInteractiveButtonsReply(config, block, chatId, logger) {
  const payload = {
    chatId,
    header: block.header || BRAND.header,
    body: block.body,
    footer: block.footer || BRAND.subtitle,
    buttons: block.buttons.map((b) => ({
      buttonId: b.buttonId,
      buttonText: b.buttonText
    }))
  };

  return postGreen(config, "sendInteractiveButtonsReply", payload, logger);
}

async function sendListMessageGreen(config, block, chatId, logger) {
  const payload = {
    chatId,
    message: block.body,
    title: block.header,
    footer: block.footer,
    buttonText: block.listButtonText,
    sections: block.sections
  };

  return postGreen(config, "sendListMessage", payload, logger);
}

async function sendWhatsAppGreen({ config, to, text, logger }) {
  const chatId = toChatId(to);
  await postGreen(config, "sendMessage", { chatId, message: text }, logger);
}

async function sendFileByUrlGreen({ config, to, url, caption, logger }) {
  const chatId = toChatId(to);
  await postGreen(
    config,
    "sendFileByUrl",
    { chatId, urlFile: url, fileName: "cabinet.jpg", caption: caption || "" },
    logger
  );
}

async function sendLocalImageGreen({ config, to, filePath, caption, logger }) {
  const chatId = toChatId(to);
  const abs = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
  if (!fs.existsSync(abs)) return false;

  const fileBase64 = fs.readFileSync(abs).toString("base64");
  await postGreen(
    config,
    "sendFileByUpload",
    {
      chatId,
      file: fileBase64,
      fileName: path.basename(abs),
      caption: caption || ""
    },
    logger
  );
  return true;
}

async function sendTextMenuFallback({ config, to, language, logger, reason }) {
  logger.warn("Interactive menu unavailable, using text menu", {
    to,
    language,
    reason: reason || "not_supported"
  });
  const text = getTextMenuFallback(language);
  await sendWhatsAppGreen({ config, to, text, logger });
}

async function sendMainMenuButtons({ config, to, language, logger }) {
  const chatId = toChatId(to);
  const block = getInteractiveMenuBlock(language);
  const buttons = block.buttons.map((b) => ({
    buttonId: b.buttonId,
    buttonText: b.buttonText
  }));

  try {
    await sendListMessageGreen(config, block, chatId, logger);
    logger.info("Menu sent (sendListMessage, 4 options)", { chatId, language });
    return { mode: "list" };
  } catch (listErr) {
    logger.debug("sendListMessage failed, trying buttons", {
      message: listErr?.response?.data?.message || listErr.message
    });
  }

  try {
    await sendInteractiveButtonsReply(config, { ...block, buttons }, chatId, logger);
    logger.info("Menu sent (sendInteractiveButtonsReply)", { chatId, language, count: buttons.length });
    return { mode: "buttons" };
  } catch (btnErr) {
    if (buttons.length > 3) {
      try {
        await sendInteractiveButtonsReply(
          config,
          { ...block, buttons: buttons.slice(0, 3) },
          chatId,
          logger
        );
        await new Promise((r) => setTimeout(r, 500));
        await sendInteractiveButtonsReply(
          config,
          {
            header: BRAND.header,
            body: language === "kz" ? "Тағы бір бөлім 🌿" : "Ещё один раздел 🌿",
            footer: block.footer,
            buttons: [buttons[3]]
          },
          chatId,
          logger
        );
        logger.info("Menu sent (buttons split 3+1)", { chatId, language });
        return { mode: "buttons_split" };
      } catch (splitErr) {
        logger.debug("buttons split failed", { message: splitErr.message });
      }
    }

    await sendTextMenuFallback({
      config,
      to,
      language,
      logger,
      reason: btnErr?.response?.data?.message || btnErr.message
    });
    return { mode: "text_fallback" };
  }
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
  logger.info("WhatsApp sent (Cloud)", { to });
}

async function sendWhatsApp({ config, to, text, logger }) {
  if (config.provider === "green") {
    return sendWhatsAppGreen({ config, to, text, logger });
  }
  return sendWhatsAppCloud({ config, to, text, logger });
}

async function sendOutboundMessages({ config, to, messages, logger }) {
  const chatId = toChatId(to);
  const typingMs = getTypingDelayMs();

  if (config.provider === "green") {
    await sendTypingGreen(config, chatId, typingMs, logger);
    await new Promise((r) => setTimeout(r, typingMs));
  }

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (msg.type === "image") {
      if (config.provider === "green") {
        if (msg.url) {
          await sendFileByUrlGreen({
            config,
            to,
            url: msg.url,
            caption: msg.caption,
            logger
          });
        } else if (msg.path) {
          await sendLocalImageGreen({
            config,
            to,
            filePath: msg.path,
            caption: msg.caption,
            logger
          });
        }
      }
    } else if (msg.text) {
      await sendWhatsApp({ config, to, text: msg.text, logger });
    }

    if (i < messages.length - 1) {
      await new Promise((r) => setTimeout(r, 600));
    }
  }
}

module.exports = {
  parseIncomingFromGreen,
  parseIncomingFromCloud,
  parseIncomingMessage,
  sendWhatsApp,
  sendMainMenuButtons,
  sendTextMenuFallback,
  sendOutboundMessages,
  sendTypingGreen
};
