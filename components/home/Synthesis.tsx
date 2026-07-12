import { Reveal } from "./Reveal";

/**
 * Beat 3 stage: the canvas resolves the clusters into the Lattice and docks
 * it — a moment that needs room to breathe, so the section runs tall
 * (~180vh) with the line pinned center-screen for its whole duration. That
 * extra scroll distance is also what calibrateBeats (useScrollDriver) uses
 * to make sure the Lattice finishes docking before About's heading is ever
 * on screen — this section must read as plain static text when the canvas
 * layer is gated off, and own the screen (nothing from About visible) when
 * it isn't.
 */
export function Synthesis() {
  return (
    <section id="synthesis" className="relative h-[180vh]">
      <div className="sticky top-0 flex h-screen w-full items-center justify-center px-6">
        <Reveal>
          <p className="text-center font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Everything connects. That&apos;s the whole trick.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
