import assert from "node:assert/strict"
import { resetProgressState } from "../src/lib/resetProgress.js"

const source = {
  activeSection: "sync",
  selectedChapterId: "chapter-8",
  theme: "dark",
  importedChapters: [{ id: "imported-neuro", number: 8, title: "Neuro" }],
  chapterProgress: { "chapter-8": { completed: true, confidence: 4 } },
  flashcardProgress: { "card-8": "known" },
  quizHistory: { chapter: { bestPercent: 90 } },
  engineQuizHistory: { engine: [{ score: 3 }] },
  practiceProgress: { match: { rounds: 4 } },
  anatomyProgress: {
    recall: { femur: "known" },
    quizHistory: { bones: [{ score: 2 }] },
    typedHistory: { femur: { misses: 1 } },
    weakSpots: { femur: { misses: 2 } },
    displayPreference: "compact",
  },
  atlasNotebook: {
    bookmarks: ["femur"],
    notes: { femur: "review" },
    results: [{ score: 7 }],
    layout: "left",
  },
}
const originalSnapshot = structuredClone(source)

const reset = resetProgressState(source)

assert.deepEqual(source, originalSnapshot, "reset must not mutate its input")
assert.equal(reset.activeSection, "sync", "reset keeps the panel mounted for undo")
assert.equal(reset.selectedChapterId, "chapter-8")
assert.equal(reset.theme, "dark")
assert.deepEqual(reset.importedChapters, source.importedChapters)
assert.deepEqual(reset.chapterProgress, {})
assert.deepEqual(reset.flashcardProgress, {})
assert.deepEqual(reset.quizHistory, {})
assert.deepEqual(reset.engineQuizHistory, {})
assert.deepEqual(reset.practiceProgress, {})
assert.deepEqual(reset.anatomyProgress, {
  recall: {}, quizHistory: {}, typedHistory: {}, weakSpots: {}, displayPreference: "compact",
})
assert.deepEqual(reset.atlasNotebook, {
  bookmarks: [], notes: {}, results: [], layout: "left",
})

const sparseReset = resetProgressState({ importedChapters: [{ id: "one" }] })
assert.equal(sparseReset.activeSection, "sync")
assert.deepEqual(sparseReset.anatomyProgress, { recall: {}, quizHistory: {}, typedHistory: {}, weakSpots: {} })
assert.deepEqual(sparseReset.atlasNotebook, { bookmarks: [], notes: {}, results: [] })

console.log("Reset progress state checks passed.")
