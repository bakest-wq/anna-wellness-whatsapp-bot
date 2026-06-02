"use client";

import Image from "next/image";
import { Check } from "lucide-react";
import { ANNA_ALT, ANNA_PHOTOS } from "@/lib/anna-photos";
import { FadeUp } from "./motion";

const HERO_TRUST_ITEMS = [
  "Более 3 лет практики",
  "Более 1000 проведённых сеансов",
  "Международные сертификаты",
  "Женское пространство восстановления",
] as const;

export function HeroSection() {
  return (
    <div className="sw-hero-block">
      <section className="sw-hero" aria-labelledby="hero-headline">
        <div className="sw-hero__inner">
          <FadeUp className="sw-hero__copy">
            <p className="sw-hero__label">SAKINA WELLNESS</p>
            <h1 id="hero-headline" className="sw-hero__headline font-display">
              Пространство глубокого восстановления для женщин
            </h1>
            <p className="sw-hero__subhead">
              Тишина. Забота. Возвращение к себе.
            </p>
            <p className="sw-hero__description">
              Индивидуальные практики восстановления тела, эмоционального
              состояния и внутреннего баланса под сопровождением Анны
              Абдулрашидовны.
            </p>
            <div className="sw-hero__actions">
              <a href="#booking" className="sw-btn sw-hero__btn-primary">
                Записаться на сеанс
              </a>
              <a href="#practices" className="sw-btn sw-btn--ghost sw-hero__btn-secondary">
                О практиках
              </a>
            </div>
          </FadeUp>

          <figure className="sw-hero__portrait">
            <Image
              src={ANNA_PHOTOS.portrait}
              alt={ANNA_ALT.portrait}
              fill
              priority
              sizes="(max-width: 767px) 100vw, 50vw"
              className="sw-hero__portrait-img"
            />
            <div className="sw-hero__portrait-veil" aria-hidden />
          </figure>
        </div>
      </section>

      <div className="sw-hero-trust" aria-label="Почему нам доверяют">
        <div className="sw-container">
          <FadeUp>
            <ul className="sw-hero-trust__list">
              {HERO_TRUST_ITEMS.map((item) => (
                <li key={item} className="sw-hero-trust__item">
                  <Check
                    className="sw-hero-trust__mark"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </FadeUp>
        </div>
      </div>
    </div>
  );
}
