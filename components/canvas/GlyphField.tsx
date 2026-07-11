"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { BEATS } from "@/lib/canvas/beats";
import { GLYPHS } from "@/lib/canvas/glyphs";
import { mulberry32 } from "@/lib/canvas/random";
import { useCanvasStore } from "@/lib/canvas/store";

/**
 * Beat 0 hero field, ported from the approved prototype
 * (design/reference/prototype-renderer.js). All placement, drift, and synapse
 * math runs in CSS-pixel space with the prototype's exact numbers, then
 * converts to world units per frame — the R3F scene is just the renderer.
 */

const SIGNAL = "#8B7CFF";
const INK = "#EDEDF2";
const MUTE = "#8E8EA3";

// Prototype alphas/sizes (all px values are CSS px).
const OUTLINE_OPACITY = 0.5;
const SPOKE_OPACITY = 0.16;
const DOT_OPACITY = 0.85;
const DOT_RADIUS = 1.6;
const LABEL_OPACITY = 0.55;
const LABEL_FONT_PX = 10;
/** Prototype sets the label baseline at +44px; ≈ visual center for 10px type. */
const LABEL_CENTER_Y = 40.5;
const SYNAPSE_DIST = 250;
const SYNAPSE_OPACITY = 0.22;

/** Supersample factor for the label textures so they stay crisp at dpr 2. */
const LABEL_SCALE = 4;

const MAX_PAIRS = (GLYPHS.length * (GLYPHS.length - 1)) / 2;

interface GlyphInstance {
  id: string;
  text: string;
  outlineGeometry: THREE.BufferGeometry;
  spokeGeometry: THREE.BufferGeometry;
  outlineMaterial: THREE.LineBasicMaterial;
  spokeMaterial: THREE.LineBasicMaterial;
  dotMaterial: THREE.MeshBasicMaterial;
  labelMaterial: THREE.MeshBasicMaterial;
  labelTexture: THREE.CanvasTexture;
  labelCanvas: HTMLCanvasElement;
  /** Label plane size in CSS px, updated whenever the texture is redrawn. */
  labelW: number;
  labelH: number;
  // Prototype placement/drift params: base position as viewport fractions,
  // drift amplitude px, drift frequency rad/s, phases, rotation.
  bx: number;
  by: number;
  ax: number;
  ay: number;
  fx: number;
  fy: number;
  px: number;
  py: number;
  rot: number;
  rotV: number;
}

function lineMaterial(color: string, opacity: number): THREE.LineBasicMaterial {
  return new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthTest: false,
    depthWrite: false,
    fog: false,
    toneMapped: false,
  });
}

/**
 * One RNG stream seeded 42, drawn in the prototype's exact order — this
 * reproduces the approved comp's polygon shapes and grid jitter bit for bit.
 */
function buildGlyphs(): GlyphInstance[] {
  const r = mulberry32(42);
  return GLYPHS.map((def, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const n = 5 + Math.floor(r() * 2);
    const rad = 15 + r() * 12;
    const verts: Array<[number, number]> = [];
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2 + r() * 0.5;
      verts.push([
        Math.cos(a) * rad * (0.7 + r() * 0.5),
        Math.sin(a) * rad * (0.7 + r() * 0.5),
      ]);
    }

    // Prototype coordinates are screen-space (y down); world y is up.
    const outlinePts: number[] = [];
    const spokePts: number[] = [];
    for (const [vx, vy] of verts) {
      outlinePts.push(vx, -vy, 0);
      spokePts.push(0, 0, 0, vx, -vy, 0);
    }
    const outlineGeometry = new THREE.BufferGeometry();
    outlineGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(outlinePts, 3),
    );
    const spokeGeometry = new THREE.BufferGeometry();
    spokeGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(spokePts, 3),
    );

    const labelCanvas = document.createElement("canvas");
    const labelTexture = new THREE.CanvasTexture(labelCanvas);
    labelTexture.colorSpace = THREE.SRGBColorSpace;
    labelTexture.minFilter = THREE.LinearFilter;
    labelTexture.generateMipmaps = false;

    return {
      id: def.id,
      text: def.label,
      outlineGeometry,
      spokeGeometry,
      outlineMaterial: lineMaterial(SIGNAL, OUTLINE_OPACITY),
      spokeMaterial: lineMaterial(SIGNAL, SPOKE_OPACITY),
      dotMaterial: new THREE.MeshBasicMaterial({
        color: INK,
        transparent: true,
        opacity: DOT_OPACITY,
        depthTest: false,
        depthWrite: false,
        fog: false,
        toneMapped: false,
      }),
      labelMaterial: new THREE.MeshBasicMaterial({
        map: labelTexture,
        transparent: true,
        opacity: LABEL_OPACITY,
        depthTest: false,
        depthWrite: false,
        fog: false,
        toneMapped: false,
      }),
      labelTexture,
      labelCanvas,
      labelW: 1,
      labelH: 1,
      bx: 0.14 + col * 0.24 + r() * 0.1,
      by: 0.18 + row * 0.3 + r() * 0.12,
      ax: 20 + r() * 26,
      ay: 16 + r() * 22,
      fx: 0.05 + r() * 0.08,
      fy: 0.04 + r() * 0.07,
      px: r() * 6.28,
      py: r() * 6.28,
      rot: r() * 6.28,
      rotV: (r() - 0.5) * 0.08,
    };
  });
}

/** The site's mono stack (next/font JetBrains Mono), for canvas fillText. */
function monoFamily(): string {
  const family = getComputedStyle(document.body)
    .getPropertyValue("--font-mono-src")
    .trim();
  return family || "monospace";
}

function drawLabel(glyph: GlyphInstance, family: string) {
  const ctx = glyph.labelCanvas.getContext("2d");
  if (!ctx) return;
  const k = LABEL_SCALE;
  const font = `${LABEL_FONT_PX * k}px ${family}`;
  ctx.font = font;
  const w = Math.max(Math.ceil(ctx.measureText(glyph.text).width) + 2 * k, 2);
  const h = (LABEL_FONT_PX + 4) * k;
  glyph.labelCanvas.width = w; // resizing resets ctx state
  glyph.labelCanvas.height = h;
  ctx.font = font;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = MUTE;
  ctx.fillText(glyph.text, w / 2, h / 2);
  glyph.labelW = w / k;
  glyph.labelH = h / k;
  glyph.labelTexture.needsUpdate = true;
}

/**
 * Beat 0: 12 flat constellation marks on a jittered 4×3 grid filling the
 * whole viewport — thin signal outlines, faint spokes, ink center dot, mute
 * label below, synapse lines between near pairs. Glyphs dim near screen
 * center so the hero type dominates; the field leans gently away from the
 * cursor (damped, {0,0} on touch).
 */
export function GlyphField() {
  const glyphs = useMemo(buildGlyphs, []);
  const groupRef = useRef<THREE.Group>(null);
  const itemRefs = useRef<(THREE.Group | null)[]>([]);
  const polyRefs = useRef<(THREE.Group | null)[]>([]);
  const labelRefs = useRef<(THREE.Mesh | null)[]>([]);
  const driftTime = useRef(0);

  // Per-frame scratch: glyph centers (CSS px) and center-dim factors.
  const posX = useMemo(() => new Float32Array(GLYPHS.length), []);
  const posY = useMemo(() => new Float32Array(GLYPHS.length), []);
  const dims = useMemo(() => new Float32Array(GLYPHS.length), []);

  const dotGeometry = useMemo(() => new THREE.CircleGeometry(DOT_RADIUS, 16), []);
  const planeGeometry = useMemo(() => new THREE.PlaneGeometry(1, 1), []);

  const synapse = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new THREE.Float32BufferAttribute(MAX_PAIRS * 2 * 3, 3);
    const colors = new THREE.Float32BufferAttribute(MAX_PAIRS * 2 * 3, 3);
    positions.setUsage(THREE.DynamicDrawUsage);
    colors.setUsage(THREE.DynamicDrawUsage);
    geometry.setAttribute("position", positions);
    geometry.setAttribute("color", colors);
    geometry.setDrawRange(0, 0);
    // Additive lines on the void ≈ the prototype's alpha + shadowBlur glow;
    // per-line alpha is folded into the vertex color.
    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      fog: false,
      toneMapped: false,
    });
    return { geometry, positions, colors, material, hue: new THREE.Color(SIGNAL) };
  }, []);

  // Labels draw immediately (mono is on screen well before this lazy chunk
  // loads) and once more after the font face set settles, just in case.
  useEffect(() => {
    let cancelled = false;
    const apply = () => {
      const family = monoFamily();
      for (const glyph of glyphs) drawLabel(glyph, family);
    };
    apply();
    document.fonts.ready.then(() => {
      if (!cancelled) apply();
    });
    return () => {
      cancelled = true;
    };
  }, [glyphs]);

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

    const w = state.size.width;
    const h = state.size.height;
    if (!w || !h) return;
    /** World units per CSS px at the glyph plane (z=0). */
    const s = state.viewport.width / w;

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

      // Prototype drift: base grid position + slow sinusoid, in CSS px.
      // disperse scales the offset from screen center as ignition ramps.
      let cx = glyph.bx * w + Math.sin(t * glyph.fx + glyph.px) * glyph.ax;
      let cy = glyph.by * h + Math.cos(t * glyph.fy + glyph.py) * glyph.ay;
      cx = w / 2 + (cx - w / 2) * disperse;
      cy = h / 2 + (cy - h / 2) * disperse;
      posX[i] = cx;
      posY[i] = cy;

      item.position.set((cx - w / 2) * s, (h / 2 - cy) * s, 0);
      item.scale.setScalar(s);

      const poly = polyRefs.current[i];
      // Negated: prototype rotation is in y-down screen space.
      if (poly) poly.rotation.z = -(glyph.rot + t * glyph.rotV);

      const label = labelRefs.current[i];
      if (label) label.scale.set(glyph.labelW, glyph.labelH, 1);

      // Dim near screen center so the hero type always dominates.
      const centerDist = Math.hypot((cx / w) * 2 - 1, (cy / h) * 2 - 1);
      const dim = 0.35 + 0.65 * THREE.MathUtils.smoothstep(centerDist, 0.12, 0.5);
      dims[i] = dim;
      const fade = dim * fieldOpacity;
      glyph.outlineMaterial.opacity = OUTLINE_OPACITY * fade;
      glyph.spokeMaterial.opacity = SPOKE_OPACITY * fade;
      glyph.dotMaterial.opacity = DOT_OPACITY * fade;
      glyph.labelMaterial.opacity = LABEL_OPACITY * fade;
    }

    // Synapses: a line between every pair closer than 250px, alpha fading
    // with distance (prototype rule), folded into additive vertex colors.
    const pos = synapse.positions;
    const col = synapse.colors;
    const { r: hr, g: hg, b: hb } = synapse.hue;
    let seg = 0;
    for (let i = 0; i < glyphs.length; i++) {
      for (let j = i + 1; j < glyphs.length; j++) {
        const d = Math.hypot(posX[i] - posX[j], posY[i] - posY[j]);
        if (d >= SYNAPSE_DIST) continue;
        const alpha =
          (1 - d / SYNAPSE_DIST) *
          SYNAPSE_OPACITY *
          fieldOpacity *
          ((dims[i] + dims[j]) / 2);
        const v = seg * 2;
        pos.setXYZ(v, (posX[i] - w / 2) * s, (h / 2 - posY[i]) * s, 0);
        pos.setXYZ(v + 1, (posX[j] - w / 2) * s, (h / 2 - posY[j]) * s, 0);
        col.setXYZ(v, hr * alpha, hg * alpha, hb * alpha);
        col.setXYZ(v + 1, hr * alpha, hg * alpha, hb * alpha);
        seg++;
      }
    }
    synapse.geometry.setDrawRange(0, seg * 2);
    pos.needsUpdate = true;
    col.needsUpdate = true;
  });

  return (
    <group ref={groupRef}>
      <lineSegments
        geometry={synapse.geometry}
        material={synapse.material}
        frustumCulled={false}
        renderOrder={1}
      />
      {glyphs.map((glyph, i) => (
        <group
          key={glyph.id}
          ref={(el) => {
            itemRefs.current[i] = el;
          }}
        >
          <group
            ref={(el) => {
              polyRefs.current[i] = el;
            }}
          >
            <lineLoop
              geometry={glyph.outlineGeometry}
              material={glyph.outlineMaterial}
              renderOrder={2}
            />
            <lineSegments
              geometry={glyph.spokeGeometry}
              material={glyph.spokeMaterial}
              renderOrder={2}
            />
          </group>
          <mesh geometry={dotGeometry} material={glyph.dotMaterial} renderOrder={3} />
          <mesh
            ref={(el) => {
              labelRefs.current[i] = el;
            }}
            geometry={planeGeometry}
            material={glyph.labelMaterial}
            position={[0, -LABEL_CENTER_Y, 0]}
            renderOrder={3}
          />
        </group>
      ))}
    </group>
  );
}
