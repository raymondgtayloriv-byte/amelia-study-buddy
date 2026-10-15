export const ATLAS_SYSTEMS = [
  ["skeletal", "Skeleton"],
  ["muscular", "Muscles"],
  ["cardiac", "Heart"],
  ["nervous", "Nervous"],
  ["respiratory", "Respiratory"],
  ["digestive", "Digestive"],
  ["arterial", "Arteries"],
  ["venous", "Veins"],
  ["urinary", "Urinary"],
  ["lymphatic", "Lymphatic"],
  ["endocrine", "Endocrine"],
  ["integumentary", "Skin"],
  ["sensory", "Sensory"],
  ["reproductive", "Reproductive"],
  ["connective", "Connective"],
]

const CORE_TARGET_NAMES = [
  "heart",
  "brain",
  "left femur",
  "right humerus",
  "sternum",
  "liver",
  "stomach",
  "trachea",
  "left scapula",
  "right tibia",
  "urinary bladder",
  "pancreas",
]

const COURSE_BONE_TARGET_NAMES = [
  "frontal bone",
  "occipital bone",
  "sphenoid bone",
  "ethmoid",
  "vomer",
  "mandible",
  "hyoid bone",
  "atlas",
  "axis",
  "sternum",
  "sacrum",
  "left parietal bone",
  "right parietal bone",
  "left temporal bone",
  "right temporal bone",
  "left zygomatic bone",
  "right zygomatic bone",
  "left maxilla",
  "right maxilla",
  "left nasal bone",
  "right nasal bone",
  "left lacrimal bone",
  "right lacrimal bone",
  "left palatine bone",
  "right palatine bone",
  "left clavicle",
  "right clavicle",
  "left scapula",
  "right scapula",
  "left humerus",
  "right humerus",
  "left radius",
  "right radius",
  "left ulna",
  "right ulna",
  "left hip bone",
  "right hip bone",
  "left femur",
  "right femur",
  "left patella",
  "right patella",
  "left tibia",
  "right tibia",
  "left fibula",
  "right fibula",
  "left calcaneus",
  "right calcaneus",
  "left talus",
  "right talus",
]

const ORGAN_NEURO_TARGET_NAMES = [
  "heart",
  "trachea",
  "left lung",
  "right lung",
  "diaphragm",
  "esophagus",
  "stomach",
  "liver",
  "gallbladder",
  "pancreas",
  "spleen",
  "duodenum",
  "jejunum",
  "ileum",
  "rectum",
  "left kidney",
  "right kidney",
  "left ureter",
  "right ureter",
  "urinary bladder",
  "thymus",
  "brain",
  "cerebellum",
  "brainstem",
  "spinal cord",
  "corpus callosum",
  "thalamus",
  "hypothalamus",
]

const POSTERIOR_KEYWORDS = [
  "scapula",
  "occipital",
  "sacrum",
  "atlas",
  "axis",
  "vertebra",
  "spinal cord",
  "cerebellum",
  "kidney",
  "calcaneus",
  "gluteus",
  "trapezius",
  "latissimus",
]

const LATERAL_KEYWORDS = [
  "temporal",
  "zygomatic",
  "fibula",
  "mandible",
  "sphenoid",
  "parietal",
]

export function buildAtlasTargets(atlas) {
  if (!atlas?.concepts) return []
  return CORE_TARGET_NAMES
    .map((name) => atlas.concepts.find((concept) => concept.name.toLowerCase() === name))
    .filter(Boolean)
}

export function buildCourseBoneTargets(atlas) {
  if (!atlas?.concepts) return []
  const byName = new Map(atlas.concepts.map((concept) => [concept.name.toLowerCase(), concept]))
  return COURSE_BONE_TARGET_NAMES.map((name) => byName.get(name)).filter(Boolean)
}

export function buildOrganNeuroTargets(atlas) {
  if (!atlas?.concepts) return []
  const byName = new Map(atlas.concepts.map((concept) => [concept.name.toLowerCase(), concept]))
  return ORGAN_NEURO_TARGET_NAMES.map((name) => byName.get(name)).filter(Boolean)
}

export function selectionMatchesConcept(selection, concept) {
  if (!selection || !concept) return false
  return (
    selection.id === concept.id ||
    (selection.elements ?? []).some((id) => concept.elements.includes(id))
  )
}

export function atlasNameMatches(response, name) {
  return (
    String(response ?? "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ") ===
    String(name ?? "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ")
  )
}

function editDistance(a, b) {
  const m = a.length
  const n = b.length
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = 0; i <= m; i += 1) dp[i][0] = i
  for (let j = 0; j <= n; j += 1) dp[0][j] = j
  for (let i = 1; i <= m; i += 1) {
    for (let j = 1; j <= n; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      )
    }
  }
  return dp[m][n]
}

export function evaluateAtlasRecall(response, targetName) {
  const cleanInput = String(response ?? "").trim().toLowerCase().replace(/\s+/g, " ")
  const cleanTarget = String(targetName ?? "").trim().toLowerCase().replace(/\s+/g, " ")
  if (!cleanInput || !cleanTarget) {
    return { correct: false, close: false, kind: "empty", message: "Enter a structure name first." }
  }
  if (cleanInput === cleanTarget) {
    return {
      correct: true,
      close: false,
      kind: "exact",
      message: "Spot on! Now see it in full anatomical context.",
    }
  }
  const strippedTarget = cleanTarget.replace(/^(left|right)\s+/, "")
  const strippedInput = cleanInput.replace(/^(left|right)\s+/, "")
  if (cleanTarget !== strippedTarget && cleanInput === strippedTarget) {
    return {
      correct: false,
      close: true,
      kind: "laterality",
      message: `Right structure, but include laterality: “${targetName}”.`,
    }
  }
  if (cleanTarget !== strippedTarget && strippedInput === strippedTarget && cleanInput !== cleanTarget) {
    return {
      correct: false,
      close: true,
      kind: "contralateral",
      message: `Watch anatomical left vs. right — that side is “${targetName}”.`,
    }
  }
  const distance = editDistance(cleanInput, cleanTarget)
  if (cleanTarget.length >= 5 && distance <= 2) {
    return {
      correct: true,
      close: true,
      kind: "near-spelling",
      message: `Accepted with minor spelling fix: “${targetName}”.`,
    }
  }
  return {
    correct: false,
    close: false,
    kind: "wrong",
    message: `The atlas name is “${targetName}”. Explore it, then try another round.`,
  }
}

export function buildAtlasChoices(target, pool = [], count = 4) {
  if (!target) return []
  const candidates = pool.filter(
    (item) => item && item.id !== target.id && item.name.toLowerCase() !== target.name.toLowerCase(),
  )
  const distractors = []
  const seen = new Set([target.name.toLowerCase()])
  for (const item of candidates) {
    const key = item.name.toLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      distractors.push(item.name)
    }
    if (distractors.length >= count - 1) break
  }
  const choices = [target.name, ...distractors]
  for (let i = choices.length - 1; i > 0; i -= 1) {
    const j = (target.name.charCodeAt(i % target.name.length) + i * 7) % (i + 1)
    ;[choices[i], choices[j]] = [choices[j], choices[i]]
  }
  return choices
}

export function getAtlasHint(target, atlas) {
  if (!target || !atlas?.parts) {
    return { view: "three-quarter", systemLabel: "Anatomy", clue: "Rotate and zoom the model to inspect its region." }
  }
  const elementSet = new Set(target.elements ?? [])
  const matchedParts = atlas.parts.filter((part) => elementSet.has(part.id))
  const primarySystem = matchedParts[0]?.system ?? "skeletal"
  const systemEntry = ATLAS_SYSTEMS.find(([id]) => id === primarySystem)
  const systemLabel = systemEntry ? systemEntry[1] : primarySystem
  const lower = target.name.toLowerCase()
  let view = "front"
  if (POSTERIOR_KEYWORDS.some((kw) => lower.includes(kw))) {
    view = "back"
  } else if (LATERAL_KEYWORDS.some((kw) => lower.includes(kw))) {
    view = "side"
  }
  const lateralityHint = lower.startsWith("left ")
    ? "Located on the subject’s anatomical left (viewer’s right in anterior view)."
    : lower.startsWith("right ")
      ? "Located on the subject’s anatomical right (viewer’s left in anterior view)."
      : "Midline or bilaterally paired structure."
  const viewLabel =
    view === "back" ? "posterior (Back)" : view === "side" ? "lateral (Side)" : "anterior (Front)"
  return {
    systemId: primarySystem,
    systemLabel,
    view,
    clue: `${systemLabel} system · Best seen from ${viewLabel} view. ${lateralityHint}`,
  }
}
