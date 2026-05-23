"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { TESTIMONIALS } from "@/lib/testimonials";
import { FadeUp, staggerContainer, easeLuxury } from "./motion";

export function TestimonialsSection() {
  return (
    <section className="luxury-section relative z-10 px-5 py-20 sm:px-6 sm:py-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#9CAA8F]/05 to-transparent" />

      <div className="relative mx-auto max-w-lg md:max-w-2xl">
        <FadeUp>
          <p className="text-gold text-center text-[11px] font-semibold uppercase tracking-[0.34em]">
            Отзывы
          </p>
          <h2 className="font-display text-heading mt-5 text-balance text-center text-[2rem] font-normal leading-[1.12] sm:text-[2.35rem]">
            Что чувствуют женщины после практик
          </h2>
          <p className="text-muted mx-auto mt-6 max-w-[19rem] text-center text-[16px] font-light leading-[1.8]">
            Тихие слова о том, что остаётся внутри — после тепла, тишины и
            заботы Sakina Wellness.
          </p>
        </FadeUp>

        <motion.ul
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-5% 0px" }}
          className="mt-14 flex flex-col gap-6"
        >
          {TESTIMONIALS.map((item, index) => (
            <motion.li
              key={item.id}
              variants={{
                hidden: { opacity: 0, y: 22 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.8,
                    delay: index * 0.07,
                    ease: easeLuxury,
                  },
                },
              }}
              className="relative pt-1"
            >
              <div
                className="absolute inset-x-3 top-3 bottom-0 rounded-[1.65rem] bg-[#EDE4D4]/55 shadow-[0_10px_28px_-14px_rgba(61,56,48,0.06)]"
                aria-hidden
              />

              <article className="glass-panel luxury-interactive relative rounded-[1.65rem] px-6 py-7 sm:px-8 sm:py-8">
                <Quote
                  className="text-gold/35 absolute left-6 top-6 h-8 w-8 sm:left-8"
                  strokeWidth={1}
                  aria-hidden
                />

                <div className="relative pl-2 pt-6 sm:pl-4">
                  <span className="inline-block rounded-full border border-[#C4A574]/25 bg-[#FFF9F3]/80 px-3.5 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-[#5F735B]">
                    {item.feeling}
                  </span>

                  <blockquote className="font-display text-heading mt-5 text-[1.2rem] font-normal italic leading-[1.55] sm:text-[1.3rem]">
                    «{item.quote}»
                  </blockquote>

                  <footer className="text-muted mt-6 text-[14px] font-light tracking-wide">
                    — {item.name}
                  </footer>
                </div>
              </article>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
