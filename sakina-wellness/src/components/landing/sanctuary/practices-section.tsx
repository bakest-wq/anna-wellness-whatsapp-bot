"use client";

import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { WELLNESS_SERVICES } from "@/lib/services";
import { easeLuxury } from "@/components/landing/motion";
import { useLuxuryMotion } from "@/components/landing/luxury-motion-context";

export function PracticesSection() {
  const { reducedMotion } = useLuxuryMotion();

  return (
    <section id="services" className="practices-calm scroll-mt-20">
      <div className="practices-calm__inner mobile-section">
        <motion.div
          className="practices-calm__intro"
          initial={reducedMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-8% 0px" }}
          transition={{ duration: 0.85, ease: easeLuxury }}
        >
          <h2 className="practices-calm__title font-display">Практики</h2>
          <p className="practices-calm__lead">
            Бережные сеансы для тела и состояния — в спокойном темпе, без
            спешки.
          </p>
        </motion.div>

        <ul className="practices-calm__list">
          {WELLNESS_SERVICES.map((service, index) => (
            <motion.li
              key={service.id}
              initial={reducedMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-4% 0px" }}
              transition={{
                duration: 0.8,
                delay: Math.min(index * 0.06, 0.3),
                ease: easeLuxury,
              }}
            >
              <article className="practices-calm__card">
                <div className="practices-calm__card-head">
                  <h3 className="practices-calm__card-title font-display">
                    {service.title}
                  </h3>
                  <p className="practices-calm__card-meta">
                    <span>{service.price}</span>
                    <span className="practices-calm__card-dot" aria-hidden>
                      ·
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock
                        className="h-3.5 w-3.5 opacity-60"
                        strokeWidth={1.5}
                        aria-hidden
                      />
                      {service.duration}
                    </span>
                  </p>
                </div>
                <p className="practices-calm__card-desc">{service.description}</p>
                <a href="#booking" className="practices-calm__card-link">
                  Записаться
                </a>
              </article>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
