"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { easeLuxury } from "@/components/landing/motion";
import { useLuxuryMotion } from "@/components/landing/luxury-motion-context";
import type { WellnessCertificate } from "@/lib/certificates";
import { cn } from "@/lib/cn";

type CertificatesLightboxProps = {
  certificate: WellnessCertificate | null;
  onClose: () => void;
};

export function CertificatesLightbox({
  certificate,
  onClose,
}: CertificatesLightboxProps) {
  const [mounted, setMounted] = useState(false);
  const { reducedMotion } = useLuxuryMotion();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!certificate) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [certificate]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!certificate) return;
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [certificate, handleKeyDown]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {certificate && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`Сертификат ${certificate.practiceName}`}
          className="cert-lightbox"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.01 : 0.35, ease: easeLuxury }}
          onClick={onClose}
        >
          <motion.div
            className="cert-lightbox__panel"
            initial={
              reducedMotion ? false : { opacity: 0, y: 24, scale: 0.97 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 12, scale: 0.98 }
            }
            transition={{ duration: 0.45, ease: easeLuxury }}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="cert-lightbox__header">
              <div className="min-w-0 pr-3">
                <p className="cert-lightbox__eyebrow">International Training</p>
                <h3 className="cert-lightbox__title">{certificate.practiceName}</h3>
                <p className="cert-lightbox__subtitle">
                  {certificate.trainingLabel}
                  {certificate.year ? ` · ${certificate.year}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="cert-lightbox__close"
                aria-label="Закрыть"
              >
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </header>

            <div className="cert-lightbox__image-wrap">
              <CertificateImage
                certificate={certificate}
                priority
                className="cert-lightbox__image"
                sizes="(max-width: 768px) 100vw, 720px"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export function CertificateImage({
  certificate,
  className,
  sizes = "(max-width: 640px) 45vw, 220px",
  priority = false,
}: {
  certificate: WellnessCertificate;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={cn(
          "cert-image-fallback flex flex-col items-center justify-center p-6 text-center",
          className,
        )}
      >
        <p className="font-display text-[1.1rem] text-[#3D3830]">
          {certificate.practiceName}
        </p>
        <p className="text-muted mt-2 text-[13px] font-light">
          Добавьте изображение в{" "}
          <code className="text-[12px]">public/images/certificates/</code>
        </p>
      </div>
    );
  }

  return (
    <Image
      src={certificate.imageSrc}
      alt={certificate.imageAlt}
      fill
      className={cn("object-contain object-center", className)}
      sizes={sizes}
      priority={priority}
      onError={() => setFailed(true)}
    />
  );
}
