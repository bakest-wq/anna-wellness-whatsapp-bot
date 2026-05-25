"use client";

import Image from "next/image";
import { ANNA_ALT, ANNA_PHOTOS } from "@/lib/anna-photos";
import { FadeUp } from "./motion";

export function TouchHealingSection() {
  return (
    <section
      id="touch"
      className="touch-healing luxury-section relative z-10 scroll-mt-20"
      aria-labelledby="touch-healing-title"
    >
      <div className="touch-healing__inner mx-auto max-w-lg px-5 py-20 sm:max-w-3xl sm:px-8 sm:py-24 lg:max-w-4xl">
        <div className="touch-healing__grid">
          <FadeUp className="touch-healing__copy">
            <p className="touch-healing__eyebrow">Прикосновение и исцеление</p>
            <h2 id="touch-healing-title" className="touch-healing__title font-display">
              Руки, которые слышат тело
            </h2>
            <div className="touch-healing__prose">
              <p>
                В каждом сеансе я работаю не «по шаблону», а по вашему дыханию,
                напряжению и ритму. Прикосновение здесь — не декорация, а
                способ вернуть телу доверие и мягкость.
              </p>
              <p>
                Массаж, Mukaino, Access Bars, дыхание — всё подчинено одному:
                чтобы вы чувствовали, что вас держат внимательно и безопасно.
              </p>
            </div>
          </FadeUp>

          <FadeUp delay={0.1} className="touch-healing__visual">
            <figure className="anna-figure anna-figure--hands">
              <Image
                src={ANNA_PHOTOS.healingTouch}
                alt={ANNA_ALT.healingTouch}
                fill
                sizes="(max-width: 640px) 88vw, 420px"
                className="anna-figure__img"
              />
            </figure>
            <figure className="anna-figure anna-figure--hands-secondary" aria-hidden>
              <Image
                src={ANNA_PHOTOS.handsDetail}
                alt=""
                fill
                sizes="120px"
                className="anna-figure__img"
              />
            </figure>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
