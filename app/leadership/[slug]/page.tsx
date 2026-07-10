import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DetailPage } from "@/components/DetailPage";
import { leadership } from "@/content/leadership";

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
  if (!entry) return { title: "Leadership — Ujjwal Kaushik" };
  return {
    title: `${entry.title} — Ujjwal Kaushik`,
    description: entry.subtitle,
  };
}

export default async function LeadershipPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = leadership.find((l) => l.slug === slug);
  if (!entry) notFound();

  return <DetailPage entity={entry} siblings={leadership} />;
}
