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
            className="w-80 rounded-2xl border border-signal/20 sm:w-96"
          />
        </Reveal>
        <Reveal delay={0.1} className="flex max-w-xl flex-col gap-6">
          <p className="font-mono text-xs uppercase tracking-[0.45em] text-mute">About</p>
          <div className="flex flex-col">
            <span aria-hidden className="font-display text-7xl leading-none text-signal/40 sm:text-8xl">
              &ldquo;
            </span>
            <p className="-mt-5 font-body text-xl leading-relaxed text-ink sm:text-2xl">
              {profile.bio}
            </p>
          </div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-mute">
            — Ujjwal Kaushik
          </p>
        </Reveal>
      </div>
    </section>
  );
}
