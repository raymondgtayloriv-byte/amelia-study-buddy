import { selectionMatchesConcept } from "./atlasLearning.js"

// Only quiz targets that have an exact concept (or exact combined concepts)
// in the shipped atlas are listed here. Keep broad region overviews out.
export const COURSE_BONE_CONCEPT_NAMES = Object.freeze({
  "frontal-bone": ["frontal bone"],
  "parietal-bone": ["parietal bone"],
  "occipital-bone": ["occipital bone"],
  "temporal-bone": ["temporal bone"],
  "sphenoid-bone": ["sphenoid bone"],
  "ethmoid-bone": ["ethmoid"],
  mandible: ["mandible"],
  maxilla: ["maxilla"],
  "zygomatic-bone": ["zygomatic bone"],
  "palatine-bone": ["palatine bone"],
  "hyoid-bone": ["hyoid bone"],
  atlas: ["atlas"],
  axis: ["axis"],
  "cervical-vertebra": ["cervical vertebra"],
  "thoracic-vertebra": ["thoracic vertebra"],
  "lumbar-vertebra": ["lumbar vertebra"],
  sacrum: ["sacrum"],
  sternum: ["sternum"],
  ribs: ["rib"],
  clavicle: ["clavicle"],
  scapula: ["scapula"],
  humerus: ["humerus"],
  ulna: ["ulna"],
  radius: ["radius"],
  "hand-carpals": ["carpal bone"],
  "hand-phalanges": ["metacarpal bone", "phalanx of finger"],
  pelvis: ["hip bone"],
  femur: ["femur"],
  patella: ["patella"],
  "tibia-fibula": ["tibia", "fibula"],
  "foot-tarsals": ["tarsal bone"],
  "foot-phalanges": ["metatarsal bone", "phalanx of toe"],
})

export const SUPPORTED_COURSE_BONE_IDS = Object.freeze(
  Object.keys(COURSE_BONE_CONCEPT_NAMES),
)

export function resolveCourseAtlasTarget(bone, atlas) {
  if (!bone || !atlas || !Array.isArray(atlas.concepts)) return null
  const names = COURSE_BONE_CONCEPT_NAMES[bone.boneId]
  if (!names) return null

  const concepts = names.map((name) =>
    atlas.concepts.find((item) => item.name.trim().toLowerCase() === name),
  )
  if (concepts.some((concept) => !concept || !concept.elements?.length)) return null

  return {
    boneId: bone.boneId,
    label: bone.label,
    concepts,
    elements: [...new Set(concepts.flatMap((concept) => concept.elements))],
  }
}

export function courseAtlasSelectionMatches(selection, target) {
  if (!selection || !target?.concepts?.length) return false
  return target.concepts.some((concept) => selectionMatchesConcept(selection, concept))
}
