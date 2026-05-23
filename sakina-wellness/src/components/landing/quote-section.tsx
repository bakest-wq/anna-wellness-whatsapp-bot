"use client";

import { motion } from "framer-motion";
import { FadeUp, LuxuryInteractive } from "./motion";
import { useLuxuryMotion } from "./luxury-motion-context";

export function QuoteSection() {
  const { reducedMotion } = useLuxuryMotion();

  return (
    <section className="luxury-section relative z-10 px-5 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-lg md:max-w-2xl">
        <FadeUp>
          <LuxuryInteractive
            as="article"
            className="glass-panel relative overflow-hidden rounded-[1.75rem] px-7 py-10 text-center sm:px-10"
          >
          <motion.blockquote
            initial={reducedMotion ? false : { opacity: 0.94, scale: 0.99 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-8% 0px" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(220,201,163,0.35),transparent_70%)] blur-2xl" />
            <p className="font-display text-[1.5rem] font-light italic leading-[1.45] text-[#3D3830] sm:text-[1.75rem]">
              «Восстановление начинается там, где тело чувствует себя в
              безопасности»
            </p>
            <footer className="text-gold mt-6 text-[12px] font-medium uppercase tracking-[0.25em]">
              Sakina Wellness
            </footer>
          </motion.blockquote>
          </LuxuryInteractive>
        </FadeUp>
      </div>
    </section>
  );
}
