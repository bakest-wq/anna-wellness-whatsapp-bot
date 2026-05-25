import { FadeIn } from "@/components/landing/home/fade-in";

export function HomeBookingCta() {
  return (
    <section className="sw-booking-cta">
      <div className="sw-container sw-container--narrow">
        <FadeIn>
          <h2 className="sw-heading sw-heading--center font-display">
            Запись в Sakina Wellness
          </h2>
          <p className="sw-booking-cta__text">
            Выберите удобное время. Мы бережно подтвердим вашу запись.
          </p>
          <a href="#booking" className="sw-btn sw-btn--primary sw-booking-cta__btn">
            Записаться
          </a>
        </FadeIn>
      </div>
    </section>
  );
}
