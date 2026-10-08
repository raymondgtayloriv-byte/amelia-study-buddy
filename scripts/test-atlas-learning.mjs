import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import {
  atlasNameMatches,
  buildAtlasTargets,
  selectionMatchesConcept,
} from "../src/lib/atlasLearning.js"
import { packBonesCh7 } from "../src/data/packs/pack-bones-ch7.js"
import {
  COURSE_BONE_CONCEPT_NAMES,
  courseAtlasSelectionMatches,
  resolveCourseAtlasTarget,
  SUPPORTED_COURSE_BONE_IDS,
} from "../src/lib/courseAtlas.js"
import { generateClickBone } from "../src/quiz/engine.js"

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const atlas = JSON.parse(fs.readFileSync(path.join(repoRoot, "public/human-atlas/models/atlas.json"), "utf8"))
const concept = (name) => atlas.concepts.find((item) => item.name.toLowerCase() === name)
const partById = new Map(atlas.parts.map((part) => [part.id, part]))

const targets = buildAtlasTargets(atlas)
assert.equal(targets.length, 12, "all curated real-catalog challenges should resolve")
assert.equal(new Set(targets.map((item) => item.id)).size, targets.length, "challenge concepts should be distinct")

const leftFemur = concept("left femur")
const rightFemur = concept("right femur")
assert.ok(leftFemur?.elements.length, "the catalog should include left femur mesh references")
assert.ok(rightFemur?.elements.length, "the catalog should include right femur mesh references")
const leftMesh = leftFemur.elements[0]
const rightMesh = rightFemur.elements[0]

assert.equal(selectionMatchesConcept({ id: leftFemur.id, elements: [] }, leftFemur), true, "concept ID selection should match")
assert.equal(selectionMatchesConcept({ id: leftFemur.id, elements: [leftMesh] }, leftFemur), true, "a selected mesh belonging to the concept should match")
assert.equal(selectionMatchesConcept({ id: rightFemur.id, elements: [rightMesh] }, leftFemur), false, "contralateral anatomy must not match")
assert.equal(selectionMatchesConcept({ id: "unknown", elements: ["unknown-mesh"] }, leftFemur), false, "unrelated meshes must not match")
assert.equal(selectionMatchesConcept(null, leftFemur), false, "missing selections must not match")
assert.equal(selectionMatchesConcept({ id: leftFemur.id, elements: [] }, null), false, "missing targets must not match")

assert.equal(atlasNameMatches("  LEFT   FEMUR ", "left femur"), true, "typed recall should ignore case and extra whitespace")
assert.equal(atlasNameMatches("right femur", "left femur"), false, "typed recall should retain laterality")
assert.equal(atlasNameMatches("femur", "left femur"), false, "typed recall should require the named laterality")

const courseBones = packBonesCh7.bones
const supportedBones = courseBones.filter((bone) => SUPPORTED_COURSE_BONE_IDS.includes(bone.boneId))
const courseTargets = supportedBones.map((bone) => resolveCourseAtlasTarget(bone, atlas))
assert.ok(courseTargets.every(Boolean), "every supported course bone must resolve to exact named atlas concepts")
assert.ok(courseTargets.every((target) => target.elements.length > 0 && target.elements.every((id) => partById.has(id))), "every mapped mesh must exist in the real atlas")
assert.equal(new Set(SUPPORTED_COURSE_BONE_IDS).size, SUPPORTED_COURSE_BONE_IDS.length, "supported course IDs must be unique")
assert.ok(SUPPORTED_COURSE_BONE_IDS.every((id) => COURSE_BONE_CONCEPT_NAMES[id]?.length), "every supported course ID must have an explicit concept-name mapping")

const frontalTarget = resolveCourseAtlasTarget(courseBones.find((bone) => bone.boneId === "frontal-bone"), atlas)
const parietalTarget = resolveCourseAtlasTarget(courseBones.find((bone) => bone.boneId === "parietal-bone"), atlas)
assert.equal(courseAtlasSelectionMatches({ id: "selected-part", elements: [frontalTarget.elements[0]] }, frontalTarget), true, "the frontal bone mesh should match its course target")
assert.equal(courseAtlasSelectionMatches({ id: "selected-part", elements: [parietalTarget.elements[0]] }, frontalTarget), false, "a parietal bone mesh must not match the frontal bone target")

const clickQuestions = generateClickBone(packBonesCh7, { count: courseBones.length, seed: 42 })
assert.equal(clickQuestions.questions.length, supportedBones.length, "click-the-bone must omit course structures without precise atlas mappings")
assert.ok(clickQuestions.questions.every((question) => SUPPORTED_COURSE_BONE_IDS.includes(question.grading.boneId)), "every generated click target must resolve in the atlas")

console.log(`Atlas learning checks passed (${targets.length} general targets; ${supportedBones.length}/${courseBones.length} course bone targets mapped precisely).`)
