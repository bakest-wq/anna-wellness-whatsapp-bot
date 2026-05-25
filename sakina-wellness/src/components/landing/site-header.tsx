"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { SiteLogo } from "@/components/site-logo";
import { SITE_TITLE } from "@/lib/brand";
import { cn } from "@/lib/cn";
import { useLuxuryMotion } from "./luxury-motion-context";

const navLinks = [
  { href: "#about", label: "О практике" },
  { href: "#practices", label: "Практики" },
  { href: "#experience", label: "Сеанс" },
  { href: "#certificates", label: "Сертификаты" },
  { href: "#booking", label: "Запись" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { reducedMotion } = useLuxuryMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={cn("sw-header", scrolled && "sw-header--scrolled")}
      >
        <div className="sw-container sw-header__inner">
          <a href="#" aria-label={SITE_TITLE} className="shrink-0">
            <SiteLogo priority />
          </a>

          <nav className="sw-nav-desktop" aria-label="Основная навигация">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>

          <a
            href="#booking"
            className="sw-btn sw-header__cta"
          >
            Записаться
          </a>

          <button
            type="button"
            className="sw-menu-btn"
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <X className="h-5 w-5" strokeWidth={1.5} />
            ) : (
              <Menu className="h-5 w-5" strokeWidth={1.5} />
            )}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="sw-nav-mobile"
            aria-label="Мобильное меню"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#booking"
              className="sw-btn"
              onClick={() => setOpen(false)}
            >
              Записаться
            </a>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
