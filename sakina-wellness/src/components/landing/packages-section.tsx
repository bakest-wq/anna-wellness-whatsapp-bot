"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { WELLNESS_PACKAGES } from "@/lib/packages";
import { buildWhatsAppBookingUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/cn";
import { useBooking } from "./booking-context";
import { FadeUp, staggerContainer, easeLuxury } from "./motion";
import { useLuxuryMotion } from "./luxury-motion-context";

export function PackagesSection() {
  const { selectedPackageId, selectedPackageName, selectPackage } = useBooking();

  return (
    <section
      id="packages"
      className="luxury-section relative z-10 scroll-mt-20 px-5 py-20 sm:px-6 sm:py-24"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#9CAA8F]/06 to-transparent" />

      <div className="relative mx-auto max-w-lg md:max-w-2xl">
        <FadeUp>
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.34em] text-[#5F735B]">
            Программы
          </p>
          <h2 className="font-display text-heading mt-5 text-balance text-center text-[2rem] font-normal leading-[1.12] sm:text-[2.35rem]">
            Wellness-пакеты Sakina
          </h2>
          <p className="text-muted mx-auto mt-6 max-w-[20rem] text-center text-[16px] font-light leading-[1.8]">
            Продуманные ритуалы в одной программе — для тех, кто хочет глубже
            погрузиться в заботу о себе.
          </p>
        </FadeUp>

        <motion.ul
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-4% 0px" }}
          className="mt-14 flex flex-col gap-8"
        >
          {WELLNESS_PACKAGES.map((pkg, index) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              index={index}
              isSelected={selectedPackageId === pkg.id}
              onSelect={() => selectPackage(pkg.id)}
            />
          ))}
        </motion.ul>

        <AnimatePresence mode="wait">
          {selectedPackageName && (
            <motion.div
              key={selectedPackageName}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.5, ease: easeLuxury }}
              className="relative mt-10"
            >
              <div
                className="absolute inset-x-4 top-3 bottom-0 rounded-[1.75rem] bg-[#E3D5C3]/50"
                aria-hidden
              />
              <div className="glass-panel relative rounded-[1.75rem] px-7 py-8 text-center">
                <p className="text-gold text-[11px] font-semibold uppercase tracking-[0.3em]">
                  Ваш пакет
                </p>
                <p className="font-display text-heading mt-3 text-[1.5rem]">
                  {selectedPackageName}
                </p>
                <motion.a
                  href={buildWhatsAppBookingUrl({
                    packageName: selectedPackageName,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
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

function PackageCard({
  pkg,
  index,
  isSelected,
  onSelect,
}: {
  pkg: (typeof WELLNESS_PACKAGES)[number];
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { enableHoverLift } = useLuxuryMotion();
  const bookingUrl = buildWhatsAppBookingUrl({ packageName: pkg.name });

  return (
    <motion.li
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
      className="relative pt-2"
    >
      <div
        className={cn(
          "absolute inset-x-4 top-4 bottom-0 rounded-[1.9rem] transition-all duration-500",
          pkg.featured
            ? "bg-[#DCC9A3]/40 shadow-[0_14px_36px_-14px_rgba(184,147,90,0.18)]"
            : "bg-[#EDE4D4]/70 shadow-[0_10px_28px_-14px_rgba(61,56,48,0.08)]",
        )}
        aria-hidden
      />

      <motion.article
        whileHover={enableHoverLift ? { y: -4 } : undefined}
        whileTap={{ scale: 0.992 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        className={cn(
          "glass-panel luxury-interactive relative overflow-hidden rounded-[1.9rem] p-7 sm:p-8",
          "shadow-[0_18px_48px_-20px_rgba(61,56,48,0.12)]",
          isSelected &&
            "ring-1 ring-[#C4A574]/45 shadow-[0_24px_52px_-16px_rgba(184,147,90,0.2)]",
        )}
      >
        {pkg.featured && (
          <div className="absolute right-5 top-5 flex items-center gap-1.5 rounded-full border border-[#C4A574]/30 bg-[#FFF9F3]/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B8935A]">
            <Sparkles className="h-3 w-3" strokeWidth={1.5} />
            Signature
          </div>
        )}

        {isSelected && (
          <motion.div
            layoutId="package-selected-glow"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_0%,rgba(220,201,163,0.25),transparent_65%)]"
          />
        )}

        <div className="relative">
          <p className="font-display text-gold text-[15px] font-light italic">
            {pkg.tagline}
          </p>
          <h3 className="font-display text-heading mt-2 pr-20 text-[1.55rem] font-normal leading-tight sm:text-[1.65rem]">
            {pkg.name}
          </h3>
        </div>

        <div className="relative mt-6">
          <p className="text-soft text-[10px] font-medium uppercase tracking-[0.22em]">
            В программе
          </p>
          <ul className="mt-3 space-y-2.5">
            {pkg.includes.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 text-[14px] font-light leading-snug text-[#3D3830]/90"
              >
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#5F735B]/60" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mt-6 rounded-[1.2rem] border border-[#EDE4D4]/90 bg-[#FFF9F3]/45 px-5 py-4">
          <p className="text-soft text-[10px] font-medium uppercase tracking-[0.2em]">
            Ваше состояние после
          </p>
          <p className="text-muted mt-2 text-[15px] font-light leading-[1.7]">
            {pkg.result}
          </p>
        </div>

        <div className="relative mt-6 rounded-[1.2rem] border border-[#EDE4D4]/80 bg-[#FFF9F3]/60 px-5 py-4 text-center sm:text-left">
          <p className="text-soft text-[10px] font-medium uppercase tracking-[0.22em]">
            Стоимость программы
          </p>
          <p className="font-display text-gold mt-1.5 text-[1.85rem] font-normal leading-none tracking-tight">
            {pkg.price}
          </p>
        </div>

        <motion.a
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onSelect()}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={cn(
            "relative mt-6 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full text-[15px] font-semibold tracking-wide",
            isSelected ? "btn-gold" : "btn-outline-gold",
          )}
        >
          {isSelected && <Check className="h-4 w-4" strokeWidth={2} />}
          {isSelected ? "Выбрано · WhatsApp" : "Выбрать пакет"}
        </motion.a>
      </motion.article>
    </motion.li>
  );
}
