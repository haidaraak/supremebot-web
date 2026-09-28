"use client";

/**
 * WebGL capability probe.
 *
 * The 3D is decoration. Nothing in the product depends on it working, and it is
 * entirely possible for it not to: WebGL can be disabled, blocked by policy,
 * unavailable in a headless or remote session, or refused because too many
 * contexts are already live. A `<Canvas>` in that situation mounts, creates no
 * drawing buffer, and renders an empty rectangle — so the hero's largest single
 * element becomes a blank box with a border, and there is no error to read.
 *
 * That failure mode is the reason this module exists. Callers use it to render
 * a designed fallback instead, so the worst case is a flat mark rather than a
 * hole in the page.
 */
import { useEffect, useState } from "react";

function detect(): boolean {
  if (typeof document === "undefined") return true; // SSR: assume, then correct
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl2") ||
          canvas.getContext("webgl") ||
          canvas.getContext("experimental-webgl")),
    );
  } catch {
    return false;
  }
}

/**
 * `null` until the probe has run, so the first paint matches the server and a
 * supported context is not replaced a frame later by a fallback.
 */
export function useWebGLSupport(): boolean | null {
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    setSupported(detect());
  }, []);

  return supported;
}
