import { NextResponse } from "next/server";
import {
  getSlotAvailabilityForDate,
  isValidAvailabilityRequest,
} from "@/lib/booking-availability";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date")?.trim() ?? "";
    const serviceId = searchParams.get("serviceId")?.trim() ?? "";

    if (!isValidAvailabilityRequest(date, serviceId)) {
      return NextResponse.json(
        { error: "Укажите корректную дату и практику." },
        { status: 400 },
      );
    }

    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from("bookings")
      .select("preferred_time, service_id")
      .eq("preferred_date", date)
      .neq("status", "cancelled");

    if (error) {
      console.error("[availability] query failed:", error.message);
      return NextResponse.json(
        { error: "Не удалось проверить свободное время. Попробуйте позже." },
        { status: 500 },
      );
    }

    return NextResponse.json(getSlotAvailabilityForDate(date, serviceId, data));
  } catch (error) {
    console.error("[availability] Unexpected error:", error);
    return NextResponse.json(
      { error: "Произошла ошибка сервера. Попробуйте позже." },
      { status: 500 },
    );
  }
}
