import {
  SHARED_PACKAGES,
  SHARED_SERVICES,
  WA_MESSAGES,
  WHATSAPP_PHONE,
  shared,
} from "@/lib/wellness-config";

export { WHATSAPP_PHONE, WA_MESSAGES };

type BookingOptions = {
  serviceSiteId?: string;
  serviceBotId?: string;
  serviceTitle?: string;
  packageId?: string;
  packageName?: string;
  /** @deprecated use serviceSiteId */
  legacyTitle?: string;
};

function resolveService(opts: BookingOptions) {
  if (opts.serviceSiteId) {
    return shared.getServiceBySiteId(opts.serviceSiteId);
  }
  if (opts.serviceBotId) {
    return shared.getServiceByBotId(opts.serviceBotId);
  }
  if (opts.serviceTitle || opts.legacyTitle) {
    const title = opts.serviceTitle || opts.legacyTitle;
    return SHARED_SERVICES.find(
      (s) => s.title.toLowerCase() === String(title).toLowerCase(),
    );
  }
  return undefined;
}

export function buildWaMeUrl(text: string, phone = WHATSAPP_PHONE) {
  return shared.buildWaMeUrl(text, phone);
}

/** Запись на конкретную практику — текст с сайта */
export function buildWhatsAppBookServiceUrl(
  siteOrBotId: string,
  by: "siteId" | "botId" = "siteId",
) {
  const svc =
    by === "botId"
      ? shared.getServiceByBotId(siteOrBotId)
      : shared.getServiceBySiteId(siteOrBotId);
  if (!svc) return buildWaMeUrl(WA_MESSAGES.genericBook);
  return buildWaMeUrl(svc.waBook);
}

/** Подробнее о практике */
export function buildWhatsAppLearnServiceUrl(
  siteOrBotId: string,
  by: "siteId" | "botId" = "siteId",
) {
  const svc =
    by === "botId"
      ? shared.getServiceByBotId(siteOrBotId)
      : shared.getServiceBySiteId(siteOrBotId);
  if (!svc) return buildWaMeUrl(WA_MESSAGES.concierge);
  return buildWaMeUrl(svc.waLearn);
}

export function buildWhatsAppConciergeUrl() {
  return buildWaMeUrl(WA_MESSAGES.concierge);
}

export function buildWhatsAppPricesUrl() {
  return buildWaMeUrl(WA_MESSAGES.prices);
}

export function buildWhatsAppPackageUrl(packageIdOrName: string) {
  const pkg = SHARED_PACKAGES.find(
    (p) => p.id === packageIdOrName || p.name === packageIdOrName,
  );
  if (!pkg) return buildWaMeUrl(WA_MESSAGES.genericBook);
  return buildWaMeUrl(pkg.waBook);
}

/** Совместимость со старым API */
export function buildWhatsAppBookingUrl(options?: BookingOptions | string) {
  if (typeof options === "string") {
    return buildWhatsAppBookServiceUrl(options, "siteId");
  }
  const opts = options ?? {};
  if (opts.packageName || opts.packageId) {
    return buildWhatsAppPackageUrl(opts.packageId || opts.packageName || "");
  }
  const svc = resolveService(opts);
  if (svc) return buildWaMeUrl(svc.waBook);
  return buildWaMeUrl(WA_MESSAGES.genericBook);
}

export const WHATSAPP_CONCIERGE_URL = buildWhatsAppConciergeUrl();
export const WHATSAPP_BOOKING_URL = buildWaMeUrl(WA_MESSAGES.genericBook);
