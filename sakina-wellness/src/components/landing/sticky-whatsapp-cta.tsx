"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { useBooking } from "./booking-context";

export function StickyWhatsAppCta() {
  const { bookingUrl, selectionLabel, selectedPackageName, conciergeUrl } =
    useBooking();
  const href = selectionLabel ? bookingUrl : conciergeUrl;
  const label = selectionLabel
    ? "Подтвердить в WhatsApp"
    : "🌿 Подобрать практику";

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 md:hidden">
      <div className="pointer-events-none h-14 bg-gradient-to-t from-[#FAF7F2]/90 via-[#FAF7F2]/50 to-transparent" />
      <div className="safe-bottom pointer-events-auto px-4 pb-1.5">
        <motion.a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          whileTap={{ scale: 0.99 }}
          className="luxury-cta btn-gold flex min-h-[50px] w-full flex-col items-center justify-center gap-0.5 rounded-[1.15rem] px-4"
        >
          <span className="flex items-center gap-2 text-[14px] font-semibold tracking-[0.02em]">
            <MessageCircle className="h-5 w-5 shrink-0" strokeWidth={1.75} />
            {label}
          </span>
          {selectionLabel && (
            <span className="max-w-full truncate text-[11px] font-medium text-white/90">
              {selectedPackageName ? `Пакет · ${selectionLabel}` : selectionLabel}
            </span>
          )}
        </motion.a>
      </div>
    </div>
  );
}
