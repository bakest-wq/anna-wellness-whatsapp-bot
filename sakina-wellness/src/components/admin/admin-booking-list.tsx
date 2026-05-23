"use client";

import { AdminBookingCard } from "@/components/admin/admin-booking-card";
import type { BookingRow, BookingStatus } from "@/lib/admin/types";

type AdminBookingListProps = {
  bookings: BookingRow[];
  updatingId: string | null;
  onStatusChange: (bookingId: string, status: BookingStatus) => void;
  showVisitDate?: boolean;
  emptyTitle: string;
  emptyHint: string;
};

export function AdminBookingList({
  bookings,
  updatingId,
  onStatusChange,
  showVisitDate = true,
  emptyTitle,
  emptyHint,
}: AdminBookingListProps) {
  if (bookings.length === 0) {
    if (!emptyTitle) return null;
    return (
      <div className="admin-empty">
        <p className="admin-empty__title">{emptyTitle}</p>
        <p className="admin-empty__hint">{emptyHint}</p>
      </div>
    );
  }

  return (
    <ul className="admin-booking-list">
      {bookings.map((booking) => (
        <li key={booking.id}>
          <AdminBookingCard
            booking={booking}
            isUpdating={updatingId === booking.id}
            onStatusChange={(status) => onStatusChange(booking.id, status)}
            showVisitDate={showVisitDate}
          />
        </li>
      ))}
    </ul>
  );
}
