import { CalendarCheck, CheckCircle2, Sparkles, TrendingUp } from "lucide-react";
import type { BookingAnalytics } from "@/lib/admin/types";

type AnalyticsCardsProps = {
  analytics: BookingAnalytics;
};

const cards = [
  {
    key: "total",
    label: "Всего записей",
    icon: TrendingUp,
    getValue: (a: BookingAnalytics) => String(a.total),
  },
  {
    key: "new",
    label: "Новые",
    icon: Sparkles,
    getValue: (a: BookingAnalytics) => String(a.newCount),
  },
  {
    key: "confirmed",
    label: "Подтверждённые",
    icon: CheckCircle2,
    getValue: (a: BookingAnalytics) => String(a.confirmedCount),
  },
  {
    key: "popular",
    label: "Популярная практика",
    icon: CalendarCheck,
    getValue: (a: BookingAnalytics) => a.popularService ?? "—",
  },
] as const;

export function AnalyticsCards({ analytics }: AnalyticsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const value = card.getValue(analytics);

        return (
          <article
            key={card.key}
            className="admin-stat-card flex flex-col gap-3 p-4 sm:p-5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#9CAA8F]/15 text-[#5F735B]">
              <Icon className="h-4 w-4" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-soft text-[10px] font-semibold uppercase tracking-[0.2em] sm:text-[11px]">
                {card.label}
              </p>
              <p
                className={
                  card.key === "popular"
                    ? "font-display mt-1.5 text-[1rem] leading-snug text-[#3D3830] sm:text-[1.05rem]"
                    : "font-display mt-1.5 text-[1.75rem] font-normal leading-none text-[#3D3830] sm:text-[2rem]"
                }
              >
                {value}
              </p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
