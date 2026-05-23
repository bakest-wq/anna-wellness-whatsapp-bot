import { BOOKING_TIME_PERIOD_GROUPS } from "@/lib/booking-slots";
import {
  intervalsOverlap,
  parseExistingBookings,
  slotToMinutes,
  toScheduledBooking,
} from "@/lib/booking-schedule";
import { formatBookingDate } from "@/lib/booking-flow";
import type { BookingRow } from "@/lib/admin/types";
import { getTomorrowDateString } from "@/lib/admin/booking-timing";
import { getTodayDateString } from "@/lib/admin/group-bookings";

export type ScheduleFilter = "today" | "week" | "all";

export type ScheduleWindow = {
  id: string;
  label: string;
  range: string;
  startMinutes: number;
  endMinutes: number;
  slots: readonly string[];
};

export const SCHEDULE_WINDOWS: ScheduleWindow[] = BOOKING_TIME_PERIOD_GROUPS.map(
  (group) => ({
    id: group.id,
    label: group.label,
    range: group.hint,
    startMinutes: slotToMinutes(group.slots[0]) ?? 0,
    endMinutes:
      (slotToMinutes(group.slots[group.slots.length - 1]) ?? 0) + 60,
    slots: group.slots,
  }),
);

export type ScheduleDay = {
  date: string;
  label: string;
  isToday: boolean;
  isTomorrow: boolean;
  bookings: BookingRow[];
};

export function formatMinutesAsTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function getBookingTimeRange(booking: BookingRow): string {
  const scheduled = toScheduledBooking(
    booking.preferred_time,
    booking.service_id,
  );

  if (!scheduled) return booking.preferred_time;

  return `${formatMinutesAsTime(scheduled.startMinutes)}–${formatMinutesAsTime(scheduled.endMinutes)}`;
}

function dateToISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function getWeekDateStrings(): string[] {
  const today = new Date();
  const day = today.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const dates: string[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + mondayOffset + i);
    dates.push(dateToISO(d));
  }

  return dates;
}

export function buildScheduleDay(
  date: string,
  bookings: BookingRow[],
  today: string,
): ScheduleDay {
  const dayBookings = bookings
    .filter((b) => b.preferred_date === date)
    .sort((a, b) => {
      const ta = a.preferred_time.replace(":", "");
      const tb = b.preferred_time.replace(":", "");
      return ta.localeCompare(tb);
    });

  const tomorrow = getTomorrowDateString();

  return {
    date,
    label: formatBookingDate(date),
    isToday: date === today,
    isTomorrow: date === tomorrow,
    bookings: dayBookings,
  };
}

export function getScheduleDays(
  filter: ScheduleFilter,
  bookings: BookingRow[],
): ScheduleDay[] {
  const today = getTodayDateString();

  if (filter === "today") {
    const tomorrow = getTomorrowDateString();
    return [
      buildScheduleDay(today, bookings, today),
      buildScheduleDay(tomorrow, bookings, today),
    ];
  }

  if (filter === "week") {
    return getWeekDateStrings().map((date) =>
      buildScheduleDay(date, bookings, today),
    );
  }

  const dates = [
    ...new Set(bookings.map((b) => b.preferred_date)),
  ].sort((a, b) => a.localeCompare(b));

  return dates.map((date) => buildScheduleDay(date, bookings, today));
}

export function bookingOverlapsWindow(
  booking: BookingRow,
  window: ScheduleWindow,
): boolean {
  const scheduled = toScheduledBooking(
    booking.preferred_time,
    booking.service_id,
  );

  if (!scheduled) {
    const start = slotToMinutes(booking.preferred_time);
    return (
      start !== null &&
      start >= window.startMinutes &&
      start < window.endMinutes
    );
  }

  return intervalsOverlap(
    scheduled.startMinutes,
    scheduled.endMinutes,
    window.startMinutes,
    window.endMinutes,
  );
}

export function getBookingsForWindow(
  dayBookings: BookingRow[],
  window: ScheduleWindow,
): BookingRow[] {
  return dayBookings.filter((b) => bookingOverlapsWindow(b, window));
}

export function getFreeSlotsForWindow(
  dayBookings: BookingRow[],
  window: ScheduleWindow,
): string[] {
  const active = dayBookings.filter((b) => b.status !== "cancelled");
  const existing = parseExistingBookings(active);

  return window.slots.filter((slot) => {
    const start = slotToMinutes(slot);
    if (start === null) return false;

    const overlaps = existing.some((booking) =>
      intervalsOverlap(
        start,
        start + 60,
        booking.startMinutes,
        booking.endMinutes,
      ),
    );

    return !overlaps;
  });
}
