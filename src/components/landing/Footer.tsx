"use client";

import { useTranslation } from "react-i18next";

import { Wordmark } from "@/components/ui/BrandMark";

export function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  const cols = [
    {
      key: "product",
      links: [
        { label: t("nav.features"), href: "#features" },
        { label: t("nav.pricing"), href: "#pricing" },
        { label: t("nav.compare"), href: "#compare" },
        { label: t("nav.launch"), href: "/dashboard/launch" },
      ],
    },
    {
      key: "resources",
      links: [
        { label: t("nav.faq"), href: "#faq" },
        { label: t("nav.plans"), href: "/dashboard/plans" },
        { label: t("nav.dashboard"), href: "/dashboard" },
      ],
    },
    {
      key: "account",
      links: [
        { label: t("nav.login"), href: "/login" },
        { label: t("nav.getStarted"), href: "/login" },
        { label: t("nav.account"), href: "/dashboard/account" },
      ],
    },
  ];

  return (
    <footer className="border-t border-line bg-bg">
      <div className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <Wordmark />
            <p className="mt-4 text-sm leading-[1.7] text-fg-subtle">
              {t("meta.tagline")}
            </p>
          </div>

          {cols.map((col) => (
            <div key={col.key}>
              <h4 className="text-2xs font-semibold uppercase tracking-[0.14em] text-fg-muted">
                {t(`footer.${col.key}`)}
              </h4>
              <ul className="mt-4 flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={`${col.key}-${link.label}`}>
                    <a
                      href={link.href}
                      className="text-sm text-fg-subtle transition-colors hover:text-fg"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-line pt-7 sm:flex-row sm:items-center">
          <p className="text-xs text-fg-subtle">
            © {year} {t("meta.name")}. {t("footer.rights")}
          </p>
          <p className="max-w-md text-2xs leading-[1.6] text-fg-subtle">
            {t("footer.legal")}
          </p>
        </div>
      </div>
    </footer>
  );
}
