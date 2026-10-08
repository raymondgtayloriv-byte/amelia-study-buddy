/**
 * generate-biology-packs.mjs
 *
 * Emits src/data/packs/pack-biology-ch{1,2,3,4,6,8,9}.js from src/data/studyData.js.
 *
 * Zero-content-loss contract: flashcards, quiz items, and chapter metadata are
 * copied VERBATIM (same ids, same strings). Terms are the chapter vocabulary
 * lists (exact strings, definition intentionally null — definitions for these
 * chapters live in the flashcards/quiz explanations, and inventing them would
 * alter content).
 *
 * Run from the repo root:  node scripts/generate-biology-packs.mjs
 * Then run scripts/verify-packs.mjs to confirm before/after counts.
 */

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, "..")

const { chapters, flashcards, quizQuestionBank } = await import(
  path.join(repoRoot, "src/data/studyData.js")
)

const SYSTEM_BY_CHAPTER = {
  "chapter-1": "Anatomy foundations",
  "chapter-2": "Chemical level of organization",
  "chapter-3": "Cellular level of organization",
  "chapter-4": "Tissue level of organization",
  "chapter-6": "Skeletal system",
  "chapter-8": "Articular system",
  "chapter-9": "Muscular system",
}

const PACK_IDS = {
  "chapter-1": "pack-biology-ch1",
  "chapter-2": "pack-biology-ch2",
  "chapter-3": "pack-biology-ch3",
  "chapter-4": "pack-biology-ch4",
  "chapter-6": "pack-biology-ch6",
  "chapter-8": "pack-biology-ch8",
  "chapter-9": "pack-biology-ch9",
}

const EXPORT_NAMES = {
  "chapter-1": "packBiologyCh1",
  "chapter-2": "packBiologyCh2",
  "chapter-3": "packBiologyCh3",
  "chapter-4": "packBiologyCh4",
  "chapter-6": "packBiologyCh6",
  "chapter-8": "packBiologyCh8",
  "chapter-9": "packBiologyCh9",
}

const json = (value) => JSON.stringify(value, null, 2)

for (const chapterId of Object.keys(PACK_IDS)) {
  const chapter = chapters.find((c) => c.id === chapterId)
  if (!chapter) throw new Error(`chapter ${chapterId} not found`)
  const system = SYSTEM_BY_CHAPTER[chapterId]

  const pack = {
    id: PACK_IDS[chapterId],
    chapterId,
    title: `Chapter ${chapter.number} — ${chapter.title}`,
    system,
    chapter: {
      id: chapter.id,
      number: chapter.number,
      title: chapter.title,
      status: chapter.status,
    },
    bones: [],
    terms: (chapter.vocabulary ?? []).map((term, index) => ({
      id: `${chapterId}-vocab-${index + 1}`,
      term,
      definition: null,
      chapterId,
      chapter: chapterId,
      system,
      boneId: null,
      aliases: [],
      hint: null,
      note: null,
    })),
    flashcards: flashcards
      .filter((card) => card.chapterId === chapterId)
      .map((card) => ({
        id: card.id,
        chapterId: card.chapterId,
        category: card.category,
        front: card.front,
        back: card.back,
        note: card.note,
      })),
    quiz: quizQuestionBank
      .filter((question) => question.chapterId === chapterId)
      .map((question) => ({
        id: question.id,
        chapterId: question.chapterId,
        type: question.type,
        prompt: question.prompt,
        options: question.options,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
      })),
  }

  const file = `/**
 * ${PACK_IDS[chapterId]}.js — GENERATED FILE. Do not edit by hand.
 *
 * Generated from src/data/studyData.js by
 *   node scripts/generate-biology-packs.mjs
 * Content is copied verbatim (same ids, same strings); only the container
 * shape follows the unified pack format documented in
 * src/data/packs/pack-schema.md.
 */

export const ${EXPORT_NAMES[chapterId]} = ${json(pack)}
`

  const outPath = path.join(repoRoot, "src/data/packs", `${PACK_IDS[chapterId]}.js`)
  fs.writeFileSync(outPath, file)
  console.log(
    `wrote ${PACK_IDS[chapterId]} — terms:${pack.terms.length} flashcards:${pack.flashcards.length} quiz:${pack.quiz.length}`,
  )
}
