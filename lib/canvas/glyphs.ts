/**
 * The 12 values as abstract glyphs — data only, no visuals here.
 * Constellations: builder (I ship), mind (I think about thinking),
 * human (I'm alive outside the terminal).
 */

export type GlyphConstellation = "builder" | "mind" | "human";

/** Edge hues per constellation. `mind` is the site's `signal` token. */
export const CONSTELLATION_HEX: Record<GlyphConstellation, string> = {
  builder: "#4FD8C9",
  mind: "#8B7CFF",
  human: "#F2B968",
};

export interface GlyphDef {
  id: string;
  constellation: GlyphConstellation;
}

export const GLYPHS: GlyphDef[] = [
  { id: "swe", constellation: "builder" },
  { id: "ai", constellation: "builder" },
  { id: "startups", constellation: "builder" },
  { id: "systemDesign", constellation: "builder" },
  { id: "philosophy", constellation: "mind" },
  { id: "psychology", constellation: "mind" },
  { id: "reading", constellation: "mind" },
  { id: "writing", constellation: "mind" },
  { id: "travel", constellation: "human" },
  { id: "music", constellation: "human" },
  { id: "guitar", constellation: "human" },
  { id: "coffee", constellation: "human" },
];
