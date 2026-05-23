"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Clock } from "lucide-react";
import { WELLNESS_SERVICES } from "@/lib/services";
import { buildWhatsAppBookingUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/cn";
import { useBooking } from "./booking-context";
import { FadeUp, staggerContainer, easeLuxury } from "./motion";
import { useLuxuryMotion } from "./luxury-motion-context";

export function ServicesSection() {
  const {
    selectedServiceId,
    selectedServiceTitle,
    selectedPackageId,
    selectService,
  } = useBooking();

  return (
    <section
      id="services"
      className="luxury-section relative z-10 scroll-mt-20 px-5 py-20 sm:px-6 sm:py-24"
    >
      <div className="mx-auto max-w-lg md:max-w-2xl">
        <FadeUp>
          <p className="text-gold text-center text-[11px] font-semibold uppercase tracking-[0.34em]">
            Услуги
          </p>
          <h2 className="font-display text-heading mt-5 text-balance text-center text-[2.1rem] font-normal leading-[1.1] sm:text-[2.5rem]">
            Ритуалы восстановления
          </h2>
          <p className="text-muted mx-auto mt-6 max-w-[19rem] text-center text-[16px] font-light leading-[1.8] sm:max-w-sm">
            Семь практик Sakina Wellness — выберите ту, что откликается вам
            сегодня.
          </p>
        </FadeUp>

        <motion.ul
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-4% 0px" }}
          className="mt-14 flex flex-col gap-8"
        >
          {WELLNESS_SERVICES.map((service, index) => (
            <ServiceCard
              key={service.id}
              service={service}
              index={index}
              isSelected={selectedServiceId === service.id}
              onSelect={() => selectService(service.id)}
            />
          ))}
        </motion.ul>

        <AnimatePresence mode="wait">
          {selectedServiceTitle && !selectedPackageId && (
            <motion.div
              key={selectedServiceTitle}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.55, ease: easeLuxury }}
              className="relative mt-10"
            >
              <div
                className="absolute inset-x-4 top-3 bottom-0 rounded-[1.75rem] bg-[#E3D5C3]/50 shadow-[0_12px_32px_-16px_rgba(61,56,48,0.1)]"
                aria-hidden
              />
              <div className="glass-panel relative rounded-[1.75rem] px-7 py-8 text-center">
                <p className="text-gold text-[11px] font-semibold uppercase tracking-[0.3em]">
                  Ваш выбор
                </p>
                <p className="font-display text-heading mt-3 text-[1.5rem]">
                  {selectedServiceTitle}
                </p>
                <p className="text-muted mt-2 text-[14px] font-light">
                  Мы подготовим для вас бережное сообщение в WhatsApp
                </p>
                <motion.a
                  href={buildWhatsAppBookingUrl(selectedServiceTitle)}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="btn-gold mt-6 inline-flex min-h-[52px] w-full items-center justify-center rounded-full text-[15px] font-semibold"
                >
                  Подтвердить в WhatsApp
                </motion.a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function ServiceCard({
  service,
  index,
  isSelected,
  onSelect,
}: {
  service: (typeof WELLNESS_SERVICES)[number];
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { enableHoverLift } = useLuxuryMotion();
  const Icon = service.icon;
  const bookingUrl = buildWhatsAppBookingUrl(service.title);
  const number = String(index + 1).padStart(2, "0");

  return (
    <motion.li
      variants={{
        hidden: { opacity: 0, y: 28 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.85,
            delay: index * 0.09,
            ease: easeLuxury,
          },
        },
      }}
      className="relative pt-2"
    >
      <div
        className={cn(
          "absolute inset-x-4 top-4 bottom-0 rounded-[1.9rem] transition-all duration-500",
          isSelected
            ? "bg-[#DCC9A3]/35 shadow-[0_16px_40px_-14px_rgba(184,147,90,0.18)]"
            : "bg-[#EDE4D4]/70 shadow-[0_10px_28px_-14px_rgba(61,56,48,0.08)]",
        )}
        aria-hidden
      />

      <motion.article
        layout
        whileHover={enableHoverLift ? { y: -5 } : undefined}
        whileTap={{ scale: 0.992 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        className={cn(
          "service-card-front glass-panel luxury-interactive relative overflow-hidden rounded-[1.9rem] p-7 sm:p-8",
          "shadow-[0_20px_50px_-20px_rgba(61,56,48,0.14)]",
          "transition-shadow duration-500 hover:shadow-[0_28px_56px_-18px_rgba(184,147,90,0.18)]",
          isSelected &&
            "ring-1 ring-[#C4A574]/50 shadow-[0_24px_52px_-16px_rgba(184,147,90,0.22)]",
        )}
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(220,201,163,0.28),transparent_68%)]" />

        {isSelected && (
          <motion.div
            layoutId="service-selected-glow"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_95%_60%_at_30%_0%,rgba(220,201,163,0.28),transparent_60%)]"
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
          />
        )}

        <div className="relative flex items-start justify-between gap-4">
          <span className="text-soft font-display text-[13px] tracking-[0.2em]">
            {number}
          </span>
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FFF9F3] to-[#EDE4D4] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]" />
            <div className="absolute inset-0 rounded-full ring-1 ring-[#C4A574]/30" />
            <Icon
              className="relative h-[22px] w-[22px] text-[#B8935A]"
              strokeWidth={1.15}
            />
          </div>
        </div>

        <div className="relative mt-5">
          <p className="font-display text-gold text-[15px] font-light italic leading-snug">
            {service.essence}
          </p>
          <h3 className="font-display text-heading mt-2 text-[1.5rem] font-normal leading-[1.15] tracking-tight sm:text-[1.6rem]">
            {service.title}
          </h3>
          <p className="text-muted mt-4 text-[15px] font-light leading-[1.75]">
            {service.description}
          </p>
        </div>

        <div className="relative mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-[1.2rem] border border-[#EDE4D4]/80 bg-[#FFF9F3]/60 px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
            <p className="text-soft text-[9px] font-medium uppercase tracking-[0.22em]">
              Стоимость сеанса
            </p>
            <p className="font-display text-gold mt-1.5 text-[1.65rem] font-normal leading-none tracking-tight sm:text-[1.75rem]">
              {service.price}
            </p>
          </div>
          <div className="rounded-[1.2rem] border border-[#EDE4D4]/80 bg-[#FFF9F3]/40 px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
            <div className="flex items-start gap-2.5">
              <Clock
                className="text-gold mt-0.5 h-4 w-4 shrink-0"
                strokeWidth={1.35}
              />
              <div>
                <p className="text-soft text-[9px] font-medium uppercase tracking-[0.22em]">
                  Длительность
                </p>
                <p className="font-display text-heading mt-1.5 text-[1.15rem] font-normal leading-snug">
                  {service.duration}
                </p>
              </div>
            </div>
          </div>
        </div>

        <motion.a
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onSelect()}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={cn(
            "relative mt-6 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full text-[15px] font-semibold tracking-wide transition-all duration-400",
            isSelected ? "btn-gold" : "btn-outline-gold",
          )}
        >
          {isSelected && (
            <Check className="h-4 w-4" strokeWidth={2} aria-hidden />
          )}
          {isSelected ? "Выбрано · Открыть WhatsApp" : "Выбрать сеанс"}
        </motion.a>
      </motion.article>
    </motion.li>
  );
}
