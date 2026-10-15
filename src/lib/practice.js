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

export function getMultiChapterMaterials({
  chapterIds = [],
  chapters = [],
  flashcards = [],
  questions = [],
  source = "all",
}) {
  const targetChapters =
    chapterIds.length > 0
      ? chapters.filter((ch) => chapterIds.includes(ch.id))
      : chapters
  const allCards = []
  const allQuestions = []

  for (const ch of targetChapters) {
    const mat = getChapterMaterials({ chapter: ch, chapters, flashcards, questions })
    const chSource = ch.sourceType === "supplemental" ? "supplemental" : "course"
    for (const card of mat.flashcards) {
      const itemSource = card.sourceType === "supplemental" ? "supplemental" : chSource
      if (source === "all" || itemSource === source) {
        allCards.push({
          ...card,
          chapterId: ch.id,
          chapterNumber: ch.number,
          chapterTitle: ch.title,
          sourceType: itemSource,
        })
      }
    }
    for (const q of mat.questions) {
      const itemSource = q.sourceType === "supplemental" ? "supplemental" : chSource
      if (source === "all" || itemSource === source) {
        allQuestions.push({
          ...q,
          chapterId: ch.id,
          chapterNumber: ch.number,
          chapterTitle: ch.title,
          sourceType: itemSource,
        })
      }
    }
  }

  const unique = (items) => [...new Map(items.filter((item) => item?.id).map((item) => [item.id, item])).values()]
  return {
    chapters: targetChapters,
    flashcards: unique(allCards),
    questions: unique(allQuestions),
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

export function computeLetterGrade(percent) {
  if (percent == null || Number.isNaN(Number(percent))) {
    return { letter: "—", label: "No graded rounds yet", tone: "neutral" }
  }
  const p = Math.round(Number(percent))
  if (p >= 97) return { letter: "A+", label: "Exam ready", tone: "emerald" }
  if (p >= 93) return { letter: "A", label: "Exam ready", tone: "emerald" }
  if (p >= 90) return { letter: "A-", label: "Exam ready", tone: "emerald" }
  if (p >= 87) return { letter: "B+", label: "Solid footing", tone: "teal" }
  if (p >= 83) return { letter: "B", label: "Solid footing", tone: "teal" }
  if (p >= 80) return { letter: "B-", label: "Solid footing", tone: "teal" }
  if (p >= 77) return { letter: "C+", label: "Needs review", tone: "amber" }
  if (p >= 73) return { letter: "C", label: "Needs review", tone: "amber" }
  if (p >= 70) return { letter: "C-", label: "Needs review", tone: "amber" }
  if (p >= 60) return { letter: "D", label: "Priority focus", tone: "rose" }
  return { letter: "F", label: "Priority focus", tone: "rose" }
}

export function computeGradeSummary({
  chapters = [],
  practiceProgress = {},
  quizHistory = {},
}) {
  const practiceEntries = Object.entries(practiceProgress ?? {})
  const quizEntries = Object.entries(quizHistory ?? {})

  const allScores = []
  for (const [, entry] of practiceEntries) {
    const score = entry?.lastPercent ?? entry?.percent ?? entry?.bestPercent
    if (typeof score === "number" && Number.isFinite(score)) {
      allScores.push(score)
    }
  }
  for (const [, entry] of quizEntries) {
    const score = entry?.lastPercent ?? entry?.bestPercent
    if (typeof score === "number" && Number.isFinite(score)) {
      allScores.push(score)
    }
  }

  const overallPercent = allScores.length
    ? Math.round(allScores.reduce((sum, val) => sum + val, 0) / allScores.length)
    : null
  const overallGrade = computeLetterGrade(overallPercent)

  // Collect missed questions across all practiceProgress entries
  const weakSpotMap = new Map()
  for (const [key, entry] of practiceEntries) {
    const chId = entry?.chapterId ?? key.replace(/^(recognition|retrieval|exam|blitz)-/, "")
    for (const miss of entry?.misses ?? []) {
      if (!miss?.questionId) continue
      const existing = weakSpotMap.get(miss.questionId)
      weakSpotMap.set(miss.questionId, {
        questionId: miss.questionId,
        prompt: miss.prompt,
        correctAnswer: miss.correctAnswer,
        lastResponse: miss.response,
        chapterId: chId,
        missCount: (existing?.missCount ?? 0) + 1,
      })
    }
  }

  const weakSpots = [...weakSpotMap.values()].sort((a, b) => b.missCount - a.missCount)

  const chapterBreakdown = chapters.map((chapter) => {
    const chPractice = practiceEntries
      .filter(([key, val]) => val?.chapterId === chapter.id || key.endsWith(`-${chapter.id}`))
      .map(([, val]) => val)
    const chQuizzes = quizEntries
      .filter(([key, val]) => val?.chapterId === chapter.id || key === chapter.id)
      .map(([, val]) => val)

    const percents = [
      ...chPractice.map((e) => e?.bestPercent ?? e?.percent).filter((n) => typeof n === "number"),
      ...chQuizzes.map((e) => e?.bestPercent ?? e?.lastPercent).filter((n) => typeof n === "number"),
    ]
    const attempts =
      chPractice.reduce((s, e) => s + (e?.attempts ?? 1), 0) +
      chQuizzes.reduce((s, e) => s + (e?.attempts ?? 1), 0)
    const avgPercent = percents.length
      ? Math.round(percents.reduce((s, n) => s + n, 0) / percents.length)
      : null
    const missedInChapter = weakSpots.filter((w) => w.chapterId === chapter.id).length
    const grade = computeLetterGrade(avgPercent)

    return {
      chapterId: chapter.id,
      number: chapter.number,
      title: chapter.title,
      sourceType: chapter.sourceType ?? "course",
      isPreviewPack: Boolean(chapter.isPreviewPack),
      percent: avgPercent,
      letter: grade.letter,
      tone: grade.tone,
      attempts,
      missedCount: missedInChapter,
      needsWork: (avgPercent !== null && avgPercent < 80) || missedInChapter > 0,
    }
  })

  return {
    overallPercent,
    letterGrade: overallGrade.letter,
    gradeLabel: overallGrade.label,
    gradeTone: overallGrade.tone,
    totalAttempts:
      practiceEntries.reduce((s, [, e]) => s + (e?.attempts ?? 1), 0) +
      quizEntries.reduce((s, [, e]) => s + (e?.attempts ?? 1), 0),
    weakSpots,
    chapterBreakdown,
    chaptersNeedingWork: chapterBreakdown.filter((ch) => ch.needsWork),
  }
}

const CHAPTER_SYSTEM_HINTS = {
  "chapter-1": { system: "skeletal", label: "Anatomical Planes & Body Cavities" },
  "chapter-2": { system: "digestive", label: "Molecular & Biochemical Foundations" },
  "chapter-3": { system: "nervous", label: "Cellular Organelles & Plasma Membrane" },
  "chapter-4": { system: "muscular", label: "Epithelial, Connective, Muscle & Nervous Tissues" },
  "chapter-5": { system: "muscular", label: "Integumentary System & Cutaneous Membranes" },
  "chapter-6": { system: "skeletal", label: "Osseous Tissue, Osteons & Bone Remodeling" },
  "chapter-7": { system: "skeletal", label: "Axial & Appendicular Skeleton Landmarks" },
  "chapter-8": { system: "skeletal", label: "Synovial, Fibrous & Cartilaginous Articulations" },
  "chapter-9": { system: "muscular", label: "Sarcomere Sliding Filament & Neuromuscular Junction" },
  "chapter-10": { system: "muscular", label: "Skeletal Muscle Actions, Fascicles & Levers" },
  "chapter-11": { system: "nervous", label: "Neurons, Synapses & Action Potentials" },
  "chapter-12": { system: "nervous", label: "Brain Regions, Ventricles & Spinal Cord Tracts" },
  "chapter-13": { system: "nervous", label: "Cranial Nerves, Plexuses & Reflex Arcs" },
  "chapter-14": { system: "nervous", label: "Sympathetic vs. Parasympathetic Autonomic Division" },
  "chapter-15": { system: "nervous", label: "Special Senses: Eye, Retina, Cochlea & Equilibrium" },
}

export function buildStudyBlitzSteps({
  chapterIds = [],
  chapters = [],
  flashcards = [],
  questions = [],
  visualsByChapter = {},
  source = "all",
  stepCount = 10,
  onlyQuestionIds = null,
}) {
  const multi = getMultiChapterMaterials({
    chapterIds,
    chapters,
    flashcards,
    questions,
    source,
  })

  const questionPool = shuffleItems(
    onlyQuestionIds && onlyQuestionIds.size > 0
      ? multi.questions.filter((q) => onlyQuestionIds.has(q.id))
      : multi.questions,
  )
  const cardPool = shuffleItems(multi.flashcards)

  if (!questionPool.length && !cardPool.length) {
    return []
  }

  const allAnswerChoices = [
    ...new Set([
      ...multi.questions.map((q) => q.correctAnswer),
      ...multi.flashcards.map((c) => c.back),
    ].filter(Boolean)),
  ]

  const makeChoices = (correct, existingOptions = []) => {
    if (Array.isArray(existingOptions) && existingOptions.length >= 2) {
      return shuffleItems(existingOptions)
    }
    const distractors = shuffleItems(
      allAnswerChoices.filter((ans) => normalizeAnswer(ans) !== normalizeAnswer(correct)),
    ).slice(0, 3)
    return shuffleItems([correct, ...distractors])
  }

  const steps = []
  const totalSteps = Math.min(
    stepCount,
    Math.max(questionPool.length + Math.floor(cardPool.length / 3), 1),
  )

  let qIdx = 0
  let cIdx = 0

  const stepModes = ["visual-figure", "body-system", "rapid-tf", "mini-match", "clue-recall"]

  for (let i = 0; i < totalSteps; i += 1) {
    const preferredMode = onlyQuestionIds?.size
      ? "clue-recall"
      : stepModes[i % stepModes.length]

    // 1. Mini-Match step (uses 3 flashcards if available)
    if (preferredMode === "mini-match" && cIdx + 3 <= cardPool.length) {
      const trio = cardPool.slice(cIdx, cIdx + 3)
      cIdx += 3
      const primaryCard = trio[0]
      steps.push({
        id: `blitz-match-${i}-${primaryCard.id}`,
        questionId: primaryCard.id,
        stepType: "mini-match",
        badge: "Speed Match · 3 Pairs",
        chapterId: primaryCard.chapterId,
        chapterNumber: primaryCard.chapterNumber,
        chapterTitle: primaryCard.chapterTitle,
        sourceType: primaryCard.sourceType,
        prompt: `Connect all 3 ${primaryCard.chapterTitle ? `Ch. ${primaryCard.chapterNumber}` : "A&P"} pairs as fast as you can`,
        correctAnswer: `${primaryCard.front} → ${primaryCard.back}`,
        pairs: trio.map((card) => ({
          pairId: card.id,
          front: card.front,
          back: card.back,
        })),
      })
      continue
    }

    const q = questionPool[qIdx % Math.max(1, questionPool.length)]
    qIdx += 1

    if (!q) {
      // Fallback to flashcard clue-recall if no questions exist
      const card = cardPool[cIdx % cardPool.length]
      cIdx += 1
      if (!card) break
      steps.push({
        id: `blitz-card-${i}-${card.id}`,
        questionId: card.id,
        stepType: "clue-recall",
        badge: "Flashcard Recall",
        chapterId: card.chapterId,
        chapterNumber: card.chapterNumber,
        chapterTitle: card.chapterTitle,
        sourceType: card.sourceType,
        prompt: card.front,
        correctAnswer: card.back,
        choices: makeChoices(card.back),
        explanation: card.note || `From Chapter ${card.chapterNumber}: ${card.chapterTitle}`,
      })
      continue
    }

    const chVisuals = visualsByChapter[q.chapterId] ?? []
    const isTrueFalse =
      q.type === "true-false" ||
      (Array.isArray(q.options) &&
        q.options.length === 2 &&
        q.options.some((o) => /^true$/i.test(o)))

    if (isTrueFalse || (preferredMode === "rapid-tf" && q.options?.length === 2)) {
      steps.push({
        id: `blitz-tf-${i}-${q.id}`,
        questionId: q.id,
        stepType: "rapid-tf",
        badge: "Lightning True / False",
        chapterId: q.chapterId,
        chapterNumber: q.chapterNumber,
        chapterTitle: q.chapterTitle,
        sourceType: q.sourceType,
        prompt: q.prompt,
        correctAnswer: q.correctAnswer,
        choices: q.options?.length ? q.options : ["True", "False"],
        explanation: q.explanation,
      })
    } else if (preferredMode === "visual-figure" && chVisuals.length > 0) {
      const fig = chVisuals[i % chVisuals.length]
      steps.push({
        id: `blitz-fig-${i}-${q.id}`,
        questionId: q.id,
        stepType: "visual-figure",
        badge: fig.source === "course" ? "Course Figure Check" : "Concept Diagram Check",
        chapterId: q.chapterId,
        chapterNumber: q.chapterNumber,
        chapterTitle: q.chapterTitle,
        sourceType: q.sourceType,
        figure: fig,
        prompt: q.prompt,
        correctAnswer: q.correctAnswer,
        choices: makeChoices(q.correctAnswer, q.options),
        explanation: q.explanation,
      })
    } else if (preferredMode === "body-system") {
      const sysMeta = CHAPTER_SYSTEM_HINTS[q.chapterId] ?? {
        system: "skeletal",
        label: "3D Human Atlas System",
      }
      const fig = chVisuals.length > 0 ? chVisuals[(i + 1) % chVisuals.length] : null
      steps.push({
        id: `blitz-sys-${i}-${q.id}`,
        questionId: q.id,
        stepType: "body-system",
        badge: `3D System Target · ${sysMeta.system.toUpperCase()}`,
        chapterId: q.chapterId,
        chapterNumber: q.chapterNumber,
        chapterTitle: q.chapterTitle,
        sourceType: q.sourceType,
        atlasSystem: sysMeta.system,
        atlasLabel: sysMeta.label,
        figure: fig,
        prompt: q.prompt,
        correctAnswer: q.correctAnswer,
        choices: makeChoices(q.correctAnswer, q.options),
        explanation: q.explanation,
      })
    } else {
      steps.push({
        id: `blitz-q-${i}-${q.id}`,
        questionId: q.id,
        stepType: "clue-recall",
        badge: "Concept Check",
        chapterId: q.chapterId,
        chapterNumber: q.chapterNumber,
        chapterTitle: q.chapterTitle,
        sourceType: q.sourceType,
        prompt: q.prompt,
        correctAnswer: q.correctAnswer,
        choices: makeChoices(q.correctAnswer, q.options),
        explanation: q.explanation,
      })
    }
  }

  return steps
}
