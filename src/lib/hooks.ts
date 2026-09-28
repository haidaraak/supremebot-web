"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Polls an async getter on an interval, pausing when the tab is hidden.
 * Keeps the attack table live without burning cycles in the background.
 */
export function usePoll<T>(
  fetcher: () => Promise<T>,
  intervalMs = 4000,
  enabled = true,
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const fetcherRef = useRef(fetcher);
  const mounted = useRef(true);

  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  const run = useCallback(async () => {
    try {
      const value = await fetcherRef.current();
      if (mounted.current) {
        setData(value);
        setError(null);
      }
    } catch (e) {
      if (mounted.current) setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    if (!enabled) {
      setLoading(false);
      return;
    }
    void run();

    let timer: number | null = null;
    const schedule = () => {
      if (document.hidden) return;
      timer = window.setInterval(() => void run(), intervalMs);
    };
    const onVisibility = () => {
      if (timer) window.clearInterval(timer);
      timer = null;
      if (!document.hidden) {
        void run();
        schedule();
      }
    };
    schedule();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      mounted.current = false;
      if (timer) window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, intervalMs, run]);

  return { data, error, loading, refresh: run };
}
