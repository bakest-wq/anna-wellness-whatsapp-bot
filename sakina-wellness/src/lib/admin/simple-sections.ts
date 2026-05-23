import {
  getActiveBookingsForDates,
  getTomorrowDateString,
} from "@/lib/admin/booking-timing";
import { getTodayDateString } from "@/lib/admin/group-bookings";
import { normalizeBookingStatus } from "@/lib/admin/status";
import type { BookingRow } from "@/lib/admin/types";

export type SimpleAdminSection = "today" | "tomorrow" | "new";

export function getTodayBookings(bookings: BookingRow[]): BookingRow[] {
  return getActiveBookingsForDates(bookings, [getTodayDateString()]);
}

export function getTomorrowBookings(bookings: BookingRow[]): BookingRow[] {
  return getActiveBookingsForDates(bookings, [getTomorrowDateString()]);
}

export function getNewBookings(bookings: BookingRow[]): BookingRow[] {
  return bookings
    .filter((b) => normalizeBookingStatus(b.status) === "new")
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function getSectionBookings(
  section: SimpleAdminSection,
  bookings: BookingRow[],
): BookingRow[] {
  switch (section) {
    case "today":
      return getTodayBookings(bookings);
    case "tomorrow":
      return getTomorrowBookings(bookings);
    case "new":
      return getNewBookings(bookings);
  }
}

export function getSectionCounts(bookings: BookingRow[]) {
  return {
    today: getTodayBookings(bookings).length,
    tomorrow: getTomorrowBookings(bookings).length,
    new: getNewBookings(bookings).length,
  };
}
