/**
 * smoke.mjs — release smoke test for Study Buddy content packs.
 *
 * Validates every pack in src/data/packs/ against src/data/packs/pack-schema.md
 * and exits non-zero with loud errors on any violation.
 *
 * Run from the repo root:  node scripts/smoke.mjs   (or  npm run smoke)
 * Exit code: 0 = all packs valid, 1 = schema violation(s) found.
 */

import { allPacks } from "../src/data/packs/index.js"

const failures = []
let checks = 0

function fail(packId, what, detail) {
  failures.push(`[${packId}] ${what}: ${detail}`)
}

function check(packId, what, condition, detail = "") {
  checks++
  if (!condition) fail(packId, what, detail)
}

const isStr = (v) => typeof v === "string"
const isNonEmptyStr = (v) => isStr(v) && v.trim().length > 0
const isStrOrNull = (v) => v === null || isStr(v)
const isArr = (v) => Array.isArray(v)

/** Normalized text for containment checks (matches quiz engine grading norm). */
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()

const globalIds = new Set()
function uniqueGlobal(packId, kind, id) {
  const key = `${kind}:${id}`
  check(packId, `${kind} id unique`, !globalIds.has(key), `duplicate ${key}`)
  globalIds.add(key)
}

const QUIZ_TYPES = new Set(["multiple-choice", "true-false"])

function validateBone(pack, bone) {
  const pid = pack.id
  for (const f of ["boneId", "label", "regionId", "regionLabel", "description", "system"]) {
    check(pid, "bone field", isNonEmptyStr(bone[f]), `bone missing/empty "${f}" (boneId=${bone.boneId})`)
  }
}

function validateTerm(pack, term) {
  const pid = pack.id
  const tag = `term id=${term.id}`
  // Required fields
  check(pid, "term field", isNonEmptyStr(term.id), `${tag}: missing id`)
  check(pid, "term field", isNonEmptyStr(term.term), `${tag}: missing term`)
  check(pid, "term field", isStrOrNull(term.definition), `${tag}: definition must be string|null`)
  check(pid, "term field", isNonEmptyStr(term.chapterId), `${tag}: missing chapterId`)
  check(pid, "term field", isNonEmptyStr(term.chapter), `${tag}: missing chapter`)
  check(pid, "term field", isNonEmptyStr(term.system), `${tag}: missing system`)
  check(pid, "term field", term.boneId === null || isNonEmptyStr(term.boneId), `${tag}: boneId must be string|null`)
  check(pid, "term field", isArr(term.aliases), `${tag}: aliases must be an array`)
  // Optional authored-cue fields: string|null when present
  for (const f of ["boneLabel", "regionId", "regionLabel", "viewId", "identifyPrompt", "location", "hint", "note"]) {
    if (term[f] !== undefined) {
      check(pid, "term optional field", isStrOrNull(term[f]), `${tag}: ${f} must be string|null`)
    }
  }
  // Schema contract: a hint is a study cue and must never BE the answer.
  if (isNonEmptyStr(term.hint)) {
    const tn = norm(term.term)
    if (tn.length >= 3 && norm(term.hint).includes(tn)) {
      fail(pid, "hint reveals answer", `${tag}: hint ${JSON.stringify(term.hint)} contains the graded term`)
    }
  }
}

function validateFlashcard(pack, card) {
  const pid = pack.id
  const tag = `flashcard id=${card.id}`
  for (const f of ["id", "chapterId", "category", "front", "back"]) {
    check(pid, "flashcard field", isNonEmptyStr(card[f]), `${tag}: missing/empty "${f}"`)
  }
  if (card.note !== undefined) {
    check(pid, "flashcard field", isStrOrNull(card.note), `${tag}: note must be string|null`)
  }
}

function validateQuizItem(pack, item) {
  const pid = pack.id
  const tag = `quiz id=${item.id}`
  check(pid, "quiz field", isNonEmptyStr(item.id), `${tag}: missing id`)
  check(pid, "quiz field", isNonEmptyStr(item.chapterId), `${tag}: missing chapterId`)
  check(pid, "quiz field", QUIZ_TYPES.has(item.type), `${tag}: bad type ${JSON.stringify(item.type)}`)
  check(pid, "quiz field", isNonEmptyStr(item.prompt), `${tag}: missing prompt`)
  check(pid, "quiz field", isArr(item.options) && item.options.length >= 2, `${tag}: options must be an array of ≥2`)
  if (isArr(item.options)) {
    check(pid, "quiz options", item.options.every(isNonEmptyStr), `${tag}: all options must be non-empty strings`)
  }
  if (item.type === "multiple-choice" && isArr(item.options)) {
    check(pid, "quiz answer", item.options.includes(item.correctAnswer), `${tag}: correctAnswer not in options`)
  }
  if (item.type === "true-false") {
    check(pid, "quiz answer", isNonEmptyStr(item.correctAnswer), `${tag}: true-false needs a string correctAnswer`)
  }
  if (item.explanation !== undefined) {
    check(pid, "quiz field", isStrOrNull(item.explanation), `${tag}: explanation must be string|null`)
  }
}

function validatePack(pack) {
  const pid = isStr(pack.id) ? pack.id : "(missing id)"
  check(pid, "pack id", isNonEmptyStr(pack.id), "missing pack id")
  check(pid, "pack field", isNonEmptyStr(pack.chapterId), "missing chapterId")
  check(pid, "pack field", isNonEmptyStr(pack.title), "missing title")
  check(pid, "pack field", isNonEmptyStr(pack.system), "missing system")
  check(pid, "pack field", pack.chapter && typeof pack.chapter === "object", "missing chapter metadata")
  if (pack.chapter && typeof pack.chapter === "object") {
    for (const f of ["id", "number", "title", "status"]) {
      check(pid, "chapter metadata", pack.chapter[f] !== undefined && pack.chapter[f] !== null, `chapter missing "${f}"`)
    }
    check(pid, "chapter id match", pack.chapter.id === pack.chapterId, `chapter.id ${pack.chapter.id} ≠ pack.chapterId ${pack.chapterId}`)
  }
  for (const coll of ["bones", "terms", "flashcards", "quiz"]) {
    check(pid, "pack collection", isArr(pack[coll]), `pack.${coll} must be an array`)
  }

  const boneIds = new Set()
  for (const bone of pack.bones ?? []) {
    validateBone(pack, bone)
    check(pid, "boneId unique in pack", !boneIds.has(bone.boneId), `duplicate boneId ${bone.boneId}`)
    boneIds.add(bone.boneId)
  }

  const termIds = new Set()
  for (const term of pack.terms ?? []) {
    validateTerm(pack, term)
    check(pid, "term id unique in pack", !termIds.has(term.id), `duplicate term id ${term.id}`)
    termIds.add(term.id)
    uniqueGlobal(pid, "term", term.id)
    // Bones references in ch7 terms must resolve to a bones entry.
    if (isNonEmptyStr(term.boneId) && pack.bones.length > 0) {
      check(pid, "term boneId resolves", boneIds.has(term.boneId), `term ${term.id} boneId ${term.boneId} not in pack.bones`)
    }
  }

  for (const card of pack.flashcards ?? []) {
    validateFlashcard(pack, card)
    uniqueGlobal(pid, "flashcard", card.id)
  }
  for (const item of pack.quiz ?? []) {
    validateQuizItem(pack, item)
    uniqueGlobal(pid, "quiz", item.id)
  }

  check(pid, "pack non-empty", (pack.terms?.length ?? 0) + (pack.flashcards?.length ?? 0) + (pack.quiz?.length ?? 0) > 0, "pack has no content at all")
}

console.log("Study Buddy pack smoke test — validating against pack-schema.md\n")
for (const pack of allPacks) {
  validatePack(pack)
}

const packIds = allPacks.map((p) => p.id)
const dupes = packIds.filter((id, i) => packIds.indexOf(id) !== i)
if (dupes.length) failures.push(`[registry] duplicate pack ids: ${dupes.join(", ")}`)

const totals = {
  packs: allPacks.length,
  bones: allPacks.reduce((n, p) => n + p.bones.length, 0),
  terms: allPacks.reduce((n, p) => n + p.terms.length, 0),
  flashcards: allPacks.reduce((n, p) => n + p.flashcards.length, 0),
  quiz: allPacks.reduce((n, p) => n + p.quiz.length, 0),
}

if (failures.length) {
  console.log("💥 SMOKE TEST FAILED — pack-schema.md violations:\n")
  for (const f of failures) console.log(`  ✗ ${f}`)
  console.log(`\n${failures.length} violation(s) across ${checks} checks.`)
  process.exit(1)
}

console.log(`✓ ${checks} checks passed across ${totals.packs} packs:`)
console.log(`  bones=${totals.bones} terms=${totals.terms} flashcards=${totals.flashcards} quiz=${totals.quiz}`)
console.log("\nSMOKE TEST PASSED ✅")
