"use client";

import { motion } from "framer-motion";
import { FadeUp } from "./motion";

export function SanctuarySection() {
  return (
    <section className="relative z-10 px-5 py-20 sm:px-6 md:py-28">
      <div className="mx-auto max-w-lg md:max-w-2xl">
        <FadeUp delay={0.05}>
          <motion.div
            whileInView={{ opacity: 1, scale: 1 }}
            initial={{ opacity: 0.85, scale: 0.98 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="glass-panel relative overflow-hidden rounded-[2rem] px-7 py-10 md:px-10 md:py-12"
          >
            <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(156,170,143,0.4),transparent_70%)] blur-2xl" />
            <div className="pointer-events-none absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(213,190,152,0.45),transparent_70%)] blur-2xl" />

            <p className="text-eyebrow text-[11px] font-medium uppercase tracking-[0.32em]">
              Атмосфера
            </p>
            <h2 className="font-display text-heading mt-4 text-[1.85rem] font-light leading-[1.2] tracking-[-0.02em] md:text-3xl">
              Убежище, где время замедляется
            </h2>
            <p className="text-muted mt-5 text-[16px] font-light leading-[1.7]">
              Приглушённый свет, тёплые оттенки и безмолвие. Sakina Wellness —
              это не просто визит, а возвращение к внутренней мягкости и
              ясности.
            </p>

            <ul className="text-soft mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[13px] tracking-wide">
              {["Индивидуальный подход", "Премиум-уход", "Конфиденциальность"].map(
                (tag) => (
                  <li
                    key={tag}
                    className="rounded-full border border-[#D5BE98]/60 bg-[#E1D3BD]/50 px-4 py-2 text-[#3F4F3D] shadow-sm"
                  >
                    {tag}
                  </li>
                ),
              )}
            </ul>
          </motion.div>
        </FadeUp>
      </div>
    </section>
  );
}
