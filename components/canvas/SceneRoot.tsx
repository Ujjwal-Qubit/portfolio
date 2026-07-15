"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { useEffect, useState } from "react";
import * as THREE from "three";
import { beatAt } from "@/lib/canvas/beats";
import { useCanvasStore } from "@/lib/canvas/store";
import { Dust } from "./Dust";
import { SignalField } from "./SignalField";
import { useScrollDriver } from "./useScrollDriver";

const VOID = "#07070d";

/**
 * Bloom is additive polish, not structure: NEXT_PUBLIC_BLOOM=off skips the
 * composer entirely and the choreography must read identically without it.
 */
const BLOOM_ENABLED = process.env.NEXT_PUBLIC_BLOOM !== "off";

// Dev-only: expose the canvas store so verification tooling can read the
// calibrated beat ranges. Compiled out of production bundles.
if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).__canvasStore = useCanvasStore;
}

/**
 * Dev-only verification hook: `window.__snapCanvas(progress?)` injects a
 * scroll progress, advances the render loop manually (works even while the
 * tab is occluded and rAF is paused), and returns the canvas as a PNG data
 * URL — captured in the same task as the render, so no preserveDrawingBuffer
 * is needed. `window.__scene` (+ `window.__THREE` and `window.__camera`)
 * exposes the live scene graph alongside it, for checking object parent
 * chains / world transforms (`obj.getWorldScale()`) or projecting world
 * positions to screen space from outside the app. Compiled out of
 * production bundles.
 */
function DevSnapshot() {
  const gl = useThree((state) => state.gl);
  const advance = useThree((state) => state.advance);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return undefined;
    const w = window as unknown as Record<string, unknown>;
    w.__scene = scene;
    w.__THREE = THREE;
    w.__camera = camera;
    w.__snapCanvas = (progress?: number) => {
      if (typeof progress === "number") {
        useCanvasStore.setState({
          scrollProgress: progress,
          activeBeat: beatAt(progress, useCanvasStore.getState().beats),
        });
      }
      advance(performance.now(), true);
      advance(performance.now() + 16, true);
      return gl.domElement.toDataURL("image/png");
    };
    return () => {
      delete w.__snapCanvas;
      delete w.__scene;
      delete w.__THREE;
      delete w.__camera;
    };
  }, [gl, advance, scene, camera]);
  return null;
}

/**
 * The one persistent canvas: fixed full-viewport, behind all DOM content,
 * purely decorative (pointer-events-none, aria-hidden). Fades in over ~1s
 * once the GL context exists — no layout shift, the div is fixed either way.
 */
export default function SceneRoot() {
  useScrollDriver();

  const [ready, setReady] = useState(false);
  const [frameloop, setFrameloop] = useState<"always" | "demand">("always");

  // Pause the loop while the tab is hidden. "demand" (not "never") so a
  // page loaded in a background tab still completes its initial render —
  // with "never", onCreated and the children's effects never fire at all.
  useEffect(() => {
    const onVisibility = () => setFrameloop(document.hidden ? "demand" : "always");
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 -z-10 transition-opacity duration-1000 ${
        ready ? "opacity-100" : "opacity-0"
      }`}
    >
      <Canvas
        frameloop={frameloop}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance", preserveDrawingBuffer: true }}
        camera={{ position: [0, 0, 10], fov: 50 }}
        onCreated={() => setReady(true)}
      >
        {/* Solid void background — identical to the page behind it, and it
            keeps the bloom composer's output well-defined (no alpha pass). */}
        <color attach="background" args={[VOID]} />
        {/* Fog toward void so depth reads without the scene ever going flat black. */}
        <fog attach="fog" args={[VOID, 10, 26]} />
        <SignalField />
        <Dust />
        {BLOOM_ENABLED && (
          <EffectComposer multisampling={0}>
            {/* Tuned luminous-not-glowy: the threshold sits above the
                brightest non-bloom element (glyph labels, ~0.32 luminance)
                and below the bloom-eligible elements, which SignalField
                boosts (BLOOM_BOOST) well past it — synapses, Lattice
                edges/nodes, the core glow, and the point. Glyph outlines,
                spokes, labels, and dust all render under threshold and stay
                clean. See components/canvas/SignalField.tsx for why this
                replaced <Select>/<SelectiveBloom> (infinite selection-context
                re-render loop). */}
            <Bloom
              luminanceThreshold={0.45}
              luminanceSmoothing={0.2}
              intensity={0.9}
              radius={0.6}
              mipmapBlur
            />
          </EffectComposer>
        )}
        <DevSnapshot />
      </Canvas>
    </div>
  );
}
