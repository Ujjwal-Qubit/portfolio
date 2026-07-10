"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { BEATS } from "@/lib/canvas/beats";
import { CONSTELLATION_HEX, GLYPHS } from "@/lib/canvas/glyphs";
import type { GlyphDef } from "@/lib/canvas/glyphs";
import { hashString, mulberry32 } from "@/lib/canvas/random";
import { useCanvasStore } from "@/lib/canvas/store";

/** Faces sit just above the void so the form reads as a silhouette. */
const FACE_COLOR = "#0c0c15";
const BASE_EDGE_OPACITY = 0.55;
const BASE_FACE_OPACITY = 0.92;

interface GlyphInstance {
  def: GlyphDef;
  geometry: THREE.BufferGeometry;
  edges: THREE.EdgesGeometry;
  faceMaterial: THREE.MeshBasicMaterial;
  edgeMaterial: THREE.LineBasicMaterial;
  /** Orbit center — the glyph's home in the field. */
  center: THREE.Vector3;
  radiusX: number;
  radiusY: number;
  zAmp: number;
  orbitSpeed: number;
  phaseA: number;
  phaseB: number;
  phaseC: number;
  spin: THREE.Vector3;
  scale: number;
}

/**
 * Low-poly base form with a smooth seeded radial displacement. The
 * displacement is a continuous function of vertex position, so vertices that
 * share a position stay together even in non-indexed geometry — irregular,
 * never cracked.
 */
function makeGlyphGeometry(rng: () => number): THREE.BufferGeometry {
  const variant = Math.floor(rng() * 3);
  const geometry =
    variant === 0
      ? new THREE.IcosahedronGeometry(1, 0)
      : variant === 1
        ? new THREE.OctahedronGeometry(1, 0)
        : new THREE.TetrahedronGeometry(1, 0);

  const fx = 1 + rng() * 2;
  const fy = 1 + rng() * 2;
  const fz = 1 + rng() * 2;
  const phase = rng() * Math.PI * 2;
  const position = geometry.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < position.count; i++) {
    v.fromBufferAttribute(position, i);
    const f = 1 + 0.14 * Math.sin(v.x * fx + v.y * fy + v.z * fz + phase);
    position.setXYZ(i, v.x * f, v.y * f, v.z * f);
  }
  return geometry;
}

function buildGlyphs(): GlyphInstance[] {
  return GLYPHS.map((def, i) => {
    const rng = mulberry32(hashString(def.id));
    const geometry = makeGlyphGeometry(rng);

    // Spread orbit centers around the viewport (camera z=10, fov 50), all
    // behind the hero type's depth plane; glyphs may drift near screen
    // center but never in front of it.
    const angle = (i / GLYPHS.length) * Math.PI * 2 + rng() * 0.8;
    const spread = 2.6 + rng() * 3.4;
    const center = new THREE.Vector3(
      Math.cos(angle) * spread * 1.35,
      Math.sin(angle) * spread * 0.55,
      -2.5 - rng() * 3.5,
    );

    return {
      def,
      geometry,
      edges: new THREE.EdgesGeometry(geometry),
      faceMaterial: new THREE.MeshBasicMaterial({
        color: FACE_COLOR,
        transparent: true,
        opacity: BASE_FACE_OPACITY,
      }),
      edgeMaterial: new THREE.LineBasicMaterial({
        color: CONSTELLATION_HEX[def.constellation],
        transparent: true,
        opacity: BASE_EDGE_OPACITY,
      }),
      center,
      radiusX: 1.2 + rng() * 1.8,
      radiusY: 0.8 + rng() * 1.4,
      zAmp: 0.4 + rng() * 0.5,
      orbitSpeed: 0.04 + rng() * 0.08,
      phaseA: rng() * Math.PI * 2,
      phaseB: rng() * Math.PI * 2,
      phaseC: rng() * Math.PI * 2,
      spin: new THREE.Vector3(
        0.08 + rng() * 0.2,
        0.08 + rng() * 0.2,
        0.04 + rng() * 0.12,
      ),
      scale: 0.4 + rng() * 0.35,
    };
  });
}

/**
 * Beat 0: the 12 values drifting in the void. Each glyph follows its own
 * seeded orbit; the whole field leans gently away from the cursor (damped,
 * capped — pointer stays {0,0} on touch, leaving pure drift).
 */
export function GlyphField() {
  const glyphs = useMemo(buildGlyphs, []);
  const groupRef = useRef<THREE.Group>(null);
  const itemRefs = useRef<(THREE.Group | null)[]>([]);
  const driftTime = useRef(0);
  const worldPos = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const { pointer, scrollProgress: p } = useCanvasStore.getState();

    // Beat 1 "ignition" — pure functions of scroll progress, so scrubbing
    // back to the top reverses cleanly. As the hero scrolls away the drift
    // quickens, the field disperses outward, and everything fades down by
    // the time the constellation strip arrives.
    const ignite = THREE.MathUtils.smoothstep(p, 0, BEATS.ignition.end);
    const fieldOpacity =
      1 - THREE.MathUtils.smoothstep(p, BEATS.ignition.start, BEATS.ignition.end);
    const speedMult = 1 + 1.5 * ignite;
    const disperse = 1 + 0.4 * ignite;

    group.visible = fieldOpacity > 0.004;
    if (!group.visible) return;

    driftTime.current += delta * speedMult;
    const t = driftTime.current;

    // Parallax: lean away from the cursor. Damped (inertial) and capped by
    // the small target amplitudes; screen +y is down, three +y is up.
    group.position.x = THREE.MathUtils.damp(group.position.x, -pointer.x * 0.8, 2.2, delta);
    group.position.y = THREE.MathUtils.damp(group.position.y, pointer.y * 0.55, 2.2, delta);
    group.rotation.y = THREE.MathUtils.damp(group.rotation.y, -pointer.x * 0.05, 2.2, delta);
    group.rotation.x = THREE.MathUtils.damp(group.rotation.x, pointer.y * 0.04, 2.2, delta);

    for (let i = 0; i < glyphs.length; i++) {
      const glyph = glyphs[i];
      const item = itemRefs.current[i];
      if (!item) continue;

      // disperse scales the offset from screen center, pushing the field
      // outward as ignition ramps (and back in when scrolling up).
      item.position.set(
        (glyph.center.x + glyph.radiusX * Math.cos(t * glyph.orbitSpeed + glyph.phaseA)) *
          disperse,
        (glyph.center.y +
          glyph.radiusY * Math.sin(t * glyph.orbitSpeed * 0.8 + glyph.phaseB)) *
          disperse,
        glyph.center.z + glyph.zAmp * Math.sin(t * glyph.orbitSpeed * 1.3 + glyph.phaseC),
      );
      const spinScale = delta * (0.6 + 0.4 * speedMult);
      item.rotation.x += glyph.spin.x * spinScale;
      item.rotation.y += glyph.spin.y * spinScale;
      item.rotation.z += glyph.spin.z * spinScale;

      // Dim near screen center so the hero type always dominates.
      item.getWorldPosition(worldPos).project(state.camera);
      const centerDist = Math.hypot(worldPos.x, worldPos.y);
      const dim = 0.35 + 0.65 * THREE.MathUtils.smoothstep(centerDist, 0.12, 0.5);
      glyph.edgeMaterial.opacity = BASE_EDGE_OPACITY * dim * fieldOpacity;
      glyph.faceMaterial.opacity = BASE_FACE_OPACITY * fieldOpacity;
    }
  });

  return (
    <group ref={groupRef}>
      {glyphs.map((glyph, i) => (
        <group
          key={glyph.def.id}
          ref={(el) => {
            itemRefs.current[i] = el;
          }}
          scale={glyph.scale}
        >
          <mesh geometry={glyph.geometry} material={glyph.faceMaterial} />
          <lineSegments geometry={glyph.edges} material={glyph.edgeMaterial} />
        </group>
      ))}
    </group>
  );
}
