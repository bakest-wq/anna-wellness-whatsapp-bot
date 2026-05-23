import { SITE_NAME } from "@/lib/brand";

/** Replace with your business WhatsApp number (country code, no + or spaces). */
export const WHATSAPP_PHONE = "77754368680";

type BookingOptions = {
  serviceTitle?: string;
  packageName?: string;
};

export function buildWhatsAppBookingUrl(options?: BookingOptions | string) {
  const opts: BookingOptions =
    typeof options === "string" ? { serviceTitle: options } : (options ?? {});

  const lines = [`Здравствуйте! Хочу записаться в ${SITE_NAME}.`];

  if (opts.packageName) {
    lines.push("", `Выбранный пакет: ${opts.packageName}`);
  } else if (opts.serviceTitle) {
    lines.push("", `Выбранный сеанс: ${opts.serviceTitle}`);
  }

  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(lines.join("\n"))}`;
}

export const WHATSAPP_BOOKING_URL = buildWhatsAppBookingUrl();
