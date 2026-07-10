# /public/media

Local image files referenced by `content/*.ts`. Each entity gets its own
folder, named after its `slug`.

## Needed now (referenced in content/projects.ts, content/experience.ts, content/leadership.ts)

None of these files have been dropped in yet — every path below is wired
into the matching content entry, but the folder currently only holds a
`.gitkeep`. Drop the real file in and it'll render.

| Path                                    | What goes here                        |
|-------------------------------------------|------------------------------------------|
| `auradesign/logo.png`                    | AuraDesign.AI logo                       |
| `auradesign/landing.png`                 | AuraDesign.AI landing page screenshot    |
| `coner-ai/logo.png`                      | ConerAI logo                             |
| `coner-ai/landing.png`                   | ConerAI landing page screenshot          |
| `edith/screenshot.png`                   | E.D.I.T.H. workspace screenshot          |
| `edc-registration/01.png`                | EDC Event Portal screenshot 1            |
| `edc-registration/02.png`                | EDC Event Portal screenshot 2            |
| `edc-auction/01.png`                     | EDC Auction System screenshot 1          |
| `edc-auction/02.png`                     | EDC Auction System screenshot 2          |
| `fpt-software/01.png`                    | FPT Software screenshot                  |
| `dxp-software/01.png`                    | DXP Software screenshot 1                |
| `dxp-software/02.png`                    | DXP Software screenshot 2                |
| `cpc-coordinator/01.png`                 | CPC Coordinator photo                    |

Also needed: `/public/photo.png` (profile photo, referenced from
`content/profile.ts`) — not under `/media`, belongs at the `public` root.

## No media by design

- **PatientID+** (`patientid`) — private client work, nothing shareable.
- **EDC Technical Lead** (`edc-technical-lead`) — none supplied yet; marked
  `// TODO(content)` in `content/leadership.ts`.

Both render a clean "No media for this entry" placeholder instead of a
broken `<img>`.

## Résumé

The résumé PDF (`Resume_UjjwalKaushik.pdf`) belongs at the `/public` root,
not under `/media` — it ships as part of C6 (Gate / resume viewer), not
this content pass.
