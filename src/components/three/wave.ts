/**
 * The wave model shared by both WebGL scenes.
 *
 * `HeroScene` (the landing hero) and `LoadCore` (the dashboard's ambient status
 * indicator) are the same object at two scales: a faceted core emitting
 * shockwaves that propagate outward. When the model lived inside `HeroScene`
 * the second scene reimplemented it in JavaScript, which meant two sets of
 * easing constants to keep in agreement and a CPU loop in the one that mattered
 * less.
 *
 * Both now derive from the constants and the GLSL below, so they cannot drift.
 */

/** Wavefronts in flight at once. */
export const WAVE_COUNT = 3;

/** Cycles per second. */
export const WAVE_SPEED = 0.55;

/** Wavefront radius at birth and at full extent, in scene units. */
export const WAVE_MIN = 0.55;
export const WAVE_MAX = 3.4;

/** Radius of the particle shell the waves travel through. */
export const SHELL_RADIUS = 2.05;

/** Held time for reduced-motion, so a still frame is a real moment in the cycle. */
export const FROZEN_TIME = 4.2;

/**
 * GLSL definition of a wavefront.
 *
 * GLSL has no include, so consumers paste this into a shader's prelude — which
 * is exactly the guarantee wanted: a ring and a particle shell that evaluate the
 * same function are in phase by construction, not by two copies of a constant
 * happening to agree.
 */
export const WAVE_GLSL = /* glsl */ `
  #define WAVE_COUNT ${WAVE_COUNT.toFixed(1)}
  const float WAVE_SPEED = ${WAVE_SPEED.toFixed(4)};
  const float WAVE_MIN = ${WAVE_MIN.toFixed(4)};
  const float WAVE_MAX = ${WAVE_MAX.toFixed(4)};
  const float TAU = 6.28318530718;

  // Where wavefront i is in its cycle at time t, 0..1.
  float wavePhase(float t, float i) {
    return fract(t * WAVE_SPEED + i / WAVE_COUNT);
  }

  float waveRadius(float t, float i) {
    return mix(WAVE_MIN, WAVE_MAX, wavePhase(t, i));
  }

  // Brightness envelope: quick to appear at the source, slow to fade at the rim.
  float waveEnvelope(float t, float i) {
    return sin(wavePhase(t, i) * 3.14159265);
  }
`;

/**
 * Even point coverage with no polar clumping — a golden-angle spiral rather than
 * a uniform latitude distribution, so the poles get the same density as the
 * equator.
 */
export function spherePositions(count: number, radius: number): Float32Array {
  const positions = new Float32Array(count * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / Math.max(count - 1, 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    positions[i * 3] = Math.cos(theta) * r * radius;
    positions[i * 3 + 1] = y * radius;
    positions[i * 3 + 2] = Math.sin(theta) * r * radius;
  }
  return positions;
}
