/**
 * src/quiz/engine.js — unified quiz engine (plain JS, UI-free).
 *
 * Deterministic question generators for six quiz modes over content packs
 * (see src/data/packs/pack-schema.md). Pass a numeric `seed` for reproducible
 * sessions; omit it for a fresh random run.
 *
 * Every generator returns { mode, packId, questions }. Each question carries:
 *   - id, drillRef        — stable identity for attempt tracking / weak spots
 *   - prompt              — the ask (never contains the graded answer)
 *   - info                — study-only supplementary cues (null in blind mode)
 *   - hintLevels          — progressive hints, never containing the answer
 *   - reveal              — shown after answering { answer, detail }
 *   - grading             — { kind: 'choice'|'typed'|'match'|'bone', ... }
 */

/* ------------------------------------------------------------------ */
/* Deterministic RNG                                                   */
/* ------------------------------------------------------------------ */

export function mulberry32(seed) {
  let state = (Number.isFinite(seed) ? seed : Date.now()) >>> 0

  return function next() {
    state = (state + 0x6d2b79f5) >>> 0
    let value = state

    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)

    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

export function shuffle(items, rng = Math.random) {
  const cloned = [...items]

  for (let index = cloned.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(rng() * (index + 1))
    ;[cloned[index], cloned[randomIndex]] = [cloned[randomIndex], cloned[index]]
  }

  return cloned
}

export function pick(items, count, rng) {
  return shuffle(items, rng).slice(0, Math.max(0, Math.min(count, items.length)))
}

/* ------------------------------------------------------------------ */
/* Text utilities (self-contained port of bonesLabUtils answer logic)   */
/* ------------------------------------------------------------------ */

export function normalizeAnswer(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

export function levenshteinDistance(source, target) {
  const rows = source.length + 1
  const cols = target.length + 1
  const table = Array.from({ length: rows }, () => Array(cols).fill(0))

  for (let row = 0; row < rows; row += 1) table[row][0] = row
  for (let col = 0; col < cols; col += 1) table[0][col] = col

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

/**
 * Spell verdict replicating the app's existing typed-recall tolerance.
 * Threshold: Levenshtein distance <= 2 absolute, OR <= 20% of the longer
 * string — otherwise a "close/misspelled" verdict.
 *
 * Returns { kind, correct, close, spellingCorrect, review, message }.
 */
export function spellVerdict(input, acceptedTerms, otherTerms = []) {
  const trimmed = String(input ?? "").trim()
  const normalizedInput = normalizeAnswer(trimmed)
  const accepted = acceptedTerms.filter(Boolean)
  const normalizedAccepted = accepted.map(normalizeAnswer)

  if (!normalizedInput) {
    return {
      kind: "blank",
      correct: false,
      close: false,
      spellingCorrect: false,
      review: true,
      message: "Type an answer before submitting.",
    }
  }

  const exactMatch = accepted.find(
    (term) => term.toLowerCase() === trimmed.toLowerCase().trim(),
  )

  if (exactMatch) {
    return {
      kind: "exact",
      correct: true,
      close: false,
      spellingCorrect: true,
      review: false,
      message: "Correct and correctly spelled.",
    }
  }

  const normalizedIndex = normalizedAccepted.indexOf(normalizedInput)
  if (normalizedIndex !== -1) {
    return {
      kind: normalizedIndex === 0 ? "exact" : "alias",
      correct: true,
      close: false,
      spellingCorrect: true,
      review: false,
      message: "Correct. Casing or punctuation differed, but the term matches.",
    }
  }

  const matchedOther = otherTerms.find((candidate) =>
    (candidate.acceptedTerms ?? []).map(normalizeAnswer).includes(normalizedInput),
  )

  if (matchedOther) {
    return {
      kind: "wrong-structure",
      correct: false,
      close: false,
      spellingCorrect: false,
      review: true,
      message: `You named a real item, but not this one. You entered ${matchedOther.label}; expected ${accepted[0]}.`,
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
      kind: "close",
      correct: false,
      close: true,
      spellingCorrect: false,
      review: true,
      message: `Close, but the spelling is off. Expected ${accepted[0]}.`,
    }
  }

  return {
    kind: "wrong",
    correct: false,
    close: false,
    spellingCorrect: false,
    review: true,
    message: `Incorrect. Expected ${accepted[0]}.`,
  }
}

/* ------------------------------------------------------------------ */
/* Question building blocks                                            */
/* ------------------------------------------------------------------ */

export const QUIZ_MODES = [
  { id: "multiple-choice", label: "Multiple choice", helper: "Pick the right answer from four options." },
  { id: "fill-in-the-blank", label: "Fill in the blank", helper: "Type the missing term." },
  { id: "connect-the-statements", label: "Connect the statements", helper: "Match each cue to its pair." },
  { id: "click-the-bone", label: "Click the bone", helper: "Find the named bone in the 3D Human Atlas." },
  { id: "type-the-bone-name", label: "Type the bone name", helper: "Typed recall with spell-check tolerance." },
  { id: "name-the-system", label: "Name the system", helper: "Which body system does it belong to?" },
]

function definedTerms(pack) {
  return (pack.terms ?? []).filter((term) => term.definition)
}

function namedTerms(pack) {
  return (pack.terms ?? []).filter((term) => term.term)
}

/** Progressive hints that never reveal the graded answer. */
export function buildHintLevels({ term, hint, regionLabel, boneLabel, system }) {
  const levels = []

  if (term) {
    const wordCount = term.trim().split(/\s+/).length
    levels.push(
      `Starts with "${term.trim().charAt(0).toUpperCase()}" • ${term.trim().length} letters • ${wordCount} word${wordCount === 1 ? "" : "s"}`,
    )
  }

  if (hint) {
    levels.push(hint)
  }

  const structural = [
    regionLabel ? `Region: ${regionLabel}` : null,
    boneLabel ? `Bone: ${boneLabel}` : null,
    system ? `System: ${system}` : null,
  ].filter(Boolean)

  if (structural.length) {
    levels.push(structural.join(" • "))
  }

  return levels.slice(0, 3)
}

function distractorsFor(correct, pool, count, rng) {
  const seen = new Set([normalizeAnswer(correct)])
  const candidates = shuffle(
    pool.filter((value) => {
      const key = normalizeAnswer(value)
      if (!key || seen.has(key)) return false
      seen.add(key)
      return true
    }),
    rng,
  )

  return candidates.slice(0, count)
}

function withStudyInfo(question, studyMode) {
  if (studyMode !== "study") {
    return { ...question, info: null }
  }

  return question
}

/* ------------------------------------------------------------------ */
/* Mode generators                                                     */
/* ------------------------------------------------------------------ */

/**
 * Multiple choice: pre-authored quiz items verbatim + generated
 * term↔definition items (4 options, distractors prefer same pack).
 */
export function generateMultipleChoice(pack, allPacks = [], { count = 10, seed, studyMode = "study" } = {}) {
  const rng = mulberry32(seed)
  const questions = []
  const terms = definedTerms(pack)
  const siblingTerms = allPacks.flatMap((p) => definedTerms(p))

  for (const item of pick(pack.quiz ?? [], count, rng)) {
    questions.push(
      withStudyInfo(
        {
          id: `mc-${item.id}`,
          drillRef: item.id,
          mode: "multiple-choice",
          prompt: item.prompt,
          kind: "pre-authored",
          options: item.options,
          info: {
            chapter: pack.title,
            cue: item.type === "true-false" ? "True or false?" : null,
          },
          hintLevels: [`Chapter: ${pack.title}`],
          reveal: { answer: item.correctAnswer, detail: item.explanation },
          grading: { kind: "choice", correctAnswer: item.correctAnswer },
        },
        studyMode,
      ),
    )
  }

  const generatedCount = Math.max(0, count - questions.length)
  pick(terms, generatedCount, rng).forEach((term, index) => {
    const termToDefinition = (index + (seed ?? 0)) % 2 === 0
    const pool = [...terms, ...siblingTerms].filter((t) => t.id !== term.id)

    let prompt
    let options
    let correctAnswer

    if (termToDefinition) {
      prompt = `Which description matches "${term.term}"?`
      correctAnswer = term.definition
      options = shuffle(
        [term.definition, ...distractorsFor(term.definition, pool.map((t) => t.definition), 3, rng)],
        rng,
      )
    } else {
      prompt = `Which term matches this description: ${term.definition}`
      correctAnswer = term.term
      options = shuffle(
        [term.term, ...distractorsFor(term.term, pool.map((t) => t.term), 3, rng)],
        rng,
      )
    }

    questions.push(
      withStudyInfo(
        {
          id: `mc-gen-${term.id}`,
          drillRef: term.id,
          mode: "multiple-choice",
          prompt,
          kind: "generated",
          options,
          info: {
            hint: term.hint,
            region: term.regionLabel,
            bone: term.boneLabel,
          },
          hintLevels: buildHintLevels(term),
          reveal: { answer: correctAnswer, detail: term.note || term.definition },
          grading: { kind: "choice", correctAnswer },
        },
        studyMode,
      ),
    )
  })

  return { mode: "multiple-choice", packId: pack.id, questions: shuffle(questions, rng) }
}

/**
 * Fill in the blank: definition with the term blanked to "______".
 * Quiz items: prompt shown, exact answer typed.
 */
export function generateFillBlank(pack, { count = 10, seed, studyMode = "study" } = {}) {
  const rng = mulberry32(seed)
  const questions = []

  for (const term of pick(definedTerms(pack), count, rng)) {
    const escaped = term.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const blanked = term.definition.replace(new RegExp(escaped, "i"), "______")
    const prompt =
      blanked === term.definition
        ? `Fill in the blank — which term does this describe? ${term.definition}`
        : `Fill in the blank: ${blanked}`

    questions.push(
      withStudyInfo(
        {
          id: `fib-${term.id}`,
          drillRef: term.id,
          mode: "fill-in-the-blank",
          prompt,
          info: {
            hint: term.hint,
            identifyPrompt: term.identifyPrompt,
            region: term.regionLabel,
          },
          hintLevels: buildHintLevels(term),
          reveal: { answer: term.term, detail: term.definition },
          grading: { kind: "typed", accepted: [term.term, ...(term.aliases ?? [])] },
        },
        studyMode,
      ),
    )
  }

  return { mode: "fill-in-the-blank", packId: pack.id, questions }
}

/**
 * Connect the statements: match N cues to N answers, both sides shuffled.
 * One question = one matching round.
 */
export function generateMatching(pack, { pairs = 5, rounds = 3, seed, studyMode = "study" } = {}) {
  const rng = mulberry32(seed)
  const terms = definedTerms(pack)
  const questions = []

  for (let round = 0; round < rounds; round += 1) {
    const selected = pick(terms, pairs, rng)
    if (selected.length < 2) break

    const pairEntries = selected.map((term, index) => ({
      id: `pair-${round}-${index}`,
      drillRef: term.id,
      left: term.term,
      right: term.definition,
      hint: term.hint,
    }))

    questions.push(
      withStudyInfo(
        {
          id: `match-${pack.id}-round-${round}`,
          drillRef: selected.map((t) => t.id).join(","),
          mode: "connect-the-statements",
          prompt: "Match each term to its correct description.",
          pairs: pairEntries,
          leftOrder: shuffle(pairEntries.map((p) => p.id), rng),
          rightOrder: shuffle(pairEntries.map((p) => p.id), rng),
          info:
            studyMode === "study"
              ? { cues: pairEntries.map((p) => ({ id: p.id, hint: p.hint })) }
              : null,
          hintLevels: [],
          reveal: {
            answer: Object.fromEntries(pairEntries.map((p) => [p.left, p.right])),
            detail: "Review any mismatched pairs before the next round.",
          },
          grading: {
            kind: "match",
            mapping: Object.fromEntries(pairEntries.map((p) => [p.id, p.id])),
          },
        },
        studyMode,
      ),
    )
  }

  return { mode: "connect-the-statements", packId: pack.id, questions }
}

import { SUPPORTED_COURSE_BONE_IDS } from "../lib/courseAtlas.js"

/** Click only course bones with an exact mapped concept in the Human Atlas. */
export function generateClickBone(pack, { count = 8, seed, studyMode = "study" } = {}) {
  const rng = mulberry32(seed)
  const supportedIds = new Set(SUPPORTED_COURSE_BONE_IDS)
  const bones = (pack.bones ?? []).filter((bone) => supportedIds.has(bone.boneId))

  const questions = pick(bones, count, rng).map((bone) => ({
    id: `click-${bone.boneId}`,
    drillRef: bone.boneId,
    mode: "click-the-bone",
    prompt: `Click the ${bone.label}`,
    ...(studyMode === "study"
      ? { info: { region: bone.regionLabel, description: bone.description } }
      : { info: null }),
    hintLevels: bone.regionLabel ? [`Region: ${bone.regionLabel}`] : [],
    reveal: { answer: bone.label, detail: bone.description },
    grading: { kind: "bone", boneId: bone.boneId, label: bone.label },
  }))

  return { mode: "click-the-bone", packId: pack.id, questions }
}

/**
 * Type the bone name: typed recall against term + aliases with the
 * spell-check tolerance from spellVerdict.
 */
export function generateTypeName(pack, { count = 10, seed, studyMode = "study" } = {}) {
  const rng = mulberry32(seed)
  const questions = []

  for (const term of pick(namedTerms(pack), count, rng)) {
    const accepted = [term.term, ...(term.aliases ?? [])]
    const prompt =
      term.identifyPrompt ||
      (term.definition ? `Type the name of the structure described: ${term.definition}` : `Type the name of: ${term.hint ?? term.term}`)

    questions.push(
      withStudyInfo(
        {
          id: `type-${term.id}`,
          drillRef: term.id,
          mode: "type-the-bone-name",
          prompt,
          info: {
            definition: term.definition,
            hint: term.hint,
            note: term.note,
            region: term.regionLabel,
            bone: term.boneLabel,
          },
          hintLevels: buildHintLevels(term),
          reveal: {
            answer: term.term,
            detail: `${term.definition ?? ""}${term.note ? ` ${term.note}` : ""}`.trim(),
          },
          grading: { kind: "typed", accepted },
        },
        studyMode,
      ),
    )
  }

  return { mode: "type-the-bone-name", packId: pack.id, questions }
}

/**
 * Name the system: "which system does X belong to?" with system options.
 */
export function generateNameSystem(pack, allSystems = [], { count = 10, seed, studyMode = "study" } = {}) {
  const rng = mulberry32(seed)
  const terms = namedTerms(pack).filter((term) => term.system)
  const questions = []

  for (const term of pick(terms, count, rng)) {
    const otherSystems = allSystems.filter((system) => system !== term.system)
    const options = shuffle(
      [term.system, ...distractorsFor(term.system, otherSystems, 3, rng)],
      rng,
    )

    questions.push(
      withStudyInfo(
        {
          id: `sys-${term.id}`,
          drillRef: term.id,
          mode: "name-the-system",
          prompt: `Which system does "${term.term}" belong to?`,
          options,
          info: term.definition ? { definition: term.definition } : { chapter: pack.title },
          hintLevels: buildHintLevels(term),
          reveal: { answer: term.system, detail: term.definition ?? term.note ?? "" },
          grading: { kind: "choice", correctAnswer: term.system },
        },
        studyMode,
      ),
    )
  }

  return { mode: "name-the-system", packId: pack.id, questions }
}

/* ------------------------------------------------------------------ */
/* Session lifecycle (pure)                                            */
/* ------------------------------------------------------------------ */

export function buildSession(pack, mode, { count, seed, studyMode = "study", spellCheck = true } = {}, context = {}) {
  const options = { count, seed, studyMode, ...context }
  const allPacks = context.allPacks ?? []
  const allSystems = context.allSystems ?? []

  let generated
  switch (mode) {
    case "multiple-choice":
      generated = generateMultipleChoice(pack, allPacks, options)
      break
    case "fill-in-the-blank":
      generated = generateFillBlank(pack, options)
      break
    case "connect-the-statements":
      generated = generateMatching(pack, options)
      break
    case "click-the-bone":
      generated = generateClickBone(pack, options)
      break
    case "type-the-bone-name":
      generated = generateTypeName(pack, options)
      break
    case "name-the-system":
      generated = generateNameSystem(pack, allSystems, options)
      break
    default:
      throw new Error(`Unknown quiz mode: ${mode}`)
  }

  return {
    id: `engine-${mode}-${Date.now().toString(36)}`,
    packId: pack.id,
    packTitle: pack.title,
    mode,
    studyMode,
    spellCheck,
    seed: seed ?? null,
    questions: generated.questions,
    currentIndex: 0,
    answers: [],
    score: 0,
    closeCount: 0,
    completed: false,
  }
}

/**
 * Grade one response. Response shapes:
 *  - choice: { selected }
 *  - typed:  { input }
 *  - match:  { mapping: { leftId: rightId } }
 *  - bone:   { boneId }
 */
export function gradeResponse(question, response, { spellCheck = true } = {}, siblingDrills = []) {
  const grading = question.grading

  if (grading.kind === "choice") {
    const correct = response.selected === grading.correctAnswer
    return {
      correct,
      close: false,
      kind: correct ? "exact" : "wrong",
      message: correct ? "Correct." : `Incorrect. Correct answer: ${grading.correctAnswer}.`,
      review: !correct,
    }
  }

  if (grading.kind === "typed") {
    const verdict = spellVerdict(response.input ?? "", grading.accepted, siblingDrills)

    if (!spellCheck && verdict.kind === "close") {
      return { ...verdict, kind: "wrong", close: false, message: `Incorrect. Expected ${grading.accepted[0]}.` }
    }

    return verdict
  }

  if (grading.kind === "match") {
    const mapping = response.mapping ?? {}
    const pairIds = Object.keys(grading.mapping)
    const correctPairs = pairIds.filter((leftId) => mapping[leftId] === grading.mapping[leftId])
    const correct = correctPairs.length === pairIds.length

    return {
      correct,
      close: false,
      kind: correct ? "exact" : "wrong",
      correctPairs,
      totalPairs: pairIds.length,
      message: correct
        ? "All pairs matched."
        : `${correctPairs.length} of ${pairIds.length} pairs correct.`,
      review: !correct,
    }
  }

  if (grading.kind === "bone") {
    const selected = normalizeAnswer(response.boneId ?? "")
    const target = normalizeAnswer(grading.boneId)
    const correct = selected !== "" && selected === target

    return {
      correct,
      close: false,
      kind: correct ? "exact" : "wrong",
      message: correct ? "Correct bone." : `That was not the ${grading.label}.`,
      review: !correct,
    }
  }

  throw new Error(`Unknown grading kind: ${grading.kind}`)
}

/** Record an answer; returns { session, feedback }. Pure — no mutation. */
export function answerQuestion(session, questionId, response, siblingDrills = []) {
  const question = session.questions.find((q) => q.id === questionId)

  if (!question) {
    throw new Error(`Question not found: ${questionId}`)
  }

  const feedback = gradeResponse(question, response, { spellCheck: session.spellCheck }, siblingDrills)
  const answers = [
    ...session.answers,
    {
      questionId,
      drillRef: question.drillRef,
      mode: session.mode,
      correct: feedback.correct,
      close: feedback.close,
      kind: feedback.kind,
      at: new Date().toISOString(),
    },
  ]
  const lastQuestion = session.currentIndex >= session.questions.length - 1

  return {
    session: {
      ...session,
      answers,
      score: feedback.correct ? session.score + 1 : session.score,
      closeCount: feedback.close ? session.closeCount + 1 : session.closeCount,
      currentIndex: lastQuestion ? session.currentIndex : session.currentIndex + 1,
      completed: lastQuestion,
    },
    feedback,
  }
}

export function summarizeSession(session) {
  const total = session.questions.length
  const correct = session.score

  return {
    total,
    correct,
    close: session.closeCount,
    percent: total ? Math.round((correct / total) * 100) : 0,
    attempts: session.answers,
  }
}

/* ------------------------------------------------------------------ */
/* Weak spots + persistence                                            */
/* ------------------------------------------------------------------ */

/**
 * Aggregate attempts into the app's existing weak-spot shape:
 * { [id]: { misses, lastMissedAt, sources: { engine: n } } }
 * Only real attempts feed this — never synthetic data.
 */
export function deriveWeakSpots(attempts) {
  const weakSpots = {}

  for (const attempt of attempts) {
    if (attempt.correct) continue

    const refs = String(attempt.drillRef ?? "").split(",").filter(Boolean)

    for (const ref of refs) {
      const previous = weakSpots[ref] ?? { misses: 0, sources: {} }

      weakSpots[ref] = {
        misses: previous.misses + 1,
        lastMissedAt: attempt.at ?? new Date().toISOString(),
        sources: {
          ...previous.sources,
          engine: (previous.sources.engine ?? 0) + 1,
        },
      }
    }
  }

  return weakSpots
}

/**
 * Merge an engine result into the existing localStorage state shape.
 * Pure: carries every existing key over untouched; adds
 * `engineQuizHistory[sessionKey]` and merges engine weak spots into
 * `anatomyProgress.weakSpots`. Never wipes existing state.
 */
export function mergeEngineProgress(prevState, { sessionKey, scopeLabel, mode, summary }) {
  const percent = summary.percent
  const previous = prevState?.engineQuizHistory?.[sessionKey]
  const anatomyProgress = prevState?.anatomyProgress ?? {}
  const mergedWeakSpots = { ...(anatomyProgress.weakSpots ?? {}) }
  const derived = deriveWeakSpots(summary.attempts)

  for (const [id, spot] of Object.entries(derived)) {
    const existing = mergedWeakSpots[id]
    const existingSources = existing?.sources ?? {}

    mergedWeakSpots[id] = {
      misses: (existing?.misses ?? 0) + spot.misses,
      lastMissedAt: spot.lastMissedAt,
      sources: {
        ...existingSources,
        engine: (existingSources.engine ?? 0) + (spot.sources.engine ?? 0),
      },
    }
  }

  return {
    ...prevState,
    engineQuizHistory: {
      ...(prevState?.engineQuizHistory ?? {}),
      [sessionKey]: {
        scopeLabel,
        mode,
        attempts: (previous?.attempts ?? 0) + 1,
        bestPercent: Math.max(previous?.bestPercent ?? 0, percent),
        lastPercent: percent,
      },
    },
    anatomyProgress: {
      ...anatomyProgress,
      weakSpots: mergedWeakSpots,
    },
  }
}

/** A bone selection from BodyExplorer matches a click-the-bone target. */
export function boneSelectionMatchesTarget(selection, target) {
  if (!selection) return false

  if (selection.boneId && target.grading?.boneId) {
    return normalizeAnswer(selection.boneId) === normalizeAnswer(target.grading.boneId)
  }

  const names = [selection.displayName, selection.meshName].filter(Boolean)

  return names.some(
    (name) => normalizeAnswer(name) === normalizeAnswer(target.grading?.label ?? ""),
  )
}
