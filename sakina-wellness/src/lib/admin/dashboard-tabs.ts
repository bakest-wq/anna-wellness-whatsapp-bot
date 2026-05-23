import { normalizeClientPhone } from "@/lib/admin/phone";
import {
  getNewBookings,
  getSectionCounts,
  getTodayBookings,
  getTomorrowBookings,
} from "@/lib/admin/simple-sections";
import type { BookingRow } from "@/lib/admin/types";

export type AdminTab = "today" | "tomorrow" | "calendar" | "clients";

export function getAdminTabCounts(bookings: BookingRow[]) {
  const section = getSectionCounts(bookings);
  const uniqueClients = new Set(
    bookings.map((b) => normalizeClientPhone(b.phone)),
  ).size;

  return {
    today: section.today,
    tomorrow: section.tomorrow,
    clients: uniqueClients,
  } satisfies Partial<Record<AdminTab, number>>;
}

export { getTodayBookings, getTomorrowBookings, getNewBookings };
