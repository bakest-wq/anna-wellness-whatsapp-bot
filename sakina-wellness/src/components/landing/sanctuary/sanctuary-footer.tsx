import { SITE_NAME, SITE_TITLE } from "@/lib/brand";
import { buildWhatsAppConciergeUrl } from "@/lib/whatsapp";

export function SanctuaryFooter() {
  return (
    <footer className="sanctuary-footer-calm">
      <div className="sanctuary-footer-calm__inner mobile-section">
        <p className="font-display sanctuary-footer-calm__brand">{SITE_TITLE}</p>
        <p className="sanctuary-footer-calm__tagline">
          Пространство восстановления для женщин
        </p>
        <nav className="sanctuary-footer-calm__nav" aria-label="Подвал">
          <a href="#certificates">Обучение</a>
          <a href="#atmosphere">Атмосфера</a>
          <a href="#services">Практики</a>
          <a href="#booking">Запись</a>
          <a
            href={buildWhatsAppConciergeUrl()}
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>
        </nav>
        <p className="sanctuary-footer-calm__copy">
          {SITE_NAME} · {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
