"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { SITE_BYLINE, SITE_TITLE } from "@/lib/brand";
import { useRef } from "react";
import { easeLuxury } from "./motion";
import { useLuxuryMotion } from "./luxury-motion-context";

export function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const { enableParallax, reducedMotion } = useLuxuryMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);
  const copyY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0.15]);
  const scrimOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.88]);

  return (
    <section
      ref={ref}
      className="hero-cinematic luxury-section relative min-h-[100svh] min-h-[100dvh] w-full overflow-hidden"
    >
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={
          enableParallax && !reducedMotion
            ? { y: imageY, scale: imageScale }
            : undefined
        }
      >
        <Image
          src="/images/anna.jpg"
          alt="Anna Abdulrashidovna — Sakina Wellness"
          fill
          priority
          sizes="100vw"
          className="hero-portrait-image"
        />
      </motion.div>

      <motion.div
        className="hero-gradient-left pointer-events-none absolute inset-0"
        style={
          enableParallax && !reducedMotion
            ? { opacity: scrimOpacity }
            : undefined
        }
        aria-hidden
      />

      <div className="relative z-10 flex min-h-[100svh] min-h-[100dvh] flex-col justify-center px-7 pb-[calc(2rem+env(safe-area-inset-bottom,0px))] pl-8 pr-6 pt-[calc(4.75rem+env(safe-area-inset-top,0px))] sm:px-12 sm:pb-20 sm:pt-28">
        <motion.div
          className="hero-copy-backdrop max-w-[min(16.75rem,52vw)] sm:max-w-md"
          style={
            enableParallax && !reducedMotion
              ? { y: copyY, opacity: copyOpacity }
              : undefined
          }
        >
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.15, ease: easeLuxury }}
          >
            <h1 className="hero-title-luxury font-display text-[clamp(2.5rem,11vw,3.25rem)] font-normal leading-[1.02] tracking-[-0.03em] sm:text-[clamp(3.1rem,5.5vw,3.85rem)] sm:leading-[0.94]">
              {SITE_TITLE}
            </h1>

            <div className="hero-accent-line mt-5 sm:mt-6" aria-hidden />

            <p className="font-script hero-byline-luxury mt-5 text-[1.48rem] leading-[1.32] sm:mt-6 sm:text-[2.1rem] sm:leading-none">
              {SITE_BYLINE}
            </p>
          </motion.div>

          <motion.p
            initial={reducedMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: easeLuxury }}
            className="hero-subtitle-luxury mt-8 max-w-[15.75rem] text-[14px] font-light leading-[1.85] tracking-[0.02em] sm:mt-9 sm:max-w-sm sm:text-[17px] sm:leading-[1.78]"
          >
            Пространство женского восстановления — тихая роскошь и забота о теле.
          </motion.p>
        </motion.div>
      </div>

      <motion.div
        aria-hidden
        className="hero-scroll-cue pointer-events-none absolute inset-x-0 bottom-[max(1.25rem,env(safe-area-inset-bottom))] flex justify-center"
        initial={reducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.9, ease: easeLuxury }}
        style={
          enableParallax && !reducedMotion
            ? { opacity: copyOpacity }
            : undefined
        }
      >
        <span className="hero-scroll-cue__line" />
      </motion.div>
    </section>
  );
}
