import Image from "next/image";
import Link from "next/link";
import type { ContentEntity, LinkItem, MediaItem } from "@/content/types";
import { KIND_LABEL } from "@/content/types";

/**
 * Detail-route base + footer label per kind. `index` points at the homepage
 * section for now — there are no standalone index routes yet.
 */
const KIND_ROUTE: Record<ContentEntity["kind"], { base: string; index: string; all: string }> = {
  project: { base: "/projects", index: "/#projects", all: "ALL PROJECTS" },
  experience: { base: "/experience", index: "/#experience", all: "ALL EXPERIENCE" },
  leadership: { base: "/leadership", index: "/#leadership", all: "ALL LEADERSHIP" },
};

/**
 * The badge is the ONLY place a constellation hue appears on a detail page.
 * Full class strings — Tailwind can't see interpolated names.
 */
const BADGE_TINT: Record<string, string> = {
  signal: "border-signal/40 text-signal",
  builder: "border-builder/40 text-builder",
  human: "border-human/40 text-human",
};

const CARD = "rounded-2xl border border-signal/20 bg-depth/60 p-6 backdrop-blur-sm sm:p-8";
// bg-void, not bg-depth: object-contain letterboxes against the page background.
const FRAME = "relative overflow-hidden rounded-2xl border border-signal/20 bg-void";
const LABEL = "font-mono text-[11px] uppercase tracking-[0.25em] text-mute";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Split an outcome into a headline sentence and its supporting remainder. */
function splitOutcome(outcome: string) {
  const end = outcome.indexOf(". ");
  if (end === -1) return { headline: outcome, support: null };
  return {
    headline: outcome.slice(0, end + 1),
    support: outcome.slice(end + 2).trim() || null,
  };
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className={LABEL}>{label}</span>
      <span className="font-mono text-sm text-ink">{value}</span>
    </div>
  );
}

/** Label-left / body-right row. Stacks on mobile. */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-3 md:grid-cols-[9rem_1fr] md:gap-10">
      <h2 className={`${LABEL} md:pt-1.5`}>{label}</h2>
      <div className="font-body text-base leading-relaxed text-ink/90">{children}</div>
    </div>
  );
}

function Frame({ item, aspect, priority }: { item: MediaItem; aspect: string; priority?: boolean }) {
  return (
    <div className={`${FRAME} ${aspect}`}>
      <Image
        src={item.src}
        alt={item.alt}
        fill
        priority={priority}
        sizes="(max-width: 768px) 100vw, 896px"
        className="object-contain"
      />
    </div>
  );
}

function LinkRow({ links }: { links: LinkItem[] }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-8 gap-y-3">
      {links.map((link) => (
        <li key={link.label} className="font-mono text-xs uppercase tracking-[0.2em]">
          {link.href ? (
            <a
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="text-signal underline decoration-signal/30 underline-offset-[6px] transition-colors hover:decoration-signal"
            >
              {link.label} ↗
            </a>
          ) : (
            <span aria-disabled className="cursor-default text-mute/70">
              {link.label}
              {link.note ? ` — ${link.note}` : ""}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

export function DetailPage({
  entity,
  siblings,
}: {
  /** Every entity of the same kind, in content order — drives case number + next link. */
  siblings: ContentEntity[];
  entity: ContentEntity;
}) {
  const index = siblings.findIndex((s) => s.slug === entity.slug);
  const next = siblings[(index + 1) % siblings.length];
  const route = KIND_ROUTE[entity.kind];

  const badgeLabel =
    entity.kind === "project" && entity.constellation
      ? entity.constellation.toUpperCase()
      : KIND_LABEL[entity.kind];
  const badgeTint =
    (entity.kind === "project" && entity.constellation && BADGE_TINT[entity.constellation]) ||
    BADGE_TINT.signal;

  const [hero, ...rest] = entity.media;
  const stack = "stack" in entity ? entity.stack : undefined;
  const outcome = "outcome" in entity ? entity.outcome : undefined;
  const roleScope = "roleScope" in entity ? entity.roleScope : undefined;
  // Richer than the meta row's `year` — experience/leadership only.
  const dates = "dates" in entity ? entity.dates : undefined;
  const location = "location" in entity ? entity.location : undefined;

  return (
    <main className="grain relative flex-1 bg-void px-6 pb-24 pt-8 text-ink">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-16">
        {/* 1 — Top bar */}
        <nav className="grid grid-cols-3 items-center font-mono text-[11px] uppercase tracking-[0.25em] text-mute">
          <Link href="/" className="justify-self-start transition-colors hover:text-ink">
            ← Index
          </Link>
          <Link href="/" className="justify-self-center transition-colors hover:text-ink">
            <span className="hidden sm:inline">Signal from Noise</span>
            <span className="sm:hidden">SFN</span>
          </Link>
          <span className="justify-self-end">
            Case {pad(index + 1)} / {pad(siblings.length)}
          </span>
        </nav>

        <header className="flex flex-col gap-7">
          {/* 2 — Badge */}
          <span
            className={`w-fit rounded-full border px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.3em] ${badgeTint}`}
          >
            {badgeLabel}
          </span>

          {/* 3 — Title + subtitle */}
          <div className="flex flex-col gap-4">
            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
              {entity.title}
            </h1>
            <p className="max-w-2xl font-body text-lg leading-relaxed text-mute">
              {entity.subtitle}
            </p>
          </div>

          {/* 4 — Meta row */}
          <div className="flex flex-wrap gap-x-14 gap-y-6 border-t border-signal/10 pt-7">
            <Meta label="Year" value={entity.year} />
            <Meta label="Role" value={entity.role} />
            <Meta label="Status" value={entity.status} />
          </div>
        </header>

        {/* 5 — Hero media. Entities with no media render nothing here. */}
        {hero && <Frame item={hero} aspect="aspect-video" priority />}

        {/* 6 — Context */}
        <Row label="Context">
          <p>{entity.context}</p>
        </Row>

        {dates && (
          <Row label="Period">
            <p>{dates}</p>
          </Row>
        )}

        {location && (
          <Row label="Location">
            <p>{location}</p>
          </Row>
        )}

        {roleScope && (
          <Row label="Role & scope">
            <p>{roleScope}</p>
          </Row>
        )}

        {/* 7 — Body block */}
        {entity.kind === "project" ? (
          <div className="grid gap-5 md:grid-cols-2">
            <section className={`${CARD} flex flex-col gap-4`}>
              <h2 className={LABEL}>Problem</h2>
              <p className="font-body leading-relaxed text-ink/90">{entity.problem}</p>
            </section>
            <section className={`${CARD} flex flex-col gap-4`}>
              <h2 className={LABEL}>Solution</h2>
              <p className="font-body leading-relaxed text-ink/90">{entity.solution}</p>
            </section>
          </div>
        ) : (
          <section className={`${CARD} flex flex-col gap-4`}>
            <h2 className={LABEL}>The work</h2>
            <p className="font-body leading-relaxed text-ink/90">{entity.work}</p>
          </section>
        )}

        {/* 8 — Stack */}
        {stack && stack.length > 0 && (
          <Row label="Stack">
            <ul className="flex flex-wrap gap-2">
              {stack.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-signal/20 bg-depth/50 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-mute"
                >
                  {item}
                </li>
              ))}
            </ul>
          </Row>
        )}

        {/* 9 — Outcome (omitted entirely when absent) */}
        {outcome && (
          <section className="flex flex-col gap-5 border-y border-signal/10 py-12">
            <h2 className={LABEL}>Outcome</h2>
            {(() => {
              const { headline, support } = splitOutcome(outcome);
              return (
                <>
                  <p className="max-w-3xl font-display text-2xl font-bold leading-snug text-signal sm:text-3xl">
                    {headline}
                  </p>
                  {support && (
                    <p className="max-w-2xl font-body leading-relaxed text-mute">{support}</p>
                  )}
                </>
              );
            })()}
          </section>
        )}

        {/* 10 — Secondary media. A lone image spans full width instead of half. */}
        {rest.length > 0 && (
          <div className={`grid gap-5 ${rest.length > 1 ? "sm:grid-cols-2" : ""}`}>
            {rest.map((item) => (
              <Frame
                key={item.src}
                item={item}
                aspect={rest.length > 1 ? "aspect-[4/3]" : "aspect-video"}
              />
            ))}
          </div>
        )}

        {/* 11 — Links */}
        {entity.links.length > 0 && (
          <Row label="Links">
            <LinkRow links={entity.links} />
          </Row>
        )}

        {/* 12 — Footer nav */}
        <nav className="flex flex-wrap items-center justify-between gap-6 border-t border-signal/10 pt-8 font-mono text-[11px] uppercase tracking-[0.25em]">
          <Link href={route.index} className="text-mute transition-colors hover:text-ink">
            ← {route.all}
          </Link>
          <Link
            href={`${route.base}/${next.slug}`}
            className="text-signal transition-colors hover:text-ink"
          >
            Next: {next.title} →
          </Link>
        </nav>
      </div>
    </main>
  );
}
