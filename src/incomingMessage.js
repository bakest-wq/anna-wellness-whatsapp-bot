const { logger } = require("./logger");
const { isDuplicate } = require("./messageDedup");
const { getSession, updateSession, saveSession } = require("./sessionStore");
const { normalizeLanguage } = require("./language");
const { handleIncomingMessage } = require("./conversation");
const { tryGreetingResetBeforeBooking } = require("./greetingReset");
const { enrichOutboundMessages, getMenuTextBlock } = require("./menus");
const {
  parseIncomingMessage,
  sendWhatsApp,
  sendOutboundMessages,
  tryInteractiveButtonsOnly
} = require("./whatsapp");

const MENU_DELAY_MS = Number(process.env.MENU_AFTER_REPLY_DELAY_MS || 700);
const CONCIERGE_DELAY_MS = Number(process.env.CONCIERGE_STEP_DELAY_MS || 1200);
const MENU_BUTTONS_AFTER = process.env.MENU_BUTTONS_AFTER !== "false";

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
  const incomingText = String(payload.buttonText || payload.text || "").trim();
  const lang = normalizeLanguage(sessionBefore.language);

  console.log("INCOMING TEXT:", incomingText);

  if (!payload.isButton && incomingText) {
    const greetingOutbound = tryGreetingResetBeforeBooking({
      chatId: payload.userId,
      session: sessionBefore,
      text: incomingText,
      language: lang
    });
    if (greetingOutbound) {
      const toSend = enrichOutboundMessages(
        greetingOutbound.messages,
        lang,
        greetingOutbound.menuContext
      );
      if (toSend.length) {
        await sendOutboundMessages({
          config: waConfig,
          to: payload.userId,
          messages: toSend,
          logger
        });
      }
      if (MENU_BUTTONS_AFTER && waConfig.provider === "green") {
        await new Promise((r) => setTimeout(r, MENU_DELAY_MS));
        await tryInteractiveButtonsOnly({
          config: waConfig,
          to: payload.userId,
          language: lang,
          menuContext: "main",
          logger
        });
      }
      sessionBefore.menuContext = "main";
      saveSession(payload.userId, sessionBefore, ["greetingResetEarly"]);
      logger.info("Greeting reset (incomingMessage gate)", { userId: payload.userId });
      return;
    }
  }

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

  const sessionAfter = getSession(payload.userId);
  const lang = normalizeLanguage(sessionAfter.language);
  const menuContext = result?.menuContext || "main";

  const toSend = result?.skipMenu
    ? outbound
    : enrichOutboundMessages(outbound, lang, menuContext);

  if (result?.conciergeTyping && toSend.length) {
    await new Promise((r) => setTimeout(r, CONCIERGE_DELAY_MS));
  }

  if (toSend.length) {
    await sendOutboundMessages({
      config: waConfig,
      to: payload.userId,
      messages: toSend,
      logger
    });
    logger.info("Reply sent", {
      userId: payload.userId,
      parts: toSend.length,
      withMenu: !result?.skipMenu,
      preview: String(toSend[0]?.text || toSend[0]?.type).slice(0, 90)
    });
  } else if (!result?.skipMenu) {
    await sendWhatsApp({
      config: waConfig,
      to: payload.userId,
      text: getMenuTextBlock(lang, menuContext),
      logger
    });
  }

  if (!result?.skipMenu && MENU_BUTTONS_AFTER && waConfig.provider === "green") {
    if (toSend.length) {
      await new Promise((r) => setTimeout(r, MENU_DELAY_MS));
    }

    const menuResult = await tryInteractiveButtonsOnly({
      config: waConfig,
      to: payload.userId,
      language: lang,
      menuContext,
      logger
    });

    logger.info("Optional menu buttons", {
      userId: payload.userId,
      menuContext,
      mode: menuResult?.mode
    });
  }

  sessionAfter.menuContext = menuContext;
  updateSession(payload.userId, sessionAfter);
}

module.exports = { processIncomingMessage };
