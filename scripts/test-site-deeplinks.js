const { parseWebsiteDeepLink, isSiteDeepLinkMessage } = require("../src/deepLinks");
const { SERVICES, PACKAGES } = require("../shared/sakina-wellness.config");

const cases = [
  ["Здравствуйте, хочу подобрать практику 🌿", "concierge"],
  ["Здравствуйте, помогите подобрать практику 🌿", "concierge"],
  ["Здравствуйте, хочу записаться на массаж «5 континентов»", "booking", "five"],
  ["Здравствуйте, хочу узнать подробнее про EarthFlow", "practice_detail", "earthflow"],
  ["Здравствуйте, хочу выбрать пакет Sakina Relax", "package_booking", "sakina-relax"]
];

for (const [text, intent, id] of cases) {
  const d = parseWebsiteDeepLink(text);
  if (!d || d.intent !== intent) {
    console.error("FAIL", text, d);
    process.exit(1);
  }
  const got = d.practiceId || d.packageId;
  if (id && got !== id) {
    console.error("FAIL id", text, got, "expected", id);
    process.exit(1);
  }
  console.log("OK", intent, got || "");
}

const svc = SERVICES.find((s) => s.botId === "five");
const pkg = PACKAGES.find((p) => p.id === "sakina-relax");
if (!svc || svc.price !== "30 000 ₸") {
  console.error("FAIL service config");
  process.exit(1);
}
if (!pkg || pkg.price !== "45 000 ₸") {
  console.error("FAIL package config");
  process.exit(1);
}

if (isSiteDeepLinkMessage("Здравствуйте")) {
  console.error("FAIL bare greeting must not be site deeplink");
  process.exit(1);
}

console.log("site deeplinks OK");
