"use client";

import { motion } from "framer-motion";
import { FadeUp, staggerContainer, easeLuxury } from "@/components/landing/motion";

const SANCTUARY_TESTIMONIALS = [
  {
    id: "breath",
    quote: "Будто тело снова начало дышать.",
  },
  {
    id: "quiet",
    quote: "Внутри стало тихо.",
  },
  {
    id: "relax",
    quote: "Я впервые за долгое время расслабилась.",
  },
] as const;

export function SanctuaryTestimonialsSection() {
  return (
    <section
      id="feelings"
      className="sanctuary-testimonials luxury-section mobile-section relative scroll-mt-20 sm:py-28"
    >
      <div className="relative mx-auto max-w-lg md:max-w-2xl">
        <FadeUp>
          <h2 className="font-display text-heading text-center text-[1.9rem] font-normal leading-[1.12] sm:text-[2.35rem]">
            Что чувствуют женщины после сеанса
          </h2>
        </FadeUp>

        <motion.ul
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-6% 0px" }}
          className="mt-14 flex flex-col gap-5 sm:gap-6"
        >
          {SANCTUARY_TESTIMONIALS.map((item, index) => (
            <motion.li
              key={item.id}
              variants={{
                hidden: { opacity: 0, y: 18 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.75,
                    delay: index * 0.1,
                    ease: easeLuxury,
                  },
                },
              }}
            >
              <figure className="sanctuary-testimonial-card">
                <span className="sanctuary-testimonial-card__mark" aria-hidden>
                  “
                </span>
                <blockquote className="font-display sanctuary-testimonial-card__quote">
                  {item.quote}
                </blockquote>
              </figure>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
