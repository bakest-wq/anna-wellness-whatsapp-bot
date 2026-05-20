const { logger } = require("./logger");
const { isDuplicate } = require("./messageDedup");
const { getSession } = require("./sessionStore");
const { detectLanguage } = require("./language");
const { handleIncomingMessage } = require("./conversation");
const {
  parseIncomingMessage,
  sendWhatsApp,
  sendMainMenuButtons,
  sendTextMenuFallback
} = require("./whatsapp");

async function processIncomingMessage({
  body,
  waConfig,
  openai,
  model,
  notifyAdmin,
  webhookTestReply = false
}) {
  const payload = parseIncomingMessage(body, waConfig.provider);

  if (!payload) {
    logger.debug("Webhook ignored (no parseable message)", {
      typeWebhook: body?.typeWebhook,
      typeMessage: body?.messageData?.typeMessage
    });
    return;
  }

  if (!payload.userId) return;

  if (!payload.text && !payload.isButton) {
    logger.debug("Webhook skipped (empty text, not a button)", {
      typeMessage: payload.typeMessage
    });
    return;
  }

  if (isDuplicate(payload.messageId)) {
    logger.debug("Duplicate message skipped", { messageId: payload.messageId });
    return;
  }

  if (payload.isButton) {
    console.log("BUTTON CLICK:", payload.buttonText);
    logger.info("BUTTON CLICK", {
      buttonText: payload.buttonText,
      buttonId: payload.buttonId,
      typeMessage: payload.typeMessage
    });
  } else {
    logger.info("Incoming text", {
      userId: payload.userId,
      text: payload.text,
      typeMessage: payload.typeMessage
    });
  }

  let result;

  if (webhookTestReply) {
    result = { reply: null, withMenu: true };
  } else {
    result = await handleIncomingMessage({
      userId: payload.userId,
      text: payload.text,
      buttonId: payload.buttonId,
      buttonText: payload.buttonText,
      isButton: payload.isButton,
      openai,
      model,
      logger,
      notifyAdmin
    });
  }

  const reply = result?.reply || (typeof result === "string" ? result : null);

  if (reply) {
    await sendWhatsApp({
      config: waConfig,
      to: payload.userId,
      text: reply,
      logger
    });
    logger.info("Reply sent", { userId: payload.userId, preview: String(reply).slice(0, 90) });
  }

  if (result?.withMenu) {
    const session = getSession(payload.userId);
    const lang = session.language || detectLanguage(payload.text);

    if (waConfig.provider === "green") {
      await sendMainMenuButtons({
        config: waConfig,
        to: payload.userId,
        language: lang,
        logger
      });
    } else {
      await sendTextMenuFallback({
        config: waConfig,
        to: payload.userId,
        language: lang,
        logger
      });
    }
  }
}

module.exports = { processIncomingMessage };
