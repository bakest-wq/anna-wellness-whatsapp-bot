"use client";

import {
  motion,
  useInView,
  type HTMLMotionProps,
  type Variants,
} from "framer-motion";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useLuxuryMotion } from "./luxury-motion-context";

export const easeLuxury = [0.22, 1, 0.36, 1] as const;

export const cinematicRevealVariants: Variants = {
  hidden: { opacity: 0, y: 26, scale: 0.985 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.95, delay, ease: easeLuxury },
  }),
};

export const mobileRevealVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.99 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.8, delay, ease: easeLuxury },
  }),
};

/** @deprecated Use cinematicRevealVariants */
export const fadeUpVariants = cinematicRevealVariants;

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.11, delayChildren: 0.08 },
  },
};

export const mobileStaggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09, delayChildren: 0.06 },
  },
};

export const staggerChild: Variants = {
  hidden: { opacity: 0, y: 22, scale: 0.99 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.88, ease: easeLuxury },
  },
};

export const imageRevealVariants: Variants = {
  hidden: { opacity: 0, scale: 1.04 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1.05, ease: easeLuxury },
  },
};

type FadeUpProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "article" | "li";
};

export function FadeUp({
  children,
  className,
  delay = 0,
  as = "div",
}: FadeUpProps) {
  const ref = useRef(null);
  const { reducedMotion, isMobile } = useLuxuryMotion();
  const inView = useInView(ref, {
    once: true,
    margin: isMobile ? "-4% 0px" : "-8% 0px",
  });
  const Component = motion[as];
  const variants = isMobile ? mobileRevealVariants : cinematicRevealVariants;

  if (reducedMotion) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <Component
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={variants}
      custom={delay}
      className={className}
    >
      {children}
    </Component>
  );
}

export function CinematicReveal(props: FadeUpProps) {
  return <FadeUp {...props} />;
}

type RevealImageWrapProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function RevealImageWrap({
  children,
  className,
  delay = 0,
}: RevealImageWrapProps) {
  const ref = useRef(null);
  const { reducedMotion } = useLuxuryMotion();
  const inView = useInView(ref, { once: true, margin: "-6% 0px" });

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={imageRevealVariants}
      custom={delay}
      transition={{ delay }}
      className={cn("overflow-hidden", className)}
    >
      {children}
    </motion.div>
  );
}

type ParallaxDepthProps = {
  children: ReactNode;
  className?: string;
  depth?: number;
};

/** Scroll-linked parallax removed — avoids hydration errors; use FadeUp on parent. */
export function ParallaxDepth({
  children,
  className,
}: ParallaxDepthProps) {
  return <div className={cn(className)}>{children}</div>;
}

type LuxuryInteractiveProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "li";
};

export function LuxuryInteractive({
  children,
  className,
  as = "div",
}: LuxuryInteractiveProps) {
  const { enableHoverLift, reducedMotion } = useLuxuryMotion();
  const Component = motion[as];

  if (reducedMotion) {
    const Tag = as;
    return <Tag className={cn("luxury-interactive", className)}>{children}</Tag>;
  }

  return (
    <Component
      className={cn("luxury-interactive", className)}
      whileTap={{ scale: 0.988 }}
      whileHover={
        enableHoverLift
          ? { y: -4, transition: { duration: 0.45, ease: easeLuxury } }
          : undefined
      }
      transition={{ type: "spring", stiffness: 360, damping: 28 }}
    >
      {children}
    </Component>
  );
}

type PremiumButtonProps = HTMLMotionProps<"a"> & {
  children: ReactNode;
  variant?: "gold" | "outline" | "whatsapp";
};

export function PremiumButton({
  children,
  className,
  variant = "gold",
  ...props
}: PremiumButtonProps) {
  const { enableHoverLift, reducedMotion } = useLuxuryMotion();

  return (
    <motion.a
      whileHover={
        !reducedMotion && enableHoverLift ? { scale: 1.015, y: -1 } : undefined
      }
      whileTap={reducedMotion ? undefined : { scale: 0.985 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn(
        "luxury-cta inline-flex min-h-[48px] items-center justify-center rounded-full px-7 text-[14px] tracking-[0.02em] transition-shadow duration-500 sm:min-h-[50px] sm:px-8 sm:text-[15px]",
        variant === "gold" && "btn-gold",
        variant === "outline" && "btn-outline-gold backdrop-blur-sm",
        variant === "whatsapp" && "btn-outline-gold backdrop-blur-sm",
        className,
      )}
      {...props}
    >
      {children}
    </motion.a>
  );
}
