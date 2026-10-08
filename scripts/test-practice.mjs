import assert from "node:assert/strict"
import { getChapterMaterials, getNextTierRecommendation, getPracticeResultKey, isAnswerCorrect, normalizeAnswer, scoreAttempt, shuffleItems } from "../src/lib/practice.js"

assert.equal(normalizeAnswer("  Homeostasis!!!  "), "homeostasis")
assert.equal(isAnswerCorrect("  left   and right portions ", "Left and right portions of the body."), false)
assert.equal(isAnswerCorrect("oxygen", "O₂", ["oxygen"]), true)
assert.equal(isAnswerCorrect("  LEFT, and   RIGHT portions! ", "left and right portions"), true)
assert.equal(isAnswerCorrect("left and right", "left and right portions"), false)
assert.equal(isAnswerCorrect("a plausible but unsupported answer", "Actual answer"), false)
assert.equal(isAnswerCorrect("", "Actual answer", ["other"]), false)

const cards = [{ id: "flat-card", chapterId: "ch1", front: "Prompt", back: "Answer" }]
const questions = [{ id: "flat-q", chapterId: "ch1", prompt: "Question", correctAnswer: "Answer" }]
const chapter = {
  id: "ch1", flashcardIds: ["flat-card"], quizIds: ["flat-q"],
  flashcards: [{ id: "nested-card", front: "Nested prompt", back: "Nested answer" }],
  questions: [{ id: "nested-q", prompt: "Nested question", correctAnswer: "Nested answer" }],
}
const material = getChapterMaterials({ chapter, flashcards: cards, questions })
assert.deepEqual(material.flashcards.map((item) => item.id).sort(), ["flat-card", "nested-card"])
assert.deepEqual(material.questions.map((item) => item.id).sort(), ["flat-q", "nested-q"])

const result = scoreAttempt([{ correct: true }, { correct: false }, { correct: true }])
assert.equal(result.correctCount, 2)
assert.equal(result.totalQuestions, 3)
assert.equal(result.percent, 67)
assert.equal(result.misses.length, 1)
assert.equal(scoreAttempt([]).percent, null)
assert.equal(getNextTierRecommendation({}, "ch1"), "recognition")
assert.equal(getPracticeResultKey("recognition", "ch1"), "recognition-ch1")
assert.equal(getNextTierRecommendation({ "recognition-ch1": { bestPercent: 80 } }, "ch1"), "retrieval")
assert.equal(getNextTierRecommendation({ "retrieval-ch1": { percent: 80 } }, "ch1"), "exam")
assert.equal(getNextTierRecommendation({ "recognition-ch1": { percent: 79 }, "retrieval-ch1": { bestPercent: 100 } }, "ch1"), "exam")
assert.deepEqual(shuffleItems([1, 2, 3], () => 0), [2, 3, 1])

console.log("Practice helpers passed.")
