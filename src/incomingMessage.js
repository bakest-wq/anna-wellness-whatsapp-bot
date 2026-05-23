const { logger } = require("./logger");
const { isDuplicate } = require("./messageDedup");
const { getSession, updateSession, saveSession } = require("./sessionStore");
const { normalizeLanguage } = require("./language");
const { handleIncomingMessage } = require("./conversation");
const { runGlobalIntentGate } = require("./messageRouter");
const { enrichOutboundMessages, getMenuTextBlock, isMainMenuContext } = require("./menus");
const {
  parseIncomingMessage,
  sendWhatsApp,
  sendOutboundMessages,
  tryInteractiveButtonsOnly
} = require("./whatsapp");

const CONCIERGE_DELAY_MS = Number(process.env.CONCIERGE_STEP_DELAY_MS || 1200);
/** Главное меню — только текст; интерактивные кнопки ломаются при >3 пунктах */
const MENU_BUTTONS_AFTER =
  process.env.MENU_BUTTONS_AFTER === "true" || process.env.MENU_BUTTONS_AFTER === "1";

function shouldSendInteractiveButtons(menuContext) {
  if (isMainMenuContext(menuContext)) return false;
  return MENU_BUTTONS_AFTER;
}

async function sendMainMenuReply({ waConfig, userId, lang, outbound, logger }) {
  const toSend =
    outbound.skipMenu === true
      ? outbound.messages
      : enrichOutboundMessages(outbound.messages, lang, "main");

  if (toSend.length) {
    await sendOutboundMessages({
      config: waConfig,
      to: userId,
      messages: toSend,
      logger
    });
  }
}

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

  const session = getSession(payload.userId);

  const incomingText = String(payload.buttonText || payload.text || "").trim();
  let lang = normalizeLanguage(session.language);

  console.log("INCOMING TEXT:", incomingText);

  if (!webhookTestReply && incomingText) {
    const gate = runGlobalIntentGate({
      chatId: payload.userId,
      session,
      text: incomingText,
      language: lang,
      isButton: payload.isButton,
      buttonId: payload.buttonId,
      menuContext: session.menuContext || "main"
    });

    if (gate.handled) {
      session.menuContext = "main";
      saveSession(payload.userId, session, ["globalIntentGate"]);
      await sendMainMenuReply({
        waConfig,
        userId: payload.userId,
        lang,
        outbound: gate.outbound,
        logger
      });
      logger.info("Global intent gate (incomingMessage)", {
        userId: payload.userId,
        reason: gate.reason
      });
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
      menuContext: session.menuContext || "main",
      openai,
      model,
      logger,
      notifyAdmin
    });
  }

  const reply = result?.reply || (typeof result === "string" ? result : null);
  const outbound = result?.messages || (reply ? [{ type: "text", text: reply }] : []);

  const sessionAfter = getSession(payload.userId);
  lang = normalizeLanguage(sessionAfter.language);
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

  if (
    !result?.skipMenu &&
    shouldSendInteractiveButtons(menuContext) &&
    waConfig.provider === "green"
  ) {
    await tryInteractiveButtonsOnly({
      config: waConfig,
      to: payload.userId,
      language: lang,
      menuContext,
      logger
    });
  }

  sessionAfter.menuContext = menuContext;
  updateSession(payload.userId, sessionAfter);
}

module.exports = { processIncomingMessage };
