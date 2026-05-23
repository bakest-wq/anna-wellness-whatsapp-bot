"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { WELLNESS_STATES } from "@/lib/wellness-states";
import { cn } from "@/lib/cn";
import { useBooking } from "./booking-context";
import { FadeUp, staggerContainer, easeLuxury } from "./motion";
import { useLuxuryMotion } from "./luxury-motion-context";

export function ChooseStateSection() {
  const { selectedServiceId, selectService } = useBooking();
  const { enableHoverLift } = useLuxuryMotion();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleSelect = (serviceId: string) => {
    selectService(serviceId);
    const el = document.getElementById("booking");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      id="states"
      className="luxury-section relative z-10 scroll-mt-20 px-5 py-20 sm:px-6 sm:py-24"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#9CAA8F]/08 to-transparent" />

      <div className="relative mx-auto max-w-lg md:max-w-2xl">
        <FadeUp>
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.34em] text-[#5F735B]">
            Ваше состояние
          </p>
          <h2 className="font-display text-heading mt-5 text-balance text-center text-[2rem] font-normal leading-[1.12] sm:text-[2.35rem]">
            Как вы хотите себя чувствовать?
          </h2>
          <p className="text-muted mx-auto mt-6 max-w-[20rem] text-center text-[16px] font-light leading-[1.8]">
            Прикоснитесь к состоянию, которое зовёт вас сегодня — мы подскажем
            ритуал, созданный для этого чувства.
          </p>
        </FadeUp>

        <motion.ul
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-5% 0px" }}
          className="mt-12 flex flex-col gap-5"
        >
          {WELLNESS_STATES.map((state, index) => {
            const Icon = state.icon;
            const isActive = selectedServiceId === state.serviceId;
            const isHovered = hoveredId === state.id;

            return (
              <motion.li
                key={state.id}
                variants={{
                  hidden: { opacity: 0, y: 24 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.8,
                      delay: index * 0.08,
                      ease: easeLuxury,
                    },
                  },
                }}
              >
                <motion.button
                  type="button"
                  onClick={() => handleSelect(state.serviceId)}
                  onHoverStart={() => setHoveredId(state.id)}
                  onHoverEnd={() => setHoveredId(null)}
                  whileTap={{ scale: 0.985 }}
                  whileHover={enableHoverLift ? { y: -4 } : undefined}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className={cn(
                    "group relative w-full overflow-hidden rounded-[1.75rem] text-left transition-shadow duration-500",
                    "shadow-[0_16px_40px_-18px_rgba(63,79,61,0.12)]",
                    "hover:shadow-[0_22px_48px_-16px_rgba(95,115,91,0.2)]",
                    isActive &&
                      "ring-1 ring-[#5F735B]/40 shadow-[0_24px_52px_-16px_rgba(95,115,91,0.22)]",
                  )}
                >
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-br transition-opacity duration-500",
                      isActive || isHovered
                        ? "from-[#9CAA8F]/25 via-[#EDE4D4]/80 to-[#FAF7F2] opacity-100"
                        : "from-[#9CAA8F]/12 via-[#F5F0E8] to-[#FAF7F2] opacity-100",
                    )}
                  />
                  <div className="absolute inset-0 rounded-[1.75rem] ring-1 ring-inset ring-white/60" />
                  <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(156,170,143,0.2),transparent_70%)]" />

                  <div className="relative flex items-start gap-5 p-6 sm:p-7">
                    <div
                      className={cn(
                        "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-all duration-400",
                        "bg-gradient-to-br from-[#FFF9F3] to-[#E8E0D4]",
                        "ring-1 ring-[#5F735B]/20 shadow-[0_8px_20px_-8px_rgba(95,115,91,0.15)]",
                        (isActive || isHovered) && "ring-[#5F735B]/35",
                      )}
                    >
                      <Icon
                        className="h-[22px] w-[22px] text-[#5F735B]"
                        strokeWidth={1.2}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-heading text-[1.4rem] font-normal leading-tight tracking-tight">
                        {state.title}
                      </h3>
                      <p className="text-muted mt-2 text-[15px] font-light leading-[1.65]">
                        {state.feeling}
                      </p>
                      <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px]">
                        <span className="text-soft uppercase tracking-[0.16em]">
                          Ритуал
                        </span>
                        <span className="font-medium text-[#5F735B]">
                          {state.practice}
                        </span>
                      </p>
                    </div>

                    <motion.span
                      animate={{
                        x: isHovered || isActive ? 4 : 0,
                        opacity: isHovered || isActive ? 1 : 0.45,
                      }}
                      className="mt-1 shrink-0 text-[#5F735B]"
                    >
                      <ArrowRight className="h-5 w-5" strokeWidth={1.5} />
                    </motion.span>
                  </div>
                </motion.button>
              </motion.li>
            );
          })}
        </motion.ul>

        <FadeUp delay={0.1}>
          <p className="text-soft mt-10 text-center text-[13px] font-light leading-relaxed">
            Нажмите на состояние — мы откроем подходящий сеанс в разделе услуг
          </p>
        </FadeUp>
      </div>
    </section>
  );
}
