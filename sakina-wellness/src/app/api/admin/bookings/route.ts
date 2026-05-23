import { NextResponse } from "next/server";
import {
  parseAdminCreateBooking,
  toAdminBookingSubmission,
} from "@/lib/admin/create-booking";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { assertSlotAvailable } from "@/lib/booking-availability";
import { toAdminBookingRecord } from "@/lib/bookings";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin-server";

export async function POST(request: Request) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const input = parseAdminCreateBooking(body);

    if (!input) {
      return NextResponse.json(
        { error: "Проверьте все обязательные поля." },
        { status: 400 },
      );
    }

    const submissionResult = toAdminBookingSubmission(input);
    if ("error" in submissionResult) {
      return NextResponse.json(
        { error: submissionResult.error },
        { status: 400 },
      );
    }

    const supabase = createServiceRoleSupabaseClient();

    const { data: existing, error: availabilityError } = await supabase
      .from("bookings")
      .select("preferred_time, service_id")
      .eq("preferred_date", submissionResult.date)
      .neq("status", "cancelled");

    if (availabilityError) {
      console.error(
        "[admin/bookings] availability check failed:",
        availabilityError.message,
      );
      return NextResponse.json(
        { error: "Не удалось проверить свободное время." },
        { status: 500 },
      );
    }

    const slotCheck = assertSlotAvailable(
      submissionResult.time,
      submissionResult.serviceId,
      existing,
    );

    if (!slotCheck.ok) {
      return NextResponse.json({ error: slotCheck.message }, { status: 409 });
    }

    const record = toAdminBookingRecord({
      ...submissionResult,
      time: slotCheck.slot,
    });

    const { data, error } = await supabase
      .from("bookings")
      .insert(record)
      .select("*")
      .single();

    if (error) {
      console.error("[admin/bookings] insert failed:", error.message);
      return NextResponse.json(
        { error: "Не удалось сохранить запись." },
        { status: 500 },
      );
    }

    return NextResponse.json({ booking: data });
  } catch (error) {
    console.error("[admin/bookings] Unexpected error:", error);
    return NextResponse.json(
      { error: "Произошла ошибка сервера." },
      { status: 500 },
    );
  }
}
