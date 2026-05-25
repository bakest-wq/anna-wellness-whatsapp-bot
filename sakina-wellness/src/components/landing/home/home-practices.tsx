import { WELLNESS_SERVICES } from "@/lib/services";

export function HomePractices() {
  return (
    <section id="services" className="bs-practices scroll-mt-20">
      <div className="bs-container bs-container--narrow">
        <p className="bs-section-label">Услуги</p>
        <h2 className="bs-section-title">Практики</h2>
        <p className="bs-practices__lead">
          Сеансы в комфортном темпе — выберите то, что откликается сегодня.
        </p>

        <ul className="bs-practices__list">
          {WELLNESS_SERVICES.map((service) => (
            <li key={service.id}>
              <article className="bs-practice">
                <h3 className="bs-practice__name">{service.title}</h3>
                <p className="bs-practice__line">{service.essence}</p>
                <p className="bs-practice__meta">{service.duration}</p>
                <a href="#booking" className="bs-practice__link">
                  Записаться
                </a>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
