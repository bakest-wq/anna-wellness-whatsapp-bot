import type { BookingRow } from "@/lib/admin/types";
import { formatBookingDate } from "@/lib/booking-flow";

export type WhatsAppQuickReplyType =
  | "confirm"
  | "reminder"
  | "reschedule"
  | "thank_you";

import { normalizeClientPhone } from "@/lib/admin/phone";

export function normalizePhoneForWhatsApp(phone: string): string {
  return normalizeClientPhone(phone);
}

function bookingDetails(booking: BookingRow) {
  return {
    serviceTitle: booking.service_title,
    preferredDate: formatBookingDate(booking.preferred_date),
    preferredTime: booking.preferred_time,
  };
}

export function buildWhatsAppQuickReplyMessage(
  booking: BookingRow,
  type: WhatsAppQuickReplyType,
): string {
  const { serviceTitle, preferredDate, preferredTime } = bookingDetails(booking);

  switch (type) {
    case "confirm":
      return [
        "Ассаляму алейкум 🌿",
        "Ваша запись в Sakina Wellness подтверждена.",
        `Практика: ${serviceTitle}`,
        `Дата: ${preferredDate}`,
        `Время: ${preferredTime}`,
        "",
        "Будем рады видеть вас 🤍",
      ].join("\n");

    case "reminder":
      return [
        "Ассаляму алейкум 🌿",
        "Напоминаем о вашей записи в Sakina Wellness.",
        `Практика: ${serviceTitle}`,
        `Дата: ${preferredDate}`,
        `Время: ${preferredTime}`,
        "",
        "До встречи 🤍",
      ].join("\n");

    case "reschedule":
      return [
        "Ассаляму алейкум 🌿",
        "Хотим уточнить удобное время для вашей записи в Sakina Wellness.",
        "Напишите, пожалуйста, какое время вам будет удобно.",
      ].join("\n");

    case "thank_you":
      return [
        "Ассаляму алейкум 🌿",
        "Благодарим вас за визит в Sakina Wellness.",
        "Пусть после практики в теле будет лёгкость, а в душе спокойствие 🤍",
      ].join("\n");
  }
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const normalized = normalizePhoneForWhatsApp(phone);
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export function buildWhatsAppQuickReplyUrl(
  booking: BookingRow,
  type: WhatsAppQuickReplyType,
): string {
  return buildWhatsAppUrl(
    booking.phone,
    buildWhatsAppQuickReplyMessage(booking, type),
  );
}

/** @deprecated Use quick reply templates instead */
export function buildAdminWhatsAppUrl(booking: BookingRow): string {
  return buildWhatsAppQuickReplyUrl(booking, "confirm");
}

export const WHATSAPP_QUICK_REPLY_OPTIONS: {
  type: WhatsAppQuickReplyType;
  label: string;
}[] = [
  { type: "confirm", label: "Подтвердить запись" },
  { type: "reminder", label: "Напомнить о сеансе" },
  { type: "reschedule", label: "Перенести запись" },
  { type: "thank_you", label: "Поблагодарить после сеанса" },
];
