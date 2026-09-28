"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  LayoutGrid,
  Rocket,
  History,
  Wrench,
  CreditCard,
  Settings,
  LogOut,
  Shield,
} from "lucide-react";

import { Wordmark } from "@/components/ui/BrandMark";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAuth, isAdmin } from "@/lib/auth";
import { cn } from "@/lib/cn";

const BASE_ITEMS = [
  { key: "dashboard", href: "/dashboard", icon: LayoutGrid },
  { key: "launch", href: "/dashboard/launch", icon: Rocket },
  { key: "attacks", href: "/dashboard/attacks", icon: History },
  { key: "tools", href: "/dashboard/tools", icon: Wrench },
  { key: "plans", href: "/dashboard/plans", icon: CreditCard },
  { key: "account", href: "/dashboard/account", icon: Settings },
] as const;

const ADMIN_ITEMS = [
  { key: "admin", href: "/dashboard/admin", icon: Shield },
] as const;

/* The mobile bar shows four destinations plus sign-out, so it takes the four a
 * phone user actually needs mid-operation and drops the rest. */
const MOBILE_ITEMS = BASE_ITEMS.filter((i) =>
  ["dashboard", "launch", "attacks", "tools"].includes(i.key),
);

export function Sidebar() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const admin = isAdmin(user);

  const items = [...BASE_ITEMS, ...(admin ? ADMIN_ITEMS : [])];

  return (
    <aside className="fixed inset-y-0 start-0 z-40 hidden w-[248px] flex-col border-e border-line bg-bg-elevated lg:flex">
      <div className="flex h-[60px] items-center border-b border-line px-5">
        <Link href="/">
          <Wordmark size={24} />
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3.5">
        <span className="px-2.5 pb-2 pt-1 text-2xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">
          {t("dash.overview")}
        </span>
        {items.map(({ key, href, icon: Icon }) => {
          const active =
            pathname === href ||
            (key !== "dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={key}
              href={href}
              className={cn(
                "group relative flex h-10 items-center gap-3 rounded-[10px] px-3 text-sm font-medium transition-colors duration-150",
                active
                  ? "bg-surface-2 text-fg"
                  : "text-fg-muted hover:bg-surface-2 hover:text-fg",
              )}
            >
              <Icon
                className={cn(
                  "size-[17px] transition-colors",
                  active ? "text-fg" : "text-fg-subtle group-hover:text-fg-muted",
                )}
                strokeWidth={1.7}
              />
              {t(`nav.${key}`)}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-line p-3.5">
        <div className="mb-3 flex items-center justify-between gap-2 rounded-[11px] bg-surface-2 px-3 py-2.5">
          <div className="min-w-0">
            <div className="truncate text-xs font-medium text-fg">
              {user?.username}
            </div>
            <div className="text-2xs text-fg-subtle">
              {t("dash.plan")}: {user?.plan?.name ?? "—"}
            </div>
          </div>
          <span className="tabular shrink-0 text-xs font-medium text-accent">
            ${user?.balance ?? "0.00"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <button
            type="button"
            onClick={() => void signOut()}
            className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-[10px] border border-line text-xs text-fg-muted transition-colors hover:border-red-500/30 hover:text-bad">
            <LogOut className="size-4" strokeWidth={1.7} />
            {t("common.signOut")}
          </button>
        </div>
      </div>
    </aside>
  );
}

export function MobileBar() {
  const { t } = useTranslation();
  const { signOut } = useAuth();
  const pathname = usePathname();

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex border-t border-line bg-[rgba(var(--rgb-bg),0.94)] backdrop-blur-xl lg:hidden">
      {MOBILE_ITEMS.map(({ key, href, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href);
        return (
          <Link
            key={key}
            href={href}
            className={cn("flex flex-1 flex-col items-center gap-1 py-2.5 text-2xs font-medium transition-colors",
              active ? "text-accent" : "text-fg-subtle",
            )}
          >
            <Icon className="size-[19px]" strokeWidth={1.7} />
            {t(`nav.${key}`)}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={() => void signOut()}
        className="flex flex-1 flex-col items-center gap-1 py-2.5 text-2xs font-medium text-fg-subtle">
        <LogOut className="size-[19px]" strokeWidth={1.7} />
        {t("common.signOut")}
      </button>
    </div>
  );
}
