"use client";

import { FadeUp, LuxuryInteractive, ParallaxDepth } from "./motion";

export function IntroSection() {
  return (
    <section
      id="intro"
      className="luxury-section relative z-10 scroll-mt-20 px-5 py-14 sm:px-6"
    >
      <div className="mx-auto max-w-lg md:max-w-2xl">
        <FadeUp>
          <ParallaxDepth depth={28}>
            <LuxuryInteractive
              as="article"
              className="glass-panel rounded-[1.75rem] px-7 py-9 sm:px-9 sm:py-11"
            >
            <p className="text-gold text-[11px] font-medium uppercase tracking-[0.3em]">
              Sakina Wellness
            </p>
            <h2 className="font-display text-heading mt-4 text-[1.75rem] font-normal leading-[1.2] sm:text-[2rem]">
              Место, где начинается восстановление
            </h2>
            <p className="text-muted mt-5 text-[16px] font-light leading-[1.75]">
              Тёплое пространство для женщин, где тело отдыхает, дыхание
              выравнивается, а внутренний ритм возвращается к гармонии. Мягкий
              уход, внимание и тишина — без суеты, только присутствие.
            </p>
            </LuxuryInteractive>
          </ParallaxDepth>
        </FadeUp>
      </div>
    </section>
  );
}
