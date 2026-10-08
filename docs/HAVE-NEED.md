# HAVE / NEED — Study Buddy content inventory (P1 inventory, P5 final)

Generated: 2026-09-11 (America/Chicago), branch `cletus-build`, from repo source only.
Finalized in P5: content counts re-verified via `npm run smoke`
(8 packs, 37 bones, 306 terms, 40 flashcards, 90 quiz items).
Course scope: **BIOL 2401 (A&P I)** — 8 chapters with live content in the app:
chapter-1, 2, 3, 4, 6, 7, 8, 9 (Marieb A&P sequence; chapter 5 sits inside this
sequence but has no content yet).

## 1. Chapter-by-chapter status (verified in `src/data/studyData.js`)

Legend: HAVE = full app content (summary + flashcards + quiz + cram deck).
PARTIAL = content exists but lacks a local professor source packet or has gaps.
NEED = chapter shell only (`coming-soon`), no app content.

| # | Chapter | App status | Flashcards | Quiz bank | Cram deck | Professor packet local? |
|---|---------|-----------|------------|-----------|-----------|------------------------|
| 1 | The Human Body: An Orientation | **HAVE** | 5 (fc-1..4,13) | 4 (q-1..4) | cram-1 | **NO** — content authored earlier, no pptx in `source-material/` |
| 2 | Chemistry Comes Alive | **HAVE** | 3 (fc-5,6,14) | 4 (q-5..8) | cram-2 | **NO** |
| 3 | Cells: The Living Units | **HAVE** | 4 (fc-7,8,15,16) | 4 (q-9..12) | cram-3 | **NO** |
| 4 | Tissue: The Living Fabric | **HAVE** | 4 (fc-9,10,17,18) | 4 (q-13..16) | cram-4 | **NO** |
| 5 | Integumentary System | **NEED** | 0 | 0 | — | **NO — Amelia must supply** |
| 6 | Bones and Skeletal Tissues | **HAVE** | 6 | 15 (q-17..31) | cram-6 | **YES** — `Chapter 6 Skeletal system.pptx` (6.2 MB) + `Chapter 6 Skeletal system_extracted.txt` (252 lines) |
| 7 | The Skeleton | **HAVE** (richest) | 6 | 15 (q-22..36) | cram-7 | **YES** — `Chapter 7 Skeletal System.pptx` (18.4 MB) + `Chapter 7 Skeletal System_extracted.txt` (745 lines). Plus Bones Lab module: 9 regions / 37 bones / 214 structures / 48 reference views (`bonesLabChapter7.js`); 47 images in `public/anatomy/chapter7/`; 6 mapped PNGs in `src/assets/anatomy/` (Anatomography/BodyParts3D, CC BY-SA 2.1 JP, credited in data) |
| 8 | Joints | **HAVE** | 6 | 22 (q-27..48) | cram-8 | **PARTIAL** — `Chapter 8 Student - Copy.pptx` (4.7 MB) is local, but the extracted slide text (made on Ray's PC 2026-04-07 per `docs/ch8-ch9-integration-execution-note.md`) was never committed to this repo |
| 9 | Muscles and Muscle Tissue | **HAVE** | 6 | 22 (q-32..53) | cram-9 | **PARTIAL** — `Chapter 9 Student - Copy.pptx` (12.6 MB) is local, extracted text likewise not committed |
| 10 | The Muscular System | NEED (shell) | — | — | — | NO (A&P II territory) |
| 11–15 | Nervous system, senses (shells) | NEED (shell) | — | — | — | NO (A&P II territory) |

Totals: 15 chapter defs, **8 ready** (1,2,3,4,6,7,8,9), **40 flashcards**
(5+3+4+4+6+6+6+6 — all referenced by a chapter def, no orphans), **90 quiz
questions** in the bank (16 + 15 + 15 + 22 + 22), **8 cram decks**.

### What Amelia must supply (the NEED list)
1. **Chapter 5 — Integumentary System**: the one BIOL 2401 gap. A chapter 5
   lecture packet (pptx or PDF) is needed to author flashcards, quiz, cram
   deck, and the chapter summary.
2. **Chapters 8/9 extracted text** (nice-to-have): the pptx files are local,
   but re-running `extract_pptx.py` on them would restore the extracted-txt
   layer that exists for chapters 6/7 and make the build reproducible here.
3. **Chapters 1–4 packets** (optional): app content for 1–4 exists but there
   is no local professor packet to verify it against. If Amelia's instructor
   materials for these arrive, they should be checked for alignment before
   launch. (Amelia's school materials are expected soon; the loop does not
   block on them.)
4. Chapters 10–15 are A&P II scope — out of BIOL 2401; no action needed.

## 2. Mystery reconciled: served dist showed "chapters 0/8, flashcards 0/40"

**Finding: not a data problem. It is zero recorded progress on a fresh profile.**

Evidence:
- `src/components/Sidebar.jsx:55,63` renders
  `{metrics.completedReadyChapters}/{metrics.totalReadyChapters}` and
  `{metrics.knownFlashcards}/{metrics.totalFlashcards}`.
- `src/App.jsx:136,338-348`: `totalReadyChapters = chapters.filter(c =>
  c.status === "ready").length` → **8** in current source;
  `totalFlashcards = chapterLinkedFlashcards.length` → **40**;
  `completedReadyChapters` / `knownFlashcards` derive from the browser's
  saved progress state, which is **0** on first load.
- Therefore a freshly served app (empty localStorage) legitimately shows
  `0/8` and `0/40`. The denominators match the source exactly; the numerators
  are progress, not missing content. **No stale-dist issue, no data loss.**

## 3. Secrets/credentials scan (P1)

Scanned `src/`, `public/`, `docs/`, root `*.md`/`*.js`/`*.json` for API keys,
tokens, passwords, and private keys. **Clean — no credentials found.**
Only false positives: the word "secrete" in a flashcard back ("They secrete
enzymes…"), the `js-tokens` npm package name in `package-lock.json`, and
policy mentions in `docs/BUILD-CONTRACT.md`. No `.env` files, no key-like
strings. (`node_modules/` excluded by convention.)

## 4. Data-consistency notes for later phases (not blockers)
- Chapter defs' `flashcardIds`/`quizIds` arrays link only a subset of the bank
  (e.g. chapter-6 def lists 5 quiz ids, bank holds 15). `QuizView` filters the
  bank directly by `chapterId`, so all bank questions are live in chapter
  quizzes — the def-level arrays are legacy/partial references. P3's unified
  quiz engine should pick one referencing scheme.
- Chapter 7 title differs by surface: `studyData.js` says "The Skeleton",
  `bonesLabChapter7.js` chapter label says "The Skeletal System". Cosmetic;
  unify in the UI pass.
- `bonesLabChapter7.js` credits its lecture export inline
  ("Chapter 7 Skeletal System lecture slide export") and credits
  Anatomography/BodyParts3D (CC BY-SA 2.1 JP) on the mapped views — keep those
  attributions in any public build.

## 5. P5 final status — content verification

- `npm run smoke` (2026-09-11, `scripts/smoke.mjs`): **PASSED** — 6,699 checks
  across all 8 packs against `pack-schema.md`. Totals: 8 packs, 37 bones,
  306 terms, 40 flashcards, 90 quiz items; ids unique globally; every chapter-7
  term boneId resolves to a pack bone; no authored hint reveals its graded term.
- One schema violation was found and fixed in P5: `src/data/bonesLabChapter7.js`
  line 923 gave `thoracic-vertebra` the hint "Thoracic vertebra with rib facets."
  (hint = the answer). Fixed at the source to "Mid-back vertebra — the one with
  facets for ribs.", `pack-bones-ch7.js` regenerated via
  `node scripts/generate-bones-pack.mjs`, and `node scripts/verify-packs.mjs`
  confirmed zero content loss (all checks passed).
- `npm run secrets-scan` (2026-09-11, `scripts/secrets-scan.mjs`): **PASSED** —
  53 text files scanned; no API keys, tokens, passwords, or private keys.
  (`node_modules/`, `dist/`, lockfiles, binaries, and copyrighted
  `source-material/` pptx binaries are excluded by design.)
- `npm run build` (2026-09-11): **PASSED** — Vite production build completes
  (large-chunk warning on the 3D bundle is cosmetic and expected).

## 6. Final NEED list — what Amelia still must supply

Nothing below blocks the current build; this is the definitive open list.

1. **Chapter 5 — Integumentary System** (the one BIOL 2401 content gap): a
   chapter 5 lecture packet (pptx or PDF) is needed to author the chapter
   summary, flashcards, quiz items, cram deck, and content pack.
2. **Chapters 8/9 extracted slide text** (nice-to-have): the pptx files are
   local, but re-running `extract_pptx.py` on them would restore the
   extracted-txt layer that exists for chapters 6/7 and make the build
   reproducible on any machine.
3. **Chapters 1–4 packets** (optional): app content for chapters 1–4 exists,
   but there is no local professor packet to verify it against. If Amelia's
   instructor materials for these arrive, check them for alignment.
