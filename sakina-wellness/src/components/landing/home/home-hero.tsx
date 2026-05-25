import Image from "next/image";
import { SITE_PHOTOS } from "@/lib/site-photos";
import { SITE_TITLE } from "@/lib/brand";

export function HomeHero() {
  return (
    <section className="bs-hero">
      <div className="bs-container">
        <div className="bs-hero__grid">
          <div className="bs-hero__copy bs-fade">
            <p className="bs-hero__eyebrow">Женское восстановление</p>
            <h1 className="bs-hero__title">{SITE_TITLE}</h1>
            <p className="bs-hero__lead">
              Пространство тишины и заботы для тела и состояния. Бережные
              практики в спокойном ритме.
            </p>
            <a href="#booking" className="bs-hero__cta">
              Записаться
            </a>
          </div>

          <figure className="bs-hero__visual bs-fade" style={{ animationDelay: "0.08s" }}>
            <Image
              src={SITE_PHOTOS.heroVisual}
              alt="Кабинет Balance & Sakura Wellness"
              fill
              priority
              sizes="(max-width: 767px) 100vw, 50vw"
              quality={88}
            />
          </figure>
        </div>
      </div>
    </section>
  );
}
