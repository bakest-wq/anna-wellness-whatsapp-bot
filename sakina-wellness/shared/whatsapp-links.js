const config = require("./sakina-wellness.config");

function buildWaMeUrl(text, phone) {
  return config.buildWaMeUrl(text, phone);
}

function getServiceBookUrl(service) {
  const s = typeof service === "string" ? config.getServiceBySiteId(service) || config.getServiceByBotId(service) : service;
  if (!s) return buildWaMeUrl(config.WA_MESSAGES.genericBook);
  return buildWaMeUrl(s.waBook);
}

function getServiceLearnUrl(service) {
  const s = typeof service === "string" ? config.getServiceBySiteId(service) || config.getServiceByBotId(service) : service;
  if (!s) return buildWaMeUrl(config.WA_MESSAGES.concierge);
  return buildWaMeUrl(s.waLearn);
}

function getConciergeUrl() {
  return buildWaMeUrl(config.WA_MESSAGES.concierge);
}

function getPricesUrl() {
  return buildWaMeUrl(config.WA_MESSAGES.prices);
}

function getPackageBookUrl(pkg) {
  const p = typeof pkg === "string" ? config.PACKAGES.find((x) => x.id === pkg || x.name === pkg) : pkg;
  if (!p) return buildWaMeUrl(config.WA_MESSAGES.genericBook);
  return buildWaMeUrl(p.waBook);
}

module.exports = {
  buildWaMeUrl,
  getServiceBookUrl,
  getServiceLearnUrl,
  getConciergeUrl,
  getPricesUrl,
  getPackageBookUrl,
  config
};
