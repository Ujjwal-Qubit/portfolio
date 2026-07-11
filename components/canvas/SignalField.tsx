"use client";

import { useFrame } from "@react-three/fiber";
import { Select } from "@react-three/postprocessing";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { rangeProgress } from "@/lib/canvas/beats";
import { CONSTELLATION_HEX, GLYPHS } from "@/lib/canvas/glyphs";
import type { GlyphConstellation } from "@/lib/canvas/glyphs";
import { buildLattice } from "@/lib/canvas/lattice";
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

// Beat 3 — THE LATTICE (prototype numbers; px are CSS px).
const LATTICE_PERSP = 1100;
/** Prototype radius at the 1440×900 design size; scaled to the viewport. */
const LATTICE_R_BASE = 265;
const NODE_LABEL_GAP = 8;
const MAX_LATTICE_EDGES = 36;

// Beat 9 — the contact point (prototype drawPoint numbers).
const POINT_GLOW_RADIUS = 190;
const POINT_RING_MAX = 190;
const POINT_CORE_RADIUS = 4.5;

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

/**
 * Line budget: hero proximity pairs + the 6-pair web inside each of the 3
 * constellations + the inter-cluster synapses of beat 3 (bounded by the
 * lattice edge count).
 */
const PROXIMITY_PAIRS = (GLYPHS.length * (GLYPHS.length - 1)) / 2;
const WEB_PAIRS = 3 * 6;
const MAX_SEGMENTS = PROXIMITY_PAIRS + WEB_PAIRS + MAX_LATTICE_EDGES;

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
 * The contact point's radial falloff, with the prototype's exact gradient
 * stops (0.28 → 0.08 at 40% → 0, normalized to white and tinted/scaled by
 * the material).
 */
function makePointGlowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.4, "rgba(255,255,255,0.286)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  return texture;
}

/** Soft radial falloff, shared by node glows and the core glow. */
function makeGlowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.35, "rgba(255,255,255,0.35)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  return texture;
}

/**
 * Where the Lattice docks after synthesis, in CSS px — bottom-right, clear
 * of nav and content flow; smaller and further inset as viewports narrow.
 */
function dockTarget(w: number, h: number, out: { x: number; y: number; r: number }) {
  if (w < 640) {
    out.x = w - 78;
    out.y = h - 96;
    out.r = 46;
  } else if (w < 1024) {
    out.x = w - 112;
    out.y = h - 126;
    out.r = 62;
  } else {
    out.x = w - 150;
    out.y = h - 150;
    out.r = 84;
  }
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
  const lattice = useMemo(buildLattice, []);
  const groupRef = useRef<THREE.Group>(null);
  const itemRefs = useRef<(THREE.Group | null)[]>([]);
  const polyRefs = useRef<(THREE.Group | null)[]>([]);
  const labelRefs = useRef<(THREE.Mesh | null)[]>([]);
  const dotRefs = useRef<(THREE.Mesh | null)[]>([]);
  const glowRefs = useRef<(THREE.Mesh | null)[]>([]);
  const coreGlowRef = useRef<THREE.Mesh>(null);
  const pointGlowRef = useRef<THREE.Mesh>(null);
  const pointRingRef = useRef<THREE.LineLoop>(null);
  const pointHaloRef = useRef<THREE.Mesh>(null);
  const pointCoreRef = useRef<THREE.Mesh>(null);
  /** The DOM contact glow the collapse lands on (queried lazily). */
  const contactGlowEl = useRef<HTMLElement | null>(null);
  const driftTime = useRef(0);

  /** glyph index → its lattice node index. */
  const nodeOfGlyph = useMemo(() => {
    const map = new Int32Array(GLYPHS.length);
    lattice.nodes.forEach((node, i) => {
      map[node.glyphIndex] = i;
    });
    return map;
  }, [lattice]);

  // Per-frame scratch: glyph centers (CSS px), dim factors, cluster ease,
  // projected lattice node positions + depths.
  const posX = useMemo(() => new Float32Array(GLYPHS.length), []);
  const posY = useMemo(() => new Float32Array(GLYPHS.length), []);
  const dims = useMemo(() => new Float32Array(GLYPHS.length), []);
  const clusterEase = useMemo(() => new Float32Array(GLYPHS.length), []);
  const nodePX = useMemo(() => new Float32Array(GLYPHS.length), []);
  const nodePY = useMemo(() => new Float32Array(GLYPHS.length), []);
  const nodeDepth = useMemo(() => new Float32Array(GLYPHS.length), []);
  const anchorScratch = useMemo(() => [0, 0], []);
  const dockScratch = useMemo(() => ({ x: 0, y: 0, r: 0 }), []);

  const dotGeometry = useMemo(() => new THREE.CircleGeometry(DOT_RADIUS, 16), []);
  const planeGeometry = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  const circleGeometry = useMemo(() => new THREE.CircleGeometry(1, 32), []);
  const ringGeometry = useMemo(() => {
    const pts: number[] = [];
    for (let i = 0; i < 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      pts.push(Math.cos(a), Math.sin(a), 0);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return geometry;
  }, []);
  const glowTexture = useMemo(makeGlowTexture, []);
  const pointGlowTexture = useMemo(makePointGlowTexture, []);

  const hues = useMemo(
    () => ({
      signal: new THREE.Color(SIGNAL),
      ink: new THREE.Color(INK),
      builder: new THREE.Color(CONSTELLATION_HEX.builder),
      mind: new THREE.Color(CONSTELLATION_HEX.mind),
      human: new THREE.Color(CONSTELLATION_HEX.human),
    }),
    [],
  );

  // Node glows (constellation hue) + the faint radial core behind the
  // Lattice — all additive sprites off one shared falloff texture.
  const glowMaterials = useMemo(
    () =>
      GLYPHS.map(
        (def) =>
          new THREE.MeshBasicMaterial({
            map: glowTexture,
            color: CONSTELLATION_HEX[def.constellation],
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
            depthTest: false,
            depthWrite: false,
            fog: false,
            toneMapped: false,
          }),
      ),
    [glowTexture],
  );
  const coreGlowMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: glowTexture,
        color: SIGNAL,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        depthWrite: false,
        fog: false,
        toneMapped: false,
      }),
    [glowTexture],
  );

  // Beat 9: the collapsed point — prototype drawPoint as four cheap parts:
  // wide radial glow (exact gradient stops), one expanding ring, a strong
  // small halo standing in for shadowBlur 24, and the ink-white core.
  const pointMaterials = useMemo(() => {
    const sprite = (map: THREE.Texture, color: string) =>
      new THREE.MeshBasicMaterial({
        map,
        color,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        depthWrite: false,
        fog: false,
        toneMapped: false,
      });
    return {
      glow: sprite(pointGlowTexture, SIGNAL),
      halo: sprite(glowTexture, SIGNAL),
      ring: new THREE.LineBasicMaterial({
        color: SIGNAL,
        transparent: true,
        opacity: 0,
        depthTest: false,
        depthWrite: false,
        fog: false,
        toneMapped: false,
      }),
      core: new THREE.MeshBasicMaterial({
        color: INK,
        transparent: true,
        opacity: 0,
        depthTest: false,
        depthWrite: false,
        fog: false,
        toneMapped: false,
      }),
    };
  }, [glowTexture, pointGlowTexture]);

  // Lattice edges as screen-space quads (two triangles each) — native GL
  // lines can't vary width, and the prototype's depth shading needs
  // per-edge width 0.8→1.6 as well as alpha 0.08→0.46.
  const latticeEdges = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new THREE.Float32BufferAttribute(MAX_LATTICE_EDGES * 4 * 3, 3);
    const colors = new THREE.Float32BufferAttribute(MAX_LATTICE_EDGES * 4 * 3, 3);
    positions.setUsage(THREE.DynamicDrawUsage);
    colors.setUsage(THREE.DynamicDrawUsage);
    const index: number[] = [];
    for (let e = 0; e < MAX_LATTICE_EDGES; e++) {
      const b = e * 4;
      index.push(b, b + 1, b + 2, b + 2, b + 1, b + 3);
    }
    geometry.setAttribute("position", positions);
    geometry.setAttribute("color", colors);
    geometry.setIndex(index);
    geometry.setDrawRange(0, 0);
    const material = new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthTest: false,
      depthWrite: false,
      fog: false,
      toneMapped: false,
    });
    return { geometry, positions, colors, material };
  }, []);

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

    // Beat 3 phases, all carved out of the synthesis range: inter-cluster
    // synapses fire, the field contracts and resolves into the Lattice
    // (~one slow rotation across the beat), then it shrinks and docks.
    const synthP = rangeProgress(beats.synthesis, p);
    const morphP = THREE.MathUtils.smoothstep(synthP, 0.24, 0.66);
    const latticeIn = THREE.MathUtils.smoothstep(synthP, 0.45, 0.75);
    const labelIn = THREE.MathUtils.smoothstep(synthP, 0.62, 0.82);
    const dockP = THREE.MathUtils.smoothstep(synthP, 0.8, 1);

    // Beat 9, carved out of the collapse range: the Lattice leaves the dock
    // and returns to center (undock), nodes ease inward as edges retract
    // (inward), the point ignites (pointIn), and finally the canvas light
    // hands off INTO the DOM contact glow (handoff) — one light, not two.
    const collapseP = rangeProgress(beats.collapse, p);
    const undock = THREE.MathUtils.smoothstep(collapseP, 0, 0.4);
    const inward = THREE.MathUtils.smoothstep(collapseP, 0.35, 0.85);
    const pointIn = THREE.MathUtils.smoothstep(collapseP, 0.55, 0.85);
    const handoff = THREE.MathUtils.smoothstep(collapseP, 0.9, 1);
    const collapseFade = 1 - THREE.MathUtils.smoothstep(collapseP, 0.5, 0.85);

    // Beats 4–8: while docked the Lattice recedes — content owns the page,
    // the canvas is furniture. During the collapse it fades out entirely as
    // the nodes condense into the point.
    const latticeDim = (1 - 0.25 * dockP) * collapseFade;

    const w = state.size.width;
    const h = state.size.height;
    if (!w || !h) return;
    /** World units per CSS px at the glyph plane (z=0). */
    const s = state.viewport.width / w;

    driftTime.current += delta * speedMult;
    const t = driftTime.current;

    // Parallax: lean away from the cursor. Damped (inertial) and capped by
    // the small target amplitudes; screen +y is down, three +y is up. Backs
    // almost fully off once the Lattice docks — a UI fixture shouldn't sway
    // — and dies completely during the collapse so the point stays glued to
    // the DOM contact glow.
    const lean = (1 - 0.85 * dockP) * (1 - collapseP);
    group.position.x = THREE.MathUtils.damp(group.position.x, -pointer.x * 0.8 * lean, 2.2, delta);
    group.position.y = THREE.MathUtils.damp(group.position.y, pointer.y * 0.55 * lean, 2.2, delta);
    group.rotation.y = THREE.MathUtils.damp(group.rotation.y, -pointer.x * 0.05 * lean, 2.2, delta);
    group.rotation.x = THREE.MathUtils.damp(group.rotation.x, pointer.y * 0.04 * lean, 2.2, delta);

    // Project the Lattice (prototype math: manual yaw/pitch + perspective
    // 1100, in CSS px). ry adds one eased full turn across the beat on top
    // of the ambient t-rotation, so the boundary into beats 4–8 is seamless.
    // The collapse target: the DOM contact glow's live viewport position
    // (fallback: the prototype's cx, 0.36h).
    let glowX = w * 0.5;
    let glowY = h * 0.36;
    if (collapseP > 0) {
      if (!contactGlowEl.current) {
        contactGlowEl.current = document.getElementById("contact-glow");
      }
      const el = contactGlowEl.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        glowX = rect.left + rect.width / 2;
        glowY = rect.top + rect.height / 2;
      }
    }

    let latCX = 0;
    let latCY = 0;
    let latR = 0;
    if (synthP > 0) {
      dockTarget(w, h, dockScratch);
      const rFull = Math.min(w * 0.26, h * 0.294, LATTICE_R_BASE);
      latCX = THREE.MathUtils.lerp(w * 0.5, dockScratch.x, dockP);
      latCY = THREE.MathUtils.lerp(h * 0.5, dockScratch.y, dockP);
      latR = THREE.MathUtils.lerp(rFull, dockScratch.r, dockP);
      if (collapseP > 0) {
        // Leave the dock toward the glow, breathe up briefly, then collapse.
        latCX = THREE.MathUtils.lerp(latCX, glowX, undock);
        latCY = THREE.MathUtils.lerp(latCY, glowY, undock);
        const rMid = Math.min(140, rFull * 0.55);
        latR = THREE.MathUtils.lerp(latR, rMid, undock) * (1 - inward);
      }
      // The collapse adds a gentle inward spiral on top of the ambient yaw.
      const ry =
        t * 0.18 +
        THREE.MathUtils.smoothstep(synthP, 0, 1) * Math.PI * 2 +
        THREE.MathUtils.smoothstep(collapseP, 0.25, 0.85) * 1.6;
      const rx = 0.34 + Math.sin(t * 0.07) * 0.06;
      const cosY = Math.cos(ry);
      const sinY = Math.sin(ry);
      const cosX = Math.cos(rx);
      const sinX = Math.sin(rx);
      for (let i = 0; i < lattice.nodes.length; i++) {
        const node = lattice.nodes[i];
        const X = node.x * latR;
        const Y = node.y * latR;
        const Z = node.z * latR;
        const x1 = X * cosY + Z * sinY;
        const z1 = -X * sinY + Z * cosY;
        const y1 = Y * cosX - z1 * sinX;
        const z2 = Y * sinX + z1 * cosX;
        const persp = LATTICE_PERSP / (LATTICE_PERSP + z2);
        nodePX[i] = latCX + x1 * persp;
        nodePY[i] = latCY + y1 * persp;
        // Guarded: as the collapse drives R → 0 the depth ratio degenerates.
        nodeDepth[i] = latR > 1 ? 1 - (z2 + latR) / (2 * latR) : 0.5;
      }
    }

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

      // Beat 3: contract onto the Lattice node this glyph becomes.
      const ni = nodeOfGlyph[i];
      const depth = synthP > 0 ? nodeDepth[ni] : 0;
      const cx = THREE.MathUtils.lerp(
        THREE.MathUtils.lerp(hx, kx, gP),
        nodePX[ni],
        morphP,
      );
      const cy = THREE.MathUtils.lerp(
        THREE.MathUtils.lerp(hy, ky, gP),
        nodePY[ni],
        morphP,
      );
      posX[i] = cx;
      posY[i] = cy;

      item.position.set((cx - w / 2) * s, (h / 2 - cy) * s, 0);
      item.scale.setScalar(s);

      // Dim near screen center so the hero type dominates — relaxes away as
      // the clusters form (the name is gone from the viewport by then).
      const centerDist = Math.hypot((cx / w) * 2 - 1, (cy / h) * 2 - 1);
      const heroDim = 0.35 + 0.65 * THREE.MathUtils.smoothstep(centerDist, 0.12, 0.5);
      const dim = THREE.MathUtils.lerp(heroDim, 1, clusterBeatP);
      dims[i] = dim;

      // Polygons dissolve as the field resolves into structure.
      const polyFade = 1 - morphP;
      const poly = polyRefs.current[i];
      if (poly) {
        poly.visible = polyFade > 0.004;
        if (poly.visible) {
          // Negated: prototype rotation is in y-down screen space.
          poly.rotation.z = -(glyph.rot + t * glyph.rotV);
          poly.scale.setScalar(1 - 0.55 * morphP);
        }
      }
      glyph.outlineMaterial.opacity = OUTLINE_OPACITY * dim * polyFade;
      glyph.spokeMaterial.opacity = SPOKE_OPACITY * dim * polyFade;

      // The center dot IS the node: it grows, takes the constellation hue,
      // and picks up the prototype's depth-shaded alpha (0.35→1, r 2.5→6).
      const nodeRadius = 2.5 + depth * 3.5;
      const dot = dotRefs.current[i];
      if (dot) {
        dot.scale.setScalar(THREE.MathUtils.lerp(1, nodeRadius / DOT_RADIUS, morphP));
      }
      glyph.dotMaterial.color.lerpColors(hues.ink, hues[glyph.group], morphP);
      glyph.dotMaterial.opacity = THREE.MathUtils.lerp(
        DOT_OPACITY * dim,
        (0.35 + depth * 0.65) * latticeDim,
        morphP,
      );

      // Node glow, depth-shaded (stands in for the prototype's shadowBlur
      // until the bloom pass lands).
      const glow = glowRefs.current[i];
      if (glow) {
        const glowAlpha = latticeIn * latticeDim * (0.12 + depth * 0.38);
        glowMaterials[i].opacity = glowAlpha;
        glow.visible = glowAlpha > 0.004;
        if (glow.visible) glow.scale.setScalar(nodeRadius * 7);
      }

      // Labels: below the glyph until the morph, then front-facing nodes
      // only (depth > 0.45), small mono to the right; off while docked.
      // The position swap happens while the label is fully transparent.
      const label = labelRefs.current[i];
      if (label && glyph.labelW > 0) {
        label.scale.set(glyph.labelW, glyph.labelH, 1); // uniform px→world via parent
        if (synthP < 0.55) {
          label.position.set(0, -LABEL_CENTER_Y, 0);
          glyph.labelMaterial.opacity =
            LABEL_OPACITY * dim * (1 - Math.min(morphP * 2, 1));
        } else {
          label.position.set(nodeRadius + NODE_LABEL_GAP + glyph.labelW / 2, 0, 0);
          glyph.labelMaterial.opacity =
            (0.25 + depth * 0.55) *
            labelIn *
            (1 - dockP) *
            THREE.MathUtils.smoothstep(depth, 0.45, 0.55);
        }
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
    // literally draw themselves as the cluster settles. They dissolve again
    // as the field morphs into the Lattice.
    const webFade = 1 - morphP;
    if (clusterBeatP > 0.004 && webFade > 0.004) {
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
          webFade *
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

    // Beat 3 phase 1: inter-cluster synapses fire — signal-hue lines draw
    // between the clusters along what will become the Lattice's inter-group
    // edges, then yield to the real edges as the Lattice resolves.
    const interFade = 1 - latticeIn;
    if (synthP > 0.004 && interFade > 0.004) {
      for (let e = 0; e < lattice.interEdges.length; e++) {
        const [na, nb] = lattice.interEdges[e];
        const i = lattice.nodes[na].glyphIndex;
        const j = lattice.nodes[nb].glyphIndex;
        const growth = THREE.MathUtils.smoothstep(
          synthP,
          0.02 * e,
          0.22 + 0.02 * e,
        );
        if (growth <= 0.004) continue;
        const alpha = 0.16 * growth * interFade;
        writeSegment(
          posX[i],
          posY[i],
          THREE.MathUtils.lerp(posX[i], posX[j], growth),
          THREE.MathUtils.lerp(posY[i], posY[j], growth),
          hues.signal,
          alpha,
        );
      }
    }

    synapse.geometry.setDrawRange(0, seg * 2);
    pos.needsUpdate = true;
    col.needsUpdate = true;

    // ── The Lattice: depth-shaded edge quads + core glow ─────────────────
    let edgeCount = 0;
    if (latticeIn > 0.004) {
      const epos = latticeEdges.positions;
      const ecol = latticeEdges.colors;
      for (const [a, b] of lattice.edges) {
        const ax = nodePX[a];
        const ay = nodePY[a];
        const bx = nodePX[b];
        const by = nodePY[b];
        const eDepth = (nodeDepth[a] + nodeDepth[b]) / 2;
        const alpha = (0.08 + eDepth * 0.38) * latticeIn * latticeDim;
        const halfWidth = (0.8 + eDepth * 0.8) / 2;
        let dx = bx - ax;
        let dy = by - ay;
        const len = Math.hypot(dx, dy) || 1;
        dx /= len;
        dy /= len;
        const ox = -dy * halfWidth;
        const oy = dx * halfWidth;
        const v = edgeCount * 4;
        epos.setXYZ(v, (ax + ox - w / 2) * s, (h / 2 - (ay + oy)) * s, 0);
        epos.setXYZ(v + 1, (ax - ox - w / 2) * s, (h / 2 - (ay - oy)) * s, 0);
        epos.setXYZ(v + 2, (bx + ox - w / 2) * s, (h / 2 - (by + oy)) * s, 0);
        epos.setXYZ(v + 3, (bx - ox - w / 2) * s, (h / 2 - (by - oy)) * s, 0);
        for (let c = 0; c < 4; c++) {
          ecol.setXYZ(
            v + c,
            hues.signal.r * alpha,
            hues.signal.g * alpha,
            hues.signal.b * alpha,
          );
        }
        edgeCount++;
      }
      epos.needsUpdate = true;
      ecol.needsUpdate = true;
    }
    latticeEdges.geometry.setDrawRange(0, edgeCount * 6);

    const core = coreGlowRef.current;
    if (core) {
      const coreAlpha = 0.07 * latticeIn * latticeDim;
      coreGlowMaterial.opacity = coreAlpha;
      core.visible = coreAlpha > 0.004;
      if (core.visible) {
        core.position.set((latCX - w / 2) * s, (h / 2 - latCY) * s, 0);
        core.scale.setScalar(latR * 2.8 * s);
      }
    }

    // ── Beat 9: the point (prototype drawPoint, scrubbed) ────────────────
    // Ignites as the Lattice condenses, then fades INTO the DOM contact
    // glow at the very end of the scroll — reversing cleanly on the way up.
    const pointAlpha = pointIn * (1 - handoff);
    const pointVisible = pointAlpha > 0.004;
    const px = (glowX - w / 2) * s;
    const py = (h / 2 - glowY) * s;
    const pulse = 1 + Math.sin(t * 1.1) * 0.07;
    const pGlow = pointGlowRef.current;
    if (pGlow) {
      pointMaterials.glow.opacity = 0.28 * pointAlpha;
      pGlow.visible = pointVisible;
      if (pointVisible) {
        pGlow.position.set(px, py, 0);
        pGlow.scale.setScalar(POINT_GLOW_RADIUS * 2 * pulse * s);
      }
    }
    const pRing = pointRingRef.current;
    if (pRing) {
      const rr = (t * 26) % POINT_RING_MAX;
      pointMaterials.ring.opacity = 0.22 * (1 - rr / POINT_RING_MAX) * pointAlpha;
      pRing.visible = pointVisible;
      if (pointVisible) {
        pRing.position.set(px, py, 0);
        pRing.scale.setScalar((14 + rr) * s);
      }
    }
    const pHalo = pointHaloRef.current;
    if (pHalo) {
      pointMaterials.halo.opacity = 0.55 * pointAlpha;
      pHalo.visible = pointVisible;
      if (pointVisible) {
        pHalo.position.set(px, py, 0);
        pHalo.scale.setScalar(56 * pulse * s);
      }
    }
    const pCore = pointCoreRef.current;
    if (pCore) {
      pointMaterials.core.opacity = pointAlpha;
      pCore.visible = pointVisible;
      if (pointVisible) {
        pCore.position.set(px, py, 0);
        pCore.scale.setScalar(POINT_CORE_RADIUS * pulse * s);
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* Everything luminous — synapses, Lattice edges, the point — is
          <Select>ed for the (optional) selective bloom pass. Glyph outlines,
          spokes, and labels stay clean. */}
      <Select enabled>
        <mesh
          ref={coreGlowRef}
          geometry={planeGeometry}
          material={coreGlowMaterial}
          renderOrder={0}
          visible={false}
        />
        <lineSegments
          geometry={synapse.geometry}
          material={synapse.material}
          frustumCulled={false}
          renderOrder={1}
        />
        <mesh
          geometry={latticeEdges.geometry}
          material={latticeEdges.material}
          frustumCulled={false}
          renderOrder={1}
        />
        <mesh
          ref={pointGlowRef}
          geometry={planeGeometry}
          material={pointMaterials.glow}
          renderOrder={0}
          visible={false}
        />
        <lineLoop
          ref={pointRingRef}
          geometry={ringGeometry}
          material={pointMaterials.ring}
          renderOrder={2}
          visible={false}
        />
        <mesh
          ref={pointHaloRef}
          geometry={planeGeometry}
          material={pointMaterials.halo}
          renderOrder={2}
          visible={false}
        />
        <mesh
          ref={pointCoreRef}
          geometry={circleGeometry}
          material={pointMaterials.core}
          renderOrder={3}
          visible={false}
        />
      </Select>
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
          <Select enabled>
            <mesh
              ref={(el) => {
                glowRefs.current[i] = el;
              }}
              geometry={planeGeometry}
              material={glowMaterials[i]}
              renderOrder={2}
              visible={false}
            />
            <mesh
              ref={(el) => {
                dotRefs.current[i] = el;
              }}
              geometry={dotGeometry}
              material={glyph.dotMaterial}
              renderOrder={3}
            />
          </Select>
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
