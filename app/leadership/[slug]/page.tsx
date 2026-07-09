import { SlugPlaceholder } from "@/components/SlugPlaceholder";

export default async function LeadershipPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <SlugPlaceholder section="Leadership" slug={slug} />;
}
