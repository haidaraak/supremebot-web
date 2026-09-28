"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Globe } from "lucide-react";

import { LANGUAGES, getStoredLang, type LanguageCode } from "@/i18n/languages";
import { useChangeLanguage } from "@/i18n/I18nProvider";
import { cn } from "@/lib/cn";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<LanguageCode>("en");
  const changeLanguage = useChangeLanguage();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActive(getStoredLang());
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const current = LANGUAGES.find((l) => l.code === active) ?? LANGUAGES[0];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Language"
        className={cn(
          "inline-flex h-9 items-center gap-2 rounded-[10px] border border-line px-3 text-sm text-fg-muted transition-colors hover:border-line-strong hover:text-fg",
          compact && "w-9 justify-center px-0",
        )}
      >
        <Globe className="size-4" strokeWidth={1.6} />
        {!compact && <span className="font-medium">{current.label}</span>}
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute end-0 top-full z-[80] mt-2 w-44 overflow-hidden rounded-[14px] border border-line-strong bg-bg-elevated p-1.5 shadow-[0_24px_60px_-18px_rgba(0,0,0,0.9)]"
        >
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              role="option"
              aria-selected={lang.code === active}
              onClick={() => {
                setActive(lang.code);
                changeLanguage(lang.code);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between gap-3 rounded-[10px] px-2.5 py-2 text-sm transition-colors",
                lang.code === active
                  ? "bg-surface-3 text-fg"
                  : "text-fg-muted hover:bg-surface-2 hover:text-fg",
              )}
            >
              <span className="flex items-center gap-2.5">
                <span className="text-base leading-none">{lang.flag}</span>
                {lang.label}
              </span>
              {lang.code === active && (
                <Check className="size-3.5 text-accent" strokeWidth={2.5} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
