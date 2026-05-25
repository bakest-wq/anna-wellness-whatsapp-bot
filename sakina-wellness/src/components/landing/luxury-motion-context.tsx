"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import {
  useLuxuryMotionCapabilities,
  type LuxuryMotionCapabilities,
} from "@/hooks/use-luxury-motion";

const LuxuryMotionContext = createContext<LuxuryMotionCapabilities>({
  reducedMotion: false,
  enableParallax: false,
  enableSoftParallax: false,
  enableHoverLift: false,
  isMobile: false,
});

export function LuxuryMotionProvider({ children }: { children: ReactNode }) {
  const capabilities = useLuxuryMotionCapabilities();

  return (
    <LuxuryMotionContext.Provider value={capabilities}>
      {children}
    </LuxuryMotionContext.Provider>
  );
}

export function useLuxuryMotion() {
  return useContext(LuxuryMotionContext);
}
