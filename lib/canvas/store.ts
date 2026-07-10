import { create } from "zustand";
import type { BeatName } from "./beats";

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
  /** Normalized pointer, -1..1 each axis (screen coords: +y is down). */
  pointer: { x: number; y: number };
}

export const useCanvasStore = create<CanvasState>(() => ({
  scrollProgress: 0,
  activeBeat: "void",
  pointer: { x: 0, y: 0 },
}));
