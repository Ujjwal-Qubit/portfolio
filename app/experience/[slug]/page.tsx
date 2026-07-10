import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DetailPage } from "@/components/DetailPage";
import { experience } from "@/content/experience";

export function generateStaticParams() {
  return experience.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = experience.find((e) => e.slug === slug);
  if (!entry) return { title: "Experience — Ujjwal Kaushik" };
  return {
    title: `${entry.title} — Ujjwal Kaushik`,
    description: entry.subtitle,
  };
}

export default async function ExperiencePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = experience.find((e) => e.slug === slug);
  if (!entry) notFound();

  return <DetailPage entity={entry} siblings={experience} />;
}
