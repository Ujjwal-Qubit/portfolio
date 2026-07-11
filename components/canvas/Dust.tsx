"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { mulberry32 } from "@/lib/canvas/random";
import { useCanvasStore } from "@/lib/canvas/store";

const COUNT = 240;
const BASE_OPACITY = 0.22;
/** After ignition the dust settles here and stays — ambient deep background. */
const SETTLED_OPACITY = 0.09;

/**
 * Sparse ambient particle dust for depth behind the glyph field — one Points
 * cloud, seeded so it's identical across reloads.
 */
export function Dust() {
  const pointsRef = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const rng = mulberry32(0x5f3759df);
    const positions = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (rng() - 0.5) * 20;
      positions[i * 3 + 1] = (rng() - 0.5) * 12;
      positions[i * 3 + 2] = -1 - rng() * 7;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return geo;
  }, []);

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: "#8e8ea3", // mute
        size: 0.035,
        sizeAttenuation: true,
        transparent: true,
        opacity: BASE_OPACITY,
        depthWrite: false,
      }),
    [],
  );

  useFrame((_, delta) => {
    const points = pointsRef.current;
    if (!points) return;
    // Settle to a faint ambient level over the ignition beat, scrubbed —
    // the dust persists through every later beat as deep background.
    const { scrollProgress: p, beats } = useCanvasStore.getState();
    const settle = THREE.MathUtils.smoothstep(p, beats.ignition.start, beats.ignition.end);
    material.opacity = THREE.MathUtils.lerp(BASE_OPACITY, SETTLED_OPACITY, settle);
    points.rotation.y += delta * 0.004; // barely-there churn
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}
