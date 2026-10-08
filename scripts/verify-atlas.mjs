import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { gunzipSync } from "node:zlib"

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const modelsDir = path.join(repoRoot, "public/human-atlas/models")
const atlas = JSON.parse(fs.readFileSync(path.join(modelsDir, "atlas.json"), "utf8"))
const expectedSystems = [
  "arterial", "cardiac", "connective", "digestive", "endocrine", "integumentary",
  "lymphatic", "muscular", "nervous", "reproductive", "respiratory", "sensory",
  "skeletal", "urinary", "venous",
]

assert.equal(atlas.version, "BodyParts3D 4.0", "catalog must identify the shipped dataset")
assert.equal(atlas.source, "BodyParts3D")
assert.equal(atlas.sex, "male")
assert.equal(atlas.parts.length, 2234, "catalog mesh count must remain intact")
assert.equal(atlas.concepts.length, 3432, "catalog concept count must remain intact")
assert.equal(atlas.triangles, 2288268, "catalog triangle count must remain intact")
assert.equal(atlas.chunks.length, 15, "catalog must reference all fifteen model chunks")

const systems = [...new Set(atlas.parts.map((part) => part.system))].sort()
assert.deepEqual(systems, expectedSystems, "mesh system coverage must remain intact")
const partById = new Map(atlas.parts.map((part) => [part.id, part]))
assert.equal(partById.size, atlas.parts.length, "mesh IDs must be unique")
assert.equal(new Set(atlas.concepts.map((item) => item.id)).size, atlas.concepts.length, "concept IDs must be unique")
assert.ok(atlas.concepts.every((item) => typeof item.name === "string" && item.name.trim() && item.elements.length > 0), "every concept must be named and reference meshes")
assert.ok(atlas.concepts.every((item) => item.elements.every((id) => partById.has(id))), "all concept mesh references must resolve")

const chunkByIndex = new Map(atlas.chunks.map((chunk, index) => [index, chunk]))
assert.equal(chunkByIndex.size, atlas.chunks.length, "chunk indices must be unique and ordered")
let totalTriangles = 0
let verifiedBytes = 0

for (const [index, chunk] of atlas.chunks.entries()) {
  const fileName = path.basename(chunk.gzip)
  assert.equal(fileName, `body-${index}.bin.gz`, `chunk ${index} must use its matching gzip asset`)
  const compressedPath = path.join(modelsDir, fileName)
  const compressed = fs.readFileSync(compressedPath)
  assert.equal(compressed.byteLength, chunk.gzipBytes, `${fileName} compressed byte count must match the catalog`)
  const raw = gunzipSync(compressed)
  assert.equal(raw.byteLength, chunk.bytes, `${fileName} decompressed byte count must match the catalog`)
  verifiedBytes += raw.byteLength

  const parts = atlas.parts.filter((part) => part.chunk === index)
  assert.ok(parts.length > 0, `${fileName} must contain mesh data`)
  for (const part of parts) {
    assert.ok(Number.isInteger(part.vertexCount) && part.vertexCount > 0, `${part.id} must have vertices`)
    assert.ok(Number.isInteger(part.indexCount) && part.indexCount > 0 && part.indexCount % 3 === 0, `${part.id} must have triangular indices`)
    const ranges = [
      [part.positions, part.vertexCount * 12, "position"],
      [part.normals, part.vertexCount * 6, "normal"],
      [part.indices, part.indexCount * 2, "index"],
    ]
    for (const [offset, length, label] of ranges) {
      assert.ok(Number.isInteger(offset) && offset >= 0 && offset + length <= raw.byteLength, `${part.id} ${label} range must fit in ${fileName}`)
    }
    totalTriangles += part.indexCount / 3
  }
}

assert.equal(totalTriangles, atlas.triangles, "mesh index buffers must agree with the declared triangle total")
console.log(`Human Atlas verified: ${atlas.parts.length.toLocaleString()} meshes, ${atlas.concepts.length.toLocaleString()} concepts, ${systems.length} systems, ${atlas.chunks.length} gzip chunks, ${totalTriangles.toLocaleString()} triangles, ${verifiedBytes.toLocaleString()} decompressed bytes.`)
