const { logger } = require("./logger");
const { isDuplicate } = require("./messageDedup");
const { getSession, updateSession } = require("./sessionStore");
const { detectLanguage } = require("./language");
const { handleIncomingMessage } = require("./conversation");
const { getTextMenuFallback } = require("./menus");
const {
  parseIncomingMessage,
  sendMenu,
  sendWhatsApp,
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
  const lang = sessionAfter.language || detectLanguage(payload.text);
  const menuContext = result?.menuContext || "main";

  if (!result?.skipMenu) {
    if (outbound.length) {
      await new Promise((r) => setTimeout(r, MENU_DELAY_MS));
    }

    let menuResult;

    if (waConfig.provider === "green") {
      menuResult = await sendMenu({
        config: waConfig,
        to: payload.userId,
        language: lang,
        menuContext,
        logger
      });
    } else {
      await sendWhatsApp({
        config: waConfig,
        to: payload.userId,
        text: getTextMenuFallback(lang, menuContext),
        logger
      });
      menuResult = { mode: "text_fallback" };
    }

    logger.info("Menu sent after reply", {
      userId: payload.userId,
      menuContext,
      mode: menuResult?.mode
    });
  }

  sessionAfter.menuContext = menuContext;
  updateSession(payload.userId, sessionAfter);
}

module.exports = { processIncomingMessage };
