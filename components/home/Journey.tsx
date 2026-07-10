import Link from "next/link";
import { experience } from "@/content/experience";
import { Reveal } from "./Reveal";
import { SectionHeader } from "./SectionHeader";

export function Journey() {
  return (
    <section id="experience" className="scroll-mt-20">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-24 sm:py-32">
        <SectionHeader eyebrow="The journey" title="Where I've worked" />

        {/* Timeline: thin signal line down the left, a node dot per entry. */}
        <div className="relative flex flex-col gap-10 pl-8 sm:pl-10">
          <span
            className="absolute bottom-2 left-[3px] top-2 w-px bg-signal/20"
            aria-hidden
          />
          {experience.map((entry, i) => {
            const current = i === 0;
            return (
              <Reveal key={entry.slug} delay={i * 0.1} className="relative">
                <span
                  className={`absolute -left-8 top-7 h-[7px] w-[7px] rounded-full sm:-left-10 ${
                    current ? "pulse-slow bg-signal" : "bg-signal/50"
                  }`}
                  aria-hidden
                />
                <Link
                  href={`/experience/${entry.slug}`}
                  className="group flex flex-col gap-4 rounded-2xl border border-signal/20 bg-depth/60 p-6 backdrop-blur-sm transition-colors duration-300 hover:border-signal/40 sm:p-7"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="font-display text-2xl font-bold text-ink">{entry.title}</h3>
                    <span className="rounded-full border border-signal/20 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-mute">
                      🇻🇳 Onsite — Ho Chi Minh City
                    </span>
                  </div>
                  <p className="font-mono text-xs uppercase tracking-[0.15em] text-mute">
                    {entry.role} · {entry.dates}
                  </p>
                  <p className="max-w-2xl font-body text-sm leading-relaxed text-mute">
                    {entry.subtitle}
                  </p>
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-signal transition-colors group-hover:text-ink">
                    Enter →
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
