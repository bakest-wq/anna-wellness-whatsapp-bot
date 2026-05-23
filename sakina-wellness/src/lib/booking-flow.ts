import { SITE_NAME } from "@/lib/brand";
import { WHATSAPP_PHONE } from "@/lib/whatsapp";

export {
  BOOKING_TIME_SLOTS,
  BOOKING_TIME_PERIOD_GROUPS,
  type BookingTimeSlot,
} from "@/lib/booking-slots";

export type ConciergeBookingPayload = {
  serviceTitle: string;
  packageName?: string | null;
  date: string;
  time: string;
  clientName: string;
  phone: string;
};

/** @deprecated Legacy multi-step labels */
export const BOOKING_STEPS = [
  "Практика",
  "Пакет",
  "Дата",
  "Время",
  "Имя",
  "WhatsApp",
  "Подтверждение",
] as const;

export const ONBOARDING_STEPS = [
  "Чувство",
  "Практика",
  "Время",
  "Контакт",
  "Готово",
] as const;

export const ONBOARDING_STEP_COUNT = ONBOARDING_STEPS.length;

export function formatBookingDate(isoDate: string): string {
  if (!isoDate) return "";
  const date = new Date(isoDate + "T12:00:00");
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function buildConciergeBookingMessage(payload: ConciergeBookingPayload) {
  const lines = [
    `Здравствуйте! Хочу записаться в ${SITE_NAME}.`,
    "",
    `Услуга: ${payload.serviceTitle}`,
  ];

  if (payload.packageName) {
    lines.push(`Пакет: ${payload.packageName}`);
  }

  lines.push(
    `Предпочтительная дата: ${formatBookingDate(payload.date)}`,
    `Предпочтительное время: ${payload.time}`,
    `Имя: ${payload.clientName}`,
    `Телефон / WhatsApp: ${payload.phone}`,
  );

  return lines.join("\n");
}

export function buildConciergeBookingUrl(payload: ConciergeBookingPayload) {
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(buildConciergeBookingMessage(payload))}`;
}

export function getMinBookingDate(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}
