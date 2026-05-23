"use client";

import { BookingRemindButton } from "@/components/admin/booking-remind-button";
import { BookingTimingBadge } from "@/components/admin/booking-timing-badge";
import { StatusBadge } from "@/components/admin/status-badge";
import { StatusSelect } from "@/components/admin/status-select";
import { WhatsAppQuickReplies } from "@/components/admin/whatsapp-quick-replies";
import { formatBookingDate } from "@/lib/booking-flow";
import { getBookingTimingLabel } from "@/lib/admin/booking-timing";
import { getBookingTimeRange } from "@/lib/admin/schedule-utils";
import type { BookingRow, BookingStatus } from "@/lib/admin/types";
import { cn } from "@/lib/cn";

type AdminBookingCardProps = {
  booking: BookingRow;
  isUpdating: boolean;
  onStatusChange: (status: BookingStatus) => void;
  showVisitDate?: boolean;
  className?: string;
};

export function AdminBookingCard({
  booking,
  isUpdating,
  onStatusChange,
  showVisitDate = true,
  className,
}: AdminBookingCardProps) {
  const timeRange = getBookingTimeRange(booking);
  const timing = getBookingTimingLabel(booking);
  const showRemind =
    timing === "today" || timing === "tomorrow" || timing === "upcoming";

  return (
    <article className={cn("admin-booking-card", className)}>
      <div className="admin-booking-card__header">
        <div className="min-w-0 flex-1">
          <h3 className="admin-booking-card__name">{booking.client_name}</h3>
          <p className="admin-booking-card__service">{booking.service_title}</p>
          {showVisitDate && (
            <p className="admin-booking-card__datetime">
              {formatBookingDate(booking.preferred_date)} · {timeRange}
            </p>
          )}
          {!showVisitDate && (
            <p className="admin-booking-card__datetime">{timeRange}</p>
          )}
        </div>
        <div className="shrink-0 space-y-1.5 text-right">
          <BookingTimingBadge booking={booking} />
          <StatusBadge status={booking.status} className="block" />
        </div>
      </div>

      <div className="admin-booking-card__status">
        <StatusSelect
          value={booking.status}
          isUpdating={isUpdating}
          onChange={onStatusChange}
        />
      </div>

      {showRemind && (
        <div className="admin-booking-card__remind">
          <BookingRemindButton booking={booking} compact />
        </div>
      )}

      <div className="admin-booking-card__whatsapp">
        <p className="admin-booking-card__whatsapp-label">WhatsApp</p>
        <WhatsAppQuickReplies booking={booking} compact />
      </div>
    </article>
  );
}
