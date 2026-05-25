"use client";

import Image from "next/image";
import { useState } from "react";
import {
  INTERNATIONAL_PRACTICES,
} from "@/lib/international-practices";

const STATS = [
  { value: "3+", label: "года практики" },
  { value: "1000+", label: "клиенток" },
  { value: null, label: "Международные обучения" },
] as const;

export function HomeTrust() {
  return (
    <section id="trust" className="bs-trust scroll-mt-20" aria-label="Доверие">
      <div className="bs-container">
        <h2 className="bs-trust__title">Почему нам доверяют</h2>

        <ul className="bs-trust__stats">
          {STATS.map((stat) => (
            <li
              key={stat.label}
              className={stat.value ? undefined : "bs-trust__stat--solo"}
            >
              {stat.value ? (
                <span className="bs-trust__stat-value">{stat.value}</span>
              ) : null}
              <span className="bs-trust__stat-label">{stat.label}</span>
            </li>
          ))}
        </ul>

        <div className="bs-trust__certs">
          <p className="bs-trust__certs-label">Международные сертификаты</p>
          <div className="bs-trust__track" role="list">
            {INTERNATIONAL_PRACTICES.map((item) => (
              <CertThumb
                key={item.id}
                name={item.name}
                src={item.certificateSrc}
                alt={item.certificateAlt}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CertThumb({
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
    <article className="bs-cert" role="listitem">
      <div className="bs-cert__frame">
        {!failed ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes="150px"
            quality={88}
            className="object-contain object-center p-2"
            onError={() => setFailed(true)}
          />
        ) : null}
      </div>
      <p className="bs-cert__name">{name}</p>
    </article>
  );
}
