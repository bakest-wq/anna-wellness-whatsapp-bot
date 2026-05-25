"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Maximize2 } from "lucide-react";
import {
  CertificateImage,
  CertificatesLightbox,
} from "@/components/landing/certificates-lightbox";
import { FadeUp, staggerContainer, easeLuxury } from "@/components/landing/motion";
import {
  WELLNESS_CERTIFICATES,
  type WellnessCertificate,
} from "@/lib/certificates";
import { cn } from "@/lib/cn";

export function CertificatesSection() {
  const [active, setActive] = useState<WellnessCertificate | null>(null);

  return (
    <section
      id="certificates"
      className="certificates-section luxury-section relative z-10 scroll-mt-20 overflow-hidden"
    >
      <div className="certificates-section__inner mx-auto max-w-lg px-5 py-24 sm:max-w-3xl sm:px-8 sm:py-28 lg:max-w-5xl lg:px-10">
        <FadeUp>
          <p className="certificates-section__eyebrow">Международное обучение</p>
          <h2 className="certificates-section__title font-display">
            Сертификаты и практики
          </h2>
          <p className="certificates-section__lead">
            Международные школы восстановления — подтверждённая квалификация.
          </p>
        </FadeUp>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-5% 0px" }}
          className="cert-gallery cert-gallery--editorial mt-14 sm:mt-16"
        >
          <CertificateCard
            certificate={WELLNESS_CERTIFICATES[0]}
            index={0}
            onOpen={() => setActive(WELLNESS_CERTIFICATES[0])}
          />

          <motion.ul className="cert-gallery__rest">
            {WELLNESS_CERTIFICATES.slice(1).map((certificate, index) => (
              <CertificateCard
                key={certificate.id}
                certificate={certificate}
                index={index + 1}
                onOpen={() => setActive(certificate)}
              />
            ))}
          </motion.ul>
        </motion.div>
      </div>

      <CertificatesLightbox
        certificate={active}
        onClose={() => setActive(null)}
      />
    </section>
  );
}

function CertificateCard({
  certificate,
  index,
  onOpen,
}: {
  certificate: WellnessCertificate;
  index: number;
  onOpen: () => void;
}) {
  const isLead = certificate.isLead === true;

  return (
    <motion.li
      variants={{
        hidden: { opacity: 0, y: 18 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.8, delay: index * 0.05, ease: easeLuxury },
        },
      }}
    >
      <button
        type="button"
        onClick={onOpen}
        className={cn("cert-card group w-full text-left", isLead && "cert-card--lead")}
      >
        <div className="cert-card__visual">
          <div className="cert-card__image-wrap">
            <CertificateImage
              certificate={certificate}
              sizes={
                isLead
                  ? "(max-width: 640px) 88vw, 420px"
                  : "(max-width: 640px) 44vw, 240px"
              }
            />
            <span className="cert-card__expand" aria-hidden>
              <Maximize2 className="h-3.5 w-3.5" strokeWidth={1.5} />
            </span>
          </div>
        </div>

        <div className="cert-card__copy">
          {isLead ? (
            <p className="cert-card__flag">Актуальное обучение</p>
          ) : null}
          <h3 className="cert-card__name font-display">{certificate.practiceName}</h3>
          <p className="cert-card__desc">{certificate.trainingLabel}</p>
          <p className="cert-card__year">{certificate.year}</p>
        </div>
      </button>
    </motion.li>
  );
}
