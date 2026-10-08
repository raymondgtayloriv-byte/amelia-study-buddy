import assert from "node:assert/strict"
import { zipSync, strToU8 } from "fflate"
import { MAX_CHAPTER_FILE_BYTES, parseChapterImport } from "../src/lib/chapterImport.js"
import {
  MAX_CHAPTER_UPLOAD_BYTES,
  extractChapterFileText,
  extractPdfText,
  extractPowerPointText,
  extractPptxTextFromXml,
} from "../src/lib/chapterFiles.js"

function makeXmlParser(source) {
  function elements(xml, localName) {
    const escapedName = localName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const paired = new RegExp(`<(?:(?:[\\w.-]+):)?${escapedName}\\b([^>]*)>([\\s\\S]*?)<\\/(?:(?:[\\w.-]+):)?${escapedName}\\s*>`, "g")
    const selfClosing = new RegExp(`<(?:(?:[\\w.-]+):)?${escapedName}\\b([^>]*)\\/>`, "g")
    const matches = []
    for (const match of xml.matchAll(paired)) matches.push({ attributes: match[1], inner: match[2] })
    for (const match of xml.matchAll(selfClosing)) matches.push({ attributes: match[1], inner: "" })
    return matches.map(({ attributes, inner }) => ({
      getAttribute(name) {
        const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        const attribute = new RegExp(`(?:^|\\s)${escaped}\\s*=\\s*(["'])(.*?)\\1`).exec(attributes)
        return attribute?.[2] ?? null
      },
      getAttributeNS(_namespace, name) { return this.getAttribute(`r:${name}`) },
      get textContent() {
        return inner.replace(/<[^>]+>/g, "").replaceAll("&amp;", "&").replaceAll("&lt;", "<").replaceAll("&gt;", ">")
      },
      getElementsByTagNameNS(_namespace, name) { return elements(inner, name) },
    }))
  }
  return {
    querySelector() { return null },
    getElementsByTagName(name) { return elements(source, name) },
    getElementsByTagNameNS(_namespace, name) { return elements(source, name) },
  }
}

function makePdfFixture(text) {
  const stream = `BT /F1 16 Tf 72 720 Td (${text}) Tj ET`
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`,
  ]
  let pdf = "%PDF-1.4\n"
  const offsets = [0]
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf))
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`
  })
  const xrefOffset = Buffer.byteLength(pdf)
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  for (const offset of offsets.slice(1)) pdf += `${String(offset).padStart(10, "0")} 00000 n \n`
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
  return new Blob([pdf], { type: "application/pdf" })
}

const notes = "# Membranes\n\nKeep this wording exactly.\n"
const plain = parseChapterImport({ fileName: "membranes.md", text: notes, number: 3, title: "Cell Membranes", sourceType: "supplemental" })
assert.equal(plain.id, "imported-cell-membranes-ch3")
assert.equal(plain.sourceType, "supplemental")
assert.equal(plain.notes, notes)
assert.equal(plain.detailSummary, notes)
assert.deepEqual(plain.flashcards, [])
assert.deepEqual(plain.questions, [])

const pack = {
  id: "chapter-4", number: 4, title: "Transport",
  flashcards: [{ id: "fc-1", front: "Define diffusion", back: "Movement down a concentration gradient" }],
  questions: [{ id: "q-1", prompt: "Which is passive?", options: ["Diffusion", "Active transport"], correctAnswer: "Diffusion" }],
}
const structured = parseChapterImport({ fileName: "transport.json", text: JSON.stringify(pack), number: 99, title: "Ignored form title", sourceType: "course" })
assert.equal(structured.id, "imported-chapter-4")
assert.equal(structured.number, 4)
assert.equal(structured.title, "Transport")
assert.equal(structured.flashcards[0].chapterId, structured.id)
assert.equal(structured.flashcards[0].id, `${structured.id}::fc-1`)
assert.equal(structured.questions[0].id, `${structured.id}::q-1`)
assert.equal(structured.questions[0].correctAnswer, "Diffusion")
const renamedPack = { ...pack, title: "Cellular Transport" }
const renamed = parseChapterImport({ fileName: "transport.json", text: JSON.stringify(renamedPack), sourceType: "course" })
assert.equal(renamed.id, structured.id, "Changing a JSON title must preserve the pack identity.")
assert.equal(renamed.flashcards[0].id, structured.flashcards[0].id, "Changing a title must preserve namespaced item IDs.")
assert.equal(renamed.questions[0].id, structured.questions[0].id)
assert.equal(renamed.title, "Cellular Transport")

assert.throws(() => parseChapterImport({ fileName: "bad.json", text: JSON.stringify({ ...pack, questions: [{ ...pack.questions[0], correctAnswer: "Missing" }] }), sourceType: "course" }), /must exactly match/)
assert.throws(() => parseChapterImport({ fileName: "bad.json", text: JSON.stringify({ ...pack, id: "x".repeat(101) }), sourceType: "course" }), /100 characters or fewer/)
assert.throws(() => parseChapterImport({ fileName: "bad.json", text: JSON.stringify({ ...pack, flashcards: [{ ...pack.flashcards[0], id: "same" }], questions: [{ ...pack.questions[0], id: "same" }] }), sourceType: "course" }), /Duplicate item id/)
assert.throws(() => parseChapterImport({ fileName: "slides.pptx", text: "data", sourceType: "course" }), /Extract this file/)
assert.throws(() => parseChapterImport({ fileName: "large.txt", text: "x".repeat(MAX_CHAPTER_FILE_BYTES + 1), number: 1, title: "Too large", sourceType: "course" }), /smaller than 2 MB/)

const pptxEntries = {
  "ppt/presentation.xml": strToU8('<p:presentation xmlns:p="urn:p"><p:sldIdLst><p:sldId r:id="rId2"/><p:sldId r:id="rId1"/></p:sldIdLst></p:presentation>'),
  "ppt/_rels/presentation.xml.rels": strToU8('<Relationships><Relationship Id="rId1" Target="slides/slide1.xml"/><Relationship Id="rId2" Target="/ppt/slides/slide2.xml"/><Relationship Id="external" Target="https://example.invalid/slide.xml" TargetMode="External"/></Relationships>'),
  "ppt/slides/slide1.xml": strToU8('<p:sld xmlns:p="urn:p" xmlns:a="urn:a"><p:sp><a:p><a:r><a:t>First slide</a:t></a:r></a:p><a:p><a:r><a:t>First slide second paragraph</a:t></a:r></a:p></p:sp></p:sld>'),
  "ppt/slides/slide2.xml": strToU8('<p:sld xmlns:p="urn:p" xmlns:a="urn:a"><p:sp><a:p><a:r><a:t>Second slide &amp; notes</a:t></a:r></a:p></p:sp></p:sld>'),
}
const pptxBytes = zipSync(pptxEntries)
const pptxFile = {
  name: "Lecture 05.pptx",
  size: pptxBytes.byteLength,
  arrayBuffer: async () => pptxBytes.buffer.slice(pptxBytes.byteOffset, pptxBytes.byteOffset + pptxBytes.byteLength),
}
const extractedSlides = await extractPowerPointText(pptxFile, { parseXmlDocument: makeXmlParser })
assert.equal(extractedSlides, "Slide 1\nSecond slide & notes\n\nSlide 2\nFirst slide\nFirst slide second paragraph")
const pptxImportText = await extractChapterFileText(pptxFile, { parseXmlDocument: makeXmlParser })
const importedSlides = parseChapterImport({
  ...pptxImportText, sourceLabel: pptxFile.name, number: 5, title: "Lecture Notes", sourceType: "course",
})
assert.equal(importedSlides.sourceLabel, "Lecture 05.pptx")
assert.equal(importedSlides.notes, extractedSlides)
assert.deepEqual(importedSlides.questions, [])
assert.throws(() => extractPptxTextFromXml({
  presentationXml: "<!DOCTYPE p [<!ENTITY x SYSTEM 'file:///secret'>]><p:presentation/>",
  relationshipsXml: "<Relationships/>", slideXmlByPath: {},
}, makeXmlParser), /unsupported XML declarations/)

const oversizedPptx = { name: "large.pptx", size: MAX_CHAPTER_UPLOAD_BYTES + 1, arrayBuffer: async () => { throw new Error("must reject before reading") } }
await assert.rejects(extractChapterFileText(oversizedPptx), /smaller than 25 MB/)

const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs")
pdfjs.GlobalWorkerOptions.workerSrc = new URL("../node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs", import.meta.url).href
const pdfText = await extractPdfText(makePdfFixture("Text extracted from PDF."), { pdfjs })
assert.match(pdfText, /Text extracted from PDF\./)
await assert.rejects(extractPdfText(makePdfFixture(""), { pdfjs }), /This PDF has no readable text\. Use a text PDF or export notes; scanned-image OCR is not supported\./)

console.log("Chapter import validation passed.")
