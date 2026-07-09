# Ujjwal Kaushik — Portfolio

## Purpose

Personal portfolio site. Concept: **"Signal from Noise"** — the site's visual
and interaction language treats content as signal emerging from a dark,
noisy void. This shows up in the dark-only palette (`void` background,
bright accent `signal`), in copy, and eventually in the 3D canvas.

## Phase plan

This is a phased build. Each phase (`C1`–`C8`) is a separate task, done in
order:

1. **C1 — Walking skeleton** (this phase): deployable Next.js scaffold,
   design tokens, fonts, empty routes. No features, no 3D, no real content.
2. **C2 — Content layer**: all real facts, copy, project/experience/
   leadership data land in `content/*.ts`. Nothing invented before this.
3. **C3 — Detail pages**: `/projects/[slug]`, `/experience/[slug]`,
   `/leadership/[slug]` get real layouts driven by content data.
4. **C4 — 2D homepage**: real homepage design and layout, no 3D yet.
5. **C5 — 3D canvas**: React Three Fiber scene work begins.
6. **C6 — Gate / resume viewer**: access gating and the resume PDF viewer.
7. **C7 — Quality pass**: performance, accessibility, polish.
8. **C8 — Domain**: custom domain cutover and launch.

## Locked stack

- Next.js 15, App Router, TypeScript (strict)
- Tailwind CSS
- Dark-only site (no light-mode variants, `color-scheme: dark`)

**Installed in later tasks — do NOT install yet:**
- React Three Fiber + drei (C5)
- Lenis + GSAP ScrollTrigger (C4/C5)
- Framer Motion (C4)
- Zustand (C4+)

## Design tokens

Defined in `app/globals.css` under `@theme inline`, exposed as Tailwind
color utilities (`bg-void`, `text-ink`, etc.):

| Token     | Hex       | Role                        |
|-----------|-----------|------------------------------|
| `void`    | `#07070D` | Default page background      |
| `depth`   | `#101018` | Secondary surface / borders  |
| `signal`  | `#8B7CFF` | Primary accent                |
| `builder` | `#4FD8C9` | Secondary accent              |
| `human`   | `#F2B968` | Tertiary accent               |
| `ink`     | `#EDEDF2` | Default text                  |
| `mute`    | `#8E8EA3` | Secondary / low-emphasis text |

## Fonts

Wired via `next/font` in `lib/fonts.ts`, exposed as CSS variables and
Tailwind font families:

- `font-display` — Clash Display (local `.woff2`, `fonts-source/`) — headings
- `font-body` — General Sans (local `.woff2`, `fonts-source/`) — default body text
- `font-mono` — JetBrains Mono (`next/font/google`) — eyebrows, code, labels

## Route map

| Route                      | Status                                             |
|-----------------------------|----------------------------------------------------|
| `/`                          | Placeholder hero + temporary type-proof block      |
| `/projects/[slug]`           | Shared minimal placeholder, echoes slug            |
| `/experience/[slug]`         | Shared minimal placeholder, echoes slug            |
| `/leadership/[slug]`         | Shared minimal placeholder, echoes slug            |
| `/writing`                   | Placeholder, `robots: noindex`, linked from nowhere |
| `/resume`                    | Placeholder, becomes a PDF viewer in C6            |
| `not-found`                  | Styled with design tokens                          |

## Standing rules

- **Dark-only.** No light-mode variants, anywhere, ever.
- **No invented facts.** Every fact, metric, or claim on the site comes from
  `content/*.ts` (arriving in C2). Never fabricate content, numbers, dates,
  or claims — placeholders only, and they're marked.
- **Placeholders are marked** with `// TODO(content)` so they're greppable
  and impossible to ship by accident.
- **Commit after every working step.** Don't batch unrelated changes into
  one commit.
