/**
 * The scroll narrative, as named beats over page scroll progress (0..1).
 * Single source of truth — C5b keys all constellation/Lattice choreography
 * off this map; nothing else defines beat boundaries.
 *
 * Note: there is no research/recognition beat — the flow ends
 * leadership → collapse.
 *
 * Ranges are estimates against the current section heights; C5b calibrates
 * them when the full choreography lands.
 */
export const BEATS = {
  void: { start: 0, end: 0.05 },
  ignition: { start: 0.05, end: 0.14 },
  constellations: { start: 0.14, end: 0.24 },
  synthesis: { start: 0.24, end: 0.32 },
  about: { start: 0.32, end: 0.44 },
  projects: { start: 0.44, end: 0.64 },
  journey: { start: 0.64, end: 0.78 },
  leadership: { start: 0.78, end: 0.9 },
  collapse: { start: 0.9, end: 1 },
} as const satisfies Record<string, { start: number; end: number }>;

export type BeatName = keyof typeof BEATS;

const BEAT_ORDER = Object.keys(BEATS) as BeatName[];

/** Beat containing the given progress (end-exclusive; 1 → "collapse"). */
export function beatAt(progress: number): BeatName {
  for (const name of BEAT_ORDER) {
    if (progress < BEATS[name].end) return name;
  }
  return "collapse";
}

/** 0..1 within the named beat, clamped. */
export function beatProgress(name: BeatName, progress: number): number {
  const { start, end } = BEATS[name];
  return Math.min(Math.max((progress - start) / (end - start), 0), 1);
}
