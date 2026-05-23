import type { BookingRow } from "@/lib/admin/types";
import { formatBookingDate } from "@/lib/booking-flow";

export type BookingDateGroup = {
  date: string;
  label: string;
  isToday: boolean;
  bookings: BookingRow[];
};

export function getTodayDateString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function compareTime(a: string, b: string): number {
  const na = a.replace(":", "");
  const nb = b.replace(":", "");
  return na.localeCompare(nb);
}

export function groupBookingsByDate(bookings: BookingRow[]): BookingDateGroup[] {
  const today = getTodayDateString();
  const map = new Map<string, BookingRow[]>();

  for (const booking of bookings) {
    const list = map.get(booking.preferred_date) ?? [];
    list.push(booking);
    map.set(booking.preferred_date, list);
  }

  const dates = [...map.keys()].sort((a, b) => b.localeCompare(a));

  return dates.map((date) => {
    const groupBookings = [...(map.get(date) ?? [])].sort((a, b) => {
      const byTime = compareTime(a.preferred_time, b.preferred_time);
      if (byTime !== 0) return byTime;
      return b.created_at.localeCompare(a.created_at);
    });

    return {
      date,
      label: formatBookingDate(date),
      isToday: date === today,
      bookings: groupBookings,
    };
  });
}
