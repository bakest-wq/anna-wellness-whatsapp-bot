import Image from "next/image";
import { ATMOSPHERE_EDITORIAL } from "@/lib/site-photos";

export function HomeAtmosphere() {
  return (
    <section id="gallery" className="bs-gallery scroll-mt-20">
      <div className="bs-container">
        <p className="bs-section-label" style={{ textAlign: "center" }}>
          Атмосфера
        </p>
        <h2
          className="bs-section-title"
          style={{ textAlign: "center", marginTop: "0.5rem" }}
        >
          Пространство заботы
        </h2>

        <div className="bs-gallery__grid">
          {ATMOSPHERE_EDITORIAL.map((photo) => (
            <figure key={photo.id} className="bs-photo">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 767px) 100vw, 33vw"
                quality={85}
              />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
