export function shuffle(items) {
  const cloned = [...items]

  for (let index = cloned.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[cloned[index], cloned[randomIndex]] = [cloned[randomIndex], cloned[index]]
  }

  return cloned
}

export function normalizeAnswer(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()
}

function levenshteinDistance(source, target) {
  const rows = source.length + 1
  const cols = target.length + 1
  const table = Array.from({ length: rows }, () => Array(cols).fill(0))

  for (let row = 0; row < rows; row += 1) {
    table[row][0] = row
  }

  for (let col = 0; col < cols; col += 1) {
    table[0][col] = col
  }

  for (let row = 1; row < rows; row += 1) {
    for (let col = 1; col < cols; col += 1) {
      const cost = source[row - 1] === target[col - 1] ? 0 : 1

      table[row][col] = Math.min(
        table[row - 1][col] + 1,
        table[row][col - 1] + 1,
        table[row - 1][col - 1] + cost,
      )
    }
  }

  return table[source.length][target.length]
}

export function getAcceptedTerms(structure) {
  return [structure.term, ...(structure.aliases ?? [])]
}

export function getAvailableBones(unit, regionId) {
  return unit.bones.filter((bone) => regionId === "all" || bone.regionId === regionId)
}

export function getAvailableViews(unit, regionId, boneId) {
  return unit.views.filter((view) => {
    const matchesRegion = regionId === "all" || view.regionId === regionId
    const matchesBone = boneId === "all" || view.boneId === boneId

    return matchesRegion && matchesBone
  })
}

export function getViewPoint(view, structureId) {
  return view?.points?.find((point) => point.structureId === structureId) ?? null
}

export function getFilteredStructures(unit, regionId, boneId, viewId) {
  const scoped = unit.structures.filter(
    (structure) =>
      (regionId === "all" || structure.regionId === regionId) &&
      (boneId === "all" || structure.boneId === boneId),
  )

  if (viewId === "all") {
    return scoped
  }

  const selectedView = unit.views.find((view) => view.id === viewId)
  const pointIds = new Set(selectedView?.points?.map((point) => point.structureId) ?? [])

  return scoped.filter(
    (structure) => structure.viewId === viewId || pointIds.has(structure.id),
  )
}

export function getScopeLabel(unit, regionId, boneId, viewId) {
  const regionLabel =
    regionId === "all"
      ? `${unit.chapterLabel ?? unit.label} mix`
      : unit.regions?.find((region) => region.id === regionId)?.label ?? unit.label

  const boneLabel =
    boneId === "all"
      ? regionLabel
      : unit.bones.find((bone) => bone.id === boneId)?.label ?? regionLabel

  if (viewId === "all") {
    return boneLabel
  }

  const viewLabel = unit.views.find((view) => view.id === viewId)?.label ?? "Focused view"

  return `${boneLabel} • ${viewLabel}`
}

function dedupeStructuresByTerm(structures) {
  const seen = new Set()

  return structures.filter((structure) => {
    const key = normalizeAnswer(structure.term)

    if (seen.has(key)) {
      return false
    }

    seen.add(key)
    return true
  })
}

export function buildQuizSession(unit, structures, quizKey) {
  const scopedStructures = dedupeStructuresByTerm(structures)
  const questions = shuffle(scopedStructures)
    .slice(0, Math.min(8, scopedStructures.length))
    .map((structure, index) => {
      const view = unit.views.find((candidate) => candidate.id === structure.viewId)
      const distractorPool = [
        ...scopedStructures.filter(
          (candidate) =>
            candidate.id !== structure.id && candidate.boneId === structure.boneId,
        ),
        ...scopedStructures.filter(
          (candidate) =>
            candidate.id !== structure.id && candidate.regionId === structure.regionId,
        ),
        ...scopedStructures.filter((candidate) => candidate.id !== structure.id),
      ]
      const seen = new Set([normalizeAnswer(structure.term)])
      const distractors = shuffle(
        distractorPool.filter((candidate) => {
          const key = normalizeAnswer(candidate.term)

          if (seen.has(key)) {
            return false
          }

          seen.add(key)
          return true
        }),
      )
        .slice(0, 3)
        .map((candidate) => candidate.term)

      return {
        id: `quiz-${structure.id}`,
        structureId: structure.id,
        prompt:
          index % 2 === 0
            ? `${structure.identifyPrompt} (${view?.label ?? "Mapped view"})`
            : `Which structure matches this description: ${structure.definition}`,
        helper: `${structure.boneLabel} • ${structure.regionLabel}`,
        correctAnswer: structure.term,
        explanation: `${structure.term} is ${structure.location}. ${structure.note}`,
        options: shuffle([structure.term, ...distractors]),
      }
    })

  return {
    quizKey,
    questions,
    currentIndex: 0,
    selectedAnswer: "",
    answered: false,
    score: 0,
    completed: false,
    answers: [],
  }
}

export function buildTypedSession(structures, sessionKey, reviewIds = []) {
  const selectedIds = new Set(reviewIds)
  const source = reviewIds.length
    ? structures.filter((structure) => selectedIds.has(structure.id))
    : structures

  return {
    sessionKey,
    questions: shuffle(source),
    currentIndex: 0,
    submitted: false,
    completed: false,
    responses: [],
  }
}

export function evaluateTypedAnswer(input, structure, allStructures) {
  const trimmed = input.trim()
  const normalizedInput = normalizeAnswer(trimmed)
  const acceptedTerms = getAcceptedTerms(structure)
  const normalizedAccepted = acceptedTerms.map(normalizeAnswer)

  if (!normalizedInput) {
    return {
      kind: "blank",
      correct: false,
      spellingCorrect: false,
      review: true,
      message: "Type an answer before submitting.",
    }
  }

  const exactMatch = acceptedTerms.find(
    (term) => term.toLowerCase() === trimmed.toLowerCase().trim(),
  )

  if (exactMatch) {
    return {
      kind: exactMatch === structure.term ? "correct" : "alias",
      correct: true,
      spellingCorrect: true,
      review: false,
      message:
        exactMatch === structure.term
          ? "Correct and correctly spelled."
          : `Accepted synonym. Preferred label: ${structure.term}.`,
    }
  }

  if (normalizedAccepted.includes(normalizedInput)) {
    return {
      kind: "correct",
      correct: true,
      spellingCorrect: true,
      review: false,
      message: "Correct. Casing or punctuation differed, but the term matches.",
    }
  }

  const matchedOther = allStructures.find((candidate) => {
    if (candidate.id === structure.id) {
      return false
    }

    return getAcceptedTerms(candidate)
      .map(normalizeAnswer)
      .includes(normalizedInput)
  })

  if (matchedOther) {
    return {
      kind: "wrong-structure",
      correct: false,
      spellingCorrect: false,
      review: true,
      message: `You named a real structure, but not this one. You entered ${matchedOther.term}; expected ${structure.term}.`,
    }
  }

  const distances = normalizedAccepted.map((term) =>
    levenshteinDistance(normalizedInput, term),
  )
  const closestDistance = Math.min(...distances)
  const maxLength = Math.max(
    normalizedInput.length,
    ...normalizedAccepted.map((term) => term.length),
  )
  const looksClose =
    closestDistance <= 2 || closestDistance / Math.max(maxLength, 1) <= 0.2

  if (looksClose) {
    return {
      kind: "misspelled",
      correct: false,
      spellingCorrect: false,
      review: true,
      message: `Close, but the spelling is off. Expected ${structure.term}.`,
    }
  }

  return {
    kind: "incorrect",
    correct: false,
    spellingCorrect: false,
    review: true,
    message: `Incorrect. Expected ${structure.term}.`,
  }
}

export function summarizeTypedResponses(responses) {
  const correctCount = responses.filter((entry) => entry.feedback.correct).length
  const spellingCount = responses.filter(
    (entry) => entry.feedback.correct && entry.feedback.spellingCorrect,
  ).length
  const closeCount = responses.filter(
    (entry) => entry.feedback.kind === "misspelled",
  ).length
  const reviewItems = responses.filter((entry) => entry.feedback.review)
  const reviewIds = [...new Set(reviewItems.map((entry) => entry.structure.id))]

  return {
    totalQuestions: responses.length,
    correctCount,
    spellingCount,
    closeCount,
    missedTerms: reviewItems.map((entry) => entry.structure.term),
    reviewIds,
  }
}
