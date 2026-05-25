"use client";

import { WELLNESS_SERVICES } from "@/lib/services";
import { FadeUp } from "./motion";

export function PracticesSection() {
  return (
    <section
      id="practices"
      className="sw-practices scroll-mt-24"
      aria-labelledby="practices-title"
    >
      <div className="sw-container sw-container--narrow">
        <FadeUp>
          <p className="sw-eyebrow">Практики</p>
          <h2 id="practices-title" className="sw-title sw-practices__title">
            Сеансы в спокойном ритме
          </h2>
          <p className="sw-lead" style={{ marginTop: "1rem" }}>
            Выберите практику — Анна подстроит сеанс под ваше состояние сегодня.
          </p>
        </FadeUp>

        <ul className="sw-practices__list">
          {WELLNESS_SERVICES.map((service, index) => (
            <li key={service.id}>
            <FadeUp delay={index * 0.04}>
              <article className="sw-practice">
                <h3 className="sw-practice__name">{service.title}</h3>
                <p className="sw-practice__desc">{service.essence}</p>
                <div className="sw-practice__meta">
                  <span>{service.duration}</span>
                  <a href="#booking" className="sw-practice__link">
                    Записаться
                  </a>
                </div>
              </article>
            </FadeUp>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
