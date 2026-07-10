import { Reveal } from "./Reveal";

export function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <Reveal className="flex flex-col gap-3">
      <p className="font-mono text-xs uppercase tracking-[0.45em] text-mute">{eyebrow}</p>
      <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-5xl">
        {title}
      </h2>
    </Reveal>
  );
}
