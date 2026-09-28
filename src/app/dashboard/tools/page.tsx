"use client";

import { useTranslation } from "react-i18next";
import { Wrench } from "lucide-react";

export default function ToolsPage() {
  const { t } = useTranslation();

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6">
      <div className="relative flex size-20 items-center justify-center rounded-[20px] border border-line bg-surface">
        <Wrench className="size-10 text-fg-subtle" strokeWidth={1.5} />
        <div className="absolute inset-0 animate-pulse rounded-[20px] bg-accent/5" />
      </div>
      <div className="text-center">
        <h1 className="font-display text-2xl font-semibold text-fg">Tools Under Maintenance</h1>
        <p className="mt-2 text-fg-muted">We'll be back soon with new recon tools</p>
      </div>
    </div>
  );
}
