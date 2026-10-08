# Study Buddy Build Contract — Cletus loop

**Mission.** Build out Amelia's BIOL 2401 Study Buddy app the way it was initially envisioned:
her entire course in the app, many ways to study (glanceable data, flashcards, multiple choice,
fill-in-the-blank, connect-the-statements, click-the-bone, type-the-bone-name, name-the-system),
quizzes/tests with progress monitoring. Beautiful, simple, obvious, fun, interactive — and calm.
Structured, bland-in-a-good-way. No clownish redesigns.

**Baseline.** Branch `cletus-build` from `7bf847c` (preserved April 2026 working tree).
Pristine copy untouched at `workspace/study-buddy-recovery/preserved/`. Revert = `git reset --hard 7bf847c`.

## Hard rules (violations fail the phase, no exceptions)

1. **Minimal diffs.** Only edits you can stand behind as obvious improvements. Surgical changes;
   no broad refactors without a strong reason. Working flows stay working.
2. **No copyrighted material in code.** Professor PPTX/slide content lives in private local data
   packs, strictly separate from code. Never publish, never commit secrets/credentials.
3. **Truthful progress.** Weak spots, scores, counters reflect real state. No fake zeros, no demo
   data presented as live data. Unavailable ≠ zero.
4. **Stack stays:** React 19, Vite 8, Tailwind v4, plain JavaScript (no TS conversion),
   @react-three/fiber + drei + three. No router, no backend, no auth. State in App.jsx,
   localStorage key `biol2401-study-hub-v1` (migrate carefully or keep).
5. **Existing 3D viewer untouched** until the new BodyExplorer passes its gate side-by-side.
6. **Every phase ends with:** `npm run build` green, secret scan clean, git checkpoint commit
   on `cletus-build`, and a verifier pass against that phase's acceptance criteria.
7. **Exploded view: YES.** Port the explosion *layout algorithm* (MIT) to R3F/plain JS for the
   existing 183-bone `skeleton.glb`. BodyParts3D multisystem geometry (CC BY 4.0) is Phase 2b —
   needs ATTRIBUTION.md + binary vendoring; not in this loop.

## Phase gates

- **P1 inventory** — read-only. `docs/HAVE-NEED.md`: exact chapter-by-chapter HAVE / PARTIAL /
  NEED list; reconcile served-dist counters (0/8 chapters, 0/40 flashcards) vs source data;
  secret scan. No app-code edits.
- **P2 BodyExplorer** — new `src/components/BodyExplorer.jsx` beside the old viewer:
  assembled↔exploded slider (ported shelf-layout), click bone → info, search, isolate/focus,
  tap-vs-drag, quiz hooks (click-the-bone). 183 bones selectable, 60fps-ish, build green.
- **P3 quiz engine** — one data-driven engine, all modes: multiple choice, fill-in-the-blank,
  connect-the-statements, click-the-bone, type-the-bone-name, name-the-system; study mode
  (visual cues + info), blind mode, hints, optional spell-check (existing behavior preserved).
  Pack format documented at `src/data/packs/pack-schema.md`; existing content migrated, none lost.
- **P4 UI taste pass** — calm, structured, glanceable. Hierarchy/spacing/consistency. Nothing
  clownish. All existing flows intact.
- **P5 release** — smoke tests (build + pack validation + secret scan as `npm run` scripts),
  final HAVE-NEED, closeout report with final commit hash, shipped tree, test results.

## Loop budget (per phase)

Build → verify → repair, max 3 build attempts per phase. Verifier failure with `retryable:false`
or budget exhausted → loop stops and reports (blocked), never spins. Broken tool calls twice
in a row → stop the phase and report.

## School materials (Amelia, ~couple hours)

Packs land in `src/data/packs/` per `pack-schema.md`. Real professor content stays local/private.
The loop builds everything against existing content + synthetic samples; it never blocks on her.
