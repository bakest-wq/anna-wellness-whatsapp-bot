"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { useBooking } from "@/components/landing/booking-context";
import { easeLuxury } from "@/components/landing/motion";
import { useLuxuryMotion } from "@/components/landing/luxury-motion-context";
import { cn } from "@/lib/cn";

export function FloatingWhatsApp() {
  const { bookingUrl } = useBooking();
  const { reducedMotion } = useLuxuryMotion();

  return (
    <motion.a
      href={bookingUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Написать в WhatsApp"
      initial={reducedMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.4, duration: 0.7, ease: easeLuxury }}
      whileTap={{ scale: 0.96 }}
      className={cn(
        "sanctuary-whatsapp fixed z-50 flex items-center gap-2 rounded-full",
        "right-[max(1rem,env(safe-area-inset-right))]",
        "bottom-[max(1.25rem,env(safe-area-inset-bottom))]",
        "md:bottom-[max(1.5rem,env(safe-area-inset-bottom))]",
      )}
    >
      <span className="sanctuary-whatsapp__pulse" aria-hidden />
      <MessageCircle className="relative h-5 w-5 shrink-0" strokeWidth={1.75} />
      <span className="relative hidden text-[13px] font-semibold tracking-wide sm:inline">
        WhatsApp
      </span>
    </motion.a>
  );
}
