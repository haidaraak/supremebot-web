"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/auth";

/** Redirects anonymous visitors to /login while the session is being resolved. */
export function Guard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="flex flex-col items-center gap-4">
          <span className="size-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <span className="text-sm text-fg-muted">Loading…</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
