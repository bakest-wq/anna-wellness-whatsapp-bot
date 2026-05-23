"use client";

import { CalendarClock } from "lucide-react";
import { BookingRemindButton } from "@/components/admin/booking-remind-button";
import { BookingTimingBadge } from "@/components/admin/booking-timing-badge";
import { StatusBadge } from "@/components/admin/status-badge";
import { getBookingTimeRange } from "@/lib/admin/schedule-utils";
import {
  getActiveBookingsForDates,
  getTomorrowDateString,
} from "@/lib/admin/booking-timing";
import { getTodayDateString } from "@/lib/admin/group-bookings";
import { formatBookingDate } from "@/lib/booking-flow";
import type { BookingRow } from "@/lib/admin/types";
import { cn } from "@/lib/cn";

type ScheduleUpcomingPanelProps = {
  bookings: BookingRow[];
};

export function ScheduleUpcomingPanel({ bookings }: ScheduleUpcomingPanelProps) {
  const today = getTodayDateString();
  const tomorrow = getTomorrowDateString();

  const todayBookings = getActiveBookingsForDates(bookings, [today]);
  const tomorrowBookings = getActiveBookingsForDates(bookings, [tomorrow]);

  if (todayBookings.length === 0 && tomorrowBookings.length === 0) {
    return (
      <div className="admin-panel rounded-[1.35rem] px-5 py-8 text-center">
        <CalendarClock
          className="mx-auto h-9 w-9 text-[#9CAA8F]"
          strokeWidth={1.25}
        />
        <p className="font-display mt-3 text-[1.15rem] text-[#3D3830]">
          На сегодня и завтра записей нет
        </p>
        <p className="text-muted mt-2 text-[14px] font-light">
          Свободные интервалы видны в расписании ниже
        </p>
      </div>
    );
  }

  return (
    <div className="admin-upcoming-panel admin-panel rounded-[1.5rem] p-4 sm:p-5">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#C4A574]/15 text-[#B8935A]">
          <CalendarClock className="h-5 w-5" strokeWidth={1.25} />
        </div>
        <div>
          <h2 className="font-display text-[1.25rem] text-[#3D3830] sm:text-[1.35rem]">
            Ближайшие записи
          </h2>
          <p className="text-muted mt-1 text-[13px] font-light">
            Сегодня и завтра — быстрое напоминание в WhatsApp
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <UpcomingDayColumn
          title="Сегодня"
          subtitle={formatBookingDate(today)}
          bookings={todayBookings}
          highlight="today"
        />
        <UpcomingDayColumn
          title="Завтра"
          subtitle={formatBookingDate(tomorrow)}
          bookings={tomorrowBookings}
          highlight="tomorrow"
        />
      </div>
    </div>
  );
}

function UpcomingDayColumn({
  title,
  subtitle,
  bookings,
  highlight,
}: {
  title: string;
  subtitle: string;
  bookings: BookingRow[];
  highlight: "today" | "tomorrow";
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-3.5 sm:p-4",
        highlight === "today"
          ? "border-[#C4A574]/40 bg-[#FFF9F3]"
          : "border-[#9CAA8F]/35 bg-[#FFF9F3]/80",
      )}
    >
      <div className="mb-3 border-b border-[#EDE4D4]/70 pb-2">
        <p className="text-gold text-[10px] font-semibold uppercase tracking-[0.2em]">
          {title}
        </p>
        <p className="font-display mt-0.5 text-[1.05rem] text-[#3D3830]">
          {subtitle}
        </p>
        <p className="text-soft mt-0.5 text-[12px]">
          {bookings.length}{" "}
          {bookings.length === 1 ? "запись" : "записей"}
        </p>
      </div>

      {bookings.length === 0 ? (
        <p className="text-soft py-4 text-center text-[13px] italic">
          Нет активных записей
        </p>
      ) : (
        <ul className="space-y-2.5">
          {bookings.map((booking) => (
            <UpcomingBookingRow key={booking.id} booking={booking} />
          ))}
        </ul>
      )}
    </div>
  );
}

function UpcomingBookingRow({ booking }: { booking: BookingRow }) {
  const timeRange = getBookingTimeRange(booking);

  return (
    <li className="rounded-lg border border-[#EDE4D4]/80 bg-[#FFF9F3]/90 px-3 py-2.5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-medium text-[#3D3830]">
            {booking.client_name}
          </p>
          <p className="text-soft truncate text-[12px]">
            {booking.service_title}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-gold text-[12px] font-semibold">{timeRange}</p>
          <div className="mt-1 flex flex-wrap justify-end gap-1">
            <BookingTimingBadge booking={booking} />
            <StatusBadge status={booking.status} className="!text-[9px]" />
          </div>
        </div>
      </div>
      <div className="mt-2.5">
        <BookingRemindButton booking={booking} compact />
      </div>
    </li>
  );
}
