"use client";

import { useEffect, useState } from "react";

export type LuxuryMotionCapabilities = {
  reducedMotion: boolean;
  enableParallax: boolean;
  /** Light translate parallax on phones (no blur) */
  enableSoftParallax: boolean;
  enableHoverLift: boolean;
  isMobile: boolean;
};

export function useLuxuryMotionCapabilities(): LuxuryMotionCapabilities {
  const [capabilities, setCapabilities] = useState<LuxuryMotionCapabilities>({
    reducedMotion: false,
    enableParallax: false,
    enableSoftParallax: false,
    enableHoverLift: false,
    isMobile: false,
  });

  useEffect(() => {
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktopParallaxMq = window.matchMedia(
      "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
    );
    const mobileParallaxMq = window.matchMedia(
      "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
    );
    const mobileMq = window.matchMedia("(max-width: 767px)");
    const hoverMq = window.matchMedia("(hover: hover) and (pointer: fine)");

    const sync = () => {
      const reducedMotion = motionMq.matches;
      const isMobile = mobileMq.matches;
      setCapabilities({
        reducedMotion,
        isMobile,
        enableParallax: !reducedMotion && desktopParallaxMq.matches,
        enableSoftParallax: !reducedMotion && mobileParallaxMq.matches,
        enableHoverLift: !reducedMotion && hoverMq.matches,
      });
    };

    sync();
    motionMq.addEventListener("change", sync);
    desktopParallaxMq.addEventListener("change", sync);
    mobileParallaxMq.addEventListener("change", sync);
    mobileMq.addEventListener("change", sync);
    hoverMq.addEventListener("change", sync);

    return () => {
      motionMq.removeEventListener("change", sync);
      desktopParallaxMq.removeEventListener("change", sync);
      mobileParallaxMq.removeEventListener("change", sync);
      mobileMq.removeEventListener("change", sync);
      hoverMq.removeEventListener("change", sync);
    };
  }, []);

  return capabilities;
}
