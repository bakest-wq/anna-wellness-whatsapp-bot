"use client";

import Image from "next/image";
import { ANNA_ALT, ANNA_PHOTOS } from "@/lib/anna-photos";
import { FadeUp } from "./motion";

export function AboutAnnaSection() {
  return (
    <section
      id="about"
      className="sw-about scroll-mt-24"
      aria-labelledby="about-title"
    >
      <div className="sw-container">
        <div className="sw-about__grid">
          <FadeUp>
            <figure className="sw-about__figure">
              <Image
                src={ANNA_PHOTOS.portrait}
                alt={ANNA_ALT.portrait}
                fill
                sizes="(max-width: 767px) 88vw, 340px"
                className="sw-about__img"
              />
            </figure>
            <p className="sw-about__name">Анна Абдулрашидовна</p>
          </FadeUp>

          <FadeUp delay={0.08}>
            <p className="sw-eyebrow">О практике</p>
            <h2 id="about-title" className="sw-title sw-about__title">
              Спокойное женское пространство, где вас слышат
            </h2>
            <div className="sw-about__prose">
              <p>
                Я создала Sakina Wellness для женщин, которым нужно не «ещё один
                массаж», а бережное присутствие и восстановление в тишине.
              </p>
              <p>
                Каждый сеанс веду лично: внимательно, без спешки, с уважением к
                вашему телу и состоянию. Более трёх лет практики и около тысячи
                женщин, которые возвращаются снова.
              </p>
              <p>
                Здесь можно выдохнуть, почувствовать безопасность и мягко
                вернуться к себе — без давления и громких обещаний.
              </p>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
