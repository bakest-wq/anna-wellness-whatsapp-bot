"use client";

import { Bell, ChevronDown, MessageCircle } from "lucide-react";
import { useMemo, useState } from "react";
import {
  REMINDER_TEMPLATE_OPTIONS,
  buildReminderWhatsAppUrl,
  getRecommendedReminderTemplate,
  type ReminderTemplateType,
} from "@/lib/admin/reminders";
import { isSessionWithinTwoHours } from "@/lib/admin/booking-timing";
import type { BookingRow } from "@/lib/admin/types";
import { cn } from "@/lib/cn";

type BookingRemindButtonProps = {
  booking: BookingRow;
  compact?: boolean;
  className?: string;
};

export function BookingRemindButton({
  booking,
  compact = false,
  className,
}: BookingRemindButtonProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const recommended = useMemo(
    () => getRecommendedReminderTemplate(booking),
    [booking],
  );

  const isCancelled = booking.status === "cancelled";
  const isCompleted = booking.status === "completed";

  if (isCancelled || isCompleted) {
    return null;
  }

  const primaryHref = buildReminderWhatsAppUrl(booking, recommended);

  return (
    <div className={cn("relative", className)}>
      <div className="flex gap-1">
        <a
          href={primaryHref}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "admin-remind-btn inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-[#5F735B]/35 bg-[#9CAA8F]/15 font-semibold text-[#5F735B] transition-colors hover:bg-[#9CAA8F]/25",
            compact
              ? "min-h-[36px] px-3 text-[11px]"
              : "min-h-[40px] px-4 text-[13px]",
          )}
        >
          <Bell className={cn("shrink-0", compact ? "h-3.5 w-3.5" : "h-4 w-4")} strokeWidth={1.5} />
          Напомнить
        </a>
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-label="Выбрать шаблон напоминания"
          className={cn(
            "inline-flex items-center justify-center rounded-full border border-[#5F735B]/35 bg-[#9CAA8F]/15 text-[#5F735B] transition-colors hover:bg-[#9CAA8F]/25",
            compact ? "h-9 w-9" : "h-10 w-10",
          )}
        >
          <ChevronDown
            className={cn("h-4 w-4 transition-transform", menuOpen && "rotate-180")}
            strokeWidth={1.5}
          />
        </button>
      </div>

      {menuOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-30 cursor-default"
            aria-label="Закрыть меню"
            onClick={() => setMenuOpen(false)}
          />
          <ul
            className="absolute right-0 z-40 mt-2 min-w-[min(100%,14rem)] overflow-hidden rounded-xl border border-[#EDE4D4]/90 bg-[#FFF9F3] py-1 shadow-[0_12px_32px_-12px_rgba(61,56,48,0.18)]"
            role="menu"
          >
            {REMINDER_TEMPLATE_OPTIONS.map((option) => (
              <li key={option.type} role="none">
                <ReminderMenuLink
                  booking={booking}
                  type={option.type}
                  label={option.label}
                  isRecommended={option.type === recommended}
                  isHighlighted={
                    option.type === "two_hours_before" &&
                    isSessionWithinTwoHours(booking)
                  }
                  onSelect={() => setMenuOpen(false)}
                />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function ReminderMenuLink({
  booking,
  type,
  label,
  isRecommended,
  isHighlighted,
  onSelect,
}: {
  booking: BookingRow;
  type: ReminderTemplateType;
  label: string;
  isRecommended?: boolean;
  isHighlighted?: boolean;
  onSelect: () => void;
}) {
  const href = buildReminderWhatsAppUrl(booking, type);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      role="menuitem"
      onClick={onSelect}
      className={cn(
        "flex items-start gap-2 px-3 py-2.5 text-[12px] leading-snug text-[#3D3830] transition-colors hover:bg-[#EDE4D4]/45",
        (isRecommended || isHighlighted) && "bg-[#9CAA8F]/10",
      )}
    >
      <MessageCircle
        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#5F735B]"
        strokeWidth={1.5}
      />
      <span>
        {label}
        {isRecommended && (
          <span className="text-soft mt-0.5 block text-[10px] font-normal">
            Рекомендуем
          </span>
        )}
      </span>
    </a>
  );
}
