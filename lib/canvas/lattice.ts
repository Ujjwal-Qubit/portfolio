/**
 * THE LATTICE — pure math, ported from the approved prototype
 * (design/reference/prototype-renderer.js). 12 nodes on a fibonacci sphere,
 * sorted by longitude into 3 contiguous sectors of 4 (builder/mind/human),
 * edges = each node's 3 nearest neighbors, deduped. Rendering lives in
 * SignalField; this module only produces the structure.
 */

import { GLYPHS } from "./glyphs";
import type { GlyphConstellation } from "./glyphs";

export interface LatticeNode {
  /** Unit-sphere position (scaled by R at render time). */
  x: number;
  y: number;
  z: number;
  group: GlyphConstellation;
  /** Index into GLYPHS — the glyph that morphs into this node. */
  glyphIndex: number;
}

export interface Lattice {
  nodes: LatticeNode[];
  /** Deduped 3-nearest-neighbor edges, as node index pairs. */
  edges: Array<[number, number]>;
  /** The subset of edges connecting different constellations. */
  interEdges: Array<[number, number]>;
}

const GROUPS: GlyphConstellation[] = ["builder", "mind", "human"];

export function buildLattice(): Lattice {
  const N = GLYPHS.length;
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const pts: Array<{ x: number; y: number; z: number }> = [];
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2;
    const rr = Math.sqrt(1 - y * y);
    const th = goldenAngle * i;
    pts.push({ x: Math.cos(th) * rr, y, z: Math.sin(th) * rr });
  }
  // Longitude sort → 3 contiguous sectors of 4, one per constellation.
  pts.sort((a, b) => Math.atan2(a.z, a.x) - Math.atan2(b.z, b.x));

  // GLYPHS is ordered builder ×4, mind ×4, human ×4, so node i in sector
  // order maps straight to glyph (sector*4 + position) — the same label
  // assignment as the prototype's `gv[i % 4]`.
  const nodes: LatticeNode[] = pts.map((p, i) => ({
    ...p,
    group: GROUPS[Math.floor(i / 4)],
    glyphIndex: Math.floor(i / 4) * 4 + (i % 4),
  }));

  const edgeSet = new Set<string>();
  const scratch: Array<{ j: number; d: number }> = [];
  nodes.forEach((a, i) => {
    scratch.length = 0;
    nodes.forEach((b, j) => {
      if (j === i) return;
      scratch.push({
        j,
        d: (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2,
      });
    });
    scratch.sort((u, v) => u.d - v.d);
    for (let k = 0; k < 3; k++) {
      const j = scratch[k].j;
      edgeSet.add(i < j ? `${i}-${j}` : `${j}-${i}`);
    }
  });
  const edges = [...edgeSet].map(
    (s) => s.split("-").map(Number) as [number, number],
  );
  const interEdges = edges.filter(
    ([a, b]) => nodes[a].group !== nodes[b].group,
  );
  return { nodes, edges, interEdges };
}
