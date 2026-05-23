import { formatBookingDate } from "@/lib/booking-flow";
import { normalizeClientPhone } from "@/lib/admin/phone";
import type { BookingRow } from "@/lib/admin/types";

export type ClientNoteRecord = {
  notes: string;
  updatedAt: string | null;
};

export type ClientProfile = {
  phoneKey: string;
  phoneDisplay: string;
  name: string;
  totalVisits: number;
  lastVisitDate: string | null;
  lastVisitLabel: string | null;
  favoriteService: string | null;
  bookings: BookingRow[];
  notes: string;
  notesUpdatedAt: string | null;
};

function compareVisitDates(a: string, b: string): number {
  return b.localeCompare(a);
}

function pickDisplayName(bookings: BookingRow[]): string {
  const counts = new Map<string, number>();
  for (const b of bookings) {
    const name = b.client_name.trim();
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }

  let best = bookings[0]?.client_name ?? "Гость";
  let max = 0;
  for (const [name, count] of counts) {
    if (count > max) {
      max = count;
      best = name;
    }
  }
  return best;
}

function getFavoriteService(bookings: BookingRow[]): string | null {
  const active = bookings.filter((b) => b.status !== "cancelled");
  if (active.length === 0) return null;

  const counts = new Map<string, number>();
  for (const b of active) {
    counts.set(
      b.service_title,
      (counts.get(b.service_title) ?? 0) + 1,
    );
  }

  let best: string | null = null;
  let max = 0;
  for (const [title, count] of counts) {
    if (count > max) {
      max = count;
      best = title;
    }
  }
  return best;
}

function getLastVisitDate(bookings: BookingRow[]): string | null {
  const active = bookings.filter((b) => b.status !== "cancelled");
  const source = active.length > 0 ? active : bookings;
  if (source.length === 0) return null;

  const sorted = [...source].sort((a, b) =>
    compareVisitDates(a.preferred_date, b.preferred_date),
  );
  return sorted[0]?.preferred_date ?? null;
}

export function buildClientProfiles(
  bookings: BookingRow[],
  notesByPhone: Record<string, ClientNoteRecord>,
): ClientProfile[] {
  const groups = new Map<string, BookingRow[]>();

  for (const booking of bookings) {
    const key = normalizeClientPhone(booking.phone);
    const list = groups.get(key) ?? [];
    list.push(booking);
    groups.set(key, list);
  }

  const profiles: ClientProfile[] = [];

  for (const [phoneKey, clientBookings] of groups) {
    const sorted = [...clientBookings].sort((a, b) => {
      const byVisit = compareVisitDates(a.preferred_date, b.preferred_date);
      if (byVisit !== 0) return byVisit;
      return b.created_at.localeCompare(a.created_at);
    });

    const activeVisits = sorted.filter((b) => b.status !== "cancelled");
    const lastVisitDate = getLastVisitDate(sorted);
    const note = notesByPhone[phoneKey];

    profiles.push({
      phoneKey,
      phoneDisplay: sorted[0]?.phone ?? phoneKey,
      name: pickDisplayName(sorted),
      totalVisits: activeVisits.length,
      lastVisitDate,
      lastVisitLabel: lastVisitDate
        ? formatBookingDate(lastVisitDate)
        : null,
      favoriteService: getFavoriteService(sorted),
      bookings: sorted,
      notes: note?.notes ?? "",
      notesUpdatedAt: note?.updatedAt ?? null,
    });
  }

  return profiles.sort((a, b) => {
    if (a.lastVisitDate && b.lastVisitDate) {
      return compareVisitDates(a.lastVisitDate, b.lastVisitDate);
    }
    if (a.lastVisitDate) return -1;
    if (b.lastVisitDate) return 1;
    return a.name.localeCompare(b.name, "ru");
  });
}
