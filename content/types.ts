// Shared content types for Project / Experience / Leadership entities.
// Populated only from the Content Dossier (B2) — see content/*.ts.

export type Constellation = "signal" | "builder" | "human";

export type MediaKind = "logo" | "screenshot" | "photo";

export interface MediaItem {
  kind: MediaKind;
  /** Local path under /public/media/<slug>/ — see public/media/README.md. */
  src: string;
  alt: string;
}

export interface LinkItem {
  label: string;
  /** Absent when the link is private, or the real URL isn't confirmed yet. */
  href?: string;
  /** True when the underlying content is private (e.g. client/society work). */
  private?: boolean;
  note?: string;
}

export interface BaseEntity {
  slug: string;
  title: string;
  /** Short line for cards/lists (e.g. homepage project list). */
  cardLine: string;
  /** Longer one-liner shown on the entity's detail page. */
  subtitle: string;
  constellation?: Constellation;
  context: string;
  media: MediaItem[];
  links: LinkItem[];
  recognition?: string;
}

export interface Project extends BaseEntity {
  kind: "project";
  problem: string;
  solution: string;
  stack: string[];
  roleScope: string;
  /** Absent when the project has no outcome to claim — render nothing, never a placeholder. */
  outcome?: string;
}

export interface Experience extends BaseEntity {
  kind: "experience";
  dates: string;
  location: string;
  whatIDid: string;
  stack: string[];
  outcome: string;
  /** True when the role is under NDA — content is limited to disclosed patterns only. */
  nda?: boolean;
}

export interface Leadership extends BaseEntity {
  kind: "leadership";
  dates: string;
  roleScope: string;
  outcome: string;
}

export type ContentEntity = Project | Experience | Leadership;

/** Badge is derived from `kind`, not stored per entry — see the Dossier's own "type:" line. */
export const KIND_LABEL: Record<ContentEntity["kind"], string> = {
  project: "PROJECT",
  experience: "EXPERIENCE",
  leadership: "LEADERSHIP",
};
