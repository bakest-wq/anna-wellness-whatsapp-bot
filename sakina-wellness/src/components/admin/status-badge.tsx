import { STATUS_LABELS, normalizeBookingStatus } from "@/lib/admin/status";
import type { BookingStatus } from "@/lib/admin/types";
import { cn } from "@/lib/cn";

const STATUS_STYLES: Record<BookingStatus, string> = {
  new: "border-[#C4A574]/45 bg-[#FFF9F3] text-[#9A7B45]",
  confirmed: "border-[#9CAA8F]/50 bg-[#9CAA8F]/15 text-[#5F735B]",
  completed: "border-[#B8935A]/35 bg-[#EDE4D4]/60 text-[#6B5A45]",
  cancelled: "border-[#D4C4B8]/70 bg-[#FAF7F2] text-[#9A9288]",
};

type StatusBadgeProps = {
  status: string;
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = normalizeBookingStatus(status);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
        STATUS_STYLES[normalized],
        className,
      )}
    >
      {STATUS_LABELS[normalized]}
    </span>
  );
}
