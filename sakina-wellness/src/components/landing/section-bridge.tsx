"use client";

import { motion } from "framer-motion";
import { easeLuxury } from "./motion";
import { useLuxuryMotion } from "./luxury-motion-context";
import { cn } from "@/lib/cn";

type SectionBridgeProps = {
  tone?: "warm" | "calm" | "olive";
  className?: string;
};

export function SectionBridge({
  tone = "warm",
  className,
}: SectionBridgeProps) {
  const { reducedMotion } = useLuxuryMotion();

  return (
    <div
      aria-hidden
      className={cn("section-bridge", `section-bridge--${tone}`, className)}
    >
      <motion.div
        className="section-bridge__glow"
        initial={reducedMotion ? false : { opacity: 0, scale: 0.92 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-20% 0px" }}
        transition={{ duration: 1.1, ease: easeLuxury }}
      />
      <motion.span
        className="section-bridge__line"
        initial={reducedMotion ? false : { scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-15% 0px" }}
        transition={{ duration: 1.25, ease: easeLuxury, delay: 0.08 }}
      />
    </div>
  );
}
