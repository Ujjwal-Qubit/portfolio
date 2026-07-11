/**
 * The 12 values as abstract glyphs — data only, no visuals here.
 * Constellations: builder (I ship), mind (I think about thinking),
 * human (I'm alive outside the terminal).
 *
 * Labels are the uppercase mono captions from the approved design prototype
 * (design/reference/prototype-renderer.js).
 */

export type GlyphConstellation = "builder" | "mind" | "human";

/** Node hues per constellation. `mind` is the site's `signal` token. */
export const CONSTELLATION_HEX: Record<GlyphConstellation, string> = {
  builder: "#4FD8C9",
  mind: "#8B7CFF",
  human: "#F2B968",
};

export interface GlyphDef {
  id: string;
  label: string;
  constellation: GlyphConstellation;
}

export const GLYPHS: GlyphDef[] = [
  { id: "swe", label: "SWE", constellation: "builder" },
  { id: "ai", label: "AI", constellation: "builder" },
  { id: "startups", label: "STARTUPS", constellation: "builder" },
  { id: "systemDesign", label: "SYSTEM DESIGN", constellation: "builder" },
  { id: "philosophy", label: "PHILOSOPHY", constellation: "mind" },
  { id: "psychology", label: "PSYCHOLOGY", constellation: "mind" },
  { id: "reading", label: "READING", constellation: "mind" },
  { id: "writing", label: "WRITING", constellation: "mind" },
  { id: "travel", label: "TRAVEL", constellation: "human" },
  { id: "music", label: "MUSIC", constellation: "human" },
  { id: "guitar", label: "GUITAR", constellation: "human" },
  { id: "coffee", label: "COFFEE", constellation: "human" },
];
