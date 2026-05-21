const axios = require("axios");
const { buildMenuBlock, getTextMenuFallback } = require("./menus");
const { BRAND } = require("./brand");

function isGreenOk(data) {
  return Boolean(data && (data.idMessage || data.id));
}

function extractGreenError(err) {
  return (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.response?.data?.description ||
    err?.message ||
    "unknown"
  );
}

async function postGreen(config, endpoint, payload, logger) {
  const url = `${config.greenBase}/waInstance${config.greenId}/${endpoint}/${config.greenToken}`;
  const res = await axios.post(url, payload, { timeout: 15000 });
  const data = res.data;

  if (data?.error || data?.errorCode) {
    throw new Error(String(data.message || data.error || "Green API error"));
  }

  logger?.info?.(`Green API ${endpoint}`, {
    chatId: payload.chatId,
    status: res.status,
    idMessage: data?.idMessage
  });

  return data;
}

async function sendInteractiveButtons(config, block, chatId, buttons, logger) {
  const payload = {
    chatId,
    header: block.header || BRAND.header,
    body: block.body || BRAND.subtitle,
    footer: block.footer || "",
    buttons: buttons.map((b) => ({
      buttonId: b.buttonId,
      buttonText: b.buttonText
    }))
  };

  const data = await postGreen(config, "sendInteractiveButtonsReply", payload, logger);
  if (!isGreenOk(data)) {
    throw new Error("sendInteractiveButtonsReply: no idMessage");
  }
  return data;
}

async function sendTextMenu(config, chatId, text, logger) {
  await postGreen(config, "sendMessage", { chatId, message: text }, logger);
}

/**
 * Единый helper: interactive buttons → при ошибке полный text fallback.
 */
async function sendMenu({ config, chatId, language, menuContext = "main", logger }) {
  const lang = language === "kz" ? "kz" : "ru";
  const block = buildMenuBlock(lang, menuContext);
  const buttons = block.buttons;
  const fallbackText = getTextMenuFallback(lang, menuContext);

  if (process.env.FORCE_MENU_TEXT === "true") {
    logger?.warn?.("FORCE_MENU_TEXT: text menu only", { chatId, menuContext });
    await sendTextMenu(config, chatId, fallbackText, logger);
    return { mode: "text_fallback", menuContext, forced: true };
  }

  const tryButtons = async (btnList, blockOverride = null) => {
    try {
      await sendInteractiveButtons(config, blockOverride || block, chatId, btnList, logger);
      return true;
    } catch (err) {
      logger?.warn?.("sendInteractiveButtonsReply failed", {
        chatId,
        menuContext,
        count: btnList.length,
        error: extractGreenError(err)
      });
      return false;
    }
  };

  if (buttons.length <= 3) {
    if (await tryButtons(buttons)) {
      logger?.info?.("Menu: interactive buttons", { chatId, menuContext, count: buttons.length });
      return { mode: "buttons", menuContext };
    }
  } else {
    if (await tryButtons(buttons)) {
      logger?.info?.("Menu: 4 interactive buttons", { chatId, menuContext });
      return { mode: "buttons", menuContext };
    }

    if (await tryButtons(buttons.slice(0, 3))) {
      await new Promise((r) => setTimeout(r, 500));
      const restBlock = {
        ...block,
        body: lang === "kz" ? "Тағы бір бөлім 👇" : "Ещё один раздел 👇"
      };
      if (await tryButtons(buttons.slice(3), restBlock)) {
        logger?.info?.("Menu: buttons split 3+1", { chatId, menuContext });
        return { mode: "buttons_split", menuContext };
      }
    }
  }

  logger?.warn?.("Menu: sending full text fallback", { chatId, menuContext });
  await sendTextMenu(config, chatId, fallbackText, logger);
  return { mode: "text_fallback", menuContext };
}

module.exports = { sendMenu, getTextMenuFallback };
