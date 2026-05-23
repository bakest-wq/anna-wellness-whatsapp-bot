"use client";

import { Calendar, CalendarClock, Sparkles } from "lucide-react";
import { getSectionCounts } from "@/lib/admin/simple-sections";
import type { BookingRow } from "@/lib/admin/types";
import { cn } from "@/lib/cn";

type AdminStatsRowProps = {
  bookings: BookingRow[];
  className?: string;
};

const STAT_ITEMS = [
  {
    key: "today" as const,
    label: "Сегодня",
    icon: Calendar,
  },
  {
    key: "tomorrow" as const,
    label: "Завтра",
    icon: CalendarClock,
  },
  {
    key: "new" as const,
    label: "Новые заявки",
    icon: Sparkles,
  },
];

export function AdminStatsRow({ bookings, className }: AdminStatsRowProps) {
  const counts = getSectionCounts(bookings);

  return (
    <div
      className={cn(
        "admin-stats-row grid grid-cols-3 gap-2 sm:gap-3",
        className,
      )}
    >
      {STAT_ITEMS.map((item) => {
        const Icon = item.icon;
        const value = counts[item.key];

        return (
          <article
            key={item.key}
            className="admin-stat-mini rounded-[1.1rem] border border-[#EDE4D4]/90 bg-[#FFF9F3]/75 px-3 py-3 sm:px-3.5 sm:py-3.5"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#9CAA8F]/14 text-[#5F735B]">
                <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
              </span>
              <div className="min-w-0">
                <p className="text-soft truncate text-[9px] font-semibold uppercase tracking-[0.14em] sm:text-[10px]">
                  {item.label}
                </p>
                <p className="font-display text-[1.35rem] leading-none text-[#3D3830] sm:text-[1.5rem]">
                  {value}
                </p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
