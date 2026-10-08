# Human Atlas integration — build note

Ray asked for the actual viral Human Atlas body explorer (ashebytes / ashemag),
not an explosion slider bolted onto the 183-bone skeleton. This is that: the
genuine human-atlas application vendored inside Study Buddy at `/human-atlas/`,
surfaced as the **Human Body** nav section (`src/components/HumanBodyView.jsx`).

## Source

- Repo: https://github.com/ashemag/human-atlas (cloned 2026-09-11 to
  `~/workspace/study-buddy/human-atlas`)
- Viewer code license: MIT (`public/human-atlas/LICENSE`)
- Anatomy data: BodyParts3D 4.0 © The Database Center for Life Science,
  licensed **CC BY 4.0**. Attribution preserved two ways:
  1. visible credit line in `HumanBodyView.jsx` (links CC BY 4.0 deed),
  2. full `public/human-atlas/ATTRIBUTION.md` shipped with the build.
- Content: 2,234 selectable meshes, 15 systems, 3,432 named concepts,
  2,288,268 triangles.

## What was vendored (and what was not)

Vendored into `work/public/human-atlas/` (34 MB total):

- `index.html`, `assets/*` — production build of the atlas app
- `models/atlas.json` — catalogue manifest (**patched**: chunk URLs rewritten
  from `/models/...` to `/human-atlas/models/...`)
- `models/body-*.bin.gz` — the 15 compressed geometry chunks
- `favicon.svg`, `ATTRIBUTION.md`, `LICENSE`

NOT vendored: `models/body-*.bin` (uncompressed, ~60 MB). The viewer fetches
the `.gz` chunks whenever `DecompressionStream` exists (all modern browsers)
and gunzips client-side, so the `.bin` fallback is unnecessary.

## Build adaptations (2)

1. `human-atlas/app/page.tsx`: `fetch('/models/atlas.json')` →
   `fetch('/human-atlas/models/atlas.json')` (subpath serving).
2. `vite build --base=/human-atlas/` so all bundled asset URLs carry the
   subpath prefix.

## How to rebuild

```sh
cd ~/workspace/study-buddy/human-atlas
npm ci
npx vite build --base=/human-atlas/
# re-apply the atlas.json URL patch, then re-copy into work/public/human-atlas/
```

Then rebuild Study Buddy normally (`npm run build`); Vite copies
`public/human-atlas/` into `dist/` untouched.

## Notes

- The 183-bone skeleton viewers (`BodyExplorer`, `Skeleton3DView`) are
  untouched — quiz modes (click-the-bone etc.) still use them.
- Known limitation: browsers without `DecompressionStream` (pre-2023) would
  need the uncompressed `.bin` chunks, which are not shipped.

## Visual verification (2026-09-12)

Rendered in headless Chromium (SwiftShader) against the production `dist/`:
- Atlas standalone: full body renders, "2,234 modeled pieces · BodyParts3D",
  15 systems listed, explode slider at 0%, search bar — all present.
- Embedded in Study Buddy: "Human Body" nav item active, header panel with
  2,234/15-system badge, atlas rendering inside the iframe.
- Zero page errors, zero failed HTTP requests. All 15 geometry chunks
  served 200 with the rewritten /human-atlas/ URLs.
Screenshots: /tmp/atlas_verify/atlas_standalone.png, app_human_body.png
