"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { SiteLogo } from "@/components/site-logo";
import { cn } from "@/lib/cn";

const navLinks = [
  { href: "#certificates", label: "Обучение" },
  { href: "#atmosphere", label: "Атмосфера" },
  { href: "#services", label: "Практики" },
  { href: "#booking", label: "Запись" },
];

type SanctuaryHeaderProps = {
  variant?: "hero" | "default";
};

export function SanctuaryHeader({ variant = "default" }: SanctuaryHeaderProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const overHero = variant === "hero" && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "sanctuary-header-calm fixed left-0 right-0 top-0 z-50 px-5 pt-[max(0.75rem,env(safe-area-inset-top))] transition-[background-color,box-shadow] duration-500 sm:px-8",
          scrolled && "sanctuary-header-calm--solid",
          overHero && "sanctuary-header-calm--hero",
        )}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <a href="#" aria-label="Sakina Wellness" className="shrink-0">
            <SiteLogo
              priority
              withDarkFrame={!overHero}
              imageClassName={cn(
                "h-8 w-auto max-w-[10rem] sm:h-9",
                overHero && "brightness-0 invert",
              )}
            />
          </a>
          <nav
            className="sanctuary-header-calm__desktop hidden items-center gap-8 sm:flex"
            aria-label="Основная навигация"
          >
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="sanctuary-header-calm__link">
                {link.label}
              </a>
            ))}
          </nav>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Закрыть меню" : "Меню"}
            className="sanctuary-header-calm__menu sm:hidden"
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-[#FAF7F2]/98"
            onClick={() => setOpen(false)}
          >
            <nav
              className="flex min-h-full flex-col items-center justify-center gap-10 px-6"
              onClick={(e) => e.stopPropagation()}
              aria-label="Мобильное меню"
            >
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="font-display text-[1.75rem] text-[#3D3830]"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
