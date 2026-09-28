"use client";

/**
 * The dashboard's ambient status indicator, minimal.
 *
 * It renders no data of its own — it reacts to how many tests are live right
 * now, and because it is driven by the same `running` array the slot counter
 * shows, it can never disagree with the number beside it.
 *
 * It shares the hero's scene model, its palette and its panel chrome
 * (`ScenePanel`) — the two are the same object at two scales, and a reader who
 * compares the landing page with the dashboard should not be able to tell that.
 *
 * Crimson is absent from the scene entirely — the live state is already stated
 * by the copy and the indicator beside it, and the shape does not need to say
 * it a second time.
 */

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { useReducedMotion } from "@/lib/useReducedMotion";
import { useScenePalette } from "./useScenePalette";
import { POINT_SIZE_GLSL, usePointScale } from "./pointScale";
import { FROZEN_TIME, WAVE_COUNT, WAVE_GLSL, WAVE_MAX, spherePositions } from "./wave";

const RING_INNER = 0.52;
const RING_OUTER = 0.536;
const DUST_COUNT = 180;
const SHELL_COUNT = 1_600;

/** Sprite diameter in scene units — see `pointScale.ts` for why. */
const SHELL_SIZE = 0.013;

/** Spin and emission rate for a given number of live tests. */
function intensityFor(running: number) {
  if (running <= 0) return { spin: 0.1, rate: 0 };
  return { spin: 0.2 + Math.min(running, 4) * 0.09, rate: 0.4 + Math.min(running, 4) * 0.12 };
}

/* ── Core ──────────────────────────────────────────────────────── */

/** Edges only. The fresnel shell is gone. */
function CoreLattice({ spin }: { spin: number }) {
  const reduced = useReducedMotion();
  const palette = useScenePalette();
  const group = useRef<THREE.LineSegments>(null);
  const material = useRef<THREE.LineBasicMaterial>(null);

  const geometry = useMemo(() => {
    const ico = new THREE.IcosahedronGeometry(0.78, 1);
    return new THREE.EdgesGeometry(ico);
  }, []);

  useFrame((_, delta) => {
    if (material.current) {
      material.current.color.copy(palette.fg);
      // Idle is a held breath; load brightens the same wireframe rather than
      // lighting anything up.
      material.current.opacity = spin > 0.1 ? 0.7 : 0.34;
    }
    if (reduced || !group.current) return;
    group.current.rotation.y += delta * spin;
    group.current.rotation.x += delta * spin * 0.4;
  });

  return (
    <lineSegments ref={group} geometry={geometry} renderOrder={3}>
      <lineBasicMaterial
        ref={material}
        color="#ffffff"
        transparent
        opacity={0.34}
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
    </lineSegments>
  );
}

/* ── Rings ─────────────────────────────────────────────────────── */

function Rings({ rate }: { rate: number }) {
  const reduced = useReducedMotion();
  const palette = useScenePalette();
  const first = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => new THREE.RingGeometry(RING_INNER, RING_OUTER, 96), []);

  const shared = useMemo(
    () => ({ uTime: { value: FROZEN_TIME }, uColor: { value: new THREE.Color("#ffffff") } }),
    [],
  );

  useFrame((state) => {
    const u = first.current?.uniforms;
    if (!u) return;
    u.uColor.value.copy(palette.fg);
    u.uTime.value =
      reduced || rate === 0 ? FROZEN_TIME : state.clock.elapsedTime * (rate / 0.55);
  });

  return (
    <group>
      {Array.from({ length: WAVE_COUNT }, (_, i) => (
        <mesh
          key={i}
          geometry={geometry}
          frustumCulled={false}
          renderOrder={1}
          rotation={[Math.PI / 2 + (i - 1.5) * 0.5, 0, i * 0.6]}
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
                gl_FragColor = vec4(uColor, vEnvelope * cross * 0.58);
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

/* ── Shell + dust ──────────────────────────────────────────────── */

function Shell() {
  const reduced = useReducedMotion();
  const palette = useScenePalette();
  const scale = usePointScale();
  const material = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const positions = spherePositions(SHELL_COUNT, 1.85);
    const seeds = new Float32Array(SHELL_COUNT);
    for (let i = 0; i < SHELL_COUNT; i++) seeds[i] = Math.random();
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    return geo;
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: FROZEN_TIME },
      uSize: { value: SHELL_SIZE },
      uScale: { value: scale },
      uAmp: { value: 0.24 },
      uColor: { value: new THREE.Color("#ffffff") },
    }),
    // `scale` is written per frame in useFrame instead of being a dependency,
    // so a resize costs one uniform write rather than a material rebuild.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useFrame((state) => {
    const u = material.current?.uniforms;
    if (!u) return;
    u.uTime.value = reduced ? FROZEN_TIME : state.clock.elapsedTime;
    u.uScale.value = scale;
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
          void main() {
            vec3 dir = normalize(position);
            float dist = length(position);
            float band = 0.0;
            for (float i = 0.0; i < WAVE_COUNT; i++) {
              float d = abs(dist - waveRadius(uTime, i));
              band += exp(-d * 6.5) * waveEnvelope(uTime, i);
            }
            band = min(band, 1.0);
            float push = band * uAmp * (0.4 + aSeed * 0.5);
            vEnergy = band;
            vec4 mv = modelViewMatrix * vec4(position + dir * push, 1.0);
            gl_Position = projectionMatrix * mv;
            ${POINT_SIZE_GLSL}
          }
        `}
        fragmentShader={/* glsl */ `
          uniform vec3 uColor;
          varying float vEnergy;
          void main() {
            vec2 c = gl_PointCoord - 0.5;
            float d = length(c);
            if (d > 0.5) discard;
            float soft = smoothstep(0.5, 0.0, d);
            gl_FragColor = vec4(uColor, soft * (0.1 + vEnergy * 0.5));
          }
        `}
        transparent
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
    </points>
  );
}

function Dust() {
  const reduced = useReducedMotion();
  const palette = useScenePalette();
  const ref = useRef<THREE.Points>(null);
  const material = useRef<THREE.PointsMaterial>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(spherePositions(DUST_COUNT, 2.4), 3));
    return geo;
  }, []);

  useFrame((_, delta) => {
    if (material.current) {
      material.current.color.copy(palette.fg);
      material.current.opacity = 0.2;
    }
    if (reduced || !ref.current) return;
    ref.current.rotation.y -= delta * 0.03;
  });

  return (
    <points ref={ref} geometry={geometry} frustumCulled={false} renderOrder={-1}>
      <pointsMaterial
        ref={material}
        size={0.014}
        color="#ffffff"
        transparent
        opacity={0.2}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
    </points>
  );
}

/* ── Scene ─────────────────────────────────────────────────────── */

export function LoadCoreScene({ count }: { count: number }) {
  const reduced = useReducedMotion();
  const { spin, rate } = intensityFor(count);

  return (
    <Canvas
      camera={{ position: [0, 0, 3.6], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      style={{ width: "100%", height: "100%" }}
    >
      <CoreLattice spin={spin} />
      <Rings rate={rate} />
      <Shell />
      <Dust />
    </Canvas>
  );
}
