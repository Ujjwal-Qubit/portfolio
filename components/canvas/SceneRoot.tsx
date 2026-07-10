"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";

const VOID = "#07070d";

/**
 * The one persistent canvas: fixed full-viewport, behind all DOM content,
 * purely decorative (pointer-events-none, aria-hidden). Fades in over ~1s
 * once the GL context exists — no layout shift, the div is fixed either way.
 */
export default function SceneRoot() {
  const [ready, setReady] = useState(false);
  const [frameloop, setFrameloop] = useState<"always" | "never">("always");

  // Pause the render loop entirely while the tab is hidden.
  useEffect(() => {
    const onVisibility = () => setFrameloop(document.hidden ? "never" : "always");
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
      </Canvas>
    </div>
  );
}
