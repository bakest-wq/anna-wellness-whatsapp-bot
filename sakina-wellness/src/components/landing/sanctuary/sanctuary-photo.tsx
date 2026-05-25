"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { easeLuxury } from "@/components/landing/motion";
import { useLuxuryMotion } from "@/components/landing/luxury-motion-context";
import { cn } from "@/lib/cn";

type SanctuaryPhotoProps = {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  priority?: boolean;
  animate?: boolean;
  animateVariant?: "slow" | "slow-alt";
  reveal?: boolean;
};

export function SanctuaryPhoto({
  src,
  alt,
  fallbackSrc,
  className,
  imageClassName,
  sizes = "100vw",
  priority = false,
  animate = false,
  animateVariant = "slow",
  reveal = false,
}: SanctuaryPhotoProps) {
  const ref = useRef(null);
  const { reducedMotion } = useLuxuryMotion();
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  const [activeSrc, setActiveSrc] = useState(src);
  const [failed, setFailed] = useState(false);

  const handleError = () => {
    if (fallbackSrc && activeSrc !== fallbackSrc) {
      setActiveSrc(fallbackSrc);
      return;
    }
    setFailed(true);
  };

  const showReveal = reveal && !reducedMotion && !priority;

  return (
    <motion.div
      ref={ref}
      className={cn(
        "sanctuary-photo",
        animate && "sanctuary-photo--animate",
        animate && `sanctuary-photo--${animateVariant}`,
        className,
      )}
      initial={showReveal ? { opacity: 0, scale: 1.05 } : false}
      animate={
        showReveal
          ? inView
            ? { opacity: 1, scale: 1 }
            : { opacity: 0, scale: 1.05 }
          : undefined
      }
      transition={{ duration: 1.1, ease: easeLuxury }}
    >
      {!failed ? (
        <Image
          src={activeSrc}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          quality={92}
          className={cn("sanctuary-photo__img", imageClassName)}
          onError={handleError}
        />
      ) : (
        <div className="sanctuary-photo__fallback" aria-hidden>
          <span className="sanctuary-photo__fallback-glow" />
        </div>
      )}
    </motion.div>
  );
}
