import type { Metadata } from "next";
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

        <DetailField label="Outcome">
          <p>{entry.outcome}</p>
        </DetailField>

        {entry.recognition && (
          <DetailField label="Recognition">
            <p>{entry.recognition}</p>
          </DetailField>
        )}

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

        {entry.media.length > 0 && (
          // TODO(content): media files not yet dropped in — see /public/media/README.md
          <DetailField label="Media">
            <p className="text-mute">
              {entry.media.length} item{entry.media.length > 1 ? "s" : ""} pending — see{" "}
              <code>/public/media/{entry.slug}</code>.
            </p>
          </DetailField>
        )}
      </div>
    </main>
  );
}
