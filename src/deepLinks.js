const {
  SERVICES,
  PACKAGES,
  WA_MESSAGES,
  getServiceByBotId
} = require("../shared/sakina-wellness.config");

const BOT_ID_TO_ROUTE = {
  five: "practice_five",
  five_fire: "practice_five_fire",
  five_bamboo: "practice_five_bamboo",
  mukaino: "practice_mukaino",
  breath: "practice_breath",
  earthflow: "practice_earthflow",
  bars: "practice_bars"
};

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[«»""„"]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Полное совпадение или клиент вставил весь текст кнопки с сайта (не короткое приветствие). */
function textsMatch(incoming, template) {
  const a = normalize(incoming);
  const b = normalize(template);
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.length >= 18 && a.includes(b)) return true;
  if (b.length >= 18 && b.includes(a) && a.length >= 12) return true;
  return false;
}

function isBareGreeting(text) {
  const t = normalize(text);
  return /^(здравствуйте|здравствуй|привет|салам|салем|сәлем|hello|hi|hey)$/.test(t);
}

/** Сортировка: длинные названия первыми — точнее матч «5 континентов с огнём» */
const SERVICES_BY_SPECIFICITY = [...SERVICES].sort(
  (a, b) => b.title.length - a.title.length
);

function findServiceInText(text) {
  const t = normalize(text);

  for (const svc of SERVICES_BY_SPECIFICITY) {
    if (textsMatch(t, svc.waBook) || textsMatch(t, svc.waLearn)) return svc;
    if (textsMatch(t, svc.title)) return svc;
    for (const alias of svc.aliases || []) {
      if (t.includes(normalize(alias))) return svc;
    }
  }

  if (/access\s*bars|accessbars|аксесс\s*барс/i.test(text)) {
    return getServiceByBotId("bars");
  }
  if (/earthflow|эртфлоу|ерт\s*флоу/i.test(text)) {
    return getServiceByBotId("earthflow");
  }
  if (/mukaino|m-test|мукайно/i.test(text)) {
    return getServiceByBotId("mukaino");
  }
  if (/дыхание\s+жизни|дыхательн/i.test(text)) {
    return getServiceByBotId("breath");
  }
  if (/5\s*континент|пять\s*континент|массаж\s*5/i.test(text)) {
    if (/огн|отпен|fire/i.test(text)) return getServiceByBotId("five_fire");
    if (/бамбук|банк|bamboo/i.test(text)) return getServiceByBotId("five_bamboo");
    return getServiceByBotId("five");
  }

  return null;
}

function findPackageInText(text) {
  const t = normalize(text);
  for (const pkg of PACKAGES) {
    if (textsMatch(t, pkg.waBook)) return pkg;
    if (t.includes(normalize(pkg.name))) return pkg;
    const short = normalize(pkg.name.replace(/^sakina\s+/i, ""));
    if (short.length > 3 && t.includes(short)) return pkg;
  }
  if (/выбранный\s+пакет:/i.test(text)) {
    const name = text.split(/выбранный\s+пакет:/i)[1]?.trim().split("\n")[0];
    if (name) {
      return PACKAGES.find((p) => textsMatch(name, p.name));
    }
  }
  return null;
}

function isConciergeSiteMessage(raw, t) {
  return (
    textsMatch(t, WA_MESSAGES.concierge) ||
    textsMatch(t, WA_MESSAGES.conciergeHelp) ||
    /хочу\s+подобрать\s+практик/i.test(raw) ||
    /помо(чь|гите)\s+подобрать\s+практик/i.test(raw) ||
    /практиканы\s+таңдауға\s+көмек/i.test(raw)
  );
}

function isLearnSiteMessage(raw) {
  return (
    /хочу\s+узнать\s+подробнее\s+про/i.test(raw) ||
    /хочу\s+узнать\s+подробнее/i.test(raw) ||
    /хочу\s+узнать\s+больше\s+про/i.test(raw) ||
    /подробнее\s+про/i.test(raw)
  );
}

function isBookSiteMessage(raw) {
  return (
    /хочу\s+записаться\s+на/i.test(raw) ||
    /хочу\s+записаться/i.test(raw) ||
    /записаться\s+на/i.test(raw) ||
    textsMatch(raw, WA_MESSAGES.genericBook)
  );
}

function isPackageSiteMessage(raw) {
  return (
    /хочу\s+выбрать\s+пакет/i.test(raw) ||
    /выбрать\s+пакет/i.test(raw) ||
    /хочу\s+записаться\s+на\s+пакет/i.test(raw) ||
    /записаться\s+на\s+пакет/i.test(raw)
  );
}

/**
 * @returns {boolean}
 */
function isSiteDeepLinkMessage(text) {
  if (isBareGreeting(text)) return false;
  return Boolean(parseWebsiteDeepLink(text)?.action);
}

/**
 * @returns {{
 *   intent: string,
 *   action: 'concierge'|'booking'|'practice_detail'|'price'|'address'|'package_booking',
 *   practiceId?: string,
 *   route?: string,
 *   packageName?: string,
 *   packageId?: string,
 *   serviceTitle?: string
 * }|null}
 */
function parseWebsiteDeepLink(text) {
  const raw = String(text || "").trim();
  if (!raw) return null;

  const t = normalize(raw);
  let result = null;

  if (isConciergeSiteMessage(raw, t)) {
    result = { intent: "concierge", action: "concierge" };
  } else if (isPackageSiteMessage(raw)) {
    const pkg = findPackageInText(raw);
    if (pkg) {
      result = {
        intent: "package_booking",
        action: "package_booking",
        packageId: pkg.id,
        packageName: pkg.name
      };
    }
  } else if (isLearnSiteMessage(raw)) {
    const svc = findServiceInText(raw);
    if (svc) {
      result = {
        intent: "practice_detail",
        action: "practice_detail",
        practiceId: svc.botId,
        route: BOT_ID_TO_ROUTE[svc.botId],
        serviceTitle: svc.title
      };
    }
  } else if (isBookSiteMessage(raw)) {
    const svc = findServiceInText(raw);
    if (svc) {
      result = {
        intent: "booking",
        action: "booking",
        practiceId: svc.botId,
        serviceTitle: svc.title
      };
    } else {
      const pkg = findPackageInText(raw);
      if (pkg && /пакет/i.test(raw)) {
        result = {
          intent: "package_booking",
          action: "package_booking",
          packageId: pkg.id,
          packageName: pkg.name
        };
      } else {
        result = { intent: "booking", action: "booking" };
      }
    }
  }

  if (!result) {
    if (textsMatch(t, WA_MESSAGES.prices) || /\b(цены|прайс|бағалар)\b/i.test(raw)) {
      result = { intent: "price", action: "price" };
    } else if (textsMatch(t, WA_MESSAGES.address) || /\b(адрес|мекенжай)\b/i.test(raw)) {
      result = { intent: "address", action: "address" };
    }
  }

  if (!result) {
    for (const svc of SERVICES_BY_SPECIFICITY) {
      if (textsMatch(t, svc.waBook)) {
        result = {
          intent: "booking",
          action: "booking",
          practiceId: svc.botId,
          serviceTitle: svc.title
        };
        break;
      }
      if (textsMatch(t, svc.waLearn)) {
        result = {
          intent: "practice_detail",
          action: "practice_detail",
          practiceId: svc.botId,
          route: BOT_ID_TO_ROUTE[svc.botId],
          serviceTitle: svc.title
        };
        break;
      }
    }
  }

  if (!result) {
    const pkg = findPackageInText(raw);
    if (pkg && (/записаться|жазыл|пакет/i.test(t) || textsMatch(t, pkg.waBook))) {
      result = {
        intent: "package_booking",
        action: "package_booking",
        packageId: pkg.id,
        packageName: pkg.name
      };
    }
  }

  if (result) {
    console.log("SITE DEEPLINK INTENT:", result.intent);
  }

  return result;
}

module.exports = {
  parseWebsiteDeepLink,
  isSiteDeepLinkMessage,
  isBareGreeting,
  findServiceInText,
  findPackageInText,
  BOT_ID_TO_ROUTE,
  textsMatch
};
