/**
 * generate-bones-pack.mjs
 *
 * Extracts Chapter 7 skeletal content from src/data/bonesLabChapter7.js and
 * emits src/data/packs/pack-bones-ch7.js in the unified pack format.
 *
 * Why a generator instead of an import: bonesLabChapter7.js imports .png
 * assets that only the Vite build can resolve, so this script statically
 * parses the data tables (regionRows, boneRows, structureGroups pushes) with
 * a balanced-bracket scanner and evaluates them as pure data literals.
 *
 * Zero-content-loss contract: every structure row and bone row in the source
 * must appear in the emitted pack. Run:
 *
 *   node scripts/generate-bones-pack.mjs
 *
 * from the repo root (~/workspace/study-buddy/work). After regenerating,
 * run scripts/verify-packs.mjs to confirm before/after counts match.
 */

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, "..")
const sourcePath = path.join(repoRoot, "src/data/bonesLabChapter7.js")
const outPath = path.join(repoRoot, "src/data/packs/pack-bones-ch7.js")

const src = fs.readFileSync(sourcePath, "utf8")

/** Scan forward from `start` (index of an opening bracket/paren) and return
 *  the full balanced literal, skipping strings, template literals, comments. */
function extractBalanced(text, start) {
  const open = text[start]
  const pairs = { "[": "]", "{": "}", "(": ")" }
  const close = pairs[open]
  if (!close) throw new Error(`Not a bracket at ${start}: ${open}`)
  const stack = [close]
  let i = start + 1
  let str = null // active quote char
  let escaped = false
  while (i < text.length && stack.length) {
    const ch = text[i]
    if (str) {
      if (escaped) escaped = false
      else if (ch === "\\") escaped = true
      else if (ch === str) str = null
    } else if (ch === '"' || ch === "'" || ch === "`") {
      str = ch
    } else if (ch === "/" && text[i + 1] === "/") {
      while (i < text.length && text[i] !== "\n") i += 1
    } else if (ch === "/" && text[i + 1] === "*") {
      i += 2
      while (i < text.length && !(text[i] === "*" && text[i + 1] === "/")) i += 1
      i += 1
    } else if (pairs[ch]) {
      stack.push(pairs[ch])
    } else if (ch === stack[stack.length - 1]) {
      stack.pop()
    }
    i += 1
  }
  if (stack.length) throw new Error(`Unbalanced brackets from ${start}`)
  return text.slice(start, i)
}

/** Find `const <name> =` and return the evaluated array literal. */
function extractConstArray(name) {
  const marker = `const ${name} =`
  const idx = src.indexOf(marker)
  if (idx === -1) throw new Error(`Missing ${name}`)
  const bracket = src.indexOf("[", idx + marker.length)
  const literal = extractBalanced(src, bracket)
  return new Function(`return (${literal})`)()
}

/** Find every `structureGroups.push(` call and return the evaluated objects. */
function extractGroupPushes() {
  const groups = []
  const marker = "structureGroups.push("
  let idx = 0
  while (true) {
    idx = src.indexOf(marker, idx)
    if (idx === -1) break
    const paren = src.indexOf("(", idx + marker.length - 1)
    const call = extractBalanced(src, paren)
    // A push call may contain several { boneId, viewId, items } objects.
    let j = 1 // skip the opening paren
    while (j < call.length - 1) {
      const ch = call[j]
      if (ch === "{") {
        const literal = extractBalanced(call, j)
        groups.push(new Function(`return (${literal})`)())
        j += literal.length
      } else {
        j += 1
      }
    }
    idx = paren + call.length
  }
  return groups
}

const regionRows = extractConstArray("regionRows")
const boneRows = extractConstArray("boneRows")
const groups = extractGroupPushes()

const CHAPTER_ID = "chapter-7"
const CHAPTER_LABEL = "Chapter 7 • The Skeletal System"
const SYSTEM = "Skeletal system"

const regionsById = Object.fromEntries(
  regionRows.map(([id, label, description]) => [
    id,
    { id, label, description, chapterId: CHAPTER_ID, chapterLabel: CHAPTER_LABEL },
  ]),
)
const bonesById = Object.fromEntries(
  boneRows.map(([id, label, regionId, description]) => [
    id,
    { id, label, regionId, description },
  ]),
)

function promptFromDefinition(definition) {
  const trimmed = definition.replace(/\.$/, "").replace(/^The\s+/i, "")
  return `Identify ${trimmed.charAt(0).toLowerCase()}${trimmed.slice(1)}.`
}

const terms = []
for (const { boneId, viewId, items } of groups) {
  const bone = bonesById[boneId]
  if (!bone) throw new Error(`Unknown boneId ${boneId}`)
  const region = regionsById[bone.regionId]
  for (const item of items) {
    const [id, term, definition, location, hint, note = "", aliases = []] = item
    terms.push({
      id,
      term,
      definition,
      chapterId: CHAPTER_ID,
      chapter: "chapter-7",
      system: SYSTEM,
      boneId,
      boneLabel: bone.label,
      regionId: region.id,
      regionLabel: region.label,
      viewId,
      aliases,
      identifyPrompt: promptFromDefinition(definition),
      location,
      hint,
      note:
        note ||
        `High-yield Chapter 7 landmark from the ${bone.label.toLowerCase()} study set.`,
    })
  }
}

const bones = boneRows.map(([id, label, regionId, description]) => ({
  boneId: id,
  label,
  regionId,
  regionLabel: regionsById[regionId].label,
  description,
  system: SYSTEM,
}))

const json = (value) => JSON.stringify(value, null, 2)

// Chapter 7 flashcards + pre-authored quiz items live in studyData.js — copy
// them verbatim so this pack is the complete Chapter 7 content container.
const studyData = await import(path.join(repoRoot, "src/data/studyData.js"))
const chapter7Flashcards = studyData.flashcards  .filter((card) => card.chapterId === "chapter-7")
  .map((card) => ({
    id: card.id,
    chapterId: card.chapterId,
    category: card.category,
    front: card.front,
    back: card.back,
    note: card.note,
  }))
const chapter7Quiz = studyData.quizQuestionBank
  .filter((question) => question.chapterId === "chapter-7")
  .map((question) => ({
    id: question.id,
    chapterId: question.chapterId,
    type: question.type,
    prompt: question.prompt,
    options: question.options,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
  }))

// Chapter 7 chapter-vocabulary terms (exact strings; definition intentionally
// null — same rule as the biology packs).
const chapter7 = studyData.chapters.find((c) => c.id === "chapter-7")
const chapter7VocabTerms = (chapter7.vocabulary ?? []).map((term, index) => ({
  id: `chapter-7-vocab-${index + 1}`,
  term,
  definition: null,
  chapterId: "chapter-7",
  chapter: "chapter-7",
  system: SYSTEM,
  boneId: null,
  boneLabel: null,
  regionId: null,
  regionLabel: null,
  viewId: null,
  aliases: [],
  identifyPrompt: null,
  location: null,
  hint: null,
  note: null,
}))

const allTerms = [...terms, ...chapter7VocabTerms]

const file = `/**
 * pack-bones-ch7.js — GENERATED FILE. Do not edit by hand.
 *
 * Generated from src/data/bonesLabChapter7.js by
 *   node scripts/generate-bones-pack.mjs
 * Regenerate after editing the source data, then run
 * scripts/verify-packs.mjs to confirm zero content loss.
 *
 * Content is identical to the source (same terms, same facts) — only the
 * container shape follows the unified pack format documented in
 * src/data/packs/pack-schema.md.
 */

export const packBonesCh7 = ${json({
  id: "pack-bones-ch7",
  chapterId: "chapter-7",
  title: "Chapter 7 — The Skeleton (Bones Lab structures)",
  system: SYSTEM,
  chapter: {
    id: "chapter-7",
    number: 7,
    title: "The Skeleton",
    status: "ready",
  },
  bones,
  terms: allTerms,
  flashcards: chapter7Flashcards,
  quiz: chapter7Quiz,
})}
`

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, file)
console.log(
  `wrote ${path.relative(repoRoot, outPath)} — ${allTerms.length} terms (${terms.length} structures + ${chapter7VocabTerms.length} vocab), ${bones.length} bones, ${chapter7Flashcards.length} flashcards, ${chapter7Quiz.length} quiz items`,
)
