"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { SITE_TITLE } from "@/lib/brand";

const LINKS = [
  { href: "#trust", label: "Доверие" },
  { href: "#about", label: "О практике" },
  { href: "#services", label: "Практики" },
  { href: "#booking", label: "Запись" },
];

export function HomeHeader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className="bs-header">
        <div className="bs-header__inner">
          <a href="#" className="bs-header__brand">
            {SITE_TITLE}
          </a>
          <nav className="bs-header__nav" aria-label="Навигация">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} className="bs-header__link">
                {l.label}
              </a>
            ))}
          </nav>
          <button
            type="button"
            className="bs-header__menu-btn"
            aria-label={open ? "Закрыть меню" : "Меню"}
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

      {open ? (
        <div className="bs-header__drawer" role="dialog" aria-modal="true">
          <nav className="bs-header__drawer-nav">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      ) : null}
    </>
  );
}
