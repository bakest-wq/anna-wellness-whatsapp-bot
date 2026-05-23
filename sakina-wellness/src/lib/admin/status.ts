import type { BookingStatus } from "@/lib/admin/types";

const STATUS_ALIASES: Record<string, BookingStatus> = {
  pending: "new",
  new: "new",
  confirmed: "confirmed",
  completed: "completed",
  cancelled: "cancelled",
};

export function normalizeBookingStatus(raw: string): BookingStatus {
  return STATUS_ALIASES[raw.toLowerCase()] ?? "new";
}

export const STATUS_LABELS: Record<BookingStatus, string> = {
  new: "Новая",
  confirmed: "Подтверждена",
  completed: "Завершена",
  cancelled: "Отменена",
};
