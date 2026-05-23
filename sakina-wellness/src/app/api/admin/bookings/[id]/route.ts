import { NextResponse } from "next/server";
import { BOOKING_STATUSES, type BookingStatus } from "@/lib/admin/types";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin-server";

function isBookingStatus(value: string): value is BookingStatus {
  return (BOOKING_STATUSES as readonly string[]).includes(value);
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: "Некорректный id записи." }, { status: 400 });
  }

  try {
    const body = (await request.json()) as { status?: string };
    const status = typeof body.status === "string" ? body.status.trim() : "";

    if (!isBookingStatus(status)) {
      return NextResponse.json(
        { error: "Недопустимый статус." },
        { status: 400 },
      );
    }

    const supabase = createServiceRoleSupabaseClient();

    const { data, error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("[admin] status update failed:", error.message, error.code);
      return NextResponse.json(
        { error: "Не удалось обновить статус." },
        { status: 500 },
      );
    }

    return NextResponse.json({ booking: data });
  } catch {
    return NextResponse.json(
      { error: "Некорректный запрос." },
      { status: 400 },
    );
  }
}
