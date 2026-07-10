import Link from "next/link";
import { leadership } from "@/content/leadership";
import { Reveal } from "./Reveal";
import { SectionHeader } from "./SectionHeader";

export function Leadership() {
  return (
    <section id="leadership" className="scroll-mt-20">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-24 sm:py-32">
        <SectionHeader eyebrow="Leadership" title="Teams I run" />

        <div className="grid gap-5 md:grid-cols-2">
          {leadership.map((entry, i) => (
            <Reveal key={entry.slug} delay={i * 0.08} className="h-full">
              <Link
                href={`/leadership/${entry.slug}`}
                className="group flex h-full flex-col gap-4 rounded-2xl border border-signal/20 bg-depth/60 p-6 backdrop-blur-sm transition-colors duration-300 hover:border-signal/40 sm:p-7"
              >
                <div className="flex flex-col gap-2">
                  <h3 className="font-display text-2xl font-bold text-ink">{entry.title}</h3>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-mute">
                    {entry.year}
                  </p>
                </div>
                <p className="font-body text-sm leading-relaxed text-mute">{entry.subtitle}</p>

                {entry.stats && entry.stats.length > 0 && (
                  <ul className="flex flex-wrap gap-1.5">
                    {entry.stats.map((stat) => (
                      <li
                        key={stat}
                        className="rounded-full border border-signal/20 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-mute"
                      >
                        {stat}
                      </li>
                    ))}
                  </ul>
                )}

                <span className="mt-auto border-t border-signal/10 pt-4 font-mono text-xs uppercase tracking-[0.2em] text-signal transition-colors group-hover:text-ink">
                  Enter →
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
