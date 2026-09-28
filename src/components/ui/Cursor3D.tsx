"use client";

import { useEffect, useRef } from "react";

/**
 * Custom cursor — a targeting reticle.
 *
 * A centre dot tracks the pointer directly while four corner brackets trail
 * behind and rotate with the direction of travel, so the reticle reads as an
 * instrument being aimed. Over an interactive element the brackets lock outward
 * and the dot goes crimson; on press they snap inward.
 *
 * Everything is additive DOM — no WebGL, no library — and the native arrow is
 * hidden only after the reticle is live and only on fine pointers, so nothing is
 * left cursor-less for keyboard or touch users. Reticle corners are driven off
 * a single transform, so the rAF loop is cheap and can be paused when the
 * pointer is idle.
 */

const FOLLOW_DOT = 0.6; // how tightly the dot hugs the pointer
const FOLLOW_EDGE = 0.16; // the brackets trail this much (the lag is the depth)
const ROTATE_K = 0.012; // how far travel tilts the reticle

export function Cursor3D() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const reticleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (coarse || reduced) return;

    const wrap = wrapRef.current;
    const dot = dotRef.current;
    const reticle = reticleRef.current;
    if (!wrap || !dot || !reticle) return;

    let px = window.innerWidth / 2;
    let py = window.innerHeight / 2;
    let dx = px;
    let dy = py;
    let rx = px;
    let ry = py;
    let vx = 0;
    let vy = 0;
    let rot = 0;
    let active = false;
    let hot = false;
    let raf = 0;
    let running = false;
    let visible = false;
    let lastMove = 0;

    const tick = () => {
      const now = performance.now();

      dx += (px - dx) * FOLLOW_DOT;
      dy += (py - dy) * FOLLOW_DOT;
      rx += (px - rx) * FOLLOW_EDGE;
      ry += (py - ry) * FOLLOW_EDGE;
      // Rotate in the direction of travel, damped to settle when the hand stops.
      const targetRot = Math.atan2(vy, vx);
      rot += (targetRot - rot) * 0.12;

      // Hot → lock outward; active → snap in.
      const lock = hot ? 7 : 0;
      const press = active ? -1.5 : 0;

      dot.style.transform = `translate3d(${dx}px, ${dy}px, 0) translate(-50%,-50%) scale(${
        hot ? 0.55 : active ? 0.7 : 1
      })`;
      reticle.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%,-50%) rotate(${rot}rad) scale(${
        1 + lock / 18 + press / 18
      })`;

      vx *= 0.88;
      vy *= 0.88;

      // Keep animating while the hand moves or has just moved; idle → pause the
      // loop rather than burn a permanent rAF waiting for the next pointermove.
      if (now - lastMove < 120) {
        raf = requestAnimationFrame(tick);
      } else {
        running = false;
      }
    };

    const start = () => {
      if (running) return;
      running = true;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      vx = e.movementX;
      vy = e.movementY;
      lastMove = performance.now();
      if (!visible) {
        visible = true;
        wrap.style.opacity = "1";
      }
      start();
    };

    const onDown = () => {
      active = true;
    };
    const onUp = () => {
      active = false;
    };

    const onOver = (e: MouseEvent) => {
      const el = (e.target as HTMLElement)?.closest(
        "a, button, input, textarea, select, [role='tab'], label, summary, [role='button']",
      );
      hot = Boolean(el);
      dot.dataset.hot = hot ? "true" : "false";
      reticle.querySelectorAll<HTMLElement>(".cursor-bracket").forEach((b) => {
        b.dataset.hot = hot ? "true" : "false";
      });
    };

    const onLeave = () => {
      wrap.style.opacity = "0";
      visible = false;
      running = false;
      cancelAnimationFrame(raf);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    document.addEventListener("mouseleave", onLeave);

    // Hide the native arrow only now that the reticle is mounted.
    document.documentElement.classList.add("hack-cursor");
    wrap.style.opacity = "0";

    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("hack-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[9999] opacity-0 transition-opacity duration-200"
    >
      <div
        ref={dotRef}
        className="cursor-dot absolute left-0 top-0 size-[6px] transition-[background-color] duration-150"
        style={{ willChange: "transform" }}
      />
      <div
        ref={reticleRef}
        className="absolute left-0 top-0 size-6"
        style={{ willChange: "transform" }}
      >
        <span className="cursor-bracket cursor-bracket-tl" />
        <span className="cursor-bracket cursor-bracket-tr" />
        <span className="cursor-bracket cursor-bracket-bl" />
        <span className="cursor-bracket cursor-bracket-br" />
      </div>
    </div>
  );
}
