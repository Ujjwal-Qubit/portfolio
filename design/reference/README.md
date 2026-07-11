# Design Reference — Signal from Noise canvas
Extracted from the approved Claude Design prototype. This is the visual ground
truth for C5. The R3F implementation must MATCH THIS LOOK, adapted to the
existing three.js architecture.

## Files
- hero-comp.png       — Beat 0 target: the glyph field around the name
- lattice-comp.png    — Beat 3 target: THE LATTICE (signature object)
- contact-point-comp.png — Beat 9 target: the collapsed point
- prototype-renderer.js  — the prototype's ACTUAL rendering code (canvas2d).
  Port its numbers and logic, not its tech: geometry, placement, alphas,
  synapse rules, sphere math, edge selection, depth shading, label rules.

## The numbers that make the look (from prototype-renderer.js)
GLYPHS (hero):
- 12 flat irregular polygons: 5–6 verts, radius 15–27px, vertex jitter
- Each: thin outline rgba(139,124,255,0.5) lw1; faint spokes center→verts
  at 0.16 alpha; bright center dot (ink, r1.6); label BELOW at +44px,
  10px JetBrains Mono, rgba(142,142,163,0.55), centered, UPPERCASE
- PLACEMENT: 4 cols × 3 rows grid + jitter — bx=0.14+col*0.24+r*0.1,
  by=0.18+row*0.3+r*0.12 → fills the WHOLE viewport, wide scatter
- Drift: sinusoidal, amplitude 16–46px, very low frequency; slow rotation
- SYNAPSES: between any pair closer than 250px, alpha (1-d/250)*0.22,
  signal color, subtle glow (shadowBlur 8)

LATTICE (synthesis):
- 12 nodes on a FIBONACCI SPHERE R=265, sorted by longitude into 3
  contiguous groups of 4 → builder/mind/human sectors
- Edges: each node → its 3 NEAREST neighbors (dedup) — clean, not a tangle
- Rotation: ry=t*0.18, rx=0.34+sin(t*0.07)*0.06 (slow yaw + gentle nod)
- Perspective 1100; depth shading: edge alpha 0.08→0.46, lw 0.8→1.6,
  glow grows with depth; node radius 2.5→6, constellation hue fill+glow
- Node labels: only when depth>0.45 (front-facing), 10px mono, to the right
- Faint radial core glow behind (signal at 0.06)

POINT (contact/collapse):
- Radial glow (signal .28→.08→0 over 190px), slow 7% pulse
- One expanding ring (period ~7s), fading as it grows
- Ink-white core r≈4.5 with strong signal glow

COLORS: builder rgba(79,216,201) · mind/signal rgba(139,124,255) ·
human rgba(242,185,104) · ink #EDEDF2 · mute #8E8EA3
