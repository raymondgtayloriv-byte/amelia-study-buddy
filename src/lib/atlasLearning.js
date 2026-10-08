export const ATLAS_SYSTEMS = [
  ["skeletal","Skeleton"],["muscular","Muscles"],["cardiac","Heart"],["nervous","Nervous"],["respiratory","Respiratory"],["digestive","Digestive"],["arterial","Arteries"],["venous","Veins"],["urinary","Urinary"],["lymphatic","Lymphatic"],["endocrine","Endocrine"],["integumentary","Skin"],["sensory","Sensory"],["reproductive","Reproductive"],["connective","Connective"],
]
export function buildAtlasTargets(atlas) {
  const names = ["heart","brain","left femur","right humerus","sternum","liver","stomach","trachea","left scapula","right tibia","urinary bladder","pancreas"]
  return names.map(name => atlas.concepts.find(concept => concept.name.toLowerCase() === name)).filter(Boolean)
}
export function selectionMatchesConcept(selection, concept) {
  if (!selection || !concept) return false
  return selection.id === concept.id || (selection.elements ?? []).some(id => concept.elements.includes(id))
}
export function atlasNameMatches(response, name) {
  return response.trim().toLowerCase().replace(/\s+/g," ") === name.trim().toLowerCase().replace(/\s+/g," ")
}
