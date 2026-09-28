"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, RotateCcw } from "lucide-react";

/**
 * Root error boundary.
 *
 * The app had no `error.tsx` anywhere, so a throw during render produced
 * Next's bare default screen with none of the product's chrome. This keeps the
 * failure inside the design system: the same tokens, the same surfaces, and a
 * real retry rather than a dead end.
 *
 * `reset()` re-renders the segment, which is the correct action for a transient
 * fetch or chunk-load failure — a full reload is not always warranted.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation();

  useEffect(() => {
    // Surfaces the failure in the console with the digest Next attaches, which
    // is what ties a client report back to a server log.
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-5">
      <div className="w-full max-w-md rounded-[20px] border border-line bg-surface p-8">
        <div className="flex size-11 items-center justify-center rounded-[12px] border border-bad/25 bg-bad/10 text-bad">
          <AlertTriangle className="size-5" strokeWidth={1.8} />
        </div>

        <h1 className="font-display mt-6 text-xl font-semibold text-fg">
          {t("common.errorTitle", { defaultValue: "Something went wrong" })}
        </h1>
        <p className="mt-2.5 text-sm leading-[1.65] text-fg-muted">
          {t("common.errorBody", {
            defaultValue:"This view failed to load. Retrying usually clears it — if it keeps failing, the upstream service may be unavailable.",
          })}
        </p>

        {error.digest && (
          <p className="tabular mt-4 text-2xs text-fg-subtle">ref {error.digest}</p>
        )}

        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[12px] bg-accent text-sm font-semibold text-on-accent transition-colors hover:bg-accent-strong">
          <RotateCcw className="size-4" strokeWidth={2} />
          {t("common.retry", { defaultValue: "Try again" })}
        </button>
      </div>
    </div>
  );
}
