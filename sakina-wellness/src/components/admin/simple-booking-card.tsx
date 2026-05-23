"use client";

import { Check, Loader2, MessageCircle } from "lucide-react";
import { getBookingTimeRange } from "@/lib/admin/schedule-utils";
import { buildWhatsAppQuickReplyUrl } from "@/lib/admin/whatsapp";
import type { BookingRow } from "@/lib/admin/types";
import { cn } from "@/lib/cn";

type SimpleBookingCardProps = {
  booking: BookingRow;
  isUpdating: boolean;
  onConfirm: (bookingId: string) => void;
};

export function SimpleBookingCard({
  booking,
  isUpdating,
  onConfirm,
}: SimpleBookingCardProps) {
  const timeRange = getBookingTimeRange(booking);
  const whatsappHref = buildWhatsAppQuickReplyUrl(booking, "confirm");
  const canConfirm =
    booking.status !== "confirmed" &&
    booking.status !== "cancelled" &&
    booking.status !== "completed";

  return (
    <article className="simple-booking-card">
      <div className="simple-booking-card__body">
        <h3 className="simple-booking-card__name">{booking.client_name}</h3>
        <p className="simple-booking-card__service">{booking.service_title}</p>
        <p className="simple-booking-card__time">{timeRange}</p>
      </div>

      <div className="simple-booking-card__actions">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="simple-btn simple-btn--whatsapp"
        >
          <MessageCircle className="h-5 w-5" strokeWidth={1.75} />
          WhatsApp
        </a>

        {canConfirm ? (
          <button
            type="button"
            onClick={() => onConfirm(booking.id)}
            disabled={isUpdating}
            className={cn(
              "simple-btn simple-btn--confirm",
              isUpdating && "simple-btn--loading",
            )}
          >
            {isUpdating ? (
              <Loader2 className="h-5 w-5 animate-spin" strokeWidth={1.75} />
            ) : (
              <Check className="h-5 w-5" strokeWidth={1.75} />
            )}
            Подтвердить
          </button>
        ) : (
          <span className="simple-btn simple-btn--done" aria-live="polite">
            <Check className="h-5 w-5" strokeWidth={1.75} />
            Подтверждено
          </span>
        )}
      </div>
    </article>
  );
}
