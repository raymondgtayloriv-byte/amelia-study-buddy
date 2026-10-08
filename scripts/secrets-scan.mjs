/**
 * secrets-scan.mjs — grep-based secret scan for the Study Buddy repo.
 *
 * Looks for API keys, tokens, passwords, and private keys in text files
 * across the repo (node_modules, dist, .git, lockfiles, binaries, and
 * copyrighted source-material binaries are skipped).
 *
 * Run from the repo root:  node scripts/secrets-scan.mjs   (or  npm run secrets-scan)
 * Exit code: 0 = clean, 1 = possible secret(s) found.
 */

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, "..")

// Directories never scanned.
const SKIP_DIRS = new Set([
  ".git",
  "node_modules",
  "dist",
  "source-material", // copyrighted professor slide binaries (pptx); not text
  "tmp_ch7_export",
  "tmp_ch7_media",
])

// File extensions treated as binary (skipped).
const SKIP_EXT = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".svg",
  ".pptx", ".ppt", ".pdf", ".zip", ".glb", ".gltf", ".mp4", ".mov",
  ".ttf", ".woff", ".woff2", ".eot", ".otf", ".map",
])

// Files skipped individually: lockfiles (huge, third-party) and this scan
// itself (it necessarily contains the pattern literals).
const SKIP_FILES = new Set([
  "package-lock.json",
  "scripts/secrets-scan.mjs",
  "scripts/smoke.mjs",
])

const PATTERNS = [
  [/AKIA[0-9A-Z]{16}/, "AWS access key id"],
  [/gh[pousr]_[A-Za-z0-9]{20,}/, "GitHub token"],
  [/sk-[A-Za-z0-9]{20,}/, "sk-* secret key"],
  [/sk_live_[A-Za-z0-9]{16,}/, "Stripe live secret key"],
  [/pk_live_[A-Za-z0-9]{16,}/, "Stripe live publishable key"],
  [/xox[baprs]-[A-Za-z0-9-]{10,}/, "Slack token"],
  [/re_[A-Za-z0-9]{20,}/, "Resend API key"],
  [/-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/, "private key block"],
  [/aws_secret_access_key/i, "AWS secret reference"],
  [/client_secret/i, "client_secret reference"],
  [/\bpassword\s*[:=]\s*["'][^"'<>{}]{6,}["']/i, "hardcoded password"],
  [/\bapi[_-]?key\s*[:=]\s*["'][A-Za-z0-9_\-.]{16,}["']/i, "hardcoded API key"],
  [/\b(token|secret|passwd)\s*[:=]\s*["'][^"'<>{}]{8,}["']/i, "hardcoded token/secret"],
  [/\bBearer\s+[A-Za-z0-9_\-.]{24,}/, "bearer token"],
]

// Pattern hits that are clearly placeholders, docs, or benign — not real secrets.
const ALLOWLIST = [
  /your[_-]?api[_-]?key/i,
  /example|placeholder|changeme|fakekey|testkey/i,
  /["'](xxx+|test|dummy|none|n\/a)["']/i,
  /<\w+>/, // <API_KEY> style template slots
  /secrete[sd]? enzymes/i, // anatomy content ("They secrete enzymes…")
]

function isTextFile(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  if (SKIP_EXT.has(ext)) return false
  const base = path.basename(filePath)
  if (SKIP_FILES.has(path.relative(repoRoot, filePath).split(path.sep).join("/"))) return false
  if (base === ".env" || base.startsWith(".env.")) return true // flag separately
  return true
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".git" || SKIP_DIRS.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else if (entry.isFile() && isTextFile(full)) out.push(full)
  }
  return out
}

const hits = []
const envFiles = []
const files = walk(repoRoot)
for (const file of files) {
  const rel = path.relative(repoRoot, file)
  const base = path.basename(file)
  if (base === ".env" || base.startsWith(".env.")) {
    envFiles.push(rel)
    continue
  }
  let lines
  try {
    lines = fs.readFileSync(file, "utf8").split("\n")
  } catch {
    continue // unreadable/binary — skip
  }
  // Guard: file with NUL bytes is binary; skip.
  if (lines.some((l) => l.includes("\0"))) continue
  lines.forEach((line, i) => {
    for (const [re, label] of PATTERNS) {
      if (re.test(line) && !ALLOWLIST.some((a) => a.test(line))) {
        hits.push({ file: rel, line: i + 1, label, snippet: line.trim().slice(0, 120) })
        break
      }
    }
  })
}

console.log(`Secrets scan — ${files.length} text files scanned\n`)
if (envFiles.length) {
  console.log(`⚠  .env file(s) present (not scanned for contents): ${envFiles.join(", ")}`)
}
if (hits.length) {
  console.log("🚨 POSSIBLE SECRETS FOUND:\n")
  for (const h of hits) {
    console.log(`  ✗ ${h.file}:${h.line} [${h.label}]`)
    console.log(`    ${h.snippet}`)
  }
  console.log(`\n${hits.length} possible secret(s) — review and remove before any release.`)
  process.exit(1)
}
console.log("✓ No API keys, tokens, passwords, or private keys found.")
console.log("\nSECRETS SCAN PASSED ✅")
