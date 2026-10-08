/**
 * verify-packs.mjs — zero-content-loss verification for the P3 migration.
 *
 * 1. Counts source content (studyData.js flashcards/quiz/vocab; bonesLabChapter7
 *    structures/bones via an independent balanced-bracket parse).
 * 2. Counts pack content and asserts equality (before == after).
 * 3. Asserts every flashcard/quiz id appears exactly once across packs.
 * 4. Smoke-tests the quiz engine: all six modes build with a fixed seed,
 *    grading works, spell-check tolerance preserved, weak spots derive from
 *    real attempts, mergeEngineProgress never wipes existing keys.
 *
 * Run from the repo root:  node scripts/verify-packs.mjs
 * Exit non-zero on any failure.
 */

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, "..")
const importFromRepo = (relativePath) =>
  import(pathToFileURL(path.join(repoRoot, relativePath)).href)

const failures = []
function check(name, condition, detail = "") {
  if (condition) {
    console.log(`  ok   ${name}`)
  } else {
    failures.push(name)
    console.log(`  FAIL ${name} ${detail}`)
  }
}

/* ---------- 1. source counts ---------- */
const studyData = await importFromRepo("src/data/studyData.js")
const srcFlashcards = studyData.flashcards
const srcQuiz = studyData.quizQuestionBank
const srcVocab = studyData.chapters.flatMap((c) =>
  (c.vocabulary ?? []).map((term) => ({ chapterId: c.id, term })),
)

// Independent parse of bonesLabChapter7.js (separate implementation from the
// generator script — balanced scan + eval of data literals only).
const boneSrc = fs.readFileSync(path.join(repoRoot, "src/data/bonesLabChapter7.js"), "utf8")
function extractBalanced(text, start) {
  const pairs = { "[": "]", "{": "}", "(": ")" }
  const close = pairs[text[start]]
  const stack = [close]
  let i = start + 1
  let str = null
  let esc = false
  while (i < text.length && stack.length) {
    const ch = text[i]
    if (str) {
      if (esc) esc = false
      else if (ch === "\\") esc = true
      else if (ch === str) str = null
    } else if (ch === '"' || ch === "'" || ch === "`") str = ch
    else if (pairs[ch]) stack.push(pairs[ch])
    else if (ch === stack[stack.length - 1]) stack.pop()
    i += 1
  }
  return text.slice(start, i)
}
function extractGroups() {
  const groups = []
  const marker = "structureGroups.push("
  let idx = 0
  while (true) {
    idx = boneSrc.indexOf(marker, idx)
    if (idx === -1) break
    const paren = boneSrc.indexOf("(", idx + marker.length - 1)
    const call = extractBalanced(boneSrc, paren)
    let j = 1
    while (j < call.length - 1) {
      if (call[j] === "{") {
        const lit = extractBalanced(call, j)
        groups.push(eval(`(${lit})`))
        j += lit.length
      } else j += 1
    }
    idx = paren + call.length
  }
  return groups
}
const groups = extractGroups()
const srcStructures = groups.flatMap((g) =>
  g.items.map((item) => ({ boneId: g.boneId, id: item[0], term: item[1] })),
)
const boneRowsIdx = boneSrc.indexOf("const boneRows =")
const srcBones = eval(`(${extractBalanced(boneSrc, boneSrc.indexOf("[", boneRowsIdx))})`)

console.log("source counts:")
console.log(`  flashcards: ${srcFlashcards.length}, quiz: ${srcQuiz.length}, vocab terms: ${srcVocab.length}`)
console.log(`  bone structures: ${srcStructures.length}, bones: ${srcBones.length}`)

/* ---------- 2. pack counts ---------- */
const packsIndex = await importFromRepo("src/data/packs/index.js")
const packs = packsIndex.allPacks

const packFlashcards = packs.flatMap((p) => p.flashcards)
const packQuiz = packs.flatMap((p) => p.quiz)
const packVocabTerms = packs.flatMap((p) => p.terms.filter((t) => t.definition === null))
const packBoneTerms = packs.flatMap((p) => p.terms.filter((t) => t.definition !== null))
const packBones = packs.flatMap((p) => p.bones)

console.log("pack counts:")
console.log(`  flashcards: ${packFlashcards.length}, quiz: ${packQuiz.length}`)
console.log(`  vocab terms: ${packVocabTerms.length}, bone terms: ${packBoneTerms.length}, bones: ${packBones.length}`)

console.log("content equality:")
check("flashcard count matches", packFlashcards.length === srcFlashcards.length)
check("quiz count matches", packQuiz.length === srcQuiz.length)
check("vocab term count matches", packVocabTerms.length === srcVocab.length)
check("bone structure count matches", packBoneTerms.length === srcStructures.length)
check("bone count matches", packBones.length === srcBones.length)

// field-level verbatim check for flashcards + quiz
const srcCardById = Object.fromEntries(srcFlashcards.map((c) => [c.id, c]))
check(
  "flashcards verbatim",
  packFlashcards.every(
    (c) =>
      srcCardById[c.id] &&
      srcCardById[c.id].front === c.front &&
      srcCardById[c.id].back === c.back &&
      srcCardById[c.id].note === c.note &&
      srcCardById[c.id].category === c.category,
  ),
)
const srcQuizById = Object.fromEntries(srcQuiz.map((q) => [q.id, q]))
check(
  "quiz items verbatim",
  packQuiz.every(
    (q) =>
      srcQuizById[q.id] &&
      srcQuizById[q.id].prompt === q.prompt &&
      srcQuizById[q.id].correctAnswer === q.correctAnswer &&
      srcQuizById[q.id].explanation === q.explanation &&
      JSON.stringify(srcQuizById[q.id].options) === JSON.stringify(q.options),
  ),
)

// every source structure term present in the bones pack, same facts
const srcStructById = Object.fromEntries(srcStructures.map((s) => [s.id, s]))
const bonePack = packs.find((p) => p.id === "pack-bones-ch7")
check(
  "bone terms cover every source structure",
  srcStructures.every((s) => {
    const t = bonePack.terms.find((term) => term.id === s.id)
    return t && t.term === s.term && t.boneId === s.boneId
  }),
)

// id uniqueness across packs
function dupes(ids) {
  const seen = new Set()
  return ids.filter((id) => (seen.has(id) ? true : !seen.add(id) && false))
}
check("flashcard ids unique", dupes(packFlashcards.map((c) => c.id)).length === 0)
check("quiz ids unique", dupes(packQuiz.map((q) => q.id)).length === 0)
check("bone term ids unique", dupes(bonePack.terms.map((t) => t.id)).length === 0)

/* ---------- 3. engine smoke tests ---------- */
console.log("engine smoke tests:")
const engine = await importFromRepo("src/quiz/engine.js")
const allSystems = packsIndex.getAllSystems()

// spell-check tolerance preserved
const vExact = engine.spellVerdict("Femur", ["Femur"])
check("spell: exact correct", vExact.correct && vExact.kind === "exact")
const vClose = engine.spellVerdict("femr", ["femur"])
check("spell: near-miss is close (<=2 edits)", vClose.close && !vClose.correct && vClose.kind === "close")
const vFar = engine.spellVerdict("xylophone", ["femur"])
check("spell: far miss is wrong", !vFar.correct && !vFar.close && vFar.kind === "wrong")
const vAlias = engine.spellVerdict("thigh bone", ["Femur", "thigh bone"])
check("spell: alias accepted", vAlias.correct)

const modes = [
  ["multiple-choice", { count: 6 }],
  ["fill-in-the-blank", { count: 6 }],
  ["connect-the-statements", { pairs: 4, rounds: 2 }],
  ["click-the-bone", { count: 6 }],
  ["type-the-bone-name", { count: 6 }],
  ["name-the-system", { count: 6 }],
]

for (const [mode, opts] of modes) {
  const session = engine.buildSession(
    bonePack,
    mode,
    { seed: 42, studyMode: "study", ...opts },
    { allPacks: packs, allSystems },
  )
  check(`${mode}: builds questions`, session.questions.length > 0, `got ${session.questions.length}`)

  let current = session
  for (const q of session.questions) {
    let response
    if (q.grading.kind === "choice") response = { selected: q.grading.correctAnswer }
    else if (q.grading.kind === "typed") response = { input: q.grading.accepted[0] }
    else if (q.grading.kind === "match") response = { mapping: { ...q.grading.mapping } }
    else if (q.grading.kind === "bone") response = { boneId: q.grading.boneId }
    const { session: next } = engine.answerQuestion(current, q.id, response)
    current = next
  }
  const summary = engine.summarizeSession(current)
  check(`${mode}: all-correct run scores 100%`, summary.percent === 100, `got ${summary.percent}`)
  check(`${mode}: blind mode nulls info`, engine.buildSession(bonePack, mode, { seed: 42, studyMode: "blind", ...opts }, { allPacks: packs, allSystems }).questions.every((q) => q.info === null))
}

// determinism: same seed ⇒ same question order
const s1 = engine.buildSession(bonePack, "multiple-choice", { seed: 7, count: 6 }, { allPacks: packs, allSystems })
const s2 = engine.buildSession(bonePack, "multiple-choice", { seed: 7, count: 6 }, { allPacks: packs, allSystems })
check(
  "deterministic with seed",
  JSON.stringify(s1.questions.map((q) => q.id)) === JSON.stringify(s2.questions.map((q) => q.id)),
)

// biology pack modes work too (multiple-choice + name-the-system)
const bioPack = packs.find((p) => p.id === "pack-biology-ch6")
const bioMc = engine.buildSession(bioPack, "multiple-choice", { seed: 3, count: 4 }, { allPacks: packs, allSystems })
check("biology pack: multiple-choice builds", bioMc.questions.length === 4)
const bioSys = engine.buildSession(bioPack, "name-the-system", { seed: 3, count: 4 }, { allPacks: packs, allSystems })
check("biology pack: name-the-system builds", bioSys.questions.length === 4)

// weak spots derive from real attempts
const mixed = engine.buildSession(bonePack, "multiple-choice", { seed: 9, count: 4 }, { allPacks: packs, allSystems })
let st = mixed
mixed.questions.forEach((q, i) => {
  const { session: next } = engine.answerQuestion(st, q.id, {
    selected: i === 0 ? "__wrong__" : q.grading.correctAnswer,
  })
  st = next
})
const weak = engine.deriveWeakSpots(engine.summarizeSession(st).attempts)
check("weak spots from real attempts", Object.keys(weak).length === 1 && Object.values(weak)[0].misses === 1)

// mergeEngineProgress never wipes
const prev = { activeSection: "quiz", quizHistory: { mixed: { bestPercent: 80 } }, anatomyProgress: { weakSpots: { "old-id": { misses: 2, sources: { quiz: 2 } } } } }
const merged = engine.mergeEngineProgress(prev, {
  sessionKey: "engine-mc-test",
  scopeLabel: "test",
  mode: "multiple-choice",
  summary: engine.summarizeSession(st),
})
check("merge keeps existing keys", merged.activeSection === "quiz" && merged.quizHistory.mixed.bestPercent === 80)
check("merge keeps old weak spots", merged.anatomyProgress.weakSpots["old-id"].misses === 2)
check("merge adds engine history", merged.engineQuizHistory["engine-mc-test"].lastPercent === 75)
check("merge adds engine weak spots", Object.values(merged.anatomyProgress.weakSpots).some((w) => w.sources.engine > 0))

console.log(failures.length ? `\n${failures.length} FAILURES` : "\nall checks passed")
process.exit(failures.length ? 1 : 0)
