import {
  getSlotAvailabilityForService,
  validateBookingSlot,
} from "@/lib/booking-schedule";
import {
  formatServiceDurationLabel,
  isKnownServiceId,
} from "@/lib/service-duration";

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidBookingDate(date: string): boolean {
  if (!ISO_DATE_RE.test(date)) return false;
  const parsed = new Date(`${date}T12:00:00`);
  return !Number.isNaN(parsed.getTime());
}

export function getSlotAvailabilityForDate(
  date: string,
  serviceId: string,
  rows: { preferred_time: string; service_id: string }[] | null | undefined,
) {
  const availability = getSlotAvailabilityForService(serviceId, rows);

  return {
    date,
    serviceId,
    durationMinutes: availability.durationMinutes,
    durationLabel: formatServiceDurationLabel(availability.durationMinutes),
    availableSlots: availability.availableSlots,
    bookedSlots: availability.bookedSlots,
    outsideHoursSlots: availability.outsideHoursSlots,
    allUnavailable: availability.allUnavailable,
    onlyOutsideHours: availability.onlyOutsideHours,
    /** @deprecated use allUnavailable */
    allBooked: availability.allUnavailable,
  };
}

export function assertSlotAvailable(
  time: string,
  serviceId: string,
  rows: { preferred_time: string; service_id: string }[] | null | undefined,
) {
  return validateBookingSlot(time, serviceId, rows);
}

export function isValidAvailabilityRequest(
  date: string,
  serviceId: string,
): boolean {
  return isValidBookingDate(date) && isKnownServiceId(serviceId);
}
