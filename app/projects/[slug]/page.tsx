import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { DetailField } from "@/components/DetailField";
import { projects } from "@/content/projects";
import { KIND_LABEL } from "@/content/types";
import { constellationTextClass } from "@/lib/constellation";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  return {
    title: project ? `${project.title} — Ujjwal Kaushik` : "Project — Ujjwal Kaushik",
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  return (
    <main className="flex flex-1 flex-col items-center gap-10 bg-void px-6 py-24 text-ink">
      <div className="flex w-full max-w-2xl flex-col gap-4 text-center">
        <p
          className={`font-mono text-sm uppercase tracking-[0.3em] ${
            project.constellation ? constellationTextClass[project.constellation] : "text-mute"
          }`}
        >
          {KIND_LABEL[project.kind]}
        </p>
        <h1 className="font-display text-4xl font-bold sm:text-5xl">
          {project.title}
        </h1>
        <p className="font-body text-lg text-mute">{project.subtitle}</p>
        <p className="font-mono text-xs text-mute">
          {project.year} · {project.role} · {project.status}
        </p>
      </div>

      <div className="flex w-full max-w-2xl flex-col gap-8 border border-depth p-8">
        <DetailField label="Context">
          <p>{project.context}</p>
        </DetailField>

        <DetailField label="Problem">
          <p>{project.problem}</p>
        </DetailField>

        <DetailField label="Solution">
          <p>{project.solution}</p>
        </DetailField>

        <DetailField label="Role & scope">
          <p>{project.roleScope}</p>
        </DetailField>

        <DetailField label="Stack">
          <ul className="flex flex-wrap gap-2">
            {project.stack.map((item) => (
              <li
                key={item}
                className="border border-depth px-2 py-1 font-mono text-xs text-mute"
              >
                {item}
              </li>
            ))}
          </ul>
        </DetailField>

        {project.outcome && (
          <DetailField label="Outcome">
            <p>{project.outcome}</p>
          </DetailField>
        )}

        {project.links.length > 0 && (
          <DetailField label="Links">
            <ul className="flex flex-col gap-1">
              {project.links.map((link) => (
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
          {project.media.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {project.media.map((item) => (
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
