import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { DetailField } from "@/components/DetailField";
import { leadership } from "@/content/leadership";
import { KIND_LABEL } from "@/content/types";
import { constellationTextClass } from "@/lib/constellation";

export function generateStaticParams() {
  return leadership.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = leadership.find((l) => l.slug === slug);
  return {
    title: entry ? `${entry.title} — Ujjwal Kaushik` : "Leadership — Ujjwal Kaushik",
  };
}

export default async function LeadershipPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = leadership.find((l) => l.slug === slug);
  if (!entry) notFound();

  return (
    <main className="flex flex-1 flex-col items-center gap-10 bg-void px-6 py-24 text-ink">
      <div className="flex w-full max-w-2xl flex-col gap-4 text-center">
        <p
          className={`font-mono text-sm uppercase tracking-[0.3em] ${
            entry.constellation ? constellationTextClass[entry.constellation] : "text-mute"
          }`}
        >
          {KIND_LABEL[entry.kind]}
        </p>
        <h1 className="font-display text-4xl font-bold sm:text-5xl">
          {entry.title}
        </h1>
        <p className="font-body text-lg text-mute">{entry.subtitle}</p>
        <p className="font-mono text-xs text-mute">
          {entry.year} · {entry.role} · {entry.status}
        </p>
      </div>

      <div className="flex w-full max-w-2xl flex-col gap-8 border border-depth p-8">
        <DetailField label="Dates">
          <p>{entry.dates}</p>
        </DetailField>

        <DetailField label="Context">
          <p>{entry.context}</p>
        </DetailField>

        <DetailField label="Role & scope">
          <p>{entry.roleScope}</p>
        </DetailField>

        <DetailField label="The work">
          <p>{entry.work}</p>
        </DetailField>

        <DetailField label="Outcome">
          <p>{entry.outcome}</p>
        </DetailField>

        {entry.links.length > 0 && (
          <DetailField label="Links">
            <ul className="flex flex-col gap-1">
              {entry.links.map((link) => (
                <li key={link.label}>
                  {link.href ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-signal underline underline-offset-4"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <span className="text-mute">
                      {link.label}
                      {link.note ? ` — ${link.note}` : ""}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </DetailField>
        )}

        <DetailField label="Media">
          {entry.media.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {entry.media.map((item) => (
                <div
                  key={item.src}
                  className="relative aspect-video overflow-hidden border border-depth bg-depth"
                >
                  <Image src={item.src} alt={item.alt} fill className="object-cover" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-mute">No media for this entry.</p>
          )}
        </DetailField>
      </div>
    </main>
  );
}
