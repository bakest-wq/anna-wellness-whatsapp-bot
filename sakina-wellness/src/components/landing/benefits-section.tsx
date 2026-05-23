"use client";

import { motion } from "framer-motion";
import { Flower2, Heart, Moon, Sparkles } from "lucide-react";
import { FadeUp, staggerContainer } from "./motion";

const benefits = [
  {
    icon: Sparkles,
    title: "Восстановление энергии",
    description: "Мягкая перезагрузка тела и внутреннего ресурса.",
  },
  {
    icon: Moon,
    title: "Глубокое расслабление",
    description: "Снятие напряжения и возвращение к спокойному дыханию.",
  },
  {
    icon: Heart,
    title: "Женское здоровье",
    description: "Забота, основанная на нежности и внимании к циклу тела.",
  },
  {
    icon: Flower2,
    title: "Внутренняя гармония",
    description: "Баланс эмоций, ясность и ощущение целостности.",
  },
] as const;

export function BenefitsSection() {
  return (
    <section
      id="benefits"
      className="luxury-section relative z-10 scroll-mt-20 px-5 py-6 sm:px-6 sm:py-10"
    >
      <div className="mx-auto max-w-lg md:max-w-2xl">
        <FadeUp>
          <p className="text-gold text-center text-[11px] font-medium uppercase tracking-[0.3em]">
            Ваш путь
          </p>
        </FadeUp>

        <motion.ul
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-8% 0px" }}
          className="mt-8 grid grid-cols-2 gap-4"
        >
          {benefits.map((item, index) => (
            <motion.li
              key={item.title}
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.65, delay: index * 0.06 },
                },
              }}
              className="glass-panel luxury-interactive flex flex-col rounded-[1.25rem] p-5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EDE4D4]/60 text-[#B8935A]">
                <item.icon className="h-[18px] w-[18px]" strokeWidth={1.25} />
              </div>
              <h3 className="font-display text-heading mt-4 text-[1.05rem] leading-snug">
                {item.title}
              </h3>
              <p className="text-soft mt-2 text-[13px] font-light leading-relaxed">
                {item.description}
              </p>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
