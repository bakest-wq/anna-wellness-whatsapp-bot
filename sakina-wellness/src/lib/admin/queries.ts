import "server-only";

import { isAdminAuthenticated } from "@/lib/admin/auth-server";
import type { ClientNoteRecord } from "@/lib/admin/clients";
import type { BookingAnalytics, BookingRow } from "@/lib/admin/types";
import { computeBookingAnalytics } from "@/lib/admin/analytics";
import { hasSupabaseServiceRoleKey } from "@/lib/supabase/env";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin-server";

export type AdminBookingsResult = {
  bookings: BookingRow[];
  analytics: BookingAnalytics;
  clientNotes: Record<string, ClientNoteRecord>;
  error: string | null;
  hasServiceRoleKey: boolean;
};

const emptyAnalytics = (): BookingAnalytics => ({
  total: 0,
  newCount: 0,
  confirmedCount: 0,
  popularService: null,
});

const emptyResult = (
  error: string | null,
  hasServiceRoleKey: boolean,
): AdminBookingsResult => ({
  bookings: [],
  analytics: emptyAnalytics(),
  clientNotes: {},
  error,
  hasServiceRoleKey,
});

export async function fetchAdminBookings(): Promise<AdminBookingsResult> {
  const hasServiceRoleKey = hasSupabaseServiceRoleKey();

  if (!(await isAdminAuthenticated())) {
    return emptyResult(null, hasServiceRoleKey);
  }

  if (!hasServiceRoleKey) {
    return emptyResult(
      "SUPABASE_SERVICE_ROLE_KEY не настроен на сервере.",
      false,
    );
  }

  const supabase = createServiceRoleSupabaseClient();

  const [bookingsResult, notesResult] = await Promise.all([
    supabase.from("bookings").select("*").order("created_at", { ascending: false }),
    supabase
      .from("client_profiles")
      .select("phone_normalized, notes, updated_at"),
  ]);

  if (bookingsResult.error) {
    console.error(
      "[admin] bookings select failed:",
      bookingsResult.error.message,
      bookingsResult.error.code,
    );
    return emptyResult("Не удалось загрузить записи.", true);
  }

  const bookings = (bookingsResult.data ?? []) as BookingRow[];
  const clientNotes: Record<string, ClientNoteRecord> = {};

  if (notesResult.error) {
    console.error(
      "[admin] client_profiles select failed:",
      notesResult.error.message,
      notesResult.error.code,
    );
    // Bookings still work; notes stay empty until migration is applied
  } else {
    for (const row of notesResult.data ?? []) {
      const phone = row.phone_normalized as string;
      clientNotes[phone] = {
        notes: (row.notes as string) ?? "",
        updatedAt: (row.updated_at as string) ?? null,
      };
    }
  }

  return {
    bookings,
    analytics: computeBookingAnalytics(bookings),
    clientNotes,
    error: null,
    hasServiceRoleKey: true,
  };
}
