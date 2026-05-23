"use client";

import { SITE_NAME } from "@/lib/brand";
import { AmbientBackground } from "./ambient-background";
import { BenefitsSection } from "./benefits-section";
import { BookingProvider } from "./booking-context";
import { ChooseStateSection } from "./choose-state-section";
import { PackagesSection } from "./packages-section";
import { ServicesSection } from "./services-section";
import { HeroSection } from "./hero-section";
import { IntroSection } from "./intro-section";
import { QuoteSection } from "./quote-section";
import { BookingFlowSection } from "./booking-flow-section";
import { TestimonialsSection } from "./testimonials-section";
import { TransformationSection } from "./transformation-section";
import { WhyChooseSection } from "./why-choose-section";
import { LuxuryMotionProvider } from "./luxury-motion-context";
import { SectionBridge } from "./section-bridge";
import { SiteHeader } from "./site-header";
import { StickyWhatsAppCta } from "./sticky-whatsapp-cta";

export function LandingPage() {
  return (
    <BookingProvider>
      <LuxuryMotionProvider>
        <AmbientBackground />
        <SiteHeader />
        <main className="luxury-flow relative z-10 pb-[calc(4.75rem+env(safe-area-inset-bottom,0px))] md:pb-0">
          <HeroSection />
          <SectionBridge tone="warm" />
          <IntroSection />
          <SectionBridge tone="calm" />
          <WhyChooseSection />
          <SectionBridge tone="warm" />
          <BenefitsSection />
          <SectionBridge tone="calm" />
          <TransformationSection />
          <SectionBridge tone="warm" />
          <QuoteSection />
          <SectionBridge tone="olive" />
          <ServicesSection />
          <SectionBridge tone="calm" />
          <PackagesSection />
          <SectionBridge tone="warm" />
          <BookingFlowSection />
          <SectionBridge tone="olive" />
          <ChooseStateSection />
          <SectionBridge tone="calm" />
          <TestimonialsSection />

          <footer className="luxury-section relative z-10 px-5 pb-14 pt-8 text-center safe-bottom sm:px-6">
            <p className="text-soft text-[11px] uppercase tracking-[0.28em]">
              {SITE_NAME} · 2026
            </p>
          </footer>
        </main>
        <StickyWhatsAppCta />
      </LuxuryMotionProvider>
    </BookingProvider>
  );
}
