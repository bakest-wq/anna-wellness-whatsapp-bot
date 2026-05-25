"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FadeUp, easeLuxury } from "@/components/landing/motion";
import { useLuxuryMotion } from "@/components/landing/luxury-motion-context";
import {
  CERTIFICATES_HEADLINE,
  INTERNATIONAL_PRACTICES,
  type InternationalPractice,
} from "@/lib/international-practices";
export function CertificatesCarouselSection() {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    const step = el.clientWidth * 0.82;
    el.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  return (
    <section
      id="certificates"
      className="certificates-calm scroll-mt-20"
    >
      <div className="certificates-calm__inner mobile-section">
        <FadeUp>
          <h2 className="certificates-calm__title font-display text-balance">
            {CERTIFICATES_HEADLINE}
          </h2>
        </FadeUp>

        <div className="certificates-calm__controls">
          <button
            type="button"
            onClick={() => scroll(-1)}
            className="certificates-calm__nav"
            aria-label="Предыдущий сертификат"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            className="certificates-calm__nav"
            aria-label="Следующий сертификат"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        <div
          ref={trackRef}
          className="certificates-calm__track"
          role="list"
          aria-label="Сертификаты международных практик"
        >
          {INTERNATIONAL_PRACTICES.map((practice, index) => (
            <CertificateSlide
              key={practice.id}
              practice={practice}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function CertificateSlide({
  practice,
  index,
}: {
  practice: InternationalPractice;
  index: number;
}) {
  const { reducedMotion } = useLuxuryMotion();
  const [failed, setFailed] = useState(false);

  return (
    <motion.article
      role="listitem"
      className="certificates-calm__slide"
      initial={reducedMotion ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-4% 0px" }}
      transition={{
        duration: 0.75,
        delay: Math.min(index * 0.05, 0.2),
        ease: easeLuxury,
      }}
    >
      <div className="certificates-calm__frame">
        {!failed ? (
          <Image
            src={practice.certificateSrc}
            alt={practice.certificateAlt}
            fill
            sizes="(max-width: 640px) 78vw, 320px"
            quality={92}
            className="certificates-calm__img object-contain object-center"
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="certificates-calm__fallback" aria-hidden />
        )}
      </div>
      <p className="certificates-calm__name">{practice.name}</p>
    </motion.article>
  );
}
