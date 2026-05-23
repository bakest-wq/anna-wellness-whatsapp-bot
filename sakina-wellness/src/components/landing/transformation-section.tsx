"use client";

import { motion } from "framer-motion";
import {
  ArrowDown,
  Brain,
  CloudRain,
  Feather,
  Heart,
  Moon,
  Sparkles,
  Sun,
  Waves,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { FadeUp, easeLuxury } from "./motion";

const beforeStates: { label: string; icon: LucideIcon }[] = [
  { label: "Перегрузка", icon: Zap },
  { label: "Тревожность", icon: CloudRain },
  { label: "Усталость", icon: Moon },
  { label: "Внутреннее напряжение", icon: Brain },
  { label: "Потеря контакта с собой", icon: Heart },
];

const afterStates: { label: string; icon: LucideIcon }[] = [
  { label: "Спокойствие", icon: Moon },
  { label: "Лёгкость", icon: Feather },
  { label: "Глубокое расслабление", icon: Waves },
  { label: "Ясность", icon: Sun },
  { label: "Внутренний баланс", icon: Sparkles },
];

export function TransformationSection() {
  return (
    <section className="luxury-section relative z-10 overflow-hidden px-5 py-20 sm:px-6 sm:py-24">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[min(420px,90vw)] w-[min(420px,90vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(220,201,163,0.2),transparent_68%)] blur-3xl" />

      <div className="relative mx-auto max-w-lg md:max-w-2xl">
        <FadeUp>
          <p className="text-gold text-center text-[11px] font-semibold uppercase tracking-[0.34em]">
            Трансформация
          </p>
          <h2 className="font-display text-heading mt-5 text-balance text-center text-[2rem] font-normal leading-[1.12] sm:text-[2.35rem]">
            Как меняется ваше состояние
          </h2>
          <p className="text-muted mx-auto mt-6 max-w-[19rem] text-center text-[16px] font-light leading-[1.8]">
            Мягкий путь от суеты к тишине — без резких шагов, только забота и
            присутствие.
          </p>
        </FadeUp>

        <div className="mt-14 flex flex-col gap-6">
          <StateCard
            variant="before"
            title="До"
            subtitle="Когда тело просит паузу"
            items={beforeStates}
            delay={0.1}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: easeLuxury }}
            className="flex justify-center py-1"
            aria-hidden
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#C4A574]/25 bg-[#FFF9F3]/80 text-[#B8935A] shadow-[0_8px_24px_-8px_rgba(184,147,90,0.2)]">
              <ArrowDown className="h-5 w-5" strokeWidth={1.5} />
            </div>
          </motion.div>

          <StateCard
            variant="after"
            title="После"
            subtitle="Когда возвращается гармония"
            items={afterStates}
            delay={0.25}
          />
        </div>
      </div>
    </section>
  );
}

function StateCard({
  variant,
  title,
  subtitle,
  items,
  delay,
}: {
  variant: "before" | "after";
  title: string;
  subtitle: string;
  items: { label: string; icon: LucideIcon }[];
  delay: number;
}) {
  const isAfter = variant === "after";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-6% 0px" }}
      transition={{ duration: 0.85, delay, ease: easeLuxury }}
      className="relative pt-1"
    >
      <div
        className={
          isAfter
            ? "absolute inset-x-3 top-3 bottom-0 rounded-[1.75rem] bg-[#DCC9A3]/35 shadow-[0_14px_36px_-14px_rgba(184,147,90,0.15)]"
            : "absolute inset-x-3 top-3 bottom-0 rounded-[1.75rem] bg-[#E8E0D4]/60 shadow-[0_10px_28px_-14px_rgba(61,56,48,0.06)]"
        }
        aria-hidden
      />

      <article
        className={
          isAfter
            ? "glass-panel relative overflow-hidden rounded-[1.75rem] px-6 py-7 ring-1 ring-[#C4A574]/20 sm:px-8 sm:py-8"
            : "relative overflow-hidden rounded-[1.75rem] border border-[#EDE4D4]/90 bg-[#F5F0E8]/80 px-6 py-7 backdrop-blur-sm sm:px-8 sm:py-8"
        }
      >
        {isAfter && (
          <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(220,201,163,0.35),transparent_70%)] blur-xl" />
        )}

        <header className="relative border-b border-[#EDE4D4]/70 pb-5">
          <p
            className={
              isAfter
                ? "text-gold text-[11px] font-semibold uppercase tracking-[0.28em]"
                : "text-soft text-[11px] font-semibold uppercase tracking-[0.28em]"
            }
          >
            {title}
          </p>
          <p className="font-display text-heading mt-2 text-[1.35rem] font-normal leading-tight">
            {subtitle}
          </p>
        </header>

        <ul className="relative mt-6 space-y-4">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.li
                key={item.label}
                initial={{ opacity: 0, x: isAfter ? 8 : -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.55,
                  delay: delay + 0.08 + index * 0.05,
                  ease: easeLuxury,
                }}
                className="flex items-center gap-4"
              >
                <div
                  className={
                    isAfter
                      ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EDE4D4]/50 text-[#5F735B]"
                      : "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EDE4D4]/40 text-[#9A9288]"
                  }
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.2} />
                </div>
                <span
                  className={
                    isAfter
                      ? "font-display text-[1.05rem] text-[#3D3830]"
                      : "text-[15px] font-light text-[#7A7368]"
                  }
                >
                  {item.label}
                </span>
              </motion.li>
            );
          })}
        </ul>
      </article>
    </motion.div>
  );
}
