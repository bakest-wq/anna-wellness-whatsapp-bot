"use client";

import { motion } from "framer-motion";
import { SanctuaryPhoto } from "@/components/landing/sanctuary/sanctuary-photo";
import { easeLuxury } from "@/components/landing/motion";
import { useLuxuryMotion } from "@/components/landing/luxury-motion-context";
import { SITE_PHOTOS } from "@/lib/site-photos";

export function SanctuaryQuoteSection() {
  const { reducedMotion } = useLuxuryMotion();

  return (
    <section className="sanctuary-quote luxury-section mobile-section relative overflow-hidden sm:py-36">
      <div className="sanctuary-quote__bg" aria-hidden>
        <SanctuaryPhoto
          src={SITE_PHOTOS.quoteBackground}
          alt=""
          reveal
          sizes="100vw"
          imageClassName="object-cover object-center scale-105 blur-md"
        />
        <div className="sanctuary-quote__bg-scrim" />
      </div>

      <motion.blockquote
        initial={reducedMotion ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 1, ease: easeLuxury }}
        className="sanctuary-quote__content relative mx-auto max-w-lg text-center md:max-w-2xl"
      >
        <p className="font-display sanctuary-quote__text text-balance">
          Иногда телу нужно не лечение.
          <br />
          А тишина, забота и бережное прикосновение.
        </p>
      </motion.blockquote>
    </section>
  );
}
