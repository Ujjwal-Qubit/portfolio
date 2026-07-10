"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// ssr:false — the 2D page renders and hydrates first; the three/r3f chunk
// only loads afterwards, and only if the gate below opens.
const SceneRoot = dynamic(() => import("./SceneRoot"), { ssr: false });

/**
 * Feature flag: NEXT_PUBLIC_CANVAS=off ships the site without the 3D layer —
 * the chunk is never imported and behavior is identical to C4. Default: on.
 */
const CANVAS_ENABLED = process.env.NEXT_PUBLIC_CANVAS !== "off";

function webglAvailable(): boolean {
  try {
    const probe = document.createElement("canvas");
    return Boolean(probe.getContext("webgl2") ?? probe.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Gate for the decorative WebGL layer. Renders nothing (same code path) when
 * the flag is off, the user prefers reduced motion, or WebGL is unavailable.
 */
export function CanvasLayer() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!CANVAS_ENABLED) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnabled(!reduced.matches && webglAvailable());
    update();
    reduced.addEventListener("change", update);
    return () => reduced.removeEventListener("change", update);
  }, []);

  if (!enabled) return null;
  return <SceneRoot />;
}
