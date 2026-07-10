import Link from "next/link";
import { projects } from "@/content/projects";
import type { Constellation } from "@/content/types";
import { splitOutcome } from "@/lib/text";
import { Reveal } from "./Reveal";
import { SectionHeader } from "./SectionHeader";

/** Constellation coding on cards: the dot and its mono label, nothing else. */
const DOT: Record<Constellation, string> = {
  signal: "bg-signal",
  builder: "bg-builder",
  human: "bg-human",
};
const HUE: Record<Constellation, string> = {
  signal: "text-signal",
  builder: "text-builder",
  human: "text-human",
};

export function Projects() {
  return (
    <section id="projects" className="scroll-mt-20">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-24 sm:py-32">
        <SectionHeader eyebrow="Selected work" title="Things I've built" />

        <div className="grid gap-5 md:grid-cols-2">
          {projects.map((project, i) => {
            const stat = project.outcome ? splitOutcome(project.outcome).headline : null;
            return (
              <Reveal key={project.slug} delay={(i % 2) * 0.08} className="h-full">
                <Link
                  href={`/projects/${project.slug}`}
                  className="group flex h-full flex-col gap-4 rounded-2xl border border-signal/20 bg-depth/60 p-6 backdrop-blur-sm transition-colors duration-300 hover:border-signal/40 sm:p-7"
                >
                  <p className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.3em]">
                    {project.constellation ? (
                      <span
                        className={`flex items-center gap-2.5 ${HUE[project.constellation]}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${DOT[project.constellation]}`}
                          aria-hidden
                        />
                        {project.constellation}
                      </span>
                    ) : (
                      <span />
                    )}
                    <span className="text-mute">{String(i + 1).padStart(2, "0")}</span>
                  </p>

                  <div className="flex flex-col gap-2">
                    <h3 className="font-display text-2xl font-bold text-ink">{project.title}</h3>
                    <p className="font-body text-sm leading-relaxed text-mute">
                      {project.cardLine}
                    </p>
                  </div>

                  <ul className="flex flex-wrap gap-1.5">
                    {project.stack.slice(0, 4).map((item) => (
                      <li
                        key={item}
                        className="rounded-full border border-signal/20 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-mute"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto flex items-end justify-between gap-6 border-t border-signal/10 pt-4">
                    {stat ? (
                      <p className="line-clamp-2 font-mono text-[10px] leading-relaxed tracking-[0.05em] text-mute">
                        {stat}
                      </p>
                    ) : (
                      <span />
                    )}
                    <span className="shrink-0 font-mono text-xs uppercase tracking-[0.2em] text-signal transition-colors group-hover:text-ink">
                      Enter →
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
