import { create } from "zustand";
import { BEATS } from "./beats";
import type { BeatName, BeatRanges } from "./beats";

/**
 * Bridge between the DOM world (Lenis/ScrollTrigger/pointer handlers write)
 * and the canvas (useFrame reads via useCanvasStore.getState()).
 *
 * Nothing subscribes to this store reactively — no component re-renders per
 * frame. Keep it that way: read with getState() inside useFrame, never with
 * the hook selector in anything that mounts per-frame-changing values.
 */
interface CanvasState {
  /** 0..1 across the whole page scroll. */
  scrollProgress: number;
  activeBeat: BeatName;
  /**
   * Beat ranges calibrated against the real section offsets (written by
   * useScrollDriver on mount/refresh). Defaults to the static estimates.
   */
  beats: BeatRanges;
  /** Normalized pointer, -1..1 each axis (screen coords: +y is down). */
  pointer: { x: number; y: number };
  /**
   * True only while useScrollDriver is mounted and running (i.e. the canvas
   * gate — flag on, no reduced-motion, WebGL available — is open). DOM
   * components that want to key off scrollProgress/beats (e.g. the
   * synthesis line's fade) must check this first: those fields simply
   * freeze at their defaults when the driver never mounts, which would
   * otherwise leave scroll-tied content stuck invisible.
   */
  driverActive: boolean;
}

export const useCanvasStore = create<CanvasState>(() => ({
  scrollProgress: 0,
  activeBeat: "void",
  beats: BEATS,
  pointer: { x: 0, y: 0 },
  driverActive: false,
}));
