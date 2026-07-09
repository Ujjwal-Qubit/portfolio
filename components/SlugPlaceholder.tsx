export function SlugPlaceholder({
  section,
  slug,
}: {
  section: string;
  slug: string;
}) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 bg-void px-6 py-24 text-center text-ink">
      <p className="font-mono text-sm uppercase tracking-[0.3em] text-mute">
        {section}
      </p>
      <h1 className="font-display text-4xl font-bold sm:text-5xl">
        {/* TODO(content) */}
        {slug}
      </h1>
    </main>
  );
}
