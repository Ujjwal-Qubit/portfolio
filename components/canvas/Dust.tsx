"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { BEATS } from "@/lib/canvas/beats";
import { mulberry32 } from "@/lib/canvas/random";
import { useCanvasStore } from "@/lib/canvas/store";

const COUNT = 240;
const BASE_OPACITY = 0.22;

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
    // Fade out with the glyph field over the ignition beat, scrubbed.
    const p = useCanvasStore.getState().scrollProgress;
    const fieldOpacity =
      1 - THREE.MathUtils.smoothstep(p, BEATS.ignition.start, BEATS.ignition.end);
    material.opacity = BASE_OPACITY * fieldOpacity;
    points.visible = fieldOpacity > 0.004;
    points.rotation.y += delta * 0.004; // barely-there churn
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}
