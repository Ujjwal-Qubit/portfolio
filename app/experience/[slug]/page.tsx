import { SlugPlaceholder } from "@/components/SlugPlaceholder";

export default async function ExperiencePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <SlugPlaceholder section="Experience" slug={slug} />;
}
