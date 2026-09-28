"use client";

/**
 * Device pixels per world unit, at unit depth.
 *
 * `gl_PointSize` is expressed in framebuffer pixels, so a point sprite whose size
 * is written as a bare constant is really "however many pixels that number
 * happens to be" — it does not shrink when the camera pulls back and it does not
 * grow when the canvas gets larger. Both scenes used to hardcode `300.0 / -mv.z`
 * with a size of `1.5`, which at a 600px canvas and a camera 5.2 units out works
 * out to roughly **74 pixels per particle**. 2,600 additive sprites that size
 * overlap into an opaque white smear that buries the lattice and the rings
 * underneath — the "broken model" was a projection that was never projected.
 *
 * The correct size for a world-space sprite is
 *
 *     pixels = worldSize * (framebufferHeight / (2 * tan(fov / 2))) / -mv.z
 *
 * where the parenthesised term is the pixels-per-world-unit the perspective
 * camera projects at one unit of depth. That is what this hook returns, so a
 * point size in the shaders is a real distance in scene units and the shell
 * stays the same physical density at any canvas size, DPR or camera distance.
 */
import { useThree } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";

export function usePointScale(): number {
  // CSS pixels; multiplied by DPR below to reach the framebuffer.
  const height = useThree((s) => s.size.height);
  const dpr = useThree((s) => s.viewport.dpr);
  const fov = useThree((s) => (s.camera as THREE.PerspectiveCamera).fov);

  return useMemo(() => {
    // Every input here is measured, and measurement can briefly be nonsense:
    // `size.height` is 0 before the canvas is measured, and `viewport.dpr` is
    // absent if the store has not set it yet. A NaN here would propagate into
    // `gl_PointSize`, where it makes the rasteriser discard every sprite — the
    // particle shell would silently vanish rather than fail loudly. So the
    // scale is validated rather than assumed, and falls back to a value that
    // still produces visible geometry.
    const frameHeight = height * dpr;
    if (!Number.isFinite(frameHeight) || frameHeight < 1) return 1;

    // World height spanned by the frustum one unit from the camera.
    const worldHeight = 2 * Math.tan((fov * Math.PI) / 360);
    if (!Number.isFinite(worldHeight) || worldHeight <= 0) return 1;

    const scale = frameHeight / worldHeight;
    return Number.isFinite(scale) && scale > 0 ? scale : 1;
  }, [height, dpr, fov]);
}

/**
 * Clamp shared by both particle shaders.
 *
 * The lower bound is what keeps the shell visible. Below about 1.5 device
 * pixels a sprite stops reading as a point and becomes a faint speck that a
 * sparse shell loses entirely — which is the difference between "a suggestion"
 * and "nothing there". The upper bound stops a particle passing close to the
 * near plane from covering the whole canvas in one sprite.
 */
export const POINT_SIZE_GLSL = /* glsl */ `
  gl_PointSize = clamp(
    uSize * (0.6 + aSeed * 0.5) * uScale / max(-mv.z, 0.001),
    1.5,
    28.0
  );
`;
