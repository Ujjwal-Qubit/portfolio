"use client";

import { useEffect, useRef } from "react";
import { rangeProgress } from "@/lib/canvas/beats";
import { useCanvasStore } from "@/lib/canvas/store";

/** No three.js import here — this file must stay in the eager homepage
 * bundle, not the lazy canvas chunk, so this is a tiny local smoothstep
 * rather than THREE.MathUtils.smoothstep. */
function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
}

/**
 * Beat 3 stage: the canvas resolves the clusters into the Lattice and docks
 * it — a moment that needs room to breathe, so the section runs tall
 * (~180vh) with the line pinned center-screen for its whole duration. That
 * extra scroll distance is also what calibrateBeats (useScrollDriver) uses
 * to make sure the Lattice finishes docking before About's heading is ever
 * on screen — this section must read as plain static text when the canvas
 * layer is gated off, and own the screen (nothing from About visible) when
 * it isn't.
 *
 * The line is the payoff for the moment the three clusters fuse, not a
 * caption for the section scrolling into view: its opacity is tied directly
 * to the synthesis beat's own progress (invisible while the clusters are
 * still separate, fading in only as the inter-cluster synapses fire and the
 * field contracts, peaking as the Lattice resolves, holding through the
 * rotation) rather than to viewport entry. Imperative subscribe, not the
 * reactive store hook — scrollProgress changes every frame and this must
 * never trigger a React re-render (see lib/canvas/store.ts).
 */
export function Synthesis() {
  const lineRef = useRef<HTMLParagraphElement>(null);
  const lastOpacity = useRef(-1);

  useEffect(() => {
    const applyOpacity = () => {
      const el = lineRef.current;
      if (!el) return;
      const { driverActive, scrollProgress, beats } = useCanvasStore.getState();
      if (!driverActive) {
        if (lastOpacity.current !== -1) {
          el.style.opacity = "";
          lastOpacity.current = -1;
        }
        return;
      }
      const synthP = rangeProgress(beats.synthesis, scrollProgress);
      const opacity = smoothstep(0.22, 0.75, synthP);
      if (opacity !== lastOpacity.current) {
        el.style.opacity = String(opacity);
        lastOpacity.current = opacity;
      }
    };
    applyOpacity();
    return useCanvasStore.subscribe(applyOpacity);
  }, []);

  return (
    <section id="synthesis" className="relative h-[180vh]">
      <div className="sticky top-0 flex h-screen w-full items-center justify-center px-6">
        <p
          ref={lineRef}
          className="text-center font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl"
        >
          Everything connects. That&apos;s the whole trick.
        </p>
      </div>
    </section>
  );
}
