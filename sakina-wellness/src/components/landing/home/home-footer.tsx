import { SITE_NAME } from "@/lib/brand";
import { buildWhatsAppConciergeUrl } from "@/lib/whatsapp";

export function HomeFooter() {
  return (
    <footer className="bs-footer">
      <p className="bs-footer__brand">Balance &amp; Sakura Wellness</p>
      <nav className="bs-footer__nav" aria-label="Подвал">
        <a href="#trust">Доверие</a>
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
      <p className="bs-footer__copy">
        {SITE_NAME} · {new Date().getFullYear()}
      </p>
    </footer>
  );
}
