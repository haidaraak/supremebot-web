"use client";

/**
 * The static stand-in for a WebGL scene.
 *
 * Same object, no GPU: a faceted core emitting rings. Drawn in SVG and coloured
 * from `--color-fg`, so it follows the theme exactly as the real scene does and
 * does not read as a different component.
 *
 * Shown when WebGL is unavailable or a scene throws while mounting. It is
 * deliberately flat and quiet — it is the absence of an effect, not a second
 * attempt at one — but it is a finished mark rather than an empty box.
 */
export function SceneFallback({ className }: { className?: string }) {
  // One facet ring plus three wavefronts, matching WAVE_MIN/WAVE_MAX scaled to
  // the 100-unit viewBox the scene occupies.
  const RINGS = [22, 42, 62, 82];
  const FACETS = 12;

  return (
    <div
      className={className}
      aria-hidden
      style={{ display: "grid", placeItems: "center" }}
    >
      <svg
        viewBox="-50 -50 100 100"
        className="size-full max-h-full"
        role="presentation"
      >
        <g fill="none" stroke="currentColor" vectorEffect="non-scaling-stroke">
          {/* Wavefronts: staggered opacity so they read as one travelling
              cycle rather than four concentric circles. */}
          {RINGS.map((r, i) => (
            <circle
              key={r}
              cx={0}
              cy={0}
              r={r}
              strokeWidth={0.5}
              opacity={0.3 - i * 0.06}
            />
          ))}

          {/* The core's facet lines. */}
          <g opacity={0.55} strokeWidth={0.5}>
            {Array.from({ length: FACETS }, (_, i) => {
              const a = (i / FACETS) * Math.PI * 2;
              return (
                <line
                  key={`m${i}`}
                  x1={0}
                  y1={0}
                  x2={Math.cos(a) * 15}
                  y2={Math.sin(a) * 15}
                />
              );
            })}
            {Array.from({ length: FACETS / 2 }, (_, i) => {
              const a = (i / (FACETS / 2)) * Math.PI;
              return (
                <line
                  key={`d${i}`}
                  x1={Math.cos(a) * 15}
                  y1={Math.sin(a) * 15}
                  x2={-Math.cos(a) * 15}
                  y2={-Math.sin(a) * 15}
                />
              );
            })}
            <circle cx={0} cy={0} r={15} strokeWidth={0.5} />
          </g>
        </g>
      </svg>
    </div>
  );
}
