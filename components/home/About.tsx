import Image from "next/image";
import { profile } from "@/content/profile";
import { Reveal } from "./Reveal";

export function About() {
  return (
    <section id="about" className="scroll-mt-20">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-24 sm:py-32 md:flex-row md:items-start md:gap-16">
        <Reveal className="shrink-0">
          <Image
            src={profile.photo}
            alt="Ujjwal Kaushik"
            width={400}
            height={400}
            className="w-52 rounded-2xl border border-signal/20 sm:w-60"
          />
        </Reveal>
        <Reveal delay={0.1} className="flex max-w-xl flex-col gap-5">
          <p className="font-mono text-xs uppercase tracking-[0.45em] text-mute">About</p>
          <p className="font-body text-lg leading-relaxed text-ink/90">{profile.bio}</p>
        </Reveal>
      </div>
    </section>
  );
}
