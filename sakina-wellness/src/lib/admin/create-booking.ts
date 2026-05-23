import { isValidBookingDate } from "@/lib/booking-availability";
import { isValidBookingTimeSlot } from "@/lib/booking-slots";
import type { AdminBookingSubmission } from "@/lib/bookings";
import { isKnownServiceId } from "@/lib/service-duration";
import { getPackageById } from "@/lib/packages";
import { getServiceById } from "@/lib/services";

export type AdminCreateBookingInput = {
  clientName: string;
  phone: string;
  serviceId: string;
  packageId: string | null;
  date: string;
  time: string;
  notes: string | null;
};

export function parseAdminCreateBooking(
  body: unknown,
): AdminCreateBookingInput | null {
  if (!body || typeof body !== "object") return null;

  const data = body as Record<string, unknown>;
  const clientName =
    typeof data.clientName === "string" ? data.clientName.trim() : "";
  const phone = typeof data.phone === "string" ? data.phone.trim() : "";
  const serviceId = typeof data.serviceId === "string" ? data.serviceId : "";
  const packageId =
    typeof data.packageId === "string" && data.packageId.trim()
      ? data.packageId.trim()
      : null;
  const date = typeof data.date === "string" ? data.date : "";
  const time = typeof data.time === "string" ? data.time : "";
  const notes =
    typeof data.notes === "string" && data.notes.trim()
      ? data.notes.trim()
      : null;

  if (
    !serviceId ||
    !date ||
    !time ||
    clientName.length < 2 ||
    phone.replace(/\D/g, "").length < 10
  ) {
    return null;
  }

  return { clientName, phone, serviceId, packageId, date, time, notes };
}

export function toAdminBookingSubmission(
  input: AdminCreateBookingInput,
): AdminBookingSubmission | { error: string } {
  if (
    !isValidBookingDate(input.date) ||
    !isValidBookingTimeSlot(input.time) ||
    !isKnownServiceId(input.serviceId)
  ) {
    return { error: "Выберите корректную дату, время и практику." };
  }

  const service = getServiceById(input.serviceId);
  if (!service) {
    return { error: "Неизвестная практика." };
  }

  let packageId: string | null = null;
  let packageName: string | null = null;

  if (input.packageId) {
    const pkg = getPackageById(input.packageId);
    if (!pkg) {
      return { error: "Неизвестный пакет." };
    }
    packageId = pkg.id;
    packageName = pkg.name;
  }

  return {
    serviceId: service.id,
    serviceTitle: service.title,
    packageId,
    packageName,
    skipPackage: !packageId,
    date: input.date,
    time: input.time,
    clientName: input.clientName,
    phone: input.phone,
    notes: input.notes,
  };
}
