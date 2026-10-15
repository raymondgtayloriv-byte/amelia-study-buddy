import assert from "node:assert/strict"
import {
  buildStudyBlitzSteps,
  computeGradeSummary,
  computeLetterGrade,
  getChapterMaterials,
  getMultiChapterMaterials,
  getNextTierRecommendation,
  getPracticeResultKey,
  isAnswerCorrect,
  normalizeAnswer,
  scoreAttempt,
  shuffleItems,
} from "../src/lib/practice.js"

assert.equal(normalizeAnswer("  Homeostasis!!!  "), "homeostasis")
assert.equal(isAnswerCorrect("  left   and right portions ", "Left and right portions of the body."), false)
assert.equal(isAnswerCorrect("oxygen", "O₂", ["oxygen"]), true)
assert.equal(isAnswerCorrect("  LEFT, and   RIGHT portions! ", "left and right portions"), true)
assert.equal(isAnswerCorrect("left and right", "left and right portions"), false)
assert.equal(isAnswerCorrect("a plausible but unsupported answer", "Actual answer"), false)
assert.equal(isAnswerCorrect("", "Actual answer", ["other"]), false)

const cards = [
  { id: "flat-card", chapterId: "ch1", front: "Prompt", back: "Answer", sourceType: "course" },
  { id: "ch2-card-1", chapterId: "ch2", front: "Term 1", back: "Def 1", sourceType: "supplemental" },
  { id: "ch2-card-2", chapterId: "ch2", front: "Term 2", back: "Def 2", sourceType: "supplemental" },
  { id: "ch2-card-3", chapterId: "ch2", front: "Term 3", back: "Def 3", sourceType: "supplemental" },
]
const questions = [
  { id: "flat-q", chapterId: "ch1", prompt: "Question", correctAnswer: "Answer", options: ["Answer", "Other"], sourceType: "course" },
  { id: "ch2-q", chapterId: "ch2", prompt: "Suppl Question", correctAnswer: "Suppl Answer", options: ["True", "False"], type: "true-false", sourceType: "supplemental" },
]
const chapter = {
  id: "ch1",
  number: 1,
  title: "Intro",
  sourceType: "course",
  flashcardIds: ["flat-card"],
  quizIds: ["flat-q"],
  flashcards: [{ id: "nested-card", front: "Nested prompt", back: "Nested answer" }],
  questions: [{ id: "nested-q", prompt: "Nested question", correctAnswer: "Nested answer" }],
}
const chapter2 = {
  id: "ch2",
  number: 2,
  title: "Supplemental Ch",
  sourceType: "supplemental",
  flashcardIds: ["ch2-card-1", "ch2-card-2", "ch2-card-3"],
  quizIds: ["ch2-q"],
}

const material = getChapterMaterials({ chapter, flashcards: cards, questions })
assert.deepEqual(material.flashcards.map((item) => item.id).sort(), ["flat-card", "nested-card"])
assert.deepEqual(material.questions.map((item) => item.id).sort(), ["flat-q", "nested-q"])

// Multi-chapter material aggregation + source filtering
const courseOnlyMulti = getMultiChapterMaterials({
  chapterIds: ["ch1", "ch2"],
  chapters: [chapter, chapter2],
  flashcards: cards,
  questions,
  source: "course",
})
assert.equal(courseOnlyMulti.questions.every((q) => q.sourceType === "course"), true)
assert.equal(courseOnlyMulti.flashcards.every((c) => c.sourceType === "course"), true)

const combinedMulti = getMultiChapterMaterials({
  chapterIds: ["ch1", "ch2"],
  chapters: [chapter, chapter2],
  flashcards: cards,
  questions,
  source: "all",
})
assert.equal(combinedMulti.questions.length, 3)
assert.equal(combinedMulti.flashcards.length, 5)

// Study Blitz generator
const blitzSteps = buildStudyBlitzSteps({
  chapterIds: ["ch1", "ch2"],
  chapters: [chapter, chapter2],
  flashcards: cards,
  questions,
  visualsByChapter: {
    ch1: [{ id: "fig-1", title: "Planes", src: "/anatomy/concepts/ch1.svg", badge: "Diagram", source: "course" }],
  },
  source: "all",
  stepCount: 4,
})
assert.equal(blitzSteps.length, 4)

// Grade & Weak-Spot computation
assert.equal(computeLetterGrade(95).letter, "A")
assert.equal(computeLetterGrade(85).letter, "B")
assert.equal(computeLetterGrade(null).letter, "—")

const gradeSummary = computeGradeSummary({
  chapters: [chapter, chapter2],
  practiceProgress: {
    "recognition-ch1": {
      chapterId: "ch1",
      percent: 80,
      bestPercent: 90,
      attempts: 2,
      misses: [
        {
          questionId: "flat-q",
          prompt: "Question",
          correctAnswer: "Answer",
          response: "Wrong",
          correct: false,
        },
      ],
    },
  },
  quizHistory: {
    ch1: { chapterId: "ch1", bestPercent: 100, lastPercent: 100, attempts: 1 },
  },
})
assert.equal(gradeSummary.overallPercent, 90)
assert.equal(gradeSummary.letterGrade, "A-")
assert.equal(gradeSummary.weakSpots.length, 1)
assert.equal(gradeSummary.weakSpots[0].questionId, "flat-q")

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

console.log("Practice helpers, multi-chapter, Blitz, and Gradebook tests passed.")
