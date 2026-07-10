"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useEffect } from "react";
import { beatAt } from "@/lib/canvas/beats";
import { useCanvasStore } from "@/lib/canvas/store";

/**
 * Smooth scroll + master scroll timeline. Lives inside the lazy 3D chunk and
 * only runs while the canvas layer is mounted — flag off / reduced motion /
 * no WebGL means native scroll and none of this code loads.
 *
 * Wiring per Lenis+GSAP docs: ScrollTrigger updates on Lenis scroll, Lenis is
 * driven from gsap.ticker, lag smoothing off so scrub stays locked to scroll.
 */
export function useScrollDriver() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({ autoRaf: false });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const writeProgress = (progress: number) => {
      useCanvasStore.setState({
        scrollProgress: progress,
        activeBeat: beatAt(progress),
      });
    };

    // Master driver: whole-page progress 0..1 into the store. The canvas
    // reads it in useFrame via getState() — no React re-render per frame.
    const trigger = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => writeProgress(self.progress),
    });
    writeProgress(trigger.progress);

    // Anchor links (nav, scroll cue) route through Lenis. Lenis itself
    // honors the target's scroll-margin-top, matching native anchor
    // navigation — no manual offset.
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      const anchor = (event.target as HTMLElement | null)?.closest<HTMLAnchorElement>(
        'a[href^="#"]',
      );
      if (!anchor) return;
      const id = decodeURIComponent(anchor.hash.slice(1));
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target);
      history.pushState(null, "", `#${id}`);
    };
    document.addEventListener("click", onClick);

    // Pointer for parallax — fine pointers only; touch keeps drift, no lean.
    const finePointer = window.matchMedia("(pointer: fine)");
    const onPointerMove = (event: PointerEvent) => {
      useCanvasStore.setState({
        pointer: {
          x: (event.clientX / window.innerWidth) * 2 - 1,
          y: (event.clientY / window.innerHeight) * 2 - 1,
        },
      });
    };
    if (finePointer.matches) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
    }

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("click", onClick);
      trigger.kill();
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33); // restore gsap defaults
      lenis.destroy();
      useCanvasStore.setState({
        scrollProgress: 0,
        activeBeat: "void",
        pointer: { x: 0, y: 0 },
      });
    };
  }, []);
}
