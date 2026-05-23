import { getTodayDateString } from "@/lib/admin/group-bookings";
import { slotToMinutes } from "@/lib/booking-schedule";
import type { BookingRow } from "@/lib/admin/types";

export type BookingTimingLabel =
  | "today"
  | "tomorrow"
  | "upcoming"
  | "completed"
  | "cancelled";

export const BOOKING_TIMING_LABELS: Record<BookingTimingLabel, string> = {
  today: "Сегодня",
  tomorrow: "Завтра",
  upcoming: "Предстоит",
  completed: "Завершена",
  cancelled: "Отменена",
};

export function getTomorrowDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function getBookingTimingLabel(booking: BookingRow): BookingTimingLabel {
  const today = getTodayDateString();
  const tomorrow = getTomorrowDateString();

  if (booking.status === "cancelled") {
    return "cancelled";
  }

  if (booking.status === "completed" || booking.preferred_date < today) {
    return "completed";
  }

  if (booking.preferred_date === today) {
    return "today";
  }

  if (booking.preferred_date === tomorrow) {
    return "tomorrow";
  }

  return "upcoming";
}

/** Session starts within the next 2 hours (today only) */
export function isSessionWithinTwoHours(booking: BookingRow): boolean {
  const today = getTodayDateString();
  if (booking.preferred_date !== today) return false;

  const start = slotToMinutes(booking.preferred_time);
  if (start === null) return false;

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const diff = start - nowMinutes;

  return diff > 0 && diff <= 120;
}

export function sortBookingsByVisitTime(bookings: BookingRow[]): BookingRow[] {
  return [...bookings].sort((a, b) => {
    const dateCmp = a.preferred_date.localeCompare(b.preferred_date);
    if (dateCmp !== 0) return dateCmp;
    return a.preferred_time.localeCompare(b.preferred_time);
  });
}

export function getActiveBookingsForDates(
  bookings: BookingRow[],
  dates: string[],
): BookingRow[] {
  const set = new Set(dates);
  return sortBookingsByVisitTime(
    bookings.filter(
      (b) => set.has(b.preferred_date) && b.status !== "cancelled",
    ),
  );
}
