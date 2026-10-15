import assert from "node:assert/strict"
import { chapters as baseChapters } from "../src/data/studyData.js"
import {
  CHAPTER_ATLAS_SYSTEM,
  supplementalChapters,
  supplementalFlashcards,
  supplementalQuestions,
  VOCABULARY_DEFINITIONS,
} from "../src/data/supplementalChapters.js"

const expectedNumbers = [5, 10, 11, 12, 13, 14, 15]
assert.deepEqual(
  supplementalChapters.map((c) => c.number),
  expectedNumbers,
  "supplemental preview packs must cover Chapters 5 and 10–15",
)

for (const ch of supplementalChapters) {
  assert.equal(ch.status, "ready", `${ch.id} must be ready`)
  assert.equal(ch.sourceType, "supplemental", `${ch.id} must be marked supplemental`)
  assert.equal(ch.isPreviewPack, true, `${ch.id} must be flagged as a preview pack`)
  assert.equal(ch.vocabulary.length, 10, `${ch.id} must have 10 vocabulary terms`)
  assert.equal(ch.mustKnow.length, 5, `${ch.id} must have 5 must-know takeaways`)
  assert.equal(ch.commonConfusions.length, 3, `${ch.id} must have 3 common confusions`)
  assert.equal(ch.reviewQuestions.length, 4, `${ch.id} must have 4 review questions`)
  const cards = supplementalFlashcards.filter((fc) => fc.chapterId === ch.id)
  const questions = supplementalQuestions.filter((q) => q.chapterId === ch.id)
  assert.equal(cards.length, 6, `${ch.id} must have 6 flashcards`)
  assert.equal(questions.length, 6, `${ch.id} must have 6 quiz questions`)
  for (const q of questions) {
    assert.ok(q.options.includes(q.correctAnswer), `${q.id} correctAnswer must be in options`)
    assert.ok(q.explanation && q.explanation.length > 10, `${q.id} must include an explanation`)
  }
}

// Verify all 15 chapters have a valid 3D Atlas system mapping and defined vocabulary terms
const allMerged = baseChapters.map((ch) =>
  ch.status === "ready" ? ch : supplementalChapters.find((s) => s.number === ch.number),
)
assert.equal(allMerged.length, 15, "all 15 chapters must resolve")
assert.ok(allMerged.every((ch) => ch && ch.status === "ready"), "all 15 chapters must be studyable")
for (const ch of allMerged) {
  assert.ok(CHAPTER_ATLAS_SYSTEM[ch.id], `${ch.id} must map to a 3D Atlas organ system`)
  for (const term of ch.vocabulary ?? []) {
    const def = VOCABULARY_DEFINITIONS[term.toLowerCase()] ?? VOCABULARY_DEFINITIONS[term]
    assert.ok(def && def.length > 15, `missing definition for term "${term}" in ${ch.id}`)
  }
}

console.log(
  `Supplemental chapters verified: ${supplementalChapters.length} preview chapters, ${supplementalFlashcards.length} flashcards, ${supplementalQuestions.length} quiz questions, ${Object.keys(VOCABULARY_DEFINITIONS).length} defined terms across all 15 chapters.`,
)
