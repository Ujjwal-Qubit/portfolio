"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { beatAt } from "@/lib/canvas/beats";
import { useCanvasStore } from "@/lib/canvas/store";
import { Dust } from "./Dust";
import { SignalField } from "./SignalField";
import { useScrollDriver } from "./useScrollDriver";

const VOID = "#07070d";

/**
 * Dev-only verification hook: `window.__snapCanvas(progress?)` injects a
 * scroll progress, advances the render loop manually (works even while the
 * tab is occluded and rAF is paused), and returns the canvas as a PNG data
 * URL — captured in the same task as the render, so no preserveDrawingBuffer
 * is needed. Compiled out of production bundles.
 */
function DevSnapshot() {
  const gl = useThree((state) => state.gl);
  const advance = useThree((state) => state.advance);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return undefined;
    const w = window as unknown as Record<string, unknown>;
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
    };
  }, [gl, advance]);
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
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 10], fov: 50 }}
        onCreated={() => setReady(true)}
      >
        {/* Fog toward void so depth reads without the scene ever going flat black. */}
        <fog attach="fog" args={[VOID, 10, 26]} />
        <SignalField />
        <Dust />
        <DevSnapshot />
      </Canvas>
    </div>
  );
}
