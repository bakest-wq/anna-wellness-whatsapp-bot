"use client";

import {
  BOOKING_TIMING_LABELS,
  getBookingTimingLabel,
  type BookingTimingLabel,
} from "@/lib/admin/booking-timing";
import type { BookingRow } from "@/lib/admin/types";
import { cn } from "@/lib/cn";

const TIMING_STYLES: Record<BookingTimingLabel, string> = {
  today: "border-[#C4A574]/50 bg-[#C4A574]/18 text-[#7A5E32]",
  tomorrow: "border-[#9CAA8F]/45 bg-[#9CAA8F]/18 text-[#5F735B]",
  upcoming: "border-[#B8935A]/35 bg-[#EDE4D4]/55 text-[#6B5A45]",
  completed: "border-[#D4C4B8]/70 bg-[#FAF7F2] text-[#9A9288]",
  cancelled: "border-[#D4C4B8]/70 bg-[#FAF7F2]/90 text-[#9A9288]",
};

type BookingTimingBadgeProps = {
  booking: BookingRow;
  className?: string;
};

export function BookingTimingBadge({ booking, className }: BookingTimingBadgeProps) {
  const timing = getBookingTimingLabel(booking);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]",
        TIMING_STYLES[timing],
        className,
      )}
    >
      {BOOKING_TIMING_LABELS[timing]}
    </span>
  );
}
