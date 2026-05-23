"use client";

import type { AdminTab } from "@/lib/admin/dashboard-tabs";
import { cn } from "@/lib/cn";

export type { AdminTab };

const TABS: { id: AdminTab; label: string }[] = [
  { id: "today", label: "Сегодня" },
  { id: "tomorrow", label: "Завтра" },
  { id: "calendar", label: "Календарь" },
  { id: "clients", label: "Клиенты" },
];

type AdminTabsProps = {
  active: AdminTab;
  counts: Partial<Record<AdminTab, number>>;
  onChange: (tab: AdminTab) => void;
};

export function AdminTabs({ active, counts, onChange }: AdminTabsProps) {
  return (
    <div
      className="admin-tabs -mx-1 flex gap-1 overflow-x-auto px-1 pb-0.5 scrollbar-none"
      role="tablist"
      aria-label="Разделы панели"
    >
      {TABS.map((tab) => {
        const count = counts[tab.id];
        const isActive = active === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              "admin-tab shrink-0 rounded-full px-3.5 py-2.5 text-[12px] font-semibold transition-all sm:px-4 sm:text-[13px]",
              isActive
                ? "bg-[#5F735B] text-[#FFF9F3] shadow-[0_4px_14px_-6px_rgba(95,115,91,0.45)]"
                : "bg-[#FFF9F3]/60 text-[#7A7368] ring-1 ring-[#EDE4D4]/90 hover:bg-[#EDE4D4]/40",
            )}
          >
            {tab.label}
            {count !== undefined && count > 0 && tab.id !== "calendar" && (
              <span
                className={cn(
                  "ml-1.5 inline-flex min-w-[1.1rem] justify-center rounded-full px-1 py-0.5 text-[10px] font-bold",
                  isActive
                    ? "bg-[#FFF9F3]/25 text-[#FFF9F3]"
                    : "bg-[#C4A574]/22 text-[#7A5E32]",
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
