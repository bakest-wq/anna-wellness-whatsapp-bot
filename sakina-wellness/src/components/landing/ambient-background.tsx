"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useLuxuryMotion } from "./luxury-motion-context";

const floatTransition = (duration: number, delay = 0) => ({
  duration,
  delay,
  repeat: Infinity,
  repeatType: "reverse" as const,
  ease: "easeInOut" as const,
});

export function AmbientBackground() {
  const { reducedMotion, enableParallax } = useLuxuryMotion();
  const { scrollY } = useScroll();
  const orbAY = useTransform(scrollY, [0, 1200], [0, -48]);
  const orbBY = useTransform(scrollY, [0, 1200], [0, 36]);
  const veilOpacity = useTransform(scrollY, [0, 600], [0.35, 0.55]);

  const animateOrbs = !reducedMotion;

  return (
    <div
      className="ambient-root pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0 bg-[#FAF7F2]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#FFF9F3] via-[#FAF7F2] to-[#EDE4D4]/40" />

      <motion.div
        className="ambient-orb ambient-orb--a absolute -left-[10%] top-[15%] h-[min(360px,80vw)] w-[min(360px,80vw)] rounded-full bg-[radial-gradient(circle,rgba(220,201,163,0.35)_0%,transparent_70%)] blur-3xl"
        style={enableParallax ? { y: orbAY } : undefined}
        animate={
          animateOrbs ? { x: [0, 14, 0], y: [0, 10, 0] } : undefined
        }
        transition={animateOrbs ? floatTransition(20) : undefined}
      />
      <motion.div
        className="ambient-orb ambient-orb--b absolute -right-[8%] top-[45%] h-[min(300px,70vw)] w-[min(300px,70vw)] rounded-full bg-[radial-gradient(circle,rgba(237,228,212,0.5)_0%,transparent_68%)] blur-3xl"
        style={enableParallax ? { y: orbBY } : undefined}
        animate={
          animateOrbs ? { x: [0, -10, 0], y: [0, 14, 0] } : undefined
        }
        transition={animateOrbs ? floatTransition(22, 1.2) : undefined}
      />

      <motion.div
        className="ambient-veil pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_0%,rgba(255,249,243,0.5),transparent_62%)]"
        style={enableParallax ? { opacity: veilOpacity } : { opacity: 0.4 }}
      />

      <div className="grain-overlay absolute inset-0" />
    </div>
  );
}
