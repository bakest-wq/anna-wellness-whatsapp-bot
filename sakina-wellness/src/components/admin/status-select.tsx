"use client";

import { Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/admin/status-badge";
import { STATUS_LABELS, normalizeBookingStatus } from "@/lib/admin/status";
import { BOOKING_STATUSES, type BookingStatus } from "@/lib/admin/types";
import { cn } from "@/lib/cn";

type StatusSelectProps = {
  value: string;
  onChange: (status: BookingStatus) => void;
  isUpdating?: boolean;
  className?: string;
};

export function StatusSelect({
  value,
  onChange,
  isUpdating = false,
  className,
}: StatusSelectProps) {
  const normalized = normalizeBookingStatus(value);

  return (
    <div className={cn("relative min-w-[9.5rem]", className)}>
      <div className="mb-2 flex items-center gap-2">
        <StatusBadge status={normalized} />
        {isUpdating && (
          <Loader2
            className="h-4 w-4 animate-spin text-[#5F735B]"
            strokeWidth={1.75}
            aria-hidden
          />
        )}
      </div>
      <label className="sr-only">Статус записи</label>
      <select
        value={normalized}
        disabled={isUpdating}
        onChange={(e) => onChange(e.target.value as BookingStatus)}
        className="admin-status-select w-full"
        aria-busy={isUpdating}
      >
        {BOOKING_STATUSES.map((status) => (
          <option key={status} value={status}>
            {STATUS_LABELS[status]}
          </option>
        ))}
      </select>
    </div>
  );
}
