"use client";

import { useEffect, useState } from "react";

export type LuxuryMotionCapabilities = {
  reducedMotion: boolean;
  enableParallax: boolean;
  enableHoverLift: boolean;
};

export function useLuxuryMotionCapabilities(): LuxuryMotionCapabilities {
  const [capabilities, setCapabilities] = useState<LuxuryMotionCapabilities>({
    reducedMotion: false,
    enableParallax: false,
    enableHoverLift: false,
  });

  useEffect(() => {
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const parallaxMq = window.matchMedia(
      "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
    );
    const hoverMq = window.matchMedia("(hover: hover) and (pointer: fine)");

    const sync = () => {
      const reducedMotion = motionMq.matches;
      setCapabilities({
        reducedMotion,
        enableParallax: !reducedMotion && parallaxMq.matches,
        enableHoverLift: !reducedMotion && hoverMq.matches,
      });
    };

    sync();
    motionMq.addEventListener("change", sync);
    parallaxMq.addEventListener("change", sync);
    hoverMq.addEventListener("change", sync);

    return () => {
      motionMq.removeEventListener("change", sync);
      parallaxMq.removeEventListener("change", sync);
      hoverMq.removeEventListener("change", sync);
    };
  }, []);

  return capabilities;
}
