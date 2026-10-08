import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { RotateCcw } from "lucide-react"
import { courseAtlasSelectionMatches, resolveCourseAtlasTarget } from "../lib/courseAtlas"

const ATLAS_URL = "/human-atlas/index.html"

export function AtlasBonePractice({ question, answered, onBoneSelect }) {
  const frame = useRef(null)
  const [atlas, setAtlas] = useState(null)
  const [bridgeReady, setBridgeReady] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState("")
  const [retry, setRetry] = useState(0)

  const target = useMemo(() => atlas
    ? resolveCourseAtlasTarget({
        boneId: question.grading.boneId,
        label: question.grading.label,
      }, atlas)
    : null, [atlas, question.grading.boneId, question.grading.label])
  const ready = bridgeReady && progress === 100

  const send = useCallback((action, data = {}) => {
    frame.current?.contentWindow?.postMessage(
      { type: "study-buddy:command", action, ...data },
      window.location.origin,
    )
  }, [])

  useEffect(() => {
    const abort = new AbortController()
    fetch("/human-atlas/models/atlas.json", { signal: abort.signal })
      .then((response) => {
        if (!response.ok) throw new Error("The Human Atlas catalogue could not be loaded.")
        return response.json()
      })
      .then(setAtlas)
      .catch((caught) => {
        if (caught.name !== "AbortError") setError(caught.message)
      })
    return () => abort.abort()
  }, [retry])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setError("The 3D bones are still loading. Reload the viewer to try again.")
    }, 120_000)
    const receive = (event) => {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow) return
      const data = event.data
      if (data?.type === "human-atlas:ready") setBridgeReady(true)
      if (data?.type === "human-atlas:status") {
        setProgress(Number.isFinite(data.progress) ? data.progress : 0)
        if (data.error) setError(String(data.error))
        else if (data.progress === 100) setError("")
      }
      if (data?.type === "human-atlas:error") setError(data.message || "The Human Atlas could not process that selection.")
      if (data?.type === "human-atlas:selection" && !answered) {
        const selection = data.selection ?? data
        if (!target || !Array.isArray(selection.elements)) return
        const correct = courseAtlasSelectionMatches(selection, target)
        onBoneSelect?.({ boneId: correct ? target.boneId : "atlas-other" })
      }
    }
    window.addEventListener("message", receive)
    return () => {
      window.removeEventListener("message", receive)
      window.clearTimeout(timeout)
    }
  }, [answered, onBoneSelect, target])

  useEffect(() => {
    if (!ready || !target) return
    send("systems", { systems: ["skeletal"] })
  }, [ready, question.id, send, target])

  function reloadViewer() {
    setError("")
    setBridgeReady(false)
    setProgress(0)
    setRetry((value) => value + 1)
  }

  return (
    <section aria-label="Course bone identification in the Human Atlas">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="source-tag">Course question</span>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Use the real 3D atlas to identify the requested bone. BodyParts3D is supplemental visual reference.
          </p>
        </div>
        <button
          className="action action-secondary"
          type="button"
          onClick={() => send("systems", { systems: ["skeletal"] })}
          disabled={!ready || answered}
        >
          <RotateCcw size={15} aria-hidden="true" /> Reset view
        </button>
      </div>
      {!ready && !error && (
        <p className="mb-3 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600" role="status">
          Preparing the 3D skeleton… {progress > 0 ? `${progress}% of model data` : "The atlas loads about 60 MB of anatomy data."}
        </p>
      )}
      {error && (
        <div className="mb-3 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800" role="alert">
          <p>{error}</p>
          <button className="action action-secondary mt-2" type="button" onClick={reloadViewer}>Reload 3D viewer</button>
        </div>
      )}
      {!target && atlas && (
        <p className="mb-3 rounded-2xl bg-amber-50 p-3 text-sm text-amber-900" role="alert">
          This course bone does not have an exact Human Atlas match yet.
        </p>
      )}
      <iframe
        key={retry}
        ref={frame}
        src={ATLAS_URL}
        title="Course bone identification in the Human Atlas"
        onLoad={() => send("ping")}
        onError={() => setError("The Human Atlas viewer could not be opened.")}
        className="block h-[680px] w-full rounded-2xl border-0 bg-slate-950"
      />
    </section>
  )
}
