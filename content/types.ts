// Shared content types for Project / Experience / Leadership entities.
// Populated from the Site Copy (Final) doc — see content/*.ts.

export type Constellation = "signal" | "builder" | "human";

export interface MediaItem {
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
  /** Short meta line: e.g. "2026", "Dec 2024 – Present". */
  year: string;
  /** Short meta line: e.g. "Solo · Full-stack". */
  role: string;
  /** Short meta line: e.g. "In production", "Live demo". */
  status: string;
  context: string;
  media: MediaItem[];
  links: LinkItem[];
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
  work: string;
  stack: string[];
  outcome: string;
  /** True when the role is under NDA — content is limited to disclosed patterns only. */
  nda?: boolean;
}

export interface Leadership extends BaseEntity {
  kind: "leadership";
  dates: string;
  roleScope: string;
  work: string;
  outcome: string;
  /** Short mono stat chips for the homepage card — confirmed facts only. */
  stats?: string[];
}

export type ContentEntity = Project | Experience | Leadership;

/** Badge is derived from `kind`, not stored per entry. */
export const KIND_LABEL: Record<ContentEntity["kind"], string> = {
  project: "PROJECT",
  experience: "EXPERIENCE",
  leadership: "LEADERSHIP",
};
