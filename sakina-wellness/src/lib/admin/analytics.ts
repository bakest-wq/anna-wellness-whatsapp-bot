import { normalizeBookingStatus } from "@/lib/admin/status";
import type { BookingAnalytics, BookingRow } from "@/lib/admin/types";

export function computeBookingAnalytics(
  bookings: BookingRow[],
): BookingAnalytics {
  const serviceCounts = new Map<string, number>();

  let newCount = 0;
  let confirmedCount = 0;

  for (const booking of bookings) {
    const status = normalizeBookingStatus(booking.status);

    if (status === "new") newCount += 1;
    if (status === "confirmed") confirmedCount += 1;

    serviceCounts.set(
      booking.service_title,
      (serviceCounts.get(booking.service_title) ?? 0) + 1,
    );
  }

  let popularService: string | null = null;
  let maxCount = 0;

  for (const [service, count] of serviceCounts) {
    if (count > maxCount) {
      maxCount = count;
      popularService = service;
    }
  }

  return {
    total: bookings.length,
    newCount,
    confirmedCount,
    popularService,
  };
}
