const { logger } = require("./logger");
const { isDuplicate } = require("./messageDedup");
const { getSession, updateSession } = require("./sessionStore");
const { detectLanguage } = require("./language");
const { handleIncomingMessage } = require("./conversation");
const {
  parseIncomingMessage,
  sendContextMenu,
  sendTextMenuFallback,
  sendOutboundMessages
} = require("./whatsapp");

const MENU_DELAY_MS = Number(process.env.MENU_AFTER_REPLY_DELAY_MS || 700);

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

  const sessionBefore = getSession(payload.userId);

  console.log("INCOMING TEXT:", payload.text);

  if (payload.isButton) {
    console.log("BUTTON CLICK:", payload.buttonText, "| id:", payload.buttonId);
    logger.info("BUTTON CLICK", {
      buttonText: payload.buttonText,
      buttonId: payload.buttonId,
      typeMessage: payload.typeMessage
    });
  }

  let result;

  if (webhookTestReply) {
    result = { reply: null, menuContext: "main", skipMenu: false };
  } else {
    result = await handleIncomingMessage({
      userId: payload.userId,
      text: payload.text,
      buttonId: payload.buttonId,
      buttonText: payload.buttonText,
      isButton: payload.isButton,
      menuContext: sessionBefore.menuContext || "main",
      openai,
      model,
      logger,
      notifyAdmin
    });
  }

  const reply = result?.reply || (typeof result === "string" ? result : null);
  const outbound = result?.messages || (reply ? [{ type: "text", text: reply }] : []);

  if (outbound.length) {
    await sendOutboundMessages({
      config: waConfig,
      to: payload.userId,
      messages: outbound,
      logger
    });
    logger.info("Reply sent", {
      userId: payload.userId,
      parts: outbound.length,
      preview: String(outbound[0]?.text || outbound[0]?.type).slice(0, 90)
    });
  }

  const sessionAfter = getSession(payload.userId);
  const menuContext = result?.menuContext || "main";

  if (!result?.skipMenu) {
    if (outbound.length) {
      await new Promise((r) => setTimeout(r, MENU_DELAY_MS));
    }

    if (waConfig.provider === "green") {
      await sendContextMenu({
        config: waConfig,
        to: payload.userId,
        language: sessionAfter.language || detectLanguage(payload.text),
        menuContext,
        logger
      });
    } else {
      await sendTextMenuFallback({
        config: waConfig,
        to: payload.userId,
        language: sessionAfter.language || detectLanguage(payload.text),
        menuContext,
        logger
      });
    }

    sessionAfter.menuContext = menuContext;
    updateSession(payload.userId, sessionAfter);

    logger.info("Context menu sent after reply", {
      userId: payload.userId,
      menuContext
    });
  }
}

module.exports = { processIncomingMessage };
