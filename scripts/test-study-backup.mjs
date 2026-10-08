import assert from "node:assert/strict"
import { createStudyBackup, MAX_STUDY_BACKUP_BYTES, parseStudyBackup, STUDY_BACKUP_FORMAT, summarizeStudyState, validateStudyState } from "../src/lib/studyBackup.js"

const validState = {
  uiVersion: 2,
  activeSection: "chapters",
  selectedChapterId: "chapter-1",
  importedChapters: [{
    id: "imported-basics-ch1", number: 1, title: "Imported Basics", status: "ready",
    sourceType: "supplemental", sourceLabel: "notes.json", summary: "Short overview.", detailSummary: "Imported notes.", notes: "Preserve all notes.",
    vocabulary: [], mustKnow: [], commonConfusions: [], reviewQuestions: [], flashcardIds: ["imported-basics-ch1::card-a"], quizIds: ["imported-basics-ch1::question-a"],
    flashcards: [{ id: "imported-basics-ch1::card-a", chapterId: "imported-basics-ch1", front: "Cue", back: "Answer" }],
    questions: [{ id: "imported-basics-ch1::question-a", chapterId: "imported-basics-ch1", prompt: "Question?", options: ["Yes", "No"], correctAnswer: "Yes" }],
  }],
  practiceProgress: { "recognition-chapter-1": { percent: 80, correctCount: 4, totalQuestions: 5, attempts: 2, bestPercent: 90, misses: [{ questionId: "q1", prompt: "Prompt", correctAnswer: "Saved answer", response: "Wrong answer", correct: false }] } },
  chapterProgress: { "chapter-1": { completed: true } }, flashcardProgress: {}, quizHistory: {},
  anatomyProgress: { recall: {}, quizHistory: {}, typedHistory: {}, weakSpots: {} },
  atlasNotebook: {
    bookmarks: [{ id: "femur-id", name: "Femur", elements: ["femur-id"], system: "Skeletal system" }],
    notes: { "femur-id": "Review the proximal end" },
    results: [{ id: "challenge-id", name: "Femur", mode: "recall", correct: true, response: "Femur", at: "2026-10-08T12:00:00.000Z" }],
  },
}

const envelope = createStudyBackup(validState)
assert.equal(envelope.format, STUDY_BACKUP_FORMAT)
assert.equal(envelope.version, 1)
assert.deepEqual(parseStudyBackup(JSON.stringify(envelope)), validState)
assert.equal(summarizeStudyState(validState).importedChapters, 1)
assert.equal(summarizeStudyState(validState).bookmarks, 1)
assert.equal(summarizeStudyState(validState).notes, 1)
assert.ok(summarizeStudyState(validState).progressEntries > 0)
assert.deepEqual(validateStudyState(validState), [])
const longNotesState = structuredClone(validState)
longNotesState.importedChapters[0].detailSummary = "Long imported notes. ".repeat(8_000)
assert.equal(parseStudyBackup(JSON.stringify(createStudyBackup(longNotesState))).importedChapters[0].detailSummary.length, longNotesState.importedChapters[0].detailSummary.length)

const bad = (value) => assert.throws(() => parseStudyBackup(JSON.stringify(value)))
bad({ ...envelope, version: 2 })
bad({ ...envelope, version: 0 })
bad({ ...envelope, format: "another-app" })
bad({ ...envelope, studyState: { ...validState, importedChapters: {} } })
bad({ ...envelope, studyState: { ...validState, importedChapters: [{ ...validState.importedChapters[0], sourceType: "unknown" }] } })
bad({ ...envelope, studyState: { ...validState, importedChapters: [{ ...validState.importedChapters[0], flashcards: [{ id: "bad", front: "Missing answer" }] }] } })
bad({ ...envelope, studyState: { ...validState, practiceProgress: [] } })
bad({ ...envelope, studyState: { ...validState, flashcardProgress: { card: "unknown" } } })
bad({ ...envelope, studyState: { ...validState, chapterProgress: { chapter: true } } })
bad({ ...envelope, studyState: { ...validState, atlasNotebook: { ...validState.atlasNotebook, bookmarks: [{ id: "bad" }] } } })
bad({ ...envelope, studyState: { ...validState, atlasNotebook: { ...validState.atlasNotebook, notes: { femur: { unsupported: true } } } } })
bad({ ...envelope, studyState: { ...validState, atlasNotebook: { ...validState.atlasNotebook, results: [{ ...validState.atlasNotebook.results[0], mode: "other" }] } } })
bad({ ...envelope, studyState: { ...validState, atlasNotebook: { ...validState.atlasNotebook, results: [{ ...validState.atlasNotebook.results[0], response: { html: "invalid" } }] } } })
bad({ ...envelope, studyState: { ...validState, practiceProgress: { run: { attempts: "many" } } } })
bad({ ...envelope, studyState: { ...validState, practiceProgress: { run: { ...validState.practiceProgress["recognition-chapter-1"], misses: [{ questionId: "q", prompt: "Prompt", correctAnswer: "Answer", response: "oops", correct: true }] } } } })
assert.throws(() => parseStudyBackup(JSON.stringify({ ...envelope, studyState: { ...validState, unsafe: { constructor: { polluted: true } } } })), /Unsafe property/)
assert.throws(() => parseStudyBackup(JSON.stringify({ ...envelope, studyState: { ...validState, unsafe: { prototype: {} } } })), /Unsafe property/)
let overDeep = {}
for (let index = 0; index < 80; index += 1) overDeep = { nested: overDeep }
assert.throws(() => parseStudyBackup(JSON.stringify({ ...envelope, studyState: { ...validState, unsafe: overDeep } })), /nested too deeply/)
assert.throws(() => parseStudyBackup("{"), /valid JSON/)
assert.throws(() => parseStudyBackup(" ".repeat(MAX_STUDY_BACKUP_BYTES + 1)), /smaller than 5 MB/)
assert.throws(() => createStudyBackup({ ...validState, uiVersion: 99 }), /supported app data version/)

console.log("Study backup helpers passed.")
