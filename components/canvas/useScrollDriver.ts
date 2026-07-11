"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useEffect } from "react";
import { BEATS, beatAt } from "@/lib/canvas/beats";
import type { BeatRanges } from "@/lib/canvas/beats";
import { useCanvasStore } from "@/lib/canvas/store";

/**
 * Measures the homepage sections and rewrites the beat ranges in scroll
 * progress terms, so the canvas choreography stays glued to the actual DOM
 * regardless of viewport or content height. A beat "arrives" as its section's
 * top crosses 85% of the viewport (i.e. the section is clearly entering).
 */
function calibrateBeats(): BeatRanges | null {
  const vh = window.innerHeight;
  const max = document.documentElement.scrollHeight - vh;
  if (max <= 0) return null;
  const sectionTop = (id: string): number | null => {
    const el = document.getElementById(id);
    if (!el) return null;
    return el.getBoundingClientRect().top + window.scrollY;
  };
  const strip = sectionTop("constellation");
  const synthesis = sectionTop("synthesis");
  const about = sectionTop("about");
  const projects = sectionTop("projects");
  const journey = sectionTop("experience");
  const leadership = sectionTop("leadership");
  const contact = sectionTop("contact");
  if (
    strip === null ||
    about === null ||
    projects === null ||
    journey === null ||
    leadership === null ||
    contact === null
  ) {
    return null;
  }
  const P = (y: number) => Math.min(Math.max(y / max, 0), 1);
  const enter = (top: number) => P(top - vh * 0.85);

  const ignitionStart = P(vh * 0.12);
  const clusterStart = enter(strip);
  // The strip is short, so clustering gets the whole ride until the next
  // full section (synthesis; About until beat 3 lands) nearly tops out —
  // otherwise the beat would compress into a few hundred px of scroll.
  const synthAnchor = synthesis !== null ? synthesis : about;
  const synthStart = P(synthAnchor - vh * 0.15);
  // Docked by the time About's top is a third of a viewport from the top.
  // (Clamped: without the synthesis section the beat is empty, never inverted.)
  const synthEnd = Math.max(P(about - vh * 0.35), synthStart);
  const collapseStart = enter(contact);

  return {
    void: { start: 0, end: ignitionStart },
    ignition: { start: ignitionStart, end: clusterStart },
    constellations: { start: clusterStart, end: synthStart },
    synthesis: { start: synthStart, end: synthEnd },
    about: { start: synthEnd, end: enter(projects) },
    projects: { start: enter(projects), end: enter(journey) },
    journey: { start: enter(journey), end: enter(leadership) },
    leadership: { start: enter(leadership), end: collapseStart },
    collapse: { start: collapseStart, end: 1 },
  };
}

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
        activeBeat: beatAt(progress, useCanvasStore.getState().beats),
      });
    };

    const measure = () => {
      const beats = calibrateBeats();
      if (beats) useCanvasStore.setState({ beats });
    };
    // Calibrate now, after fonts settle heights, and on every ScrollTrigger
    // refresh (which includes resizes).
    measure();
    document.fonts.ready.then(measure);
    ScrollTrigger.addEventListener("refresh", measure);

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
      ScrollTrigger.removeEventListener("refresh", measure);
      trigger.kill();
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33); // restore gsap defaults
      lenis.destroy();
      useCanvasStore.setState({
        scrollProgress: 0,
        activeBeat: "void",
        beats: BEATS,
        pointer: { x: 0, y: 0 },
      });
    };
  }, []);
}
