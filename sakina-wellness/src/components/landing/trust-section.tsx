"use client";

import { Award, Globe2, Heart } from "lucide-react";
import { FadeUp } from "./motion";

const TRUST_STATS = [
  { icon: Heart, value: "3+", label: "года практики" },
  { icon: Award, value: "1000+", label: "клиенток" },
  { icon: Globe2, value: null, label: "Международные обучения" },
] as const;

export function TrustSection() {
  return (
    <section className="sw-trust" aria-label="Доверие">
      <div className="sw-container">
        <FadeUp>
          <ul className="sw-trust__list">
            {TRUST_STATS.map((stat) => {
              const Icon = stat.icon;
              return (
                <li key={stat.label} className="sw-trust__item">
                  <Icon
                    className="sw-trust__icon h-5 w-5"
                    strokeWidth={1.25}
                    aria-hidden
                  />
                  <div>
                    {stat.value ? (
                      <p className="sw-trust__value">{stat.value}</p>
                    ) : null}
                    <p className="sw-trust__label">{stat.label}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </FadeUp>
      </div>
    </section>
  );
}
