"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { rangeProgress } from "@/lib/canvas/beats";
import { CONSTELLATION_HEX, GLYPHS } from "@/lib/canvas/glyphs";
import type { GlyphConstellation } from "@/lib/canvas/glyphs";
import { mulberry32 } from "@/lib/canvas/random";
import { useCanvasStore } from "@/lib/canvas/store";

/**
 * The signal field — the 12 values across the scroll narrative. Beats 0–1
 * are the hero drift ported from the approved prototype
 * (design/reference/prototype-renderer.js); beat 2 gravitates the glyphs
 * into their three constellations behind the strip. Everything is a pure
 * function of scroll progress (plus ambient drift time), so scrubbing in
 * either direction is seamless.
 *
 * All placement/drift/synapse math runs in CSS-pixel space with the
 * prototype's exact numbers, then converts to world units per frame — the
 * R3F scene is just the renderer.
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

/** Beat 2: clustered glyphs keep a small local float so drift never dies. */
const CLUSTER_FLOAT_PX = 7;

/**
 * Labels are canvas-texture sprites drawn with the real JetBrains Mono TTF,
 * loaded explicitly via the FontFace API so metrics are deterministic — no
 * fallback-font measurement window, no distortion. (drei/troika Text renders
 * a broken fullscreen quad against three r185, so it's not an option here.)
 */
const LABEL_FONT_URL = "/fonts/JetBrainsMono-Regular.ttf";
const LABEL_FONT_FAMILY = "GlyphFieldMono";
/** Supersample factor for the label textures so they stay crisp at dpr 2. */
const LABEL_SCALE = 4;

const GROUPS: GlyphConstellation[] = ["builder", "mind", "human"];

/** Proximity pairs + the 6-pair web inside each of the 3 constellations. */
const PROXIMITY_PAIRS = (GLYPHS.length * (GLYPHS.length - 1)) / 2;
const WEB_PAIRS = 3 * 6;
const MAX_SEGMENTS = PROXIMITY_PAIRS + WEB_PAIRS;

/** Intra-constellation pairs, precomputed: [i, j, groupIndex, stagger 0..5]. */
const CLUSTER_WEB: Array<[number, number, number, number]> = (() => {
  const pairs: Array<[number, number, number, number]> = [];
  for (let g = 0; g < 3; g++) {
    const base = g * 4; // GLYPHS is ordered builder ×4, mind ×4, human ×4
    let k = 0;
    for (let a = 0; a < 4; a++) {
      for (let b = a + 1; b < 4; b++) {
        pairs.push([base + a, base + b, g, k]);
        k++;
      }
    }
  }
  return pairs;
})();

const easeOutQuart = (x: number) => 1 - (1 - x) ** 4;

interface GlyphInstance {
  id: string;
  text: string;
  group: GlyphConstellation;
  groupIndex: number;
  /** Order within the constellation (0..3), for the cluster formation. */
  groupOrder: number;
  outlineGeometry: THREE.BufferGeometry;
  spokeGeometry: THREE.BufferGeometry;
  outlineMaterial: THREE.LineBasicMaterial;
  spokeMaterial: THREE.LineBasicMaterial;
  dotMaterial: THREE.MeshBasicMaterial;
  labelMaterial: THREE.MeshBasicMaterial;
  labelTexture: THREE.CanvasTexture;
  labelCanvas: HTMLCanvasElement;
  /** Label plane size in CSS px; 0 until the font has loaded and drawn. */
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
  // Beat 2: seeded offset from the cluster anchor + local float params.
  clusterX: number;
  clusterY: number;
  floatFx: number;
  floatFy: number;
  floatPhase: number;
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
 * Cluster-formation params come from a SEPARATE stream so they can never
 * shift the hero layout.
 */
function buildGlyphs(): GlyphInstance[] {
  const r = mulberry32(42);
  const glyphs = GLYPHS.map((def, i) => {
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
      group: def.constellation,
      groupIndex: GROUPS.indexOf(def.constellation),
      groupOrder: i % 4,
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
        opacity: 0, // stays invisible until the TTF has loaded and drawn
        depthTest: false,
        depthWrite: false,
        fog: false,
        toneMapped: false,
      }),
      labelTexture,
      labelCanvas,
      labelW: 0,
      labelH: 0,
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
      clusterX: 0,
      clusterY: 0,
      floatFx: 0,
      floatFy: 0,
      floatPhase: 0,
    };
  });

  const rc = mulberry32(7);
  for (const glyph of glyphs) {
    const angle = (glyph.groupOrder / 4) * Math.PI * 2 + (rc() - 0.5) * 1.2;
    const radius = 58 + rc() * 52;
    glyph.clusterX = Math.cos(angle) * radius * 1.15;
    glyph.clusterY = Math.sin(angle) * radius * 0.8;
    glyph.floatFx = 0.25 + rc() * 0.2;
    glyph.floatFy = 0.2 + rc() * 0.2;
    glyph.floatPhase = rc() * 6.28;
  }
  return glyphs;
}

/**
 * Where each constellation gathers, in CSS px. Spread across the viewport
 * behind the strip (matching its builder/mind/human column order); stacked
 * vertically on narrow viewports.
 */
function clusterAnchor(group: number, w: number, h: number, out: number[]) {
  if (w < 768) {
    out[0] = w * 0.5;
    out[1] = h * (0.3 + group * 0.25);
    return;
  }
  out[0] = w * (0.2 + group * 0.3);
  out[1] = h * (group === 1 ? 0.56 : 0.62);
}

/**
 * Renders one label into its canvas at LABEL_SCALE× and records the plane
 * size in CSS px. Only called once the TTF is resident (or its load failed),
 * so measureText always uses the metrics of the face actually drawn.
 */
function drawLabel(glyph: GlyphInstance) {
  const ctx = glyph.labelCanvas.getContext("2d");
  if (!ctx) return;
  const k = LABEL_SCALE;
  const font = `${LABEL_FONT_PX * k}px "${LABEL_FONT_FAMILY}", monospace`;
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

export function SignalField() {
  const glyphs = useMemo(buildGlyphs, []);
  const groupRef = useRef<THREE.Group>(null);
  const itemRefs = useRef<(THREE.Group | null)[]>([]);
  const polyRefs = useRef<(THREE.Group | null)[]>([]);
  const labelRefs = useRef<(THREE.Mesh | null)[]>([]);
  const driftTime = useRef(0);

  // Per-frame scratch: glyph centers (CSS px), dim factors, cluster ease.
  const posX = useMemo(() => new Float32Array(GLYPHS.length), []);
  const posY = useMemo(() => new Float32Array(GLYPHS.length), []);
  const dims = useMemo(() => new Float32Array(GLYPHS.length), []);
  const clusterEase = useMemo(() => new Float32Array(GLYPHS.length), []);
  const anchorScratch = useMemo(() => [0, 0], []);

  const dotGeometry = useMemo(() => new THREE.CircleGeometry(DOT_RADIUS, 16), []);
  const planeGeometry = useMemo(() => new THREE.PlaneGeometry(1, 1), []);

  const hues = useMemo(
    () => ({
      signal: new THREE.Color(SIGNAL),
      builder: new THREE.Color(CONSTELLATION_HEX.builder),
      mind: new THREE.Color(CONSTELLATION_HEX.mind),
      human: new THREE.Color(CONSTELLATION_HEX.human),
    }),
    [],
  );

  const synapse = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new THREE.Float32BufferAttribute(MAX_SEGMENTS * 2 * 3, 3);
    const colors = new THREE.Float32BufferAttribute(MAX_SEGMENTS * 2 * 3, 3);
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
    return { geometry, positions, colors, material };
  }, []);

  // Load the TTF, then draw every label with its real metrics. On failure
  // (offline dev?) draw anyway — monospace fallback beats missing labels.
  useEffect(() => {
    let cancelled = false;
    const drawAll = () => {
      if (cancelled) return;
      for (const glyph of glyphs) drawLabel(glyph);
    };
    const face = new FontFace(LABEL_FONT_FAMILY, `url(${LABEL_FONT_URL})`);
    face
      .load()
      .then((loaded) => {
        document.fonts.add(loaded);
        drawAll();
      })
      .catch(drawAll);
    return () => {
      cancelled = true;
    };
  }, [glyphs]);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const { pointer, scrollProgress: p, beats } = useCanvasStore.getState();

    // Beat 1 "ignition": the field never dies — drift quickens and the grid
    // breathes outward, handing a dispersed-but-alive field to beat 2.
    const ignite = THREE.MathUtils.smoothstep(p, 0, beats.ignition.end);
    // Beat 2: 0..1 across the constellations range; each group eases in on
    // its own staggered window inside it (builder → mind → human).
    const clusterBeatP = rangeProgress(beats.constellations, p);
    const speedMult = 1 + 1.5 * ignite;
    const disperse = 1 + 0.4 * ignite;

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

      // Hero position: prototype drift + ignition dispersion (unchanged, so
      // scrubbing back to the top always restores the comp exactly).
      let hx = glyph.bx * w + Math.sin(t * glyph.fx + glyph.px) * glyph.ax;
      let hy = glyph.by * h + Math.cos(t * glyph.fy + glyph.py) * glyph.ay;
      hx = w / 2 + (hx - w / 2) * disperse;
      hy = h / 2 + (hy - h / 2) * disperse;

      // Cluster position: anchor + seeded formation offset + local float.
      const gStart = glyph.groupIndex * 0.22;
      const gP = easeOutQuart(
        Math.min(Math.max((clusterBeatP - gStart) / 0.56, 0), 1),
      );
      clusterEase[i] = gP;
      clusterAnchor(glyph.groupIndex, w, h, anchorScratch);
      const kx =
        anchorScratch[0] +
        glyph.clusterX +
        Math.sin(t * glyph.floatFx + glyph.floatPhase) * CLUSTER_FLOAT_PX * gP;
      const ky =
        anchorScratch[1] +
        glyph.clusterY +
        Math.cos(t * glyph.floatFy + glyph.floatPhase) * CLUSTER_FLOAT_PX * gP;

      const cx = THREE.MathUtils.lerp(hx, kx, gP);
      const cy = THREE.MathUtils.lerp(hy, ky, gP);
      posX[i] = cx;
      posY[i] = cy;

      item.position.set((cx - w / 2) * s, (h / 2 - cy) * s, 0);
      item.scale.setScalar(s);

      const poly = polyRefs.current[i];
      // Negated: prototype rotation is in y-down screen space.
      if (poly) poly.rotation.z = -(glyph.rot + t * glyph.rotV);

      // Dim near screen center so the hero type dominates — relaxes away as
      // the clusters form (the name is gone from the viewport by then).
      const centerDist = Math.hypot((cx / w) * 2 - 1, (cy / h) * 2 - 1);
      const heroDim = 0.35 + 0.65 * THREE.MathUtils.smoothstep(centerDist, 0.12, 0.5);
      const dim = THREE.MathUtils.lerp(heroDim, 1, clusterBeatP);
      dims[i] = dim;
      glyph.outlineMaterial.opacity = OUTLINE_OPACITY * dim;
      glyph.spokeMaterial.opacity = SPOKE_OPACITY * dim;
      glyph.dotMaterial.opacity = DOT_OPACITY * dim;
      const label = labelRefs.current[i];
      if (label && glyph.labelW > 0) {
        label.scale.set(glyph.labelW, glyph.labelH, 1); // uniform px→world via parent
        glyph.labelMaterial.opacity = LABEL_OPACITY * dim;
      }
    }

    // ── Synapses ──────────────────────────────────────────────────────────
    const pos = synapse.positions;
    const col = synapse.colors;
    let seg = 0;
    const writeSegment = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      hue: THREE.Color,
      alpha: number,
    ) => {
      const v = seg * 2;
      pos.setXYZ(v, (x1 - w / 2) * s, (h / 2 - y1) * s, 0);
      pos.setXYZ(v + 1, (x2 - w / 2) * s, (h / 2 - y2) * s, 0);
      col.setXYZ(v, hue.r * alpha, hue.g * alpha, hue.b * alpha);
      col.setXYZ(v + 1, hue.r * alpha, hue.g * alpha, hue.b * alpha);
      seg++;
    };

    // Hero proximity synapses (prototype rule), handing off to the webs.
    const proximityFade = 1 - clusterBeatP;
    if (proximityFade > 0.004) {
      for (let i = 0; i < glyphs.length; i++) {
        for (let j = i + 1; j < glyphs.length; j++) {
          const d = Math.hypot(posX[i] - posX[j], posY[i] - posY[j]);
          if (d >= SYNAPSE_DIST) continue;
          const alpha =
            (1 - d / SYNAPSE_DIST) *
            SYNAPSE_OPACITY *
            proximityFade *
            ((dims[i] + dims[j]) / 2);
          writeSegment(posX[i], posY[i], posX[j], posY[j], hues.signal, alpha);
        }
      }
    }

    // Beat 2: intra-constellation webs draw in, staggered pair by pair, in
    // the constellation's own hue. Length grows from one endpoint — lines
    // literally draw themselves as the cluster settles.
    if (clusterBeatP > 0.004) {
      for (const [i, j, g, k] of CLUSTER_WEB) {
        const arrive = Math.min(clusterEase[i], clusterEase[j]);
        const growth = THREE.MathUtils.smoothstep(
          arrive,
          0.3 + k * 0.08,
          0.6 + k * 0.08,
        );
        if (growth <= 0.004) continue;
        const d = Math.hypot(posX[i] - posX[j], posY[i] - posY[j]);
        const alpha =
          Math.max(1 - d / SYNAPSE_DIST, 0.35) *
          SYNAPSE_OPACITY *
          growth *
          ((dims[i] + dims[j]) / 2);
        writeSegment(
          posX[i],
          posY[i],
          THREE.MathUtils.lerp(posX[i], posX[j], growth),
          THREE.MathUtils.lerp(posY[i], posY[j], growth),
          hues[GROUPS[g]],
          alpha,
        );
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
