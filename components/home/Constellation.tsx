import { Reveal } from "./Reveal";

/**
 * The one component where all three constellation hues coexist — and only as
 * dots. Labels and copy stay ink/mute.
 */
// `key` matches lib/canvas/glyphs.ts's GlyphConstellation ("builder" | "mind" |
// "human") — the canvas measures #constellation-col-{key} at runtime to align
// each cluster beneath its own column (see SignalField's clusterAnchor).
const ENTRIES = [
  { key: "builder", label: "Builder", dot: "bg-builder", line: "I ship." },
  { key: "mind", label: "Mind", dot: "bg-signal", line: "I think about thinking." },
  { key: "human", label: "Human", dot: "bg-human", line: "I'm alive outside the terminal." },
];

export function Constellation() {
  return (
    <section id="constellation" className="border-y border-signal/10">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-20 sm:grid-cols-3 sm:gap-6">
        {ENTRIES.map((entry, i) => (
          <Reveal key={entry.label} delay={i * 0.1} className="flex flex-col gap-2.5">
            <p
              id={`constellation-col-${entry.key}`}
              className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] text-ink"
            >
              <span className={`h-2 w-2 shrink-0 rounded-full ${entry.dot}`} aria-hidden />
              {entry.label}
            </p>
            <p className="pl-5 font-body text-sm leading-relaxed text-mute">{entry.line}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
