const axios = require("axios");
const { buildMenuBlock } = require("./menus");
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
    body: block.body || "👇",
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

/**
 * Только кнопки — без отдельного текстового меню (оно уже в основном сообщении).
 */
async function tryInteractiveButtonsOnly({
  config,
  chatId,
  language,
  menuContext = "main",
  logger
}) {
  const lang = language === "kz" ? "kz" : "ru";
  const block = buildMenuBlock(lang, menuContext);
  const buttons = block.buttons;

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
      return { mode: "buttons", menuContext };
    }
    return { mode: "skipped" };
  }

  if (await tryButtons(buttons)) {
    return { mode: "buttons", menuContext };
  }

  if (await tryButtons(buttons.slice(0, 3))) {
    await new Promise((r) => setTimeout(r, 500));
    const restBlock = { ...block, body: lang === "kz" ? "Тағы 👇" : "Ещё 👇" };
    if (await tryButtons(buttons.slice(3), restBlock)) {
      return { mode: "buttons_split", menuContext };
    }
  }

  return { mode: "skipped" };
}

/** @deprecated Используйте enrichOutboundMessages + tryInteractiveButtonsOnly */
async function sendMenu({ config, chatId, language, menuContext = "main", logger }) {
  const { getMenuTextBlock } = require("./menus");
  const fallbackText = getMenuTextBlock(language, menuContext);

  if (process.env.FORCE_MENU_TEXT === "true") {
    await postGreen(config, "sendMessage", { chatId, message: fallbackText }, logger);
    return { mode: "text_only", menuContext, forced: true };
  }

  const buttonsResult = await tryInteractiveButtonsOnly({
    config,
    chatId,
    language,
    menuContext,
    logger
  });

  if (buttonsResult.mode !== "skipped") {
    return buttonsResult;
  }

  await postGreen(config, "sendMessage", { chatId, message: fallbackText }, logger);
  return { mode: "text_fallback", menuContext };
}

module.exports = { sendMenu, tryInteractiveButtonsOnly };
