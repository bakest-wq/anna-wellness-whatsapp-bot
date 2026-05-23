"use client";

import { useMemo, useState } from "react";
import { AdminBookingCard } from "@/components/admin/admin-booking-card";
import {
  SCHEDULE_WINDOWS,
  getBookingsForWindow,
  getFreeSlotsForWindow,
  getScheduleDays,
  type ScheduleFilter,
} from "@/lib/admin/schedule-utils";
import type { BookingRow, BookingStatus } from "@/lib/admin/types";
import { cn } from "@/lib/cn";

const SCHEDULE_FILTERS: { id: ScheduleFilter; label: string }[] = [
  { id: "today", label: "Сегодня и завтра" },
  { id: "week", label: "Неделя" },
  { id: "all", label: "Все даты" },
];

type ScheduleViewProps = {
  bookings: BookingRow[];
  updatingId: string | null;
  statusError: string | null;
  onStatusChange: (bookingId: string, status: BookingStatus) => void;
};

export function ScheduleView({
  bookings,
  updatingId,
  statusError,
  onStatusChange,
}: ScheduleViewProps) {
  const [filter, setFilter] = useState<ScheduleFilter>("week");

  const days = useMemo(
    () => getScheduleDays(filter, bookings),
    [filter, bookings],
  );

  return (
    <div className="admin-schedule">
      <p className="text-muted text-[14px] font-light leading-relaxed">
        Расписание по дням и рабочим интервалам. Ниже — занятость и свободные
        слоты.
      </p>

      <div
        className="mt-4 flex flex-wrap gap-1.5 rounded-full border border-[#EDE4D4]/90 bg-[#FFF9F3]/60 p-1"
        role="group"
        aria-label="Период календаря"
      >
        {SCHEDULE_FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={cn(
              "rounded-full px-3 py-2 text-[12px] font-semibold transition-all",
              filter === item.id
                ? "bg-[#C4A574]/25 text-[#5F4A32] ring-1 ring-[#C4A574]/35"
                : "text-[#7A7368] hover:bg-[#EDE4D4]/50",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {statusError && (
        <p className="admin-alert mt-5" role="alert">
          {statusError}
        </p>
      )}

      {days.length === 0 && filter === "all" && (
        <div className="admin-empty mt-8">
          <p className="admin-empty__title">Записей пока нет</p>
          <p className="admin-empty__hint">
            Когда появятся заявки, они отобразятся по датам.
          </p>
        </div>
      )}

      <div className="mt-6 space-y-6">
        {days.map((day) => (
          <section
            key={day.date}
            className={cn(
              "admin-schedule-day rounded-[1.35rem] border p-4",
              day.isToday && "admin-schedule-day--today border-[#C4A574]/45 bg-[#FFF9F3]",
              day.isTomorrow &&
                !day.isToday &&
                "admin-schedule-day--tomorrow border-[#9CAA8F]/40 bg-[#FFF9F3]/90",
              !day.isToday &&
                !day.isTomorrow &&
                "border-[#EDE4D4]/90 bg-[#FFF9F3]/50",
            )}
          >
            <header className="mb-4 flex flex-wrap items-end justify-between gap-2 border-b border-[#EDE4D4]/75 pb-3">
              <div>
                {day.isToday && (
                  <p className="text-gold text-[10px] font-semibold uppercase tracking-[0.18em]">
                    Сегодня
                  </p>
                )}
                {day.isTomorrow && !day.isToday && (
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5F735B]">
                    Завтра
                  </p>
                )}
                <h3 className="font-display text-[1.2rem] text-[#3D3830]">
                  {day.label}
                </h3>
              </div>
              <p className="text-soft text-[11px]">
                {day.bookings.length}{" "}
                {day.bookings.length === 1 ? "запись" : "записей"}
              </p>
            </header>

            <div className="space-y-4">
              {SCHEDULE_WINDOWS.map((window) => (
                <ScheduleWindowBlock
                  key={`${day.date}-${window.id}`}
                  window={window}
                  dayBookings={day.bookings}
                  updatingId={updatingId}
                  onStatusChange={onStatusChange}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function ScheduleWindowBlock({
  window,
  dayBookings,
  updatingId,
  onStatusChange,
}: {
  window: (typeof SCHEDULE_WINDOWS)[number];
  dayBookings: BookingRow[];
  updatingId: string | null;
  onStatusChange: (bookingId: string, status: BookingStatus) => void;
}) {
  const windowBookings = getBookingsForWindow(dayBookings, window);
  const freeSlots = getFreeSlotsForWindow(dayBookings, window);
  const activeCount = windowBookings.filter(
    (b) => b.status !== "cancelled",
  ).length;

  return (
    <div className="rounded-xl border border-[#EDE4D4]/80 bg-[#FFF9F3]/40 p-3.5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-soft text-[10px] font-semibold uppercase tracking-[0.14em]">
            {window.label} · {window.range}
          </p>
        </div>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
            activeCount > 0
              ? "bg-[#9CAA8F]/18 text-[#5F735B]"
              : "bg-[#EDE4D4]/50 text-[#9A9288]",
          )}
        >
          {activeCount > 0 ? `${activeCount} занято` : "Свободно"}
        </span>
      </div>

      {windowBookings.length > 0 ? (
        <ul className="space-y-3">
          {windowBookings.map((booking) => (
            <li key={booking.id}>
              <AdminBookingCard
                booking={booking}
                isUpdating={updatingId === booking.id}
                onStatusChange={(status) => onStatusChange(booking.id, status)}
                showVisitDate={false}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-soft py-1 text-[13px] italic">Нет записей</p>
      )}

      <div className="mt-3 border-t border-[#EDE4D4]/65 pt-2.5">
        <p className="text-soft mb-1.5 text-[10px] uppercase tracking-[0.12em]">
          Свободно
        </p>
        {freeSlots.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {freeSlots.map((slot) => (
              <span
                key={slot}
                className="admin-schedule-free-slot inline-flex rounded-md border border-[#9CAA8F]/30 bg-[#9CAA8F]/10 px-2 py-0.5 text-[11px] font-medium text-[#5F735B]"
              >
                {slot}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-[#9A9288]">—</p>
        )}
      </div>
    </div>
  );
}
