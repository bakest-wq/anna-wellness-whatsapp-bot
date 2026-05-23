"use client";

import { useMemo } from "react";
import { AnalyticsCards } from "@/components/admin/analytics-cards";
import { StatusSelect } from "@/components/admin/status-select";
import { WhatsAppQuickReplies } from "@/components/admin/whatsapp-quick-replies";
import { groupBookingsByDate } from "@/lib/admin/group-bookings";
import type { BookingAnalytics, BookingRow, BookingStatus } from "@/lib/admin/types";
import { cn } from "@/lib/cn";

type BookingsManagerProps = {
  bookings: BookingRow[];
  analytics: BookingAnalytics;
  updatingId: string | null;
  statusError: string | null;
  onStatusChange: (bookingId: string, status: BookingStatus) => void;
};

function formatCreatedAt(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function BookingsManager({
  bookings,
  analytics,
  updatingId,
  statusError,
  onStatusChange,
}: BookingsManagerProps) {
  const dateGroups = useMemo(() => groupBookingsByDate(bookings), [bookings]);

  if (bookings.length === 0) {
    return (
      <>
        <AnalyticsCards analytics={analytics} />
        <div className="admin-panel mt-8 rounded-[1.5rem] px-6 py-14 text-center">
          <p className="font-display text-[1.35rem] text-[#3D3830]">
            Записей пока нет
          </p>
          <p className="text-muted mt-3 text-[15px] font-light">
            Новые заявки с сайта появятся здесь автоматически.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <AnalyticsCards analytics={analytics} />

      {statusError && (
        <p
          className="booking-alert mt-6 text-[14px] leading-relaxed text-[#6B4A38]"
          role="alert"
        >
          {statusError}
        </p>
      )}

      <div className="mt-8 space-y-8">
        {dateGroups.map((group) => (
          <section key={group.date} className="admin-date-group">
            <DateGroupHeader
              label={group.label}
              isToday={group.isToday}
              count={group.bookings.length}
            />

            <ul className="mt-4 flex flex-col gap-3 md:hidden">
              {group.bookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  highlightToday={group.isToday}
                  isUpdating={updatingId === booking.id}
                  onStatusChange={(status) =>
                    onStatusChange(booking.id, status)
                  }
                />
              ))}
            </ul>

            <div className="admin-panel mt-4 hidden overflow-hidden rounded-[1.5rem] md:block">
              <div className="overflow-x-auto">
                <table className="admin-table w-full min-w-[960px]">
                  <thead>
                    <tr>
                      <th>Клиент</th>
                      <th>Практика</th>
                      <th>Время</th>
                      <th>Статус</th>
                      <th>Создана</th>
                      <th>WhatsApp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.bookings.map((booking) => (
                      <tr
                        key={booking.id}
                        className={cn(
                          group.isToday && "admin-table-row--today",
                        )}
                      >
                        <td>
                          <p className="font-medium text-[#3D3830]">
                            {booking.client_name}
                          </p>
                          <p className="text-soft mt-0.5 text-[12px]">
                            {booking.phone}
                          </p>
                        </td>
                        <td>
                          <p className="text-[14px] text-[#3D3830]">
                            {booking.service_title}
                          </p>
                          {booking.package_name && (
                            <p className="text-gold mt-0.5 text-[12px]">
                              {booking.package_name}
                            </p>
                          )}
                        </td>
                        <td className="text-[14px] font-medium text-[#3D3830]">
                          {booking.preferred_time}
                        </td>
                        <td>
                          <StatusSelect
                            value={booking.status}
                            isUpdating={updatingId === booking.id}
                            onChange={(status) =>
                              onStatusChange(booking.id, status)
                            }
                          />
                        </td>
                        <td className="text-soft text-[13px]">
                          {formatCreatedAt(booking.created_at)}
                        </td>
                        <td>
                          <WhatsAppQuickReplies booking={booking} compact />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        ))}
      </div>
    </>
  );
}

function DateGroupHeader({
  label,
  isToday,
  count,
}: {
  label: string;
  isToday: boolean;
  count: number;
}) {
  return (
    <div
      className={cn(
        "admin-date-group-header flex flex-wrap items-end justify-between gap-3 rounded-[1.25rem] border px-4 py-3.5 sm:px-5",
        isToday
          ? "admin-date-group-header--today border-[#C4A574]/45 bg-[#FFF9F3]"
          : "border-[#EDE4D4]/90 bg-[#FFF9F3]/60",
      )}
    >
      <div>
        {isToday && (
          <p className="text-gold mb-1 text-[10px] font-semibold uppercase tracking-[0.2em]">
            Сегодня
          </p>
        )}
        <h3 className="font-display text-[1.25rem] text-[#3D3830] sm:text-[1.35rem]">
          {label}
        </h3>
      </div>
      <p className="text-soft text-[12px] uppercase tracking-[0.14em]">
        {count}{" "}
        {count === 1 ? "запись" : count < 5 ? "записи" : "записей"}
      </p>
    </div>
  );
}

function BookingCard({
  booking,
  highlightToday = false,
  isUpdating,
  onStatusChange,
}: {
  booking: BookingRow;
  highlightToday?: boolean;
  isUpdating: boolean;
  onStatusChange: (status: BookingStatus) => void;
}) {
  return (
    <li
      className={cn(
        "admin-panel rounded-[1.35rem] p-4",
        highlightToday && "admin-booking-card--today",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-[1.2rem] text-[#3D3830]">
            {booking.client_name}
          </p>
          <p className="text-soft mt-0.5 text-[13px]">{booking.phone}</p>
        </div>
        <p className="text-gold shrink-0 text-[15px] font-medium">
          {booking.preferred_time}
        </p>
      </div>

      <div className="mt-4">
        <StatusSelect
          value={booking.status}
          isUpdating={isUpdating}
          onChange={onStatusChange}
        />
      </div>

      <dl className="mt-4 space-y-2.5 text-[14px]">
        <div className="flex justify-between gap-3 border-b border-[#EDE4D4]/70 pb-2">
          <dt className="text-soft text-[11px] uppercase tracking-[0.14em]">
            Практика
          </dt>
          <dd className="text-right font-medium text-[#3D3830]">
            {booking.service_title}
          </dd>
        </div>
        {booking.package_name && (
          <div className="flex justify-between gap-3 border-b border-[#EDE4D4]/70 pb-2">
            <dt className="text-soft text-[11px] uppercase tracking-[0.14em]">
              Пакет
            </dt>
            <dd className="text-gold text-right text-[13px]">
              {booking.package_name}
            </dd>
          </div>
        )}
        <div className="flex justify-between gap-3">
          <dt className="text-soft text-[11px] uppercase tracking-[0.14em]">
            Создана
          </dt>
          <dd className="text-soft text-right text-[13px]">
            {formatCreatedAt(booking.created_at)}
          </dd>
        </div>
      </dl>

      <div className="mt-5 border-t border-[#EDE4D4]/80 pt-4">
        <p className="text-soft mb-3 text-[10px] font-semibold uppercase tracking-[0.18em]">
          WhatsApp
        </p>
        <WhatsAppQuickReplies booking={booking} />
      </div>
    </li>
  );
}
