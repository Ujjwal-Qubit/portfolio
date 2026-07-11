import { Reveal } from "./Reveal";

/**
 * Beat 3 stage: a full viewport of negative space where the canvas resolves
 * the clusters into the Lattice. One display line, nothing else — and it must
 * read perfectly as plain static text when the canvas layer is gated off.
 */
export function Synthesis() {
  return (
    <section id="synthesis" className="scroll-mt-20">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6">
        <Reveal>
          <p className="text-center font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Everything connects. That&apos;s the whole trick.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
