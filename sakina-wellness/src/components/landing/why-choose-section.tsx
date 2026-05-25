"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Award,
  Flower2,
  Heart,
  Shield,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import { ANNA_ALT, ANNA_PHOTOS } from "@/lib/anna-photos";
import { FadeUp, staggerContainer, easeLuxury } from "./motion";

const PRACTICE_HIGHLIGHTS = [
  "Массаж «5 континентов»",
  "Mukaino M-Test",
  "EarthFlow",
  "дыхательные практики",
  "Access Bars",
] as const;

type Advantage = {
  icon: LucideIcon;
  title: string;
  description: string;
  practices?: readonly string[];
};

const advantages: Advantage[] = [
  {
    icon: Heart,
    title: "Индивидуальный подход",
    description:
      "Каждая практика подбирается под состояние женщины, её напряжение, усталость и внутренний запрос.",
  },
  {
    icon: Award,
    title: "Опыт и доверие",
    description:
      "Более 3 лет практики и около 1000 довольных клиентов, которые возвращаются снова.",
  },
  {
    icon: Flower2,
    title: "Не просто массаж",
    description:
      "Сеансы Sakina Wellness — это сочетание телесного расслабления, восстановления состояния и глубокого внутреннего выдоха.",
  },
  {
    icon: Shield,
    title: "Женское безопасное пространство",
    description:
      "Мягкая атмосфера, приватность, спокойствие и забота, где женщина может по-настоящему расслабиться.",
  },
  {
    icon: Sparkles,
    title: "Современные wellness-практики",
    description:
      "Анна сочетает проверенные телесные ритуалы и современные методики восстановления — бережно и осознанно.",
    practices: PRACTICE_HIGHLIGHTS,
  },
];

export function WhyChooseSection() {
  return (
    <section
      id="why-choose"
      className="why-choose-section luxury-section relative z-10 scroll-mt-20 overflow-hidden px-5 py-20 sm:px-6 sm:py-24"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-1/4 h-[min(480px,85vw)] bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(220,201,163,0.16),transparent_70%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-lg md:max-w-2xl">
        <FadeUp>
          <p className="text-gold text-center text-[11px] font-semibold uppercase tracking-[0.34em]">
            Sakina Wellness
          </p>
          <h2 className="font-display text-heading mt-5 text-balance text-center text-[1.95rem] font-normal leading-[1.12] sm:text-[2.35rem]">
            Почему женщины выбирают Sakina Wellness
          </h2>
          <p className="text-muted mx-auto mt-6 max-w-[21rem] text-center text-[16px] font-light leading-[1.8] sm:max-w-md">
            Пространство бережного восстановления тела, состояния и внутреннего
            спокойствия.
          </p>
        </FadeUp>

        <motion.ul
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-6% 0px" }}
          className="mt-14 flex flex-col gap-5"
        >
          {advantages.map((item, index) => (
            <AdvantageCard key={item.title} item={item} index={index} />
          ))}
        </motion.ul>

        <FadeUp delay={0.15} className="mt-12">
          <AnnaStoryBlock />
        </FadeUp>
      </div>
    </section>
  );
}

function AdvantageCard({
  item,
  index,
}: {
  item: Advantage;
  index: number;
}) {
  const Icon = item.icon;

  return (
    <motion.li
      variants={{
        hidden: { opacity: 0, y: 22 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.7, delay: index * 0.07, ease: easeLuxury },
        },
      }}
      className="why-choose-card glass-panel luxury-interactive relative overflow-hidden rounded-[1.35rem] p-6 sm:p-7"
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(220,201,163,0.22),transparent_68%)] blur-2xl"
        aria-hidden
      />
      <div className="relative flex gap-4 sm:gap-5">
        <div className="why-choose-card__icon flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#C4A574]/22 bg-[#FFF9F3]/80 text-[#B8935A] sm:h-12 sm:w-12">
          <Icon className="h-5 w-5" strokeWidth={1.25} />
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-soft text-[10px] font-semibold uppercase tracking-[0.2em]">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="font-display text-heading mt-1.5 text-[1.2rem] leading-snug sm:text-[1.3rem]">
            {item.title}
          </h3>
          <p className="text-muted mt-3 text-[15px] font-light leading-[1.75]">
            {item.description}
          </p>
          {item.practices && item.practices.length > 0 && (
            <ul className="why-choose-practices mt-4 flex flex-wrap gap-2">
              {item.practices.map((practice) => (
                <li key={practice}>
                  <span className="why-choose-practice-pill">{practice}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </motion.li>
  );
}

function AnnaStoryBlock() {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-4% 0px" }}
      transition={{ duration: 0.8, ease: easeLuxury }}
      className="why-choose-anna relative overflow-hidden rounded-[1.5rem] border border-[#EDE4D4]/90 bg-[linear-gradient(165deg,rgba(255,249,243,0.95)_0%,rgba(237,228,212,0.35)_100%)] px-7 py-8 sm:px-9 sm:py-10"
    >
      <div
        className="pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(156,170,143,0.12),transparent_70%)] blur-2xl"
        aria-hidden
      />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
        <figure className="why-choose-anna__photo anna-figure anna-figure--thumb shrink-0">
          <Image
            src={ANNA_PHOTOS.portrait}
            alt={ANNA_ALT.portrait}
            fill
            sizes="80px"
            className="anna-figure__img anna-figure__img--portrait"
          />
        </figure>
        <div className="min-w-0">
          <p className="text-gold text-[10px] font-semibold uppercase tracking-[0.28em]">
            С вами лично
          </p>
          <h3 className="font-display text-heading mt-2 text-[1.35rem] leading-snug sm:text-[1.45rem]">
            Анна Абдулрашидовна
          </h3>
          <p className="text-soft mt-1 text-[13px] font-medium tracking-wide">
            wellness-практик
          </p>
          <p className="text-muted mt-5 text-[15px] font-light leading-[1.8] sm:text-[16px]">
            Каждый сеанс веду сама: с вниманием к вашему телу, дыханию и
            состоянию. Около 1000 женщин уже нашли здесь спокойствие и
            восстановление.
          </p>
          <a
            href="#about"
            className="text-gold mt-4 inline-block text-[13px] font-medium tracking-wide underline-offset-4 hover:underline"
          >
            Узнать больше об Анне
          </a>
        </div>
      </div>
    </motion.article>
  );
}
