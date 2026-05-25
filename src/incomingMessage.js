const { logger } = require("./logger");
const { isDuplicate } = require("./messageDedup");
const { getSession, updateSession, saveSession } = require("./sessionStore");
const { normalizeLanguage } = require("./language");
const { handleIncomingMessage } = require("./conversation");
const { runGlobalIntentGate } = require("./messageRouter");
const {
  enrichOutboundMessages,
  getMenuTextBlock,
  isMainMenuContext,
  isEmotionalMenuContext
} = require("./menus");
const {
  parseIncomingMessage,
  sendWhatsApp,
  sendOutboundMessages,
  tryInteractiveButtonsOnly
} = require("./whatsapp");
const {
  logFallbackTriggered,
  buildSafeMenuOutbound,
  isWhatsAppDeliveryError,
  isRecoverableBotError
} = require("./safeFallback");

const CONCIERGE_DELAY_MS = Number(process.env.CONCIERGE_STEP_DELAY_MS || 1200);
/** Главное меню — только текст; интерактивные кнопки ломаются при >3 пунктах */
const MENU_BUTTONS_AFTER =
  process.env.MENU_BUTTONS_AFTER === "true" || process.env.MENU_BUTTONS_AFTER === "1";

function shouldSendInteractiveButtons(menuContext) {
  if (isMainMenuContext(menuContext) || isEmotionalMenuContext(menuContext)) return false;
  return MENU_BUTTONS_AFTER;
}

async function deliverOutbound({ waConfig, userId, lang, outbound, menuContext, result, logger }) {
  const toSend = enrichOutboundMessages(
    outbound.messages || (outbound.reply ? [{ type: "text", text: outbound.reply }] : []),
    lang,
    menuContext,
    { skipMenu: outbound.skipMenu ?? result?.skipMenu }
  );

  if (!toSend.length) {
    if (!result?.skipMenu) {
      await sendWhatsApp({
        config: waConfig,
        to: userId,
        text: getMenuTextBlock(lang, menuContext),
        logger
      });
    }
    return;
  }

  await sendOutboundMessages({
    config: waConfig,
    to: userId,
    messages: toSend,
    logger
  });
}

async function processIncomingMessage({
  body,
  waConfig,
  openai,
  model,
  notifyAdmin,
  webhookTestReply = false
}) {
  let payload;
  let incomingText = "";
  let lang = "ru";

  try {
    payload = parseIncomingMessage(body, waConfig.provider);

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

    incomingText = String(payload.buttonText || payload.text || "").trim();
    lang = normalizeLanguage(session.language);

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
      session.menuContext = gate.outbound?.menuContext || "main";
      saveSession(payload.userId, session, ["globalIntentGate"]);
      try {
        await deliverOutbound({
          waConfig,
          userId: payload.userId,
          lang,
          outbound: gate.outbound,
          menuContext: "main",
          result: gate.outbound,
          logger
        });
      } catch (sendErr) {
        logFallbackTriggered(sendErr, {
          userId: payload.userId,
          stage: "globalIntentGateDeliver"
        });
        logger.error("Global gate reply not delivered", { message: sendErr.message });
        try {
          const recoverySession = getSession(payload.userId);
          const menuOutbound = buildSafeMenuOutbound(recoverySession, lang);
          if (menuOutbound?.reply) {
            await sendWhatsApp({
              config: waConfig,
              to: payload.userId,
              text: menuOutbound.reply,
              logger
            });
          }
        } catch (menuSendErr) {
          logFallbackTriggered(menuSendErr, {
            userId: payload.userId,
            stage: "globalIntentGateMenuRecovery"
          });
        }
      }
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

  try {
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

    if (!result?.reply && !result?.messages?.length && !result?.skipMenu) {
      const sessionMid = getSession(payload.userId);
      result = buildSafeMenuOutbound(sessionMid, lang);
      saveSession(payload.userId, sessionMid, ["emptyReplyMenu"]);
    }
  } catch (err) {
    logFallbackTriggered(err, { userId: payload.userId, stage: "handleIncomingMessage" });
    const sessionErr = getSession(payload.userId);
    result = buildSafeMenuOutbound(sessionErr, lang);
    saveSession(payload.userId, sessionErr, ["incomingSafeFallback"]);
  }

  const sessionAfter = getSession(payload.userId);
  lang = normalizeLanguage(sessionAfter.language);
  const menuContext = result?.menuContext || "main";

  const outbound = {
    reply: result?.reply,
    messages: result?.messages,
    skipMenu: result?.skipMenu
  };

  if (result?.conciergeTyping) {
    await new Promise((r) => setTimeout(r, CONCIERGE_DELAY_MS));
  }

  try {
    await deliverOutbound({
      waConfig,
      userId: payload.userId,
      lang,
      outbound,
      menuContext,
      result,
      logger
    });
    logger.info("Reply sent", {
      userId: payload.userId,
      menuContext,
      withMenu: !result?.skipMenu,
      preview: String(outbound.reply || outbound.messages?.[0]?.text || "").slice(0, 90)
    });
  } catch (sendErr) {
    logFallbackTriggered(sendErr, { userId: payload.userId, stage: "deliverOutbound" });
    logger.error("WhatsApp delivery failed (no maintenance to user)", {
      userId: payload.userId,
      message: sendErr.message
    });

    if (!isWhatsAppDeliveryError(sendErr) && !isRecoverableBotError(sendErr)) {
      try {
        const recoverySession = getSession(payload.userId);
        const menuOutbound = buildSafeMenuOutbound(recoverySession, lang);
        if (menuOutbound?.reply) {
          await sendWhatsApp({
            config: waConfig,
            to: payload.userId,
            text: menuOutbound.reply,
            logger
          });
          logger.info("Safe menu sent after deliverOutbound failure", {
            userId: payload.userId
          });
        }
      } catch (menuSendErr) {
        logFallbackTriggered(menuSendErr, {
          userId: payload.userId,
          stage: "deliverOutboundMenuRecovery"
        });
      }
    }
  }

  if (
    !result?.skipMenu &&
    shouldSendInteractiveButtons(menuContext) &&
    waConfig.provider === "green"
  ) {
    try {
      await tryInteractiveButtonsOnly({
        config: waConfig,
        to: payload.userId,
        language: lang,
        menuContext,
        logger
      });
    } catch (err) {
      logger.warn("Interactive buttons skipped", {
        userId: payload.userId,
        menuContext,
        message: err.message
      });
    }
  }

  sessionAfter.menuContext = menuContext;
  updateSession(payload.userId, sessionAfter);
  } catch (err) {
    logFallbackTriggered(err, {
      userId: payload?.userId,
      stage: "processIncomingMessage",
      incomingText: incomingText.slice(0, 80)
    });
    logger.error("Incoming pipeline failed — attempting safe menu (never maintenance here)", {
      userId: payload?.userId,
      message: err.message
    });

    if (!payload?.userId) {
      throw err;
    }

    try {
      const recoverySession = getSession(payload.userId);
      const menuOutbound = buildSafeMenuOutbound(recoverySession, lang);
      if (menuOutbound?.reply) {
        await sendWhatsApp({
          config: waConfig,
          to: payload.userId,
          text: menuOutbound.reply,
          logger
        });
        logger.info("Safe menu sent from processIncomingMessage catch", {
          userId: payload.userId
        });
      }
    } catch (menuSendErr) {
      logFallbackTriggered(menuSendErr, {
        userId: payload.userId,
        stage: "processIncomingMessageMenuRecovery"
      });
      if (!isWhatsAppDeliveryError(err) && !isRecoverableBotError(err)) {
        throw err;
      }
    }
  }
}

module.exports = { processIncomingMessage };
