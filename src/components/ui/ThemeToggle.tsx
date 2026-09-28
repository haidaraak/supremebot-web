"use client";

import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/cn";
import { useTranslation } from "react-i18next";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const { t } = useTranslation();
  const isLight = theme === "light";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isLight ? t("common.themeDark") : t("common.themeLight")}
      title={isLight ? t("common.themeDark") : t("common.themeLight")}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-[10px] border border-line text-fg-muted transition-colors hover:border-line-strong hover:text-fg",
        className,
      )}
    >
      {isLight ? (
        <Moon className="size-[17px]" strokeWidth={1.8} />
      ) : (
        <Sun className="size-[17px]" strokeWidth={1.8} />
      )}
    </button>
  );
}
