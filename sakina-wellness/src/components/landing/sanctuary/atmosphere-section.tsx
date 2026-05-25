"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { easeLuxury } from "@/components/landing/motion";
import { useLuxuryMotion } from "@/components/landing/luxury-motion-context";
import { ATMOSPHERE_PHOTOS } from "@/lib/site-photos";

export function AtmosphereSection() {
  const { reducedMotion } = useLuxuryMotion();

  return (
    <section id="atmosphere" className="atmosphere-calm scroll-mt-20">
      <div className="atmosphere-calm__inner mobile-section">
        <motion.p
          className="atmosphere-calm__label"
          initial={reducedMotion ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-8% 0px" }}
          transition={{ duration: 0.9, ease: easeLuxury }}
        >
          Атмосфера
        </motion.p>

        <ul className="atmosphere-calm__list">
          {ATMOSPHERE_PHOTOS.map((photo, index) => (
            <motion.li
              key={photo.src}
              className="atmosphere-calm__item"
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-6% 0px" }}
              transition={{
                duration: 0.95,
                delay: index * 0.12,
                ease: easeLuxury,
              }}
            >
              <figure className="atmosphere-calm__figure">
                <div className="atmosphere-calm__media">
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 720px"
                    quality={90}
                    className="object-cover object-center"
                  />
                </div>
                <figcaption className="atmosphere-calm__caption">
                  {photo.caption}
                </figcaption>
              </figure>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
