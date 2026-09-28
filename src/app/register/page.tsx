"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { ArrowRight, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { Wordmark } from "@/components/ui/BrandMark";
import { api, ApiError } from "@/lib/api";

function RegisterForm() {
  const { t } = useTranslation();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // Backend owns registration shape; the proxy forwards whatever it returns.
      await api.post("/auth/register", {
        username: username.trim(),
        email: email.trim(),
        password,
      });
      await router.push("/login?registered=1");
    } catch (err) {
      const msg =
        err instanceof ApiError && err.message ? err.message : t("auth.errorGeneric");
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="relative w-full max-w-[420px] overflow-hidden rounded-[20px] border border-line-strong bg-[var(--color-glass)] p-7 backdrop-blur-xl sm:p-8">
      <div className="pointer-events-none absolute inset-0 opacity-25" />

      <div className="relative">
        <div className="mb-6 flex items-center justify-between">
          <Wordmark />
          <LanguageSwitcher compact />
        </div>

        <h1 className="font-display text-2xl font-semibold text-fg">
          {t("auth.signUpTitle")}
        </h1>
        <p className="mt-2 text-sm text-fg-muted">
          {t("auth.signUpSub")}
        </p>

        <div className="mt-7 flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-xs font-medium text-fg-muted">
              {t("auth.username")}
            </span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              spellCheck={false}
              required
              className="h-12 rounded-[12px] border border-line-strong bg-input px-4 text-base text-fg outline-none transition-colors placeholder:text-fg-subtle focus:border-accent/60"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-medium text-fg-muted">
              {t("auth.email")}
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              className="h-12 rounded-[12px] border border-line-strong bg-input px-4 text-base text-fg outline-none transition-colors placeholder:text-fg-subtle focus:border-accent/60"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-medium text-fg-muted">
              {t("auth.password")}
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={6}
              className="h-12 rounded-[12px] border border-line-strong bg-input px-4 text-base text-fg outline-none transition-colors placeholder:text-fg-subtle focus:border-accent/60"
            />
          </label>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2.5 rounded-[11px] border border-bad/25 bg-bad/8 px-3.5 py-2.5 text-xs text-bad">
            <AlertCircle className="size-4 shrink-0" strokeWidth={2} />
            {error}
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          loading={loading}
          className="mt-6 w-full">
          {!loading && <ArrowRight className="size-4" strokeWidth={2.2} />}
          {t("auth.signUp")}
        </Button>

        <p className="mt-6 text-center text-xs text-fg-subtle">
          {t("auth.haveAccount")}{" "}
          <Link
            href="/login"
            className="font-medium text-accent transition-colors hover:text-accent-strong">
            {t("auth.signInInstead")}
          </Link>
        </p>
      </div>
    </form>
  );
}

export default function RegisterPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg px-5 py-16">
      <div className="pointer-events-none absolute inset-0 opacity-70" />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(var(--rgb-accent),),transparent_68%)]"
      />
      <Suspense fallback={null}>
        <RegisterForm />
      </Suspense>
    </main>
  );
}
