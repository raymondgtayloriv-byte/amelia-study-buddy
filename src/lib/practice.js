export const PRACTICE_TIERS = [
  { id: "recognition", label: "Guided recognition", detail: "Choose an answer and get feedback after each question." },
  { id: "retrieval", label: "Retrieval practice", detail: "Recall each saved answer. Case, punctuation, and spacing are ignored; wording must match." },
  { id: "exam", label: "Exam rehearsal", detail: "Work through a set without hints. Answers and explanations appear in the review." },
]

export function normalizeAnswer(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .toLocaleLowerCase()
    .replace(/[\p{P}\p{S}]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
}

export function isAnswerCorrect(response, correctAnswer, aliases = []) {
  const normalized = normalizeAnswer(response)
  if (!normalized) return false
  return [correctAnswer, ...aliases].some((answer) => normalizeAnswer(answer) === normalized)
}

export function shuffleItems(items, random = Math.random) {
  const shuffled = [...items]
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function getQuestionAliases(question) {
  const aliases = question?.acceptedAnswers ?? question?.aliases ?? []
  return Array.isArray(aliases) ? aliases.filter((value) => typeof value === "string") : []
}

export function getChapterMaterials({ chapter, chapters = [], flashcards = [], questions = [] }) {
  const chapterData = chapters.find((item) => item.id === chapter?.id) ?? chapter ?? {}
  const cardIds = new Set(chapterData.flashcardIds ?? [])
  const questionIds = new Set(chapterData.quizIds ?? [])
  const chapterCards = [
    ...flashcards.filter((card) => card.chapterId === chapterData.id || cardIds.has(card.id)),
    ...(chapterData.flashcards ?? []),
  ]
  const chapterQuestions = [
    ...questions.filter((question) => question.chapterId === chapterData.id || questionIds.has(question.id)),
    ...(chapterData.questions ?? []),
  ]
  const unique = (items) => [...new Map(items.filter((item) => item?.id).map((item) => [item.id, item])).values()]
  return {
    chapter: chapterData,
    flashcards: unique(chapterCards).filter((card) => card.front && card.back),
    questions: unique(chapterQuestions).filter((question) => question.prompt && question.correctAnswer),
  }
}

export function sourceName(item) {
  return item?.sourceType === "supplemental" ? "Supplemental" : "Course material"
}

export function scoreAttempt(answers) {
  const correctCount = answers.filter((answer) => answer.correct).length
  const totalQuestions = answers.length
  return {
    correctCount,
    totalQuestions,
    percent: totalQuestions ? Math.round((correctCount / totalQuestions) * 100) : null,
    misses: answers.filter((answer) => !answer.correct),
  }
}

export function getPracticeResultKey(tier, chapterId) {
  return `${tier}-${chapterId}`
}

export function getNextTierRecommendation(progress, chapterId) {
  const recognition = progress?.[getPracticeResultKey("recognition", chapterId)]
  const retrieval = progress?.[getPracticeResultKey("retrieval", chapterId)]
  const achieved = (result) => Math.max(result?.bestPercent ?? 0, result?.percent ?? 0) >= 80
  if (achieved(retrieval)) return "exam"
  return achieved(recognition) ? "retrieval" : "recognition"
}
