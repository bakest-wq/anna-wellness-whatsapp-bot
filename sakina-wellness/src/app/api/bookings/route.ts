import { NextResponse } from "next/server";
import {
  assertSlotAvailable,
  isValidBookingDate,
} from "@/lib/booking-availability";
import { isValidBookingTimeSlot } from "@/lib/booking-slots";
import { isKnownServiceId } from "@/lib/service-duration";
import { toBookingRecord, type BookingSubmission } from "@/lib/bookings";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function parseSubmission(body: unknown): BookingSubmission | null {
  if (!body || typeof body !== "object") return null;

  const data = body as Record<string, unknown>;
  const serviceId = typeof data.serviceId === "string" ? data.serviceId : "";
  const serviceTitle =
    typeof data.serviceTitle === "string" ? data.serviceTitle : "";
  const packageId =
    typeof data.packageId === "string" ? data.packageId : null;
  const packageName =
    typeof data.packageName === "string" ? data.packageName : null;
  const skipPackage = data.skipPackage === true;
  const date = typeof data.date === "string" ? data.date : "";
  const time = typeof data.time === "string" ? data.time : "";
  const clientName =
    typeof data.clientName === "string" ? data.clientName.trim() : "";
  const phone = typeof data.phone === "string" ? data.phone.trim() : "";

  if (
    !serviceId ||
    !serviceTitle ||
    !date ||
    !time ||
    clientName.length < 2 ||
    phone.replace(/\D/g, "").length < 10
  ) {
    return null;
  }

  return {
    serviceId,
    serviceTitle,
    packageId,
    packageName,
    skipPackage,
    date,
    time,
    clientName,
    phone,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const submission = parseSubmission(body);

    if (!submission) {
      return NextResponse.json(
        { error: "Проверьте данные заявки и попробуйте снова." },
        { status: 400 },
      );
    }

    if (
      !isValidBookingDate(submission.date) ||
      !isValidBookingTimeSlot(submission.time) ||
      !isKnownServiceId(submission.serviceId)
    ) {
      return NextResponse.json(
        { error: "Выберите корректную дату и время из расписания." },
        { status: 400 },
      );
    }

    const supabase = createServerSupabaseClient();

    const { data: existing, error: availabilityError } = await supabase
      .from("bookings")
      .select("preferred_time, service_id")
      .eq("preferred_date", submission.date)
      .neq("status", "cancelled");

    if (availabilityError) {
      console.error(
        "[bookings] availability check failed:",
        availabilityError.message,
      );
      return NextResponse.json(
        {
          error:
            "Не удалось проверить свободное время. Попробуйте ещё раз или напишите нам в WhatsApp.",
        },
        { status: 500 },
      );
    }

    const slotCheck = assertSlotAvailable(
      submission.time,
      submission.serviceId,
      existing,
    );

    if (!slotCheck.ok) {
      return NextResponse.json({ error: slotCheck.message }, { status: 409 });
    }

    const record = toBookingRecord({
      ...submission,
      time: slotCheck.slot,
    });

    const { error } = await supabase.from("bookings").insert(record);

    if (error) {
      console.error("[bookings] Supabase insert failed:", error.message);
      return NextResponse.json(
        {
          error:
            "Не удалось сохранить заявку. Попробуйте ещё раз или напишите нам в WhatsApp.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[bookings] Unexpected error:", error);
    return NextResponse.json(
      { error: "Произошла ошибка сервера. Попробуйте позже." },
      { status: 500 },
    );
  }
}
