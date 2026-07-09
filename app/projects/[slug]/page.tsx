import type { Metadata } from "next";
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

        <DetailField label="Outcome">
          <p>{project.outcome}</p>
        </DetailField>

        {project.recognition && (
          <DetailField label="Recognition">
            <p>{project.recognition}</p>
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

        {project.media.length > 0 && (
          // TODO(content): media files not yet dropped in — see /public/media/README.md
          <DetailField label="Media">
            <p className="text-mute">
              {project.media.length} item{project.media.length > 1 ? "s" : ""} pending — see{" "}
              <code>/public/media/{project.slug}</code>.
            </p>
          </DetailField>
        )}
      </div>
    </main>
  );
}
