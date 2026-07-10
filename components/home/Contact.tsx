import Link from "next/link";
import { contact } from "@/content/contact";
import { Reveal } from "./Reveal";

const LINKS = [
  { label: "GitHub", href: contact.github.href },
  { label: "LinkedIn", href: contact.linkedin.href },
  { label: "Instagram", href: contact.instagram.href },
  { label: "Email", href: `mailto:${contact.email}` },
];

export function Contact() {
  return (
    <section id="contact" className="scroll-mt-20">
      <div className="mx-auto flex min-h-[80vh] w-full max-w-6xl flex-col items-center justify-center gap-10 px-6 py-24 text-center">
        <Reveal className="flex flex-col items-center gap-10">
          <span
            className="pulse-slow h-2.5 w-2.5 rounded-full bg-signal shadow-[0_0_28px_10px_rgba(139,124,255,0.35)]"
            aria-hidden
          />
          <h2 className="font-display text-4xl font-bold tracking-tight text-ink sm:text-6xl">
            Let&apos;s build something.
          </h2>
        </Reveal>

        <Reveal delay={0.15} className="flex flex-col items-center gap-10">
          <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 font-mono text-xs uppercase tracking-[0.25em]">
            {LINKS.map(
              (link) =>
                link.href && (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      {...(link.href.startsWith("mailto:")
                        ? {}
                        : { target: "_blank", rel: "noreferrer" })}
                      className="text-mute transition-colors hover:text-signal"
                    >
                      {link.label}
                    </a>
                  </li>
                ),
            )}
          </ul>

          <Link
            href="/resume"
            className="rounded-full border border-signal/40 px-8 py-3.5 font-mono text-xs uppercase tracking-[0.3em] text-signal transition-colors hover:bg-signal/10"
          >
            Résumé ↓
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
