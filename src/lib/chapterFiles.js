import { MAX_CHAPTER_FILE_BYTES } from "./chapterImport.js"

export const MAX_CHAPTER_UPLOAD_BYTES = 25 * 1024 * 1024
const MAX_PPTX_XML_BYTES = 8 * 1024 * 1024
const MAX_PPTX_SLIDES = 500

function abortError() {
  return new DOMException("File extraction was cancelled.", "AbortError")
}

function throwIfAborted(signal) {
  if (signal?.aborted) throw abortError()
}

function extensionOf(fileName) {
  return fileName.toLowerCase().split(".").pop()
}

function normalizeSlideTarget(target) {
  if (!target || target.includes(":") || target.includes("\\")) return null
  const segments = (target.startsWith("/") ? target.slice(1) : `ppt/${target}`).split("/")
  const normalized = []
  for (const segment of segments) {
    if (!segment || segment === ".") continue
    if (segment === "..") {
      if (normalized.length === 0) return null
      normalized.pop()
    } else {
      normalized.push(segment)
    }
  }
  const path = normalized.join("/")
  return /^ppt\/slides\/slide\d+\.xml$/.test(path) ? path : null
}

function parseXml(xml, parseXmlDocument) {
  if (xml.length > MAX_PPTX_XML_BYTES) throw new Error("This PowerPoint contains unusually large XML and cannot be safely extracted.")
  if (/<!DOCTYPE|<!ENTITY/i.test(xml)) throw new Error("This PowerPoint contains unsupported XML declarations.")
  const parser = parseXmlDocument ?? ((source) => {
    if (typeof DOMParser === "undefined") throw new Error("PowerPoint text extraction requires a browser with XML support.")
    return new DOMParser().parseFromString(source, "application/xml")
  })
  const document = parser(xml)
  if (document.querySelector?.("parsererror") || document.getElementsByTagName?.("parsererror")?.length) {
    throw new Error("This PowerPoint contains malformed XML and could not be read.")
  }
  return document
}

function elementsByLocalName(document, name) {
  return document.getElementsByTagNameNS("*", name)
}

function extractSlideParagraphs(xml, parseXmlDocument) {
  const document = parseXml(xml, parseXmlDocument)
  const paragraphs = [...elementsByLocalName(document, "p")]
    .map((paragraph) => [...elementsByLocalName(paragraph, "t")].map((run) => run.textContent ?? "").join(""))
    .filter((paragraph) => paragraph.trim())
  if (paragraphs.length) return paragraphs
  return [...elementsByLocalName(document, "t")].map((run) => run.textContent ?? "").filter((text) => text.trim())
}

export function extractPptxTextFromXml({ presentationXml, relationshipsXml, slideXmlByPath }, parseXmlDocument) {
  if (!presentationXml || !relationshipsXml) throw new Error("This PowerPoint is missing its slide index and cannot be read.")
  const presentation = parseXml(presentationXml, parseXmlDocument)
  const relationships = parseXml(relationshipsXml, parseXmlDocument)
  const targets = new Map()
  for (const relationship of elementsByLocalName(relationships, "Relationship")) {
    if (relationship.getAttribute("TargetMode") === "External") continue
    const id = relationship.getAttribute("Id")
    const path = normalizeSlideTarget(relationship.getAttribute("Target"))
    if (id && path) targets.set(id, path)
  }

  const order = [...elementsByLocalName(presentation, "sldId")]
  if (!order.length) throw new Error("No slides were found in this PowerPoint file.")
  if (order.length > MAX_PPTX_SLIDES) throw new Error(`PowerPoint files can contain at most ${MAX_PPTX_SLIDES} slides for text import.`)
  const slideNotes = []
  order.forEach((slideId, index) => {
    const relationshipId = slideId.getAttributeNS?.("http://schemas.openxmlformats.org/officeDocument/2006/relationships", "id")
      ?? slideId.getAttribute("{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id")
      ?? slideId.getAttribute("r:id")
    const path = targets.get(relationshipId)
    const xml = path && slideXmlByPath[path]
    if (!xml) throw new Error(`PowerPoint slide ${index + 1} is missing or uses an unsupported relationship.`)
    const paragraphs = extractSlideParagraphs(xml, parseXmlDocument)
    if (paragraphs.length) slideNotes.push(`Slide ${index + 1}\n${paragraphs.join("\n")}`)
  })
  const text = slideNotes.join("\n\n")
  if (!text.trim()) throw new Error("No readable slide text was found in this PowerPoint file.")
  if (new TextEncoder().encode(text).byteLength > MAX_CHAPTER_FILE_BYTES) throw new Error("Extracted notes exceed 2 MB. Split the source into smaller files.")
  return text
}

async function unzipPowerPointXml(data, signal) {
  const { Unzip, UnzipInflate, UnzipPassThrough, strFromU8 } = await import("fflate")
  throwIfAborted(signal)
  return new Promise((resolve, reject) => {
    const entries = Object.create(null)
    let totalBytes = 0
    let slideCount = 0
    let failed = false
    const fail = (error) => {
      if (failed) return
      failed = true
      reject(error)
    }
    const zip = new Unzip((file) => {
      if (failed) return
      const name = file.name.replaceAll("\\", "/")
      const isIndex = name === "ppt/presentation.xml" || name === "ppt/_rels/presentation.xml.rels"
      const isSlide = /^ppt\/slides\/slide\d+\.xml$/.test(name)
      if (!isIndex && !isSlide) return
      if (isSlide && ++slideCount > MAX_PPTX_SLIDES) {
        fail(new Error(`PowerPoint files can contain at most ${MAX_PPTX_SLIDES} slides for text import.`))
        file.terminate()
        return
      }
      if (Object.hasOwn(entries, name)) {
        fail(new Error("This PowerPoint contains duplicate slide XML entries."))
        file.terminate()
        return
      }
      if (file.originalSize !== undefined && file.originalSize > MAX_PPTX_XML_BYTES) {
        fail(new Error("This PowerPoint contains unusually large XML and cannot be safely extracted."))
        file.terminate()
        return
      }
      const chunks = []
      let size = 0
      file.ondata = (error, chunk, final) => {
        if (error) {
          fail(new Error("This PowerPoint archive is damaged or uses unsupported compression."))
          return
        }
        size += chunk.byteLength
        totalBytes += chunk.byteLength
        if (size > MAX_PPTX_XML_BYTES || totalBytes > MAX_PPTX_XML_BYTES) {
          fail(new Error("This PowerPoint contains unusually large XML and cannot be safely extracted."))
          file.terminate()
          return
        }
        chunks.push(chunk)
        if (final) {
          const content = new Uint8Array(size)
          let offset = 0
          for (const part of chunks) {
            content.set(part, offset)
            offset += part.byteLength
          }
          entries[name] = strFromU8(content)
        }
      }
      try {
        file.start()
      } catch {
        fail(new Error("This PowerPoint archive is damaged or uses unsupported compression."))
      }
    })
    zip.register(UnzipInflate)
    zip.register(UnzipPassThrough)
    try {
      zip.push(data, true)
      if (!failed) resolve(entries)
    } catch {
      fail(new Error("This PowerPoint archive could not be opened."))
    }
  })
}

export async function extractPowerPointText(file, { signal, parseXmlDocument } = {}) {
  const data = new Uint8Array(await file.arrayBuffer())
  throwIfAborted(signal)
  const entries = await unzipPowerPointXml(data, signal)
  throwIfAborted(signal)
  const slideXmlByPath = Object.create(null)
  for (const [path, xml] of Object.entries(entries)) {
    if (/^ppt\/slides\/slide\d+\.xml$/.test(path)) slideXmlByPath[path] = xml
  }
  return extractPptxTextFromXml({
    presentationXml: entries["ppt/presentation.xml"],
    relationshipsXml: entries["ppt/_rels/presentation.xml.rels"],
    slideXmlByPath,
  }, parseXmlDocument)
}

async function loadPdfJs() {
  const [pdfjs, worker] = await Promise.all([
    import("pdfjs-dist"),
    import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
  ])
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default
  return pdfjs
}

export async function extractPdfText(file, { signal, onProgress, pdfjs: injectedPdfjs } = {}) {
  throwIfAborted(signal)
  const pdfjs = injectedPdfjs ?? await loadPdfJs()
  const data = new Uint8Array(await file.arrayBuffer())
  throwIfAborted(signal)
  const loadingTask = pdfjs.getDocument({ data, isEvalSupported: false, useWorkerFetch: false, enableXfa: false, verbosity: 0 })
  const cancel = () => { void loadingTask.destroy() }
  signal?.addEventListener("abort", cancel, { once: true })
  try {
    const document = await loadingTask.promise
    const pages = []
    let textBytes = 0
    onProgress?.({ current: 0, total: document.numPages })
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      throwIfAborted(signal)
      const page = await document.getPage(pageNumber)
      const content = await page.getTextContent({ includeMarkedContent: false })
      const pageText = content.items
        .map((item) => "str" in item ? `${item.str}${item.hasEOL ? "\n" : " "}` : "")
        .join("")
        .replace(/[ \t]+\n/g, "\n")
        .trim()
      if (pageText) {
        const section = `Page ${pageNumber}\n${pageText}`
        textBytes += new TextEncoder().encode(section).byteLength + 2
        if (textBytes > MAX_CHAPTER_FILE_BYTES) throw new Error("Extracted notes exceed 2 MB. Split the source into smaller files.")
        pages.push(section)
      }
      onProgress?.({ current: pageNumber, total: document.numPages })
    }
    const text = pages.join("\n\n")
    if (!text) throw new Error("This PDF has no readable text. Use a text PDF or export notes; scanned-image OCR is not supported.")
    return text
  } finally {
    signal?.removeEventListener("abort", cancel)
    await loadingTask.destroy()
  }
}

export async function extractChapterFileText(file, { signal, onProgress, parseXmlDocument } = {}) {
  const extension = extensionOf(file.name)
  const plainText = ["txt", "md", "json"].includes(extension)
  if (!plainText && !["pdf", "pptx"].includes(extension)) {
    throw new Error("Supported files are .txt, .md, .json, .pdf, and .pptx.")
  }
  const limit = plainText ? MAX_CHAPTER_FILE_BYTES : MAX_CHAPTER_UPLOAD_BYTES
  if (file.size > limit) throw new Error(plainText ? "Text and JSON files must be smaller than 2 MB." : "PDF and PowerPoint files must be smaller than 25 MB.")
  throwIfAborted(signal)
  if (extension === "pptx") {
    onProgress?.("Extracting slide text…")
    const text = await extractPowerPointText(file, { signal, parseXmlDocument })
    return { fileName: `${file.name.replace(/\.pptx$/i, "")}.txt`, text }
  }
  if (extension === "pdf") {
    const text = await extractPdfText(file, { signal, onProgress: (progress) => {
      onProgress?.(`Extracting PDF page ${progress.current} of ${progress.total}…`)
    } })
    return { fileName: `${file.name.replace(/\.pdf$/i, "")}.txt`, text }
  }
  return { fileName: file.name, text: await file.text() }
}
