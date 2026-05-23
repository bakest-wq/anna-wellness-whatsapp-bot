"use client";

import { motion } from "framer-motion";
import { Droplets, Flower2, Moon } from "lucide-react";
import { cn } from "@/lib/cn";
import { FadeUp, staggerContainer } from "./motion";

const experiences = [
  {
    icon: Moon,
    title: "Глубокое расслабление",
    description:
      "Мягкие практики и атмосфера покоя, где тело отпускает напряжение, а дыхание становится ровным.",
  },
  {
    icon: Droplets,
    title: "Восстановление энергии",
    description:
      "Пространство, созданное для перезагрузки — нежный уход, тепло и внимание к каждой детали.",
  },
  {
    icon: Flower2,
    title: "Женская гармония",
    description:
      "Эстетика спокойствия и силы: тактильные ритуалы, свет и тишина, которые возвращают к себе.",
  },
] as const;

export function ExperienceSection() {
  return (
    <section
      id="experience"
      className="relative z-10 px-5 py-24 sm:px-6 md:py-32"
    >
      <div className="mx-auto max-w-lg md:max-w-2xl">
        <FadeUp>
          <p className="text-eyebrow text-center text-[11px] font-medium uppercase tracking-[0.32em] md:text-left">
            Опыт
          </p>
          <h2 className="font-display text-heading mt-4 text-balance text-center text-[2rem] font-light leading-[1.15] tracking-[-0.02em] md:text-left md:text-4xl">
            Каждый момент — как личный ритуал
          </h2>
          <p className="text-muted mt-5 text-center text-[16px] font-light leading-relaxed md:text-left">
            Минимализм, свет и тактильность. Без суеты — только забота,
            присутствие и тихая роскошь.
          </p>
        </FadeUp>

        <motion.ul
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10% 0px" }}
          className="mt-12 flex flex-col gap-4"
        >
          {experiences.map((item, index) => (
            <ExperienceCard key={item.title} {...item} index={index} />
          ))}
        </motion.ul>
      </div>
    </section>
  );
}

function ExperienceCard({
  icon: Icon,
  title,
  description,
  index,
}: {
  icon: (typeof experiences)[number]["icon"];
  title: string;
  description: string;
  index: number;
}) {
  return (
    <motion.li
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.75, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "glass-panel group rounded-[1.75rem] p-6 md:p-7",
        index === 1 && "md:translate-x-4",
      )}
    >
      <div className="icon-wellness mb-5 flex h-11 w-11 items-center justify-center rounded-2xl transition-colors group-hover:border-[#5F735B]/40">
        <Icon className="h-5 w-5" strokeWidth={1.25} />
      </div>
      <h3 className="font-display text-heading text-xl font-normal tracking-tight">
        {title}
      </h3>
      <p className="text-soft mt-3 text-[15px] font-light leading-[1.65]">
        {description}
      </p>
    </motion.li>
  );
}
