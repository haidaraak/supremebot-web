"use client";

/**
 * Reads the design tokens out of CSS so the WebGL layer uses the same palette as
 * everything else.
 *
 * Before this, every colour in both scenes was a hardcoded `#ef4444`, which
 * meant the 3D ignored the theme entirely — a dark-red wireframe on a white
 * page in light mode — and a rebrand would have meant editing shader source.
 * Now the shaders take their colours from `--color-*` and a theme switch
 * propagates into the canvas with no JSX changes.
 *
 * Token values are read from the live computed style rather than duplicated in
 * JS, so `globals.css` stays the single source of truth.
 */

import { useEffect, useState } from "react";
import * as THREE from "three";

export type ScenePalette = {
  accent: THREE.Color;
  accentSoft: THREE.Color;
  ember: THREE.Color;
  fg: THREE.Color;
  warn: THREE.Color;
  ok: THREE.Color;
  info: THREE.Color;
  violet: THREE.Color;
  /** Which theme is active — scenes need it for choices a colour cannot express. */
  isLight: boolean;
  /** True once the tokens have been read; the scene holds still until then. */
  ready: boolean;
};

const TOKENS = {
  accent: "--color-accent",
  accentSoft: "--color-accent-soft",
  ember: "--color-accent-ember",
  fg: "--color-fg",
  warn: "--color-warn",
  ok: "--color-ok",
  info: "--color-info",
  violet: "--color-violet",
} as const;

function readPalette(): ScenePalette {
  const root = getComputedStyle(document.documentElement);
  const pick = (token: string) =>
    new THREE.Color(root.getPropertyValue(token).trim() || "#ef4444");

  return {
    accent: pick(TOKENS.accent),
    accentSoft: pick(TOKENS.accentSoft),
    ember: pick(TOKENS.ember),
    fg: pick(TOKENS.fg),
    warn: pick(TOKENS.warn),
    ok: pick(TOKENS.ok),
    info: pick(TOKENS.info),
    violet: pick(TOKENS.violet),
    isLight: document.documentElement.dataset.theme === "light",
    ready: true,
  };
}

/**
 * A dark placeholder so the first frame has sane colours rather than black,
 * before the tokens have been read.
 */
const FALLBACK: ScenePalette = {
  accent: new THREE.Color("#ef4444"),
  accentSoft: new THREE.Color("#fca5a5"),
  ember: new THREE.Color("#7f1d1d"),
  fg: new THREE.Color("#f4f0f1"),
  warn: new THREE.Color("#fbbf24"),
  ok: new THREE.Color("#34d399"),
  info: new THREE.Color("#60a5fa"),
  violet: new THREE.Color("#a78bfa"),
  isLight: false,
  ready: false,
};

/**
 * Subscribes to the `data-theme` attribute on <html>, which is what
 * `ThemeProvider` and the pre-paint script both set.
 */
export function useScenePalette(): ScenePalette {
  const [palette, setPalette] = useState<ScenePalette>(FALLBACK);

  useEffect(() => {
    const sync = () => setPalette(readPalette());
    sync();

    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  return palette;
}
