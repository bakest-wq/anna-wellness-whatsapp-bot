import {
  BOOKING_TIME_SLOTS,
  type BookingTimeSlot,
  isValidBookingTimeSlot,
  normalizeBookingTimeSlot,
} from "@/lib/booking-slots";
import { getServiceDurationMinutes } from "@/lib/service-duration";

/** Working hours: 09:00–13:00, 15:00–18:00, 19:00–22:00 */
export const WORKING_WINDOWS_MINUTES = [
  { start: 9 * 60, end: 13 * 60 },
  { start: 15 * 60, end: 18 * 60 },
  { start: 19 * 60, end: 22 * 60 },
] as const;

export type SlotBlockReason = "booked" | "outside_hours";

export type ScheduledBooking = {
  startMinutes: number;
  endMinutes: number;
  startSlot: BookingTimeSlot;
};

export type SlotStatus = {
  slot: BookingTimeSlot;
  reason: SlotBlockReason | null;
};

export const SLOT_MESSAGES: Record<SlotBlockReason, string> = {
  booked: "Это время уже занято",
  outside_hours: "Сеанс не помещается в рабочий интервал",
};

export function slotToMinutes(slot: string): number | null {
  const normalized = normalizeBookingTimeSlot(slot);
  if (!normalized) return null;

  const [h, m] = normalized.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToSlot(minutes: number): BookingTimeSlot | null {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const slot = `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  return isValidBookingTimeSlot(slot) ? slot : null;
}

export function fitsWorkingHours(
  startMinutes: number,
  durationMinutes: number,
): boolean {
  const endMinutes = startMinutes + durationMinutes;
  return WORKING_WINDOWS_MINUTES.some(
    (window) => startMinutes >= window.start && endMinutes <= window.end,
  );
}

export function intervalsOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export function toScheduledBooking(
  time: string,
  serviceId: string,
): ScheduledBooking | null {
  const normalized = normalizeBookingTimeSlot(time);
  const startMinutes = normalized ? slotToMinutes(normalized) : null;

  if (!normalized || startMinutes === null) return null;

  const durationMinutes = getServiceDurationMinutes(serviceId);

  return {
    startSlot: normalized,
    startMinutes,
    endMinutes: startMinutes + durationMinutes,
  };
}

export function parseExistingBookings(
  rows: { preferred_time: string; service_id: string }[] | null | undefined,
): ScheduledBooking[] {
  const scheduled: ScheduledBooking[] = [];

  for (const row of rows ?? []) {
    const booking = toScheduledBooking(row.preferred_time, row.service_id);
    if (booking) scheduled.push(booking);
  }

  return scheduled;
}

export function getSlotStatuses(
  durationMinutes: number,
  existing: ScheduledBooking[],
): SlotStatus[] {
  return BOOKING_TIME_SLOTS.map((slot) => {
    const startMinutes = slotToMinutes(slot);
    if (startMinutes === null) {
      return { slot, reason: "outside_hours" as const };
    }

    if (!fitsWorkingHours(startMinutes, durationMinutes)) {
      return { slot, reason: "outside_hours" };
    }

    const endMinutes = startMinutes + durationMinutes;
    const overlapsExisting = existing.some((booking) =>
      intervalsOverlap(
        startMinutes,
        endMinutes,
        booking.startMinutes,
        booking.endMinutes,
      ),
    );

    if (overlapsExisting) {
      return { slot, reason: "booked" };
    }

    return { slot, reason: null };
  });
}

export function getAvailabilityFromStatuses(statuses: SlotStatus[]) {
  const availableSlots: BookingTimeSlot[] = [];
  const bookedSlots: BookingTimeSlot[] = [];
  const outsideHoursSlots: BookingTimeSlot[] = [];

  for (const { slot, reason } of statuses) {
    if (!reason) {
      availableSlots.push(slot);
    } else if (reason === "booked") {
      bookedSlots.push(slot);
    } else {
      outsideHoursSlots.push(slot);
    }
  }

  const allUnavailable = availableSlots.length === 0;
  const onlyOutsideHours =
    allUnavailable &&
    outsideHoursSlots.length > 0 &&
    bookedSlots.length === 0;

  return {
    availableSlots,
    bookedSlots,
    outsideHoursSlots,
    allUnavailable,
    onlyOutsideHours,
  };
}

export function getSlotAvailabilityForService(
  serviceId: string,
  rows: { preferred_time: string; service_id: string }[] | null | undefined,
) {
  const durationMinutes = getServiceDurationMinutes(serviceId);
  const existing = parseExistingBookings(rows);
  const statuses = getSlotStatuses(durationMinutes, existing);

  return {
    durationMinutes,
    ...getAvailabilityFromStatuses(statuses),
    slotStatuses: statuses,
  };
}

export type BookingSlotValidationResult =
  | { ok: true; slot: BookingTimeSlot }
  | { ok: false; message: string; reason?: SlotBlockReason };

export function validateBookingSlot(
  time: string,
  serviceId: string,
  rows: { preferred_time: string; service_id: string }[] | null | undefined,
): BookingSlotValidationResult {
  const normalized = normalizeBookingTimeSlot(time);

  if (!normalized) {
    return {
      ok: false,
      message: "Выберите доступное время из расписания.",
    };
  }

  const durationMinutes = getServiceDurationMinutes(serviceId);
  const startMinutes = slotToMinutes(normalized);

  if (startMinutes === null) {
    return {
      ok: false,
      message: "Выберите доступное время из расписания.",
    };
  }

  if (!fitsWorkingHours(startMinutes, durationMinutes)) {
    return {
      ok: false,
      message: SLOT_MESSAGES.outside_hours,
      reason: "outside_hours",
    };
  }

  const existing = parseExistingBookings(rows);
  const endMinutes = startMinutes + durationMinutes;
  const hasOverlap = existing.some((booking) =>
    intervalsOverlap(
      startMinutes,
      endMinutes,
      booking.startMinutes,
      booking.endMinutes,
    ),
  );

  if (hasOverlap) {
    return {
      ok: false,
      message: SLOT_MESSAGES.booked,
      reason: "booked",
    };
  }

  return { ok: true, slot: normalized };
}
