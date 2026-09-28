"use client";

/**
 * The one 3D panel treatment in the product.
 *
 * The landing hero and the dashboard's load-core tile were the same object
 * wearing two different sets of furniture. The hero boxed its scene in a hard
 * square with four corner brackets and a scanline texture behind it; the
 * dashboard let the scene bleed edge to edge under a gradient scrim. A reader
 * who compared the two — which is exactly what a landing page invites, since it
 * advertises the product the dashboard contains — saw two unrelated designs.
 *
 * There is one panel now, and both pages use it:
 *
 *   · A `bg-surface` panel on a hairline, at the radius and padding every other
 *     card in the product uses. The 3D sits in the same furniture as the copy
 *     beside it instead of reading as a foreign object dropped onto the page.
 *   · The scene runs full-bleed inside the panel. Copy that sits *over* the
 *     scene passes `edge`, and the panel then fades that edge into the surface
 *     so the text stays legible. Copy in the adjacent grid column — which is
 *     what the hero does — must pass nothing: a directional fade there has no
 *     copy to protect and only dims half the scene for no reason.
 *   · When WebGL is unavailable, or a scene throws while mounting, the panel
 *     renders `SceneFallback` instead. See `webglSupport.ts` for why a blank
 *     rectangle is not an acceptable failure mode for decoration.
 */
import { Component, useEffect, useRef, useState, type ReactNode, type ErrorInfo } from "react";

import { cn } from "@/lib/cn";
import { SceneFallback } from "./SceneFallback";
import { useWebGLSupport } from "./webglSupport";

/** Which side of the panel overlaid copy sits on, and therefore which side fades. */
export type SceneEdge = "start" | "end" | "bottom";

/**
 * Directional fade from the panel surface into the scene.
 *
 * Logical properties rather than left/right, so the `start`/`end` edges mirror
 * correctly under `[dir="rtl"]` — the Arabic locale flips the axis and a
 * physical `bg-gradient-to-l` would fade the wrong way.
 */
function SceneFade({ edge }: { edge: SceneEdge }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0",
        // `from-surface` has to match the panel ground exactly or the fade
        // leaves a visible seam where it ends.
        edge === "bottom" && "bg-gradient-to-t from-surface via-surface/40 to-transparent",
        edge === "start" &&
          "bg-gradient-to-r from-surface via-surface/40 to-transparent rtl:bg-gradient-to-l",
        edge === "end" &&
          "bg-gradient-to-l from-surface via-surface/40 to-transparent rtl:bg-gradient-to-r",
      )}
    />
  );
}

/**
 * Catches a scene that throws while mounting — a lost context, a driver
 * failure, a shader a device refuses. Without this the error unmounts the tree
 * above it; with it, the panel degrades to the fallback.
 *
 * `key` forces a fresh boundary when the scene identity changes, so a remount
 * retries rather than inheriting a tripped boundary.
 */
class SceneBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * Watches the scene slot for a usable box.
 *
 * A canvas with no box does not fail — it renders nothing, forever, with no
 * error. That happens when the panel ends up with no intrinsic size (an
 * unresolved `aspect-ratio`, a collapsed grid track, a parent that never laid
 * out) or when the context is created before the element has been measured.
 * Either way the symptom is identical from the outside: an empty bordered
 * rectangle where the product's one piece of 3D should be.
 *
 * So the panel measures its own slot and gives up on the scene if the box never
 * arrives, rather than leaving an empty rectangle on the page.
 */
function useHasBox(ref: React.RefObject<HTMLElement | null>, enabled: boolean) {
  const [ok, setOk] = useState(true);

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    const measure = () => setOk(el.clientWidth > 0 && el.clientHeight > 0);

    // Two frames: one for layout to settle, one to confirm it stayed settled.
    const raf = requestAnimationFrame(() => requestAnimationFrame(measure));
    const ro = new ResizeObserver(measure);
    ro.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [ref, enabled]);

  return ok;
}

export function ScenePanel({
  scene,
  sceneKey,
  label,
  tone,
  children,
  className,
  edge,
}: {
  /** The canvas, stretched to fill the panel. */
  scene: ReactNode;
  /** Change to remount the scene and retry after a failure. */
  sceneKey?: string;
  /**
   * Monospace caption in the panel's corner, with a live dot.
   *
   * A square with a hairline around it and nothing else in it reads as an empty
   * frame, not as a view. One line of `text-2xs` mono with a status dot is enough
   * to say what the panel is *for* — and it is the same metadata the rest of the
   * product already uses for live state, so it introduces nothing new.
   */
  label?: string;
  /** The dot's tone. `live` pulses; `idle` sits still. */
  tone?: "live" | "idle";
  /** Overlay copy, on its own layer above both the scene and its fade. */
  children?: ReactNode;
  className?: string;
  /** Only for copy that actually overlaps the scene. Omit otherwise. */
  edge?: SceneEdge;
}) {
  const probed = useWebGLSupport();
  const [threw, setThrew] = useState(false);
  const slotRef = useRef<HTMLDivElement>(null);

  // `null` means the probe has not run. Rendering the scene then is deliberate:
  // it matches the server-rendered markup, and a browser without WebGL corrects
  // itself one frame later instead of flashing a fallback at everyone.
  const wanted = probed !== false && !threw;
  const hasBox = useHasBox(slotRef, wanted);
  const showScene = wanted && hasBox;

  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-[18px] border border-line bg-surface",
        className,
      )}
    >
      {/* The scene is inert chrome: nothing in it is a control, so the whole
          layer leaves the hit-test and the tab order alone. */}
      <div
        ref={slotRef}
        aria-hidden
        className="pointer-events-none absolute inset-0"
      >
        {showScene ? (
          <SceneBoundary
            key={`${sceneKey ?? "scene"}:${probed}`}
            onError={() => setThrew(true)}
          >
            {scene}
          </SceneBoundary>
        ) : (
          <SceneFallback className="size-full p-[18%] text-fg" />
        )}
      </div>

      {showScene && edge ? <SceneFade edge={edge} /> : null}

      {/* The caption sits on the same layer as the copy below it, not inside
          the scene slot — the slot is `aria-hidden`, and a live state announced
          from inside it would be invisible to assistive tech. */}
      <div className="pointer-events-none relative flex h-full flex-col">
        {label && (
          <div className="flex items-center gap-2 p-6 pb-0 sm:p-7 sm:pb-0">
            <span
              className={cn(
                "size-1.5 shrink-0 rounded-full",
                tone === "live" ? "bg-state pulse-dot" : "bg-fg-subtle",
              )}
            />
            <span className="text-2xs font-medium uppercase tracking-[0.12em] text-fg-subtle">
              {label}
            </span>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
