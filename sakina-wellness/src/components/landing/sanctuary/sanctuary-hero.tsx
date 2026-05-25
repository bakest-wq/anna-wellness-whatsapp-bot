"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { easeLuxury } from "@/components/landing/motion";
import { useLuxuryMotion } from "@/components/landing/luxury-motion-context";
import { SITE_PHOTOS } from "@/lib/site-photos";

export function SanctuaryHero() {
  const { reducedMotion } = useLuxuryMotion();

  return (
    <section className="sanctuary-hero-calm relative min-h-[100svh] min-h-[100dvh] w-full overflow-hidden">
      <div className="sanctuary-hero-calm__media" aria-hidden>
        <Image
          src={SITE_PHOTOS.heroRoom}
          alt="Кабинет Sakina Wellness с тёплым светом"
          fill
          priority
          sizes="100vw"
          quality={90}
          className="sanctuary-hero-calm__room object-cover object-[center_35%]"
        />
        <div className="sanctuary-hero-calm__hands">
          <Image
            src={SITE_PHOTOS.heroHands}
            alt="Бережная терапия рук"
            fill
            priority
            sizes="50vw"
            quality={90}
            className="object-cover object-[center_40%]"
          />
        </div>
        <div className="sanctuary-hero-calm__overlay" />
      </div>

      <motion.div
        className="sanctuary-hero-calm__content"
        initial={reducedMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: easeLuxury }}
      >
        <p className="sanctuary-hero-calm__brand font-display">Sakina Wellness</p>
        <h1 className="sanctuary-hero-calm__title font-display text-balance">
          Пространство восстановления для женщин
        </h1>
        <p className="sanctuary-hero-calm__subtitle text-balance">
          Тишина. Забота. Глубокое восстановление.
        </p>
        <a href="#booking" className="sanctuary-hero-calm__cta">
          Записаться
        </a>
      </motion.div>
    </section>
  );
}
