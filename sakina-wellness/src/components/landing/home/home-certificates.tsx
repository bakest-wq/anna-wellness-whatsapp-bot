"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FadeIn } from "@/components/landing/home/fade-in";
import {
  CERTIFICATES_HEADLINE,
  INTERNATIONAL_PRACTICES,
} from "@/lib/international-practices";

export function HomeCertificates() {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.7), behavior: "smooth" });
  };

  return (
    <section id="certificates" className="sw-certificates scroll-mt-24">
      <div className="sw-container">
        <FadeIn>
          <h2 className="sw-heading sw-heading--center font-display">
            {CERTIFICATES_HEADLINE}
          </h2>
        </FadeIn>

        <div className="sw-certificates__bar">
          <button
            type="button"
            className="sw-certificates__nav"
            onClick={() => scroll(-1)}
            aria-label="Назад"
          >
            <ChevronLeft strokeWidth={1.25} className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="sw-certificates__nav"
            onClick={() => scroll(1)}
            aria-label="Вперёд"
          >
            <ChevronRight strokeWidth={1.25} className="h-5 w-5" />
          </button>
        </div>

        <div ref={trackRef} className="sw-certificates__track">
          {INTERNATIONAL_PRACTICES.map((item) => (
            <CertificateCard key={item.id} name={item.name} src={item.certificateSrc} alt={item.certificateAlt} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CertificateCard({
  name,
  src,
  alt,
}: {
  name: string;
  src: string;
  alt: string;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <article className="sw-cert-card">
      <div className="sw-cert-card__frame">
        {!failed ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes="200px"
            quality={88}
            className="object-contain object-center p-2"
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="sw-cert-card__fallback" aria-hidden />
        )}
      </div>
      <p className="sw-cert-card__name">{name}</p>
    </article>
  );
}
