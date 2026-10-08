import { execFileSync } from "node:child_process"
import { createHash } from "node:crypto"
import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const vendor = join(root, "vendor", "human-atlas")
const buildDir = join(vendor, "dist")
const published = join(root, "public", "human-atlas")

function run(command, args) {
  execFileSync(command, args, { cwd: vendor, stdio: "inherit", shell: process.platform === "win32" })
}

async function digest(path) {
  return createHash("sha256").update(await readFile(path)).digest("hex")
}

async function preservedFileDigests() {
  const paths = [join(published, "models", "atlas.json"), join(published, "ATTRIBUTION.md")]
  for (let index = 0; index < 15; index += 1) paths.push(join(published, "models", `body-${index}.bin.gz`))
  const digests = new Map()
  for (const path of paths) {
    try {
      if ((await stat(path)).isFile()) digests.set(path, await digest(path))
      else throw new Error(`Required preserved file is missing: ${path}`)
    } catch (error) {
      throw new Error(`Cannot verify preserved Human Atlas data at ${path}: ${error.message}`)
    }
  }
  return digests
}

const before = await preservedFileDigests()
run(process.platform === "win32" ? "npm.cmd" : "npm", ["ci"])
run(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "build"])

const builtIndex = join(buildDir, "index.html")
const builtAssets = join(buildDir, "assets")
if (!(await stat(builtIndex)).isFile() || !(await stat(builtAssets)).isDirectory()) {
  throw new Error("The Human Atlas build did not produce index.html and assets/.")
}
const assetNames = await readdir(builtAssets)
if (!assetNames.some((name) => name.endsWith(".js")) || !assetNames.some((name) => name.endsWith(".css"))) {
  throw new Error("The Human Atlas build is missing its JavaScript or CSS bundle.")
}

const publishedAssets = resolve(published, "assets")
if (dirname(publishedAssets) !== resolve(published)) throw new Error("Refusing to publish outside public/human-atlas/assets.")
await rm(publishedAssets, { recursive: true, force: true })
await mkdir(publishedAssets, { recursive: true })
await cp(builtAssets, publishedAssets, { recursive: true })
await writeFile(join(published, "index.html"), await readFile(builtIndex))

for (const [path, expected] of before) {
  const actual = await digest(path)
  if (actual !== expected) throw new Error(`Preserved atlas data changed during build: ${path}`)
}
console.log(`Published Human Atlas index.html and ${assetNames.length} assets; preserved atlas catalog, 15 model chunks, and attribution.`)
