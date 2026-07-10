"use client";

import { Reveal } from "./Reveal";

/**
 * Deliberate negative space: the C5 glyph field docks behind this section, so
 * the type sits alone in a full viewport of void by design.
 */
export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center gap-6 text-center">
        <Reveal mount>
          <p className="font-mono text-xs uppercase tracking-[0.45em] text-mute">
            Inside the head of
          </p>
        </Reveal>
        <Reveal mount delay={0.15}>
          <h1 className="font-display text-5xl font-bold uppercase leading-[1.02] tracking-tight text-ink sm:text-7xl lg:text-8xl">
            Ujjwal Kaushik
          </h1>
        </Reveal>
        <Reveal mount delay={0.3}>
          <p className="max-w-xl font-body text-base leading-relaxed text-mute sm:text-lg">
            Full-stack &amp; AI — I turn open-ended problems into shipped products.
          </p>
        </Reveal>
      </div>

      <a
        href="#constellation"
        className="pulse-slow absolute bottom-10 left-1/2 w-max max-w-[calc(100vw-3rem)] -translate-x-1/2 text-center font-mono text-[11px] uppercase tracking-[0.35em] text-mute transition-colors hover:text-ink"
      >
        Make sense of <span className="whitespace-nowrap">this&nbsp;↓</span>
      </a>
    </section>
  );
}
