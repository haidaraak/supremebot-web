"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Wordmark } from "@/components/ui/BrandMark";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/cn";
import { useAuth } from "@/lib/auth";
import { DURATION, EASE, SPRING } from "@/lib/motion";

const LINKS = [
  { key: "features", href: "#features" },
  { key: "compare", href: "#compare" },
  { key: "pricing", href: "#pricing" },
  { key: "faq", href: "#faq" },
];

export function Nav() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /**
   * The drawer is a modal surface, so it owns Escape, the body scroll lock and
   * focus while it is open. Without the lock, the page scrolls behind an open
   * panel on iOS and the links land on the wrong section.
   */
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }
      // Keep Tab inside the panel while it is open.
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    // Move focus into the panel so the next Tab starts from the first link.
    panelRef.current?.querySelector<HTMLElement>("a[href]")?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = useCallback(() => setOpen(false), []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled || open
          ? "border-b border-line bg-[rgba(var(--rgb-bg),0.82)] backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-[60px] max-w-[1240px] items-center justify-between px-5 sm:px-8">
        <a href="#top" className="flex items-center" aria-label="SupremeBot home">
          <Wordmark />
        </a>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.key}
              href={l.href}
              className="rounded-[9px] px-3.5 py-2 text-sm font-medium text-fg-muted transition-colors hover:text-fg"
            >
              {t(`nav.${l.key}`)}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <LanguageSwitcher compact />
          <ThemeToggle />
          <a
            href={user ? "/dashboard" : "/login"}
            className="hidden h-9 items-center rounded-[10px] px-3.5 text-sm font-medium text-fg-muted transition-colors hover:text-fg sm:inline-flex"
          >
            {t("nav.login")}
          </a>
          <a
            href={user ? "/dashboard" : "/login"}
            className="hidden h-9 items-center rounded-[10px] bg-accent px-4 text-sm font-semibold text-on-accent transition-all hover:bg-accent-strong sm:inline-flex"
          >
            {user ? t("nav.dashboard") : t("nav.getStarted")}
          </a>

          {/* Without this the four section links had no reachable control on a
              phone at all — the desktop nav is `hidden md:flex`. */}
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="nav-drawer"
            aria-label={open ? t("common.close") : t("nav.menu")}
            className="flex size-9 items-center justify-center rounded-[10px] border border-line-strong text-fg transition-colors hover:bg-surface-2 md:hidden"
          >
            <span className="relative block h-3.5 w-4">
              <motion.span
                className="absolute inset-x-0 top-0 h-[1.5px] rounded-full bg-current"
                animate={open ? { rotate: 45, y: 6.5 } : { rotate: 0, y: 0 }}
                transition={SPRING.snappy}
              />
              <motion.span
                className="absolute inset-x-0 top-[6.5px] h-[1.5px] rounded-full bg-current"
                animate={open ? { opacity: 0, scaleX: 0.4 } : { opacity: 1, scaleX: 1 }}
                transition={SPRING.snappy}
              />
              <motion.span
                className="absolute inset-x-0 top-[13px] h-[1.5px] rounded-full bg-current"
                animate={open ? { rotate: -45, y: -6.5 } : { rotate: 0, y: 0 }}
                transition={SPRING.snappy}
              />
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="nav-drawer"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={t("nav.menu")}
            className="overflow-hidden border-t border-line bg-glass backdrop-blur-xl md:hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: DURATION.base, ease: EASE.outQuint }}
          >
            <nav className="mx-auto flex max-w-[1240px] flex-col gap-1 px-5 py-4">
              {LINKS.map((l, i) => (
                <motion.a
                  key={l.key}
                  href={l.href}
                  onClick={close}
                  className="rounded-[12px] px-3.5 py-3 text-md font-medium text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: DURATION.base, ease: EASE.outQuint, delay: 0.04 + i * 0.04 }}
                >
                  {t(`nav.${l.key}`)}
                </motion.a>
              ))}

              <div className="my-2 h-px bg-line" />

              <motion.a
                href={user ? "/dashboard" : "/login"}
                onClick={close}
                className="rounded-[12px] px-3.5 py-3 text-md font-medium text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: DURATION.base, ease: EASE.outQuint, delay: 0.2 }}
              >
                {t("nav.login")}
              </motion.a>
              <motion.a
                href={user ? "/dashboard" : "/login"}
                onClick={close}
                className="rounded-[12px] bg-accent px-3.5 py-3 text-center text-md font-semibold text-on-accent transition-colors hover:bg-accent-strong"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: DURATION.base, ease: EASE.outQuint, delay: 0.24 }}
              >
                {user ? t("nav.dashboard") : t("nav.getStarted")}
              </motion.a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
