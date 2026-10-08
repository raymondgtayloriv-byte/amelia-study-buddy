import { useEffect, useRef, useState } from "react"
import { Download, FilePlus2, Trash2 } from "lucide-react"
import { chapterImportTemplate, parseChapterImport } from "../lib/chapterImport"
import { extractChapterFileText } from "../lib/chapterFiles"

const formatBytes = (bytes) => `${(bytes / 1024).toFixed(0)} KB`

export function ChapterImportView({ importedChapters = [], onImport, onRemove, initialNumber = 5, initialTitle = "" }) {
  const [file, setFile] = useState(null)
  const [number, setNumber] = useState(initialNumber)
  const [title, setTitle] = useState(initialTitle)
  const [sourceType, setSourceType] = useState("course")
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [processingMessage, setProcessingMessage] = useState("")
  const readVersion = useRef(0)
  const readController = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => () => {
    readVersion.current += 1
    readController.current?.abort()
  }, [])

  function invalidatePreview() {
    readVersion.current += 1
    readController.current?.abort()
    readController.current = null
    setPreview(null)
    setError("")
    setLoading(false)
    setProcessingMessage("")
  }

  function resetSelection(nextFile) {
    invalidatePreview()
    setFile(nextFile)
    if (nextFile && !title) setTitle(nextFile.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "))
  }

  async function preparePreview(event) {
    event.preventDefault()
    const version = ++readVersion.current
    if (!file) {
      setError("Choose a .txt, .md, .json, .pdf, or .pptx file first.")
      return
    }
    const controller = new AbortController()
    readController.current = controller
    setLoading(true)
    setError("")
    setPreview(null)
    setProcessingMessage("Reading local file…")
    try {
      const extracted = await extractChapterFileText(file, {
        signal: controller.signal,
        onProgress: (message) => {
          if (version === readVersion.current) setProcessingMessage(message)
        },
      })
      if (version !== readVersion.current) return
      const chapter = parseChapterImport({
        fileName: extracted.fileName,
        sourceLabel: file.name,
        text: extracted.text,
        number: Number(number),
        title,
        sourceType,
      })
      if (version === readVersion.current) setPreview(chapter)
    } catch (caught) {
      if (version === readVersion.current && caught?.name !== "AbortError") setError(caught instanceof Error ? caught.message : "The file could not be imported.")
    } finally {
      if (version === readVersion.current) {
        setLoading(false)
        setProcessingMessage("")
        readController.current = null
      }
    }
  }

  function saveImport() {
    if (!preview) return
    onImport?.(preview)
    setPreview(null)
    setFile(null)
    setError("")
    if (inputRef.current) inputRef.current.value = ""
  }

  function downloadTemplate() {
    const blob = new Blob([chapterImportTemplate()], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = "chapter-pack-template.json"
    anchor.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <div className="space-y-5">
      <section className="panel p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Local chapter import</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-900">Add your chapter materials</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Files stay on this device while text is extracted. Text and Markdown stay verbatim; PDF and PowerPoint files contribute readable text only. Nothing is converted into invented questions. JSON packs can include flashcards and multiple-choice questions.
            </p>
          </div>
          <button className="action action-secondary" type="button" onClick={downloadTemplate}>
            <Download size={16} aria-hidden="true" /> Download JSON template
          </button>
        </div>

        <form className="mt-5 space-y-4" noValidate onSubmit={preparePreview}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="field">
              <span>Chapter number</span>
              <input type="number" min="1" max="999" step="1" value={number} onChange={(event) => { invalidatePreview(); setNumber(event.target.value) }} />
            </label>
            <label className="field">
              <span>Chapter title</span>
              <input type="text" maxLength="200" value={title} onChange={(event) => { invalidatePreview(); setTitle(event.target.value) }} placeholder="For example, Cell Structure" />
            </label>
          </div>
          <p className="text-xs text-slate-500">The chapter number and title above apply to text, PDF, and PowerPoint files. JSON packs include their own chapter metadata.</p>
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-slate-700">Material source</legend>
            <div className="flex flex-wrap gap-3">
              {[ ["course", "Course material"], ["supplemental", "Supplemental material"] ].map(([value, label]) => (
                <label key={value} className="flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700">
                  <input type="radio" name="sourceType" value={value} checked={sourceType === value} onChange={() => { invalidatePreview(); setSourceType(value) }} />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="field">
            <span>Choose a local file</span>
            <input
              ref={inputRef}
              type="file"
              accept=".txt,.md,.json,.pdf,.pptx,text/plain,text/markdown,application/json,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation"
              onChange={(event) => resetSelection(event.target.files?.[0] ?? null)}
              aria-describedby="chapter-file-help"
            />
          </label>
          <p id="chapter-file-help" className="text-xs leading-5 text-slate-500">
            {file ? `${file.name} · ${formatBytes(file.size)}` : "Supported: .txt, .md, .json (2 MB max), .pdf, .pptx (25 MB max). Files are read locally; scanned PDF OCR is not supported."}
          </p>
          {loading && <p className="text-sm text-slate-600" role="status">{processingMessage}</p>}
          {error && <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>}
          <button className="action" type="submit" disabled={loading}>
            <FilePlus2 size={17} aria-hidden="true" /> {loading ? "Reading file…" : "Preview chapter"}
          </button>
        </form>

        {preview && (
          <section aria-label="Chapter import preview" className="mt-6 rounded-[24px] border border-teal-100 bg-teal-50/60 p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="eyebrow">Preview before saving</p>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">Chapter {preview.number}: {preview.title}</h3>
                <p className="mt-1 text-sm text-slate-600">Source file: {preview.sourceLabel}</p>
              </div>
              <span className="source-tag">{preview.sourceType === "course" ? "Course material" : "Supplemental material"}</span>
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {preview.flashcards.length} flashcards · {preview.questions.length} quiz questions
            </p>
            {preview.notes && <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-2xl bg-white p-4 text-sm leading-6 text-slate-700">{preview.notes}</pre>}
            <div className="mt-4 flex flex-wrap gap-2">
              <button className="action" type="button" onClick={saveImport}>Save chapter</button>
              <button className="action action-secondary" type="button" onClick={() => setPreview(null)}>Back to edit</button>
            </div>
          </section>
        )}
      </section>

      {importedChapters.length > 0 && (
        <section className="panel p-5 sm:p-6">
          <div className="section-heading">
            <div><p className="eyebrow">Your library</p><h2 className="text-xl font-semibold text-slate-900">Imported chapters</h2></div>
            <span className="text-sm text-slate-500">{importedChapters.length} saved</span>
          </div>
          <ul className="mt-4 divide-y divide-slate-100">
            {importedChapters.map((chapter) => (
              <li key={chapter.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-semibold text-slate-800">Chapter {chapter.number}: {chapter.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{chapter.sourceLabel} · {chapter.sourceType === "course" ? "Course" : "Supplemental"}</p>
                </div>
                <button className="action action-secondary" type="button" onClick={() => onRemove?.(chapter.id)} aria-label={`Remove ${chapter.title}`}>
                  <Trash2 size={16} aria-hidden="true" /> Remove
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
