import { useRef, useState } from "react"
import { Download, RotateCcw, Upload } from "lucide-react"
import { createStudyBackup, MAX_STUDY_BACKUP_BYTES, parseStudyBackup, summarizeStudyState } from "../lib/studyBackup"
import { resetProgressState } from "../lib/resetProgress"

function downloadBackup(studyState) {
  const backup = createStudyBackup(studyState)
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = `amelia-study-buddy-backup-${new Date().toISOString().slice(0, 10)}.json`
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

export function BackupPanel({ studyState, onRestore }) {
  const inputRef = useRef(null)
  const readVersion = useRef(0)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [undoState, setUndoState] = useState(null)
  const [undoKind, setUndoKind] = useState("restore")
  const [reading, setReading] = useState(false)
  const [resetReview, setResetReview] = useState(false)

  async function selectBackup(event) {
    const file = event.target.files?.[0]
    const version = ++readVersion.current
    setPreview(null)
    setError("")
    setMessage("")
    setResetReview(false)
    if (!file) { setReading(false); return }
    if (file.size > MAX_STUDY_BACKUP_BYTES) {
      setError("Choose a backup smaller than 5 MB.")
      setReading(false)
      event.target.value = ""
      return
    }
    setReading(true)
    try {
      const nextState = parseStudyBackup(await file.text())
      if (version !== readVersion.current) return
      setPreview({ state: nextState, summary: summarizeStudyState(nextState), fileName: file.name })
    } catch (caught) {
      if (version === readVersion.current) setError(caught instanceof Error ? caught.message : "This backup could not be read.")
    } finally {
      if (version === readVersion.current) setReading(false)
    }
  }

  function restorePreview() {
    if (!preview) return
    readVersion.current += 1
    setUndoState({ ...studyState, activeSection: "sync" })
    setUndoKind("restore")
    onRestore({ ...preview.state, activeSection: "sync" })
    setMessage(`Restored ${preview.fileName}. You can undo this replacement below.`)
    setPreview(null)
    setError("")
    setReading(false)
    setResetReview(false)
    if (inputRef.current) inputRef.current.value = ""
  }

  function undoChange() {
    if (!undoState) return
    readVersion.current += 1
    onRestore({ ...undoState, activeSection: "sync" })
    setUndoState(null)
    setMessage(undoKind === "reset" ? "Your previous progress is back." : "Previous study data restored.")
    setReading(false)
    setPreview(null)
    setResetReview(false)
    if (inputRef.current) inputRef.current.value = ""
  }

  function openResetReview() {
    readVersion.current += 1
    setReading(false)
    setPreview(null)
    setError("")
    setMessage("")
    setResetReview(true)
    if (inputRef.current) inputRef.current.value = ""
  }

  function confirmResetProgress() {
    readVersion.current += 1
    setUndoState({ ...studyState, activeSection: "sync" })
    setUndoKind("reset")
    onRestore(resetProgressState(studyState))
    setMessage("Progress reset. You can undo this change below.")
    setResetReview(false)
    setPreview(null)
    setError("")
    setReading(false)
    if (inputRef.current) inputRef.current.value = ""
  }

  return <section className="panel p-5 sm:p-6" aria-labelledby="study-backup-heading">
    <div className="section-heading">
      <div><p className="eyebrow">Backup and restore</p><h2 id="study-backup-heading" className="text-xl font-semibold text-slate-900">Keep a copy of your study data</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Export your progress, notebook bookmarks and notes, and imported chapters to a JSON file. Restoring replaces the saved study data in this browser.</p></div>
      <button className="action" type="button" onClick={() => { try { downloadBackup(studyState); setError(""); setMessage("Backup downloaded.") } catch (caught) { setError(caught instanceof Error ? caught.message : "Backup could not be created."); setMessage("") } }}><Download size={16} aria-hidden="true" /> Download backup</button>
    </div>

    <div className="mt-5 space-y-3">
      <label className="field"><span>Choose a backup file</span><input ref={inputRef} type="file" accept=".json,application/json" onChange={selectBackup} aria-describedby="backup-file-help" /></label>
      <p id="backup-file-help" className="text-xs leading-5 text-slate-500">JSON backup · maximum size 5 MB. The file is checked before any saved data changes.</p>
      {reading && <p role="status" className="text-sm text-slate-600">Reading and checking backup…</p>}
      {error && <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>}
      {message && <p role="status" className="rounded-2xl bg-teal-50 px-4 py-3 text-sm text-teal-900">{message}</p>}
      {undoState && <button className="action action-secondary" type="button" onClick={undoChange}><RotateCcw size={16} aria-hidden="true" /> Undo {undoKind === "reset" ? "reset" : "restore"}</button>}
    </div>

    <section className="mt-6 border-t border-slate-200 pt-5" aria-labelledby="reset-progress-heading">
      <p className="eyebrow">Start fresh</p>
      <h3 id="reset-progress-heading" className="mt-1 text-lg font-semibold text-slate-900">Reset study progress</h3>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Downloads start fresh; progress belongs to this browser.</p>
      {!resetReview && <button className="action action-secondary mt-3" type="button" onClick={openResetReview}><RotateCcw size={16} aria-hidden="true" /> Review progress reset</button>}
      {resetReview && <div className="mt-4 rounded-[24px] border border-amber-200 bg-amber-50/70 p-4 sm:p-5">
        <h4 className="font-semibold text-slate-900">Review what will change</h4>
        <p className="mt-2 text-sm leading-6 text-slate-700">This clears chapter completion, flashcard status, quiz and practice history, anatomy recall and weak spots, and anatomy notebook notes, bookmarks, and results.</p>
        <p className="mt-2 text-sm leading-6 text-slate-700">Imported chapter materials, your selected chapter, and your theme stay saved. This only changes progress in this browser.</p>
        <div className="mt-4 flex flex-wrap gap-2"><button className="action" type="button" onClick={confirmResetProgress}>Reset progress</button><button className="action action-secondary" type="button" onClick={() => setResetReview(false)}>Cancel</button></div>
      </div>}
    </section>

    {preview && <section className="mt-5 rounded-[24px] border border-teal-100 bg-teal-50/60 p-4 sm:p-5" aria-label="Backup restore preview">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="eyebrow">Ready to restore</p><h3 className="mt-1 text-lg font-semibold text-slate-900">{preview.fileName}</h3></div><span className="source-tag">Validated backup</span></div>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-white/80 p-3"><dt className="text-slate-500">Imported chapters</dt><dd className="mt-1 font-semibold text-slate-900">{preview.summary.importedChapters}</dd></div>
        <div className="rounded-2xl bg-white/80 p-3"><dt className="text-slate-500">Saved progress groups</dt><dd className="mt-1 font-semibold text-slate-900">{preview.summary.progressEntries}</dd></div>
        <div className="rounded-2xl bg-white/80 p-3"><dt className="text-slate-500">Bookmarks</dt><dd className="mt-1 font-semibold text-slate-900">{preview.summary.bookmarks}</dd></div>
        <div className="rounded-2xl bg-white/80 p-3"><dt className="text-slate-500">Notebook notes</dt><dd className="mt-1 font-semibold text-slate-900">{preview.summary.notes}</dd></div>
      </dl>
      <p className="mt-4 text-sm leading-6 text-slate-700">Restoring replaces your current saved study data. You can undo the replacement from this panel.</p>
      <div className="mt-4 flex flex-wrap gap-2"><button className="action" type="button" onClick={restorePreview}><Upload size={16} aria-hidden="true" /> Replace my saved study data</button><button className="action action-secondary" type="button" onClick={() => { readVersion.current += 1; setPreview(null); setError(""); setReading(false); if (inputRef.current) inputRef.current.value = "" }}>Cancel</button></div>
    </section>}
  </section>
}

export default BackupPanel
