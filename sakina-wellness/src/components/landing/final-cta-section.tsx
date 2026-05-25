"use client";

import { FadeUp } from "./motion";

export function FinalCtaSection() {
  return (
    <section className="sw-final-cta" aria-label="Запись на сеанс">
      <div className="sw-container sw-container--narrow">
        <FadeUp>
          <p className="sw-final-cta__quote">
            Вы заслуживаете восстановления.
          </p>
          <p className="sw-final-cta__sub">
            Тихое пространство · лично с Анной · без спешки
          </p>
          <a href="#booking" className="sw-btn sw-final-cta__btn">
            Записаться на сеанс
          </a>
        </FadeUp>
      </div>
    </section>
  );
}
