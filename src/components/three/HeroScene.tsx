"use client";

/**
 * Hero scene — monochrome wireframe.
 *
 * The previous version was a particle storm: 18,000 points, three expanding
 * shockwave rings, a fresnel glow core and a bloom pass, all in ember red. It
 * was spectacle, and spectacle is the opposite of what this redesign is for.
 *
 * What survives is the part that was doing real work — the geometry of a load
 * event propagating outward from a source — restated in monochrome:
 *
 *   · No colour. Everything is driven by `--color-fg`, so the scene matches the
 *     text beside it and follows the theme instead of shouting over it.
 *   · No bloom. The postprocessing composer is gone entirely; line weight and
 *     negative space carry any emphasis it used to fake.
 *   · Far fewer elements. A few thousand points instead of 18,000, and they read
 *     as air rather than as a surface.
 *   · Much slower. A quiet rotation reads as considered; fast enough to notice
 *     is fast enough to be noise.
 *
 * Two rendering bugs made this look broken rather than quiet, and both are
 * load-bearing to understand before changing anything here again:
 *
 *   1. **Point size was never projected.** The particle shader sized its sprites
 *      from a hardcoded `300.0 / -mv.z`, which put every one of them at roughly
 *      74 pixels. Overlapping additively, they merged into an opaque white
 *      field that covered the lattice and the rings completely. Sizes are now
 *      real scene units converted through the camera by `usePointScale`.
 *   2. **Additive blending cannot draw ink.** The scene was authored for a dark
 *      ground, where adding the foreground colour works. In light mode
 *      `--color-fg` is near-black, and adding black to anything is a no-op — so
 *      the entire scene disappeared the moment the theme was switched. Every
 *      material here is normal-blended now, which is the only blend mode that
 *      means the same thing in both themes.
 *
 * The engineering standard from before is intact: displacement is still a
 * vertex shader with one uniform write per frame and no allocation, and the
 * rings and the particle shell still evaluate the shared wave function from
 * `wave.ts` so they cannot drift out of phase.
 */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { useReducedMotion } from "@/lib/useReducedMotion";
import { useScenePalette } from "./useScenePalette";
import { POINT_SIZE_GLSL, usePointScale } from "./pointScale";
import { FROZEN_TIME, WAVE_COUNT, WAVE_GLSL, WAVE_MAX, spherePositions } from "./wave";

/**
 * Sparse, so the shell reads as air rather than as a surface.
 *
 * The count is sized against the sprite area, not picked for a number: at the
 * projected size below, this is a few percent coverage at rest and a visible
 * brightening where a wavefront crosses. Raising it much further stops reading
 * as air.
 */
const PARTICLE_COUNT = 5_000;
const SHELL_RADIUS = 2.05;

/** Sprite diameter in scene units. Converted to pixels by `usePointScale`. */
const PARTICLE_SIZE = 0.016;

const RING_INNER = 0.62;
const RING_OUTER = 0.638;

/* ── Particle shell ────────────────────────────────────────────── */

function shellGeometry(count: number, radius: number) {
  const positions = spherePositions(count, radius);
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i++) seeds[i] = Math.random();

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  return geo;
}

function RippleShell() {
  const reduced = useReducedMotion();
  const palette = useScenePalette();
  const scale = usePointScale();
  const material = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => shellGeometry(PARTICLE_COUNT, SHELL_RADIUS), []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: FROZEN_TIME },
      uSize: { value: PARTICLE_SIZE },
      uScale: { value: scale },
      uAmp: { value: 0.3 },
      uColor: { value: new THREE.Color("#ffffff") },
    }),
    // `scale` is deliberately absent: it is written every frame below rather than
    // re-creating the uniform block, so a resize costs one float and not a
    // material rebuild.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useFrame((state) => {
    const u = material.current?.uniforms;
    if (!u) return;
    u.uTime.value = reduced ? FROZEN_TIME : state.clock.elapsedTime;
    u.uScale.value = scale;
    // Monochrome: the same ink as the copy alongside it.
    u.uColor.value.copy(palette.fg);
  });

  return (
    <points geometry={geometry} frustumCulled={false} renderOrder={2}>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={/* glsl */ `
          ${WAVE_GLSL}
          attribute float aSeed;
          uniform float uTime;
          uniform float uSize;
          uniform float uScale;
          uniform float uAmp;
          varying float vEnergy;
          varying float vSeed;

          void main() {
            vec3 dir = normalize(position);
            float dist = length(position);

            float band = 0.0;
            for (float i = 0.0; i < WAVE_COUNT; i++) {
              float d = abs(dist - waveRadius(uTime, i));
              // Wider than the original 9.0 so the wavefront reads as a band
              // travelling through the shell rather than a single lit meridian.
              band += exp(-d * 6.5) * waveEnvelope(uTime, i);
            }
            band = min(band, 1.0);

            float breathe = sin(uTime * 0.5 + aSeed * TAU) * 0.012;
            float push = band * uAmp * (0.35 + aSeed * 0.5) + breathe;

            vEnergy = band;
            vSeed = aSeed;

            vec4 mv = modelViewMatrix * vec4(position + dir * push, 1.0);
            gl_Position = projectionMatrix * mv;
            ${POINT_SIZE_GLSL}
          }
        `}
        fragmentShader={/* glsl */ `
          uniform vec3 uColor;
          varying float vEnergy;
          varying float vSeed;

          void main() {
            vec2 c = gl_PointCoord - 0.5;
            float d = length(c);
            if (d > 0.5) discard;
            float soft = smoothstep(0.5, 0.0, d);
            // Low base alpha so the shell is a suggestion at rest; the energy
            // term is what makes a wavefront legible as it crosses.
            float alpha = soft * (0.13 + vEnergy * 0.62) * (0.55 + vSeed * 0.45);
            gl_FragColor = vec4(uColor, alpha);
          }
        `}
        transparent
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
    </points>
  );
}

/* ── Rings ─────────────────────────────────────────────────────── */

function ShockwaveRings() {
  const reduced = useReducedMotion();
  const palette = useScenePalette();
  const first = useRef<THREE.ShaderMaterial>(null);

  // Thin: 0.62→0.638 instead of 0.62→0.665, so the line reads as a hairline.
  const geometry = useMemo(() => new THREE.RingGeometry(RING_INNER, RING_OUTER, 128), []);

  const shared = useMemo(
    () => ({ uTime: { value: FROZEN_TIME }, uColor: { value: new THREE.Color("#ffffff") } }),
    [],
  );

  useFrame((state) => {
    const u = first.current?.uniforms;
    if (!u) return;
    u.uColor.value.copy(palette.fg);
    u.uTime.value = reduced ? FROZEN_TIME : state.clock.elapsedTime;
  });

  return (
    <group>
      {Array.from({ length: WAVE_COUNT }, (_, i) => (
        <mesh
          key={i}
          geometry={geometry}
          frustumCulled={false}
          renderOrder={1}
          rotation={[Math.PI / 2 + (i - 1) * 0.42, 0, i * 0.55]}
        >
          <shaderMaterial
            ref={i === 0 ? first : undefined}
            uniforms={{ ...shared, uIndex: { value: i } }}
            vertexShader={/* glsl */ `
              ${WAVE_GLSL}
              uniform float uTime;
              uniform float uIndex;
              varying float vEnvelope;
              varying float vRadial;

              void main() {
                float p = wavePhase(uTime, uIndex);
                vec3 pos = position * mix(0.55, ${WAVE_MAX.toFixed(2)}, p);
                vEnvelope = sin(p * 3.14159265);
                vRadial = (length(position.xy) - ${RING_INNER.toFixed(4)}) /
                          ${(RING_OUTER - RING_INNER).toFixed(4)};
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
              }
            `}
            fragmentShader={/* glsl */ `
              uniform vec3 uColor;
              varying float vEnvelope;
              varying float vRadial;
              void main() {
                float cross = sin(clamp(vRadial, 0.0, 1.0) * 3.14159265);
                gl_FragColor = vec4(uColor, vEnvelope * cross * 0.62);
              }
            `}
            transparent
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.NormalBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ── Core ──────────────────────────────────────────────────────── */

/**
 * Just the icosahedron's edges. The fresnel shell that gave it volume also gave
 * it a glow, and both are the kind of effect minimalism is removing.
 */
function CoreLattice() {
  const reduced = useReducedMotion();
  const palette = useScenePalette();
  const group = useRef<THREE.LineSegments>(null);
  const material = useRef<THREE.LineBasicMaterial>(null);

  const geometry = useMemo(() => {
    const ico = new THREE.IcosahedronGeometry(0.92, 1);
    return new THREE.EdgesGeometry(ico);
  }, []);

  useFrame((_, delta) => {
    if (material.current) material.current.color.copy(palette.fg);
    if (reduced || !group.current) return;
    // Deliberately slow — a quiet turn, not a spin.
    group.current.rotation.y += delta * 0.11;
    group.current.rotation.x += delta * 0.055;
  });

  return (
    <lineSegments ref={group} geometry={geometry} renderOrder={3}>
      <lineBasicMaterial
        ref={material}
        color="#ffffff"
        transparent
        opacity={0.7}
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
    </lineSegments>
  );
}

/* ── Dust ──────────────────────────────────────────────────────── */

function Dust() {
  const reduced = useReducedMotion();
  const palette = useScenePalette();
  const ref = useRef<THREE.Points>(null);
  const material = useRef<THREE.PointsMaterial>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(spherePositions(420, 3.4), 3));
    return geo;
  }, []);

  useFrame((_, delta) => {
    if (material.current) {
      material.current.color.copy(palette.fg);
      material.current.opacity = 0.22;
    }
    if (reduced || !ref.current) return;
    ref.current.rotation.y -= delta * 0.012;
  });

  return (
    <points ref={ref} geometry={geometry} frustumCulled={false} renderOrder={-1}>
      <pointsMaterial
        ref={material}
        size={0.014}
        color="#ffffff"
        transparent
        opacity={0.22}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
    </points>
  );
}

/* ── Camera rig ────────────────────────────────────────────────── */

function CameraRig({ reduced }: { reduced: boolean }) {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector2());

  useFrame((state, delta) => {
    if (reduced) return;
    // Reduced travel — it should be felt, not noticed.
    target.current.set(state.pointer.x * 0.26, state.pointer.y * 0.16);
    const k = Math.min(1, delta * 1.6);
    camera.position.x += (target.current.x - camera.position.x) * k;
    camera.position.y += (target.current.y - camera.position.y) * k;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

/* ── Scene ─────────────────────────────────────────────────────── */

export function HeroScene() {
  const reduced = useReducedMotion();

  return (
    <Canvas
      camera={{ position: [0, 0, 5.2], fov: 42 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%" }}
    >
      <CameraRig reduced={reduced} />
      <CoreLattice />
      <ShockwaveRings />
      <RippleShell />
      <Dust />
    </Canvas>
  );
}
