"use client";

import { SITE_NAME } from "@/lib/brand";
import { AboutAnnaSection } from "./about-anna-section";
import { AtmosphereSection } from "./atmosphere-section";
import { BookingProvider } from "./booking-context";
import { BookingFlowSection } from "./booking-flow-section";
import { CertificatesSection } from "./certificates-section";
import { FinalCtaSection } from "./final-cta-section";
import { HeroSection } from "./hero-section";
import { LuxuryMotionProvider } from "./luxury-motion-context";
import { PracticesSection } from "./practices-section";
import { SessionFlowSection } from "./session-flow-section";
import { SiteHeader } from "./site-header";
import { StickyWhatsAppCta } from "./sticky-whatsapp-cta";

/**
 * Quiet luxury studio — logical flow:
 * who → trust → Anna → practices → atmosphere → experience → credentials → book
 */
export function LandingPage() {
  return (
    <BookingProvider>
      <LuxuryMotionProvider>
        <div className="sw-page">
          <SiteHeader />
          <main className="relative z-10 pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:pb-0">
            <HeroSection />
            <AboutAnnaSection />
            <PracticesSection />
            <AtmosphereSection />
            <SessionFlowSection />
            <CertificatesSection />
            <FinalCtaSection />
            <BookingFlowSection />

            <footer className="sw-footer sw-container">
              {SITE_NAME} · {new Date().getFullYear()}
            </footer>
          </main>
          <StickyWhatsAppCta />
        </div>
      </LuxuryMotionProvider>
    </BookingProvider>
  );
}
