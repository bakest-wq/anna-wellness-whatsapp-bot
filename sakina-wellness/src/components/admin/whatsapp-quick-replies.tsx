"use client";

import { MessageCircle } from "lucide-react";
import Link from "next/link";
import {
  WHATSAPP_QUICK_REPLY_OPTIONS,
  buildWhatsAppQuickReplyUrl,
  type WhatsAppQuickReplyType,
} from "@/lib/admin/whatsapp";
import type { BookingRow } from "@/lib/admin/types";
import { cn } from "@/lib/cn";

type WhatsAppQuickRepliesProps = {
  booking: BookingRow;
  compact?: boolean;
  className?: string;
};

export function WhatsAppQuickReplies({
  booking,
  compact = false,
  className,
}: WhatsAppQuickRepliesProps) {
  return (
    <div
      className={cn(
        compact
          ? "flex min-w-[11rem] flex-col gap-1.5"
          : "grid grid-cols-1 gap-2 sm:grid-cols-2",
        className,
      )}
    >
      {WHATSAPP_QUICK_REPLY_OPTIONS.map((option) => (
        <WhatsAppReplyButton
          key={option.type}
          booking={booking}
          type={option.type}
          label={option.label}
          compact={compact}
        />
      ))}
    </div>
  );
}

function WhatsAppReplyButton({
  booking,
  type,
  label,
  compact,
}: {
  booking: BookingRow;
  type: WhatsAppQuickReplyType;
  label: string;
  compact?: boolean;
}) {
  const href = buildWhatsAppQuickReplyUrl(booking, type);

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "admin-whatsapp-reply inline-flex items-center gap-1.5 rounded-full border border-[#C4A574]/35 bg-[#FFF9F3]/90 text-[#5F735B] transition-colors hover:border-[#B8935A]/50 hover:bg-[#FFF9F3]",
        compact
          ? "min-h-[36px] justify-center px-2.5 py-1.5 text-[11px] leading-tight"
          : "min-h-[40px] justify-center px-3 py-2 text-[12px] font-medium leading-snug sm:text-[13px]",
      )}
    >
      <MessageCircle
        className={cn("shrink-0", compact ? "h-3.5 w-3.5" : "h-4 w-4")}
        strokeWidth={1.5}
      />
      <span className="text-balance">{label}</span>
    </Link>
  );
}
