const { WELLNESS } = require("./knowledge");
const { BRAND } = require("./brand");

const MAPS = {
  google:
    process.env.WELLNESS_GOOGLE_MAPS_URL ||
    "https://www.google.com/maps/search/?api=1&query=%D0%90%D0%BA%D1%82%D0%BE%D0%B1%D0%B5%2C+%D0%9E%D1%80%D0%B0%D0%B7+%D0%A2%D0%B0%D1%82%D0%B5%D1%83%D0%BB%D1%8B+15",
  twoGis:
    process.env.WELLNESS_2GIS_URL || "https://go.2gis.com/PbCSe"
};

const CABINET_IMAGE_URL = process.env.WELLNESS_CABINET_IMAGE_URL || "";
const CABINET_IMAGE_PATH = process.env.WELLNESS_CABINET_IMAGE_PATH || "assets/cabinet.jpg";

function getAddressMessages(language) {
  const lang = language === "kz" ? "kz" : "ru";

  const text =
    lang === "kz"
      ? `📍 ${BRAND.header}
${BRAND.subtitle}

${WELLNESS.address}

🗺 Google Maps:
${MAPS.google}

🗺 2GIS:
${MAPS.twoGis}

${WELLNESS.schedule} 🌿

Келуге дайын болғанда — қасыңызда боламын 🤍`
      : `📍 ${BRAND.header}
${BRAND.subtitle}

${WELLNESS.address}

🗺 Google Maps:
${MAPS.google}

🗺 2GIS:
${MAPS.twoGis}

Ежедневно ${WELLNESS.schedule} 🌿

${BRAND.sanctuaryLine}

Если захотите прийти — мягко подскажу 🤍`;

  const messages = [{ type: "text", text }];

  const caption =
    lang === "kz"
      ? `${BRAND.name} — wellness studio 🤍`
      : `${BRAND.name} — пространство восстановления 🤍`;

  if (CABINET_IMAGE_URL) {
    messages.push({ type: "image", url: CABINET_IMAGE_URL, caption });
  } else if (CABINET_IMAGE_PATH) {
    messages.push({ type: "image", path: CABINET_IMAGE_PATH, caption });
  }

  return messages;
}

module.exports = {
  MAPS,
  CABINET_IMAGE_URL,
  getAddressMessages
};
