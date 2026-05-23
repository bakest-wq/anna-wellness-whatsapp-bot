"use client";

import { motion } from "framer-motion";
import { ONBOARDING_STEPS } from "@/lib/booking-flow";
import { easeLuxury } from "@/components/landing/motion";
import { useLuxuryMotion } from "@/components/landing/luxury-motion-context";
import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export function OnboardingProgress({ current }: { current: number }) {
  return (
    <div className="onboarding-progress" aria-hidden>
      <div className="onboarding-progress__track">
        {ONBOARDING_STEPS.map((_, i) => (
          <div
            key={i}
            className={cn(
              "onboarding-progress__dot",
              i <= current && "onboarding-progress__dot--active",
              i === current && "onboarding-progress__dot--current",
            )}
          />
        ))}
      </div>
      <p className="onboarding-progress__label">
        {ONBOARDING_STEPS[current]} · {current + 1} из {ONBOARDING_STEPS.length}
      </p>
    </div>
  );
}

export function OnboardingStepShell({
  children,
  stepKey,
}: {
  children: ReactNode;
  stepKey: string | number;
}) {
  const { reducedMotion, enableParallax } = useLuxuryMotion();
  const cinematic = !reducedMotion;

  return (
    <motion.div
      key={stepKey}
      initial={
        cinematic
          ? {
              opacity: 0,
              y: 24,
              ...(enableParallax ? { filter: "blur(5px)" } : {}),
            }
          : false
      }
      animate={{
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
      }}
      exit={
        cinematic
          ? {
              opacity: 0,
              y: -12,
              ...(enableParallax ? { filter: "blur(3px)" } : {}),
            }
          : { opacity: 0 }
      }
      transition={{ duration: 0.58, ease: easeLuxury }}
      className="onboarding-step"
    >
      {children}
    </motion.div>
  );
}

export function OnboardingQuestion({
  title,
  hint,
  eyebrow,
  className,
}: {
  title: string;
  hint?: string;
  eyebrow?: string;
  className?: string;
}) {
  return (
    <header className={cn("onboarding-question", className)}>
      {eyebrow && (
        <p className="onboarding-question__eyebrow">{eyebrow}</p>
      )}
      <h3 className="onboarding-question__title">{title}</h3>
      {hint && <p className="onboarding-question__hint">{hint}</p>}
    </header>
  );
}
