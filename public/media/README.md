# /public/media

Local image files referenced by `content/*.ts`. The Content Dossier's image
URLs are temporary Notion links that expire, so content files reference
local paths here instead — the actual files need to be dropped in by hand.

Each entity gets its own folder, named after its `slug`.

## Needed now (referenced in content/projects.ts)

| Path                                  | What goes here                        |
|----------------------------------------|----------------------------------------|
| `auradesign/logo.png`                  | AuraDesign.AI logo                     |
| `auradesign/landing.png`               | AuraDesign.AI landing page screenshot  |
| `coner-ai/logo.png`                    | ConerAI logo                           |
| `coner-ai/landing.png`                 | ConerAI landing page screenshot        |

Every reference above is marked `// TODO(content)` at its call site in
`content/projects.ts`.

## Not yet referenced

The Dossier's Media section was blank (or explicitly `TODO`) for every
other entity — E.D.I.T.H., EDC Event Portal, EDC Auction System, FPT
Software, DXP Software, EDC Technical Lead, and CPC Coordinator — so no
local media paths were invented for them. PatientID+ is confirmed private
client work with nothing shareable, so it has none by design.

If real images turn up for any of these later, add a
`public/media/<slug>/` folder and wire the path into the matching entry in
`content/projects.ts`, `content/experience.ts`, or `content/leadership.ts`.

## Résumé

The résumé PDF (`Resume_UjjwalKaushik.pdf`) belongs at the `/public` root,
not under `/media` — it ships as part of C6 (Gate / resume viewer), not
this content pass.
