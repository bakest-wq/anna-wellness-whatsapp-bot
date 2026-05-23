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
    .replace(/[«»""]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function textsMatch(incoming, template) {
  const a = normalize(incoming);
  const b = normalize(template);
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;
  return false;
}

function findServiceInText(text) {
  const t = normalize(text);

  for (const svc of SERVICES) {
    if (textsMatch(t, svc.waBook) || textsMatch(t, svc.waLearn)) return svc;
    if (textsMatch(t, svc.title)) return svc;
    for (const alias of svc.aliases || []) {
      if (t.includes(normalize(alias))) return svc;
    }
  }

  if (/access\s*bars|accessbars/i.test(text)) {
    return getServiceByBotId("bars");
  }

  return null;
}

function findPackageInText(text) {
  const t = normalize(text);
  for (const pkg of PACKAGES) {
    if (textsMatch(t, pkg.waBook)) return pkg;
    if (t.includes(normalize(pkg.name))) return pkg;
    if (/пакет/i.test(t) && t.includes(normalize(pkg.name.replace("sakina ", "")))) return pkg;
  }
  if (/выбранный пакет:/i.test(text)) {
    const name = text.split(/выбранный пакет:/i)[1]?.trim().split("\n")[0];
    if (name) {
      return PACKAGES.find((p) => textsMatch(name, p.name));
    }
  }
  return null;
}

/**
 * @returns {{
 *   action: 'concierge'|'booking'|'practice_detail'|'price'|'address'|'package_booking'|null,
 *   practiceId?: string,
 *   route?: string,
 *   packageName?: string,
 *   packageId?: string
 * }|null}
 */
function parseWebsiteDeepLink(text) {
  const raw = String(text || "").trim();
  if (!raw) return null;

  const t = normalize(raw);

  if (textsMatch(t, WA_MESSAGES.concierge) || /хочу\s+подобрать\s+практик/i.test(t)) {
    return { action: "concierge" };
  }

  if (textsMatch(t, WA_MESSAGES.prices) || /\b(цены|прайс|бағалар|қанша\s+тұрады)\b/i.test(raw)) {
    return { action: "price" };
  }

  if (textsMatch(t, WA_MESSAGES.address) || /\b(адрес|мекенжай|қайда\s+орналасқан)\b/i.test(raw)) {
    return { action: "address" };
  }

  const pkg = findPackageInText(raw);
  if (pkg && (/записаться|жазыл/i.test(t) || textsMatch(t, pkg.waBook))) {
    return {
      action: "package_booking",
      packageId: pkg.id,
      packageName: pkg.name
    };
  }

  const learn =
    /хочу\s+узнать\s+(подробнее|больше)/i.test(raw) ||
    /хочу\s+узнать\s+про/i.test(raw) ||
    /подробнее\s+про/i.test(raw);

  const book = /хочу\s+записаться/i.test(raw) || /записаться\s+на/i.test(raw);

  const svc = findServiceInText(raw);

  if (svc && learn) {
    return {
      action: "practice_detail",
      practiceId: svc.botId,
      route: BOT_ID_TO_ROUTE[svc.botId]
    };
  }

  if (svc && (book || textsMatch(t, svc.waBook))) {
    return { action: "booking", practiceId: svc.botId };
  }

  if (book && !svc) {
    return { action: "booking" };
  }

  if (textsMatch(t, WA_MESSAGES.genericBook)) {
    return { action: "booking" };
  }

  for (const s of SERVICES) {
    if (textsMatch(t, s.waBook)) {
      return { action: "booking", practiceId: s.botId };
    }
    if (textsMatch(t, s.waLearn)) {
      return {
        action: "practice_detail",
        practiceId: s.botId,
        route: BOT_ID_TO_ROUTE[s.botId] || `practice_${s.botId}`
      };
    }
  }

  return null;
}

module.exports = { parseWebsiteDeepLink, findServiceInText, findPackageInText };
