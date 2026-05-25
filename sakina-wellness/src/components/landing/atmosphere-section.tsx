"use client";

import Image from "next/image";
import { ATMOSPHERE_ALT, SITE_PHOTOS } from "@/lib/site-photos";
import { FadeUp } from "./motion";

const CELLS = [
  { key: "hands", area: "hero", src: SITE_PHOTOS.atmosphere.hands, alt: ATMOSPHERE_ALT.hands },
  { key: "candle", area: "candle", src: SITE_PHOTOS.atmosphere.candle, alt: ATMOSPHERE_ALT.candle },
  { key: "room", area: "room", src: SITE_PHOTOS.atmosphere.room, alt: ATMOSPHERE_ALT.room },
  { key: "detail", area: "detail", src: SITE_PHOTOS.atmosphere.detail, alt: ATMOSPHERE_ALT.detail },
] as const;

export function AtmosphereSection() {
  return (
    <section
      id="atmosphere"
      className="sw-atmosphere scroll-mt-24"
      aria-labelledby="atmosphere-title"
    >
      <div className="sw-container">
        <FadeUp>
          <p className="sw-eyebrow">Атмосфера</p>
          <h2 id="atmosphere-title" className="sw-title sw-atmosphere__title">
            Тишина, тепло и внимание к деталям
          </h2>
        </FadeUp>

        <div className="sw-atmosphere__grid">
          {CELLS.map((cell, index) => (
            <FadeUp
              key={cell.key}
              delay={index * 0.05}
              className={`sw-atmo-cell sw-atmo-cell--${cell.area}`}
            >
              <Image
                src={cell.src}
                alt={cell.alt}
                fill
                sizes={
                  cell.area === "hero"
                    ? "(max-width: 767px) 100vw, 55vw"
                    : "(max-width: 767px) 45vw, 280px"
                }
                className="sw-atmo-cell__img"
              />
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
