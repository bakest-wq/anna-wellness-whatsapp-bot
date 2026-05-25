"use client";

import Image from "next/image";
import { ANNA_ALT, ANNA_PHOTOS } from "@/lib/anna-photos";
import { SITE_PHOTOS } from "@/lib/site-photos";
import { FadeUp } from "./motion";

export function HeroSection() {
  return (
    <section className="sw-hero" aria-label="Sakina Wellness">
      <div className="sw-container sw-hero__copy">
        <FadeUp>
          <h1 className="sw-hero__brand">SAKINA WELLNESS</h1>
          <p className="sw-hero__tagline">
            Пространство восстановления для женщин
            <br />
            Тишина. Забота. Возвращение к себе.
          </p>
          <a href="#booking" className="sw-btn sw-hero__cta">
            Записаться
          </a>
        </FadeUp>
      </div>

      <div className="sw-hero__visual">
        <Image
          src={SITE_PHOTOS.hero}
          alt={ANNA_ALT.handsWorking}
          fill
          priority
          sizes="(max-width: 767px) 100vw, 58vw"
          className="sw-hero__img"
        />
      </div>
    </section>
  );
}
