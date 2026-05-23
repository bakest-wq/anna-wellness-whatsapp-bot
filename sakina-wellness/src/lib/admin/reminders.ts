import { SITE_TITLE } from "@/lib/brand";
import { formatBookingDate } from "@/lib/booking-flow";
import {
  getBookingTimingLabel,
  isSessionWithinTwoHours,
} from "@/lib/admin/booking-timing";
import { buildWhatsAppUrl } from "@/lib/admin/whatsapp";
import { getBookingTimeRange } from "@/lib/admin/schedule-utils";
import type { BookingRow } from "@/lib/admin/types";

export type ReminderTemplateType = "today" | "tomorrow" | "two_hours_before";

export const REMINDER_TEMPLATE_OPTIONS: {
  type: ReminderTemplateType;
  label: string;
}[] = [
  { type: "today", label: "Напоминание на сегодня" },
  { type: "tomorrow", label: "Напоминание на завтра" },
  { type: "two_hours_before", label: "За 2 часа до сеанса" },
];

const SIGNATURE = `${SITE_TITLE} 🤍`;

function reminderDetails(booking: BookingRow) {
  return {
    clientName: booking.client_name.trim(),
    serviceTitle: booking.service_title,
    date: formatBookingDate(booking.preferred_date),
    time: getBookingTimeRange(booking),
  };
}

export function buildReminderMessage(
  booking: BookingRow,
  type: ReminderTemplateType,
): string {
  const { clientName, serviceTitle, date, time } = reminderDetails(booking);

  switch (type) {
    case "today":
      return [
        "Ассаляму алейкум 🌿",
        `${clientName}, напоминаем: сегодня ваша запись в ${SITE_TITLE}.`,
        `Практика: ${serviceTitle}`,
        `Дата: ${date}`,
        `Время: ${time}`,
        "",
        "До встречи!",
        SIGNATURE,
      ].join("\n");

    case "tomorrow":
      return [
        "Ассаляму алейкум 🌿",
        `${clientName}, напоминаем: завтра ваша запись в ${SITE_TITLE}.`,
        `Практика: ${serviceTitle}`,
        `Дата: ${date}`,
        `Время: ${time}`,
        "",
        "Будем рады видеть вас.",
        SIGNATURE,
      ].join("\n");

    case "two_hours_before":
      return [
        "Ассаляму алейкум 🌿",
        `${clientName}, через 2 часа ждём вас в ${SITE_TITLE}.`,
        `Практика: ${serviceTitle}`,
        `Дата: ${date}`,
        `Время: ${time}`,
        "",
        "До скорой встречи!",
        SIGNATURE,
      ].join("\n");
  }
}

export function buildReminderWhatsAppUrl(
  booking: BookingRow,
  type: ReminderTemplateType,
): string {
  return buildWhatsAppUrl(booking.phone, buildReminderMessage(booking, type));
}

export function getRecommendedReminderTemplate(
  booking: BookingRow,
): ReminderTemplateType {
  const timing = getBookingTimingLabel(booking);

  if (timing === "tomorrow") return "tomorrow";
  if (timing === "today") {
    if (isSessionWithinTwoHours(booking)) return "two_hours_before";
    return "today";
  }

  return "today";
}
