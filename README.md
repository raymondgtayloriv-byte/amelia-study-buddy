# Amelia's Study Buddy

A local BIOL 2401 study workspace built around the genuine Human Atlas: 2,234 selectable 3D meshes, 15 anatomical systems, search, isolation, and assembled-to-exploded exploration.

Study with chapter notes, matching, guided recognition, typed retrieval, exam rehearsal, flashcards, bone landmarks, and printable visual guides. Course material and supplemental atlas reference activities are labeled separately.

## Run the app

Use Node.js 22.12 or newer, then run from the project folder:

```sh
npm ci
npm run dev
```

Open the localhost address printed by Vite. The first anatomy view downloads about 34 MB of local model files. A current browser with WebGL and DecompressionStream is required. Serve over HTTP; opening index.html directly as a file will not work.

For the production build:

```sh
npm run build
npm run preview
```

The generated dist/ can be hosted at the root of a static website. Paths currently assume a root URL; a GitHub Pages project subpath requires separate base-path configuration. Downloading from GitHub and running locally needs no such change.

## Progress and a clean handoff

Each browser stores its own progress, bookmarks, notes, uploads, and theme locally. These are never written into source code or builds. A classmate downloading or cloning this repository starts with no progress. Separate browsers, browser profiles, and devices already have separate progress; there is no account service.

On the same browser, use **Add chapters → Start fresh → Review reset**. Reset clears learning progress and the anatomy notebook, keeps imported chapter materials, and offers **Undo reset** while that panel is open. Export a backup first for a durable copy of your own progress. Restoring somebody else's backup intentionally restores the progress in it.

## Add missing chapters

Use **Add chapters** to preview and save TXT, Markdown, PDF, PPTX, or a JSON chapter pack. Extraction runs locally. PDF/PPTX files provide readable notes; scanned PDFs require OCR beforehand, and images are not extracted. Plain notes do not invent authoritative questions. Download the JSON template to supply your own flashcards and questions. Choose Course or Supplemental explicitly.

Uploads also belong to that browser. To share new materials, distribute chapter files/packs for each person to import; uploading a file in the app does not add it to GitHub. See [sharing details](docs/SHARING.md).

## Verify and edit

```sh
npm run lint
npm run test:study
npm run smoke
npm run verify:content
npm run secrets-scan
```

Original course data lives in src/data/. Editable atlas source lives in vendor/human-atlas/. To republish atlas edits, run `npm run build:atlas`, then `npm run build`. The atlas build script preserves its catalog, all 15 compressed chunks, and attribution. The shipped prebuilt atlas is enough for normal app builds.

## Source and attribution

Human Atlas is by Ashe Magalhaes (@ashebytes), vendored from upstream commit 1c38bf35c254a891200d3cedecfd57abebe83d8d, with a Study Buddy bridge, theme support, and targeted rendering optimizations. Its viewer code is MIT; BodyParts3D data is CC BY 4.0. Keep public/human-atlas/ATTRIBUTION.md, shipped licenses, and visible attribution in redistributed builds. Those licenses apply to their respective third-party materials, not automatically to course content.

Original instructor decks and recovered private Git history are excluded from the prepared sharing ZIP. Existing course summaries and question packs remain included. Chapters 5 and 10–15 need course materials. Thirty-two of the original 37 bone targets have exact selectable atlas mappings; the remaining overview concepts retain text practice.
