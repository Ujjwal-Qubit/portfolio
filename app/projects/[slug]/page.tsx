import { SlugPlaceholder } from "@/components/SlugPlaceholder";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <SlugPlaceholder section="Project" slug={slug} />;
}
