"use client";

import Image from "next/image";
import { ANNA_ALT, ANNA_PHOTOS } from "@/lib/anna-photos";
import { FadeUp } from "./motion";

export function AnnaCtaSection() {
  return (
    <section
      className="anna-cta luxury-section relative z-10 scroll-mt-20"
      aria-labelledby="anna-cta-title"
    >
      <div className="anna-cta__inner mx-auto max-w-lg px-5 py-20 sm:max-w-3xl sm:px-8 sm:py-24 lg:max-w-4xl">
        <FadeUp>
          <div className="anna-cta__panel">
            <figure className="anna-cta__portrait anna-figure anna-figure--cta">
              <Image
                src={ANNA_PHOTOS.inPractice}
                alt={ANNA_ALT.inPractice}
                fill
                sizes="(max-width: 640px) 100vw, 280px"
                className="anna-figure__img"
              />
            </figure>

            <div className="anna-cta__content">
              <p className="anna-cta__eyebrow">Личная запись</p>
              <h2 id="anna-cta-title" className="anna-cta__title font-display">
                Хотите прийти именно к Анне?
              </h2>
              <p className="anna-cta__text">
                Выберите время — я лично проведу сеанс и бережно подстрою
                практику под ваше состояние сегодня.
              </p>
              <a href="#booking" className="btn-gold anna-cta__button">
                Записаться к Анне
              </a>
              <p className="anna-cta__note">
                Тихое пространство · только для женщин · без спешки
              </p>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
