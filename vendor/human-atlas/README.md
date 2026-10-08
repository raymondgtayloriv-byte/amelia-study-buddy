# Human Atlas (vendored source)

This folder contains the editable Human Atlas application embedded in Study Buddy.

## Provenance

Upstream repository: [ashemag/human-atlas](https://github.com/ashemag/human-atlas)

Vendored from commit `1c38bf35c254a891200d3cedecfd57abebe83d8d`, matching the supplied upstream checkout. Source and viewer license: MIT; see [LICENSE](./LICENSE). BodyParts3D models are published separately under CC BY 4.0 with attribution retained at `public/human-atlas/ATTRIBUTION.md`.

The atlas app, scene, utilities, web entry point, required UI components, package manifest and lockfile, and Vite/TypeScript configs are included. Unused generated UI scaffolding and the optional browser `modelContext` tool-registration module were removed. Upstream `.git`, `node_modules`, source model data, and upstream `public` are excluded.

## Build and publish

From the Study Buddy beta root, run:

```sh
node scripts/build-human-atlas.mjs
```

The script runs `npm ci` and the Vite production build in this folder. Vite uses `/human-atlas/` as its base and writes to `vendor/human-atlas/dist`. The script publishes only `index.html` and `assets/` into `public/human-atlas`; the atlas catalog, 15 compressed geometry files, and attribution file are checked and preserved. The dependency set includes only the React/Three.js viewer, its used UI primitives, and Vite/Tailwind build tools.

## Study Buddy bridge

`app/page.tsx` accepts same-origin `study-buddy:command` messages from its parent frame. It emits `human-atlas:ready`, bounded `human-atlas:status`, `human-atlas:selection`, and actionable `human-atlas:error` events. The listener checks both `event.source === window.parent` and the exact current origin. The bridge sends selection metadata only; it does not send the atlas dataset or contact an external service.
