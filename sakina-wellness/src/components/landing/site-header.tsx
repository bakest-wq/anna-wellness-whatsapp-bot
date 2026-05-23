"use client";

import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useLuxuryMotion } from "./luxury-motion-context";
import { SiteLogo } from "@/components/site-logo";
import { SITE_TITLE } from "@/lib/brand";
const navLinks = [
  { href: "#intro", label: "О нас" },
  { href: "#why-choose", label: "Почему мы" },
  { href: "#benefits", label: "Преимущества" },
  { href: "#services", label: "Услуги" },
  { href: "#packages", label: "Пакеты" },
  { href: "#booking", label: "Запись" },
  { href: "#states", label: "Состояние" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { reducedMotion } = useLuxuryMotion();
  const { scrollY } = useScroll();
  const headerBg = useTransform(
    scrollY,
    [0, 120],
    ["rgba(255, 249, 243, 0)", "rgba(255, 249, 243, 0.82)"],
  );
  const headerBackdrop = useTransform(
    scrollY,
    [0, 120],
    ["blur(0px)", "blur(14px)"],
  );

  return (
    <>
      <motion.header
        style={
          reducedMotion
            ? undefined
            : {
                backgroundColor: headerBg,
                backdropFilter: headerBackdrop,
                WebkitBackdropFilter: headerBackdrop,
              }
        }
        className="site-header fixed left-0 right-0 top-0 z-50 px-5 pt-[max(0.625rem,env(safe-area-inset-top))] sm:px-6 sm:pt-[max(0.75rem,env(safe-area-inset-top))]"
      >
        <div className="mx-auto flex max-w-lg items-center justify-between md:max-w-2xl">
          <a
            href="#"
            aria-label={SITE_TITLE}
            className="inline-flex shrink-0 rounded-lg transition-opacity hover:opacity-90"
          >
            <SiteLogo priority />
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#C4A574]/28 bg-[#FFF9F3]/75 text-[#B8935A] shadow-[0_6px_20px_-10px_rgba(61,56,48,0.1)] backdrop-blur-sm sm:h-11 sm:w-11"
          >
            {open ? (
              <X className="h-5 w-5" strokeWidth={1.5} />
            ) : (
              <Menu className="h-5 w-5" strokeWidth={1.5} />
            )}
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-[#FAF7F2]/90 backdrop-blur-md"
            onClick={() => setOpen(false)}
          >
            <motion.nav
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex min-h-full flex-col items-center justify-center gap-8"
              onClick={(e) => e.stopPropagation()}
            >
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="font-display text-2xl text-[#3D3830]"
                >
                  {link.label}
                </a>
              ))}
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
