import { packBiologyCh1 } from "./pack-biology-ch1.js"
import { packBiologyCh2 } from "./pack-biology-ch2.js"
import { packBiologyCh3 } from "./pack-biology-ch3.js"
import { packBiologyCh4 } from "./pack-biology-ch4.js"
import { packBiologyCh6 } from "./pack-biology-ch6.js"
import { packBiologyCh8 } from "./pack-biology-ch8.js"
import { packBiologyCh9 } from "./pack-biology-ch9.js"
import { packBonesCh7 } from "./pack-bones-ch7.js"

/**
 * Registry of unified content packs (see pack-schema.md).
 * Biology packs are verbatim derivations of src/data/studyData.js;
 * pack-bones-ch7.js is generated from src/data/bonesLabChapter7.js.
 */
export const allPacks = [
  packBiologyCh1,
  packBiologyCh2,
  packBiologyCh3,
  packBiologyCh4,
  packBiologyCh6,
  packBonesCh7,
  packBiologyCh8,
  packBiologyCh9,
]

export function getPackById(packId) {
  return allPacks.find((pack) => pack.id === packId) ?? null
}

export function getPackByChapter(chapterId) {
  return allPacks.find((pack) => pack.chapterId === chapterId) ?? null
}

/** Distinct system labels across all packs (used by name-the-system mode). */
export function getAllSystems() {
  const seen = new Set()
  for (const pack of allPacks) {
    if (pack.system) seen.add(pack.system)
    for (const term of pack.terms) {
      if (term.system) seen.add(term.system)
    }
  }
  return [...seen]
}
