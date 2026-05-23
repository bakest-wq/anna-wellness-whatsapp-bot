/** Working hours: morning 09–13, afternoon 15–18, evening 19–22 */
export const BOOKING_TIME_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "15:00",
  "16:00",
  "17:00",
  "19:00",
  "20:00",
  "21:00",
] as const;

export type BookingTimeSlot = (typeof BOOKING_TIME_SLOTS)[number];

export const BOOKING_TIME_PERIOD_GROUPS = [
  {
    id: "morning",
    label: "Утро",
    hint: "09:00–13:00",
    slots: ["09:00", "10:00", "11:00", "12:00"] as const,
  },
  {
    id: "afternoon",
    label: "День",
    hint: "15:00–18:00",
    slots: ["15:00", "16:00", "17:00"] as const,
  },
  {
    id: "evening",
    label: "Вечер",
    hint: "19:00–22:00",
    slots: ["19:00", "20:00", "21:00"] as const,
  },
] as const;

const SLOT_SET = new Set<string>(BOOKING_TIME_SLOTS);

export function isValidBookingTimeSlot(time: string): time is BookingTimeSlot {
  return SLOT_SET.has(time);
}

/** Normalize stored times (e.g. "9:00") to HH:MM for comparison */
export function normalizeBookingTimeSlot(time: string): BookingTimeSlot | null {
  const trimmed = time.trim();
  const match = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;

  const hours = match[1].padStart(2, "0");
  const minutes = match[2];
  const normalized = `${hours}:${minutes}`;

  return isValidBookingTimeSlot(normalized) ? normalized : null;
}

