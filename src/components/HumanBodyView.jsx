import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react"
import {
  ArrowLeftRight,
  ArrowRight,
  Bookmark,
  Check,
  ChevronDown,
  ChevronUp,
  Compass,
  Expand,
  ExternalLink,
  Flame,
  Focus,
  GripHorizontal,
  Layers,
  Lightbulb,
  Maximize2,
  Minimize2,
  RotateCcw,
  Search,
  Sparkles,
  X,
} from "lucide-react"
import {
  ATLAS_SYSTEMS,
  buildAtlasChoices,
  buildAtlasTargets,
  buildCourseBoneTargets,
  buildOrganNeuroTargets,
  evaluateAtlasRecall,
  getAtlasHint,
  selectionMatchesConcept,
} from "../lib/atlasLearning"
import { shuffleItems } from "../lib/practice"

const ATLAS_URL = `${import.meta.env.BASE_URL}human-atlas/index.html`

export function HumanBodyView({
  notebook,
  onNotebookChange,
  onNavigate,
  initialSystem = null,
  onClearInitialSystem,
}) {
  const frame = useRef(null)
  const studio = useRef(null)
  const [atlas, setAtlas] = useState(null)
  const [ready, setReady] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState("")
  const [retry, setRetry] = useState(0)
  const [mode, setMode] = useState("explore")
  const [selection, setSelection] = useState(null)
  const [query, setQuery] = useState("")
  const [systems, setSystems] = useState(() => (initialSystem ? [initialSystem] : []))
  const [wide, setWide] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [hudMinimized, setHudMinimized] = useState(false)
  const [hudSide, setHudSide] = useState("right")
  const [hudOffset, setHudOffset] = useState({ x: 0, y: 0 })
  const [draggingHud, setDraggingHud] = useState(false)
  const dragRef = useRef(null)
  const [challenge, setChallenge] = useState(null)
  const [answer, setAnswer] = useState("")
  const [feedback, setFeedback] = useState("")
  const [challengeDone, setChallengeDone] = useState(false)
  const [challengePool, setChallengePool] = useState("core")
  const [huntContext, setHuntContext] = useState("context")
  const [recallStyle, setRecallStyle] = useState("choices")
  const [hintShown, setHintShown] = useState(false)
  const [streak, setStreak] = useState(0)

  const targets = useMemo(() => (atlas ? buildAtlasTargets(atlas) : []), [atlas])
  const courseBoneTargets = useMemo(() => (atlas ? buildCourseBoneTargets(atlas) : []), [atlas])
  const organNeuroTargets = useMemo(() => (atlas ? buildOrganNeuroTargets(atlas) : []), [atlas])

  const challengeTargets = useMemo(() => {
    if (!atlas) return []
    if (challengePool === "course-bones") return courseBoneTargets
    if (challengePool === "organs") return organNeuroTargets
    if (challengePool === "saved") {
      return (atlas.concepts ?? []).filter((concept) =>
        notebook.bookmarks.some(
          (saved) => saved.id === concept.id || saved.name.toLowerCase() === concept.name.toLowerCase(),
        ),
      )
    }
    if (challengePool === "expanded") {
      return (atlas.concepts ?? []).filter(
        (concept) => concept.elements.length > 0 && concept.elements.length <= 8,
      )
    }
    return targets
  }, [atlas, challengePool, courseBoneTargets, organNeuroTargets, notebook.bookmarks, targets])

  const recallChoices = useMemo(
    () =>
      challenge
        ? buildAtlasChoices(challenge, challengeTargets.length >= 4 ? challengeTargets : targets, 4)
        : [],
    [challenge, challengeTargets, targets],
  )
  const activeHint = useMemo(
    () => (challenge && atlas ? getAtlasHint(challenge, atlas) : null),
    [challenge, atlas],
  )

  const results =
    query.trim() && atlas
      ? atlas.concepts
          .filter((c) => c.name.toLowerCase().includes(query.trim().toLowerCase()))
          .sort((a, b) => a.name.length - b.name.length)
          .slice(0, 12)
      : []

  function send(action, data = {}) {
    frame.current?.contentWindow?.postMessage(
      { type: "study-buddy:command", action, ...data },
      window.location.origin,
    )
  }

  function record(correct, response) {
    const result = {
      id: challenge.id,
      name: challenge.name,
      mode,
      correct,
      response,
      at: new Date().toISOString(),
    }
    setStreak((prev) => (correct ? prev + 1 : 0))
    onNotebookChange({ ...notebook, results: [...(notebook.results ?? []), result].slice(-100) })
  }

  const handleSelection = useEffectEvent((chosen) => {
    if (mode === "hunt" && challenge && !challengeDone) {
      const correct = selectionMatchesConcept(chosen, challenge)
      if (correct) {
        setFeedback(`Found it! “${challenge.name}” locked in.`)
        record(true, chosen.name)
        setChallengeDone(true)
        setHudMinimized(false)
        send("select", { name: challenge.name, isolate: true, details: false })
      } else {
        setFeedback(
          `You clicked “${chosen.name}”. Keep looking for “${challenge.name}”, or tap Hint for camera angle.`,
        )
        record(false, chosen.name)
      }
    }
    if (mode !== "recall" || challengeDone) setSelection(chosen)
  })

  useEffect(() => {
    const abort = new AbortController()
    fetch(`${import.meta.env.BASE_URL}human-atlas/models/atlas.json`, { signal: abort.signal })
      .then((response) => {
        if (!response.ok) throw new Error("The anatomy catalogue could not be loaded.")
        return response.json()
      })
      .then(setAtlas)
      .catch((caught) => {
        if (caught.name !== "AbortError") setError(caught.message)
      })
    return () => abort.abort()
  }, [retry])

  useEffect(() => {
    const timeout = setTimeout(() => {
      setError(
        "The atlas is taking longer than expected. Try reloading the viewer; your saved notes will stay here.",
      )
    }, 45000)
    const receive = (event) => {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow)
        return
      const data = event.data
      if (data?.type === "human-atlas:status") {
        setProgress(data.progress ?? 0)
        if (data.error) {
          setError(data.error)
          setReady(false)
        } else if (data.progress === 100) {
          setReady(true)
          setError("")
          clearTimeout(timeout)
        }
      }
      if (data?.type === "human-atlas:error")
        setError(data.message || "That structure could not be selected.")
      if (data?.type === "human-atlas:selection") {
        const chosen = data.selection ?? data
        if (!chosen.name || !Array.isArray(chosen.elements)) return
        handleSelection(chosen)
      }
    }
    window.addEventListener("message", receive)
    return () => {
      window.removeEventListener("message", receive)
      clearTimeout(timeout)
    }
  }, [retry])

  useEffect(() => {
    if (!ready || !initialSystem) return
    send("systems", { systems: [initialSystem] })
    onClearInitialSystem?.()
  }, [ready, initialSystem, onClearInitialSystem])

  async function toggleFullscreen() {
    if (isFullscreen) {
      if (document.fullscreenElement) {
        try {
          await document.exitFullscreen()
        } catch {
          // Ignore exit errors
        }
      }
      setIsFullscreen(false)
      return
    }
    setIsFullscreen(true)
    if (studio.current?.requestFullscreen) {
      try {
        await studio.current.requestFullscreen()
      } catch {
        // Fallback CSS fullscreen (.is-fullscreen) remains active even if native API is blocked
      }
    }
  }

  useEffect(() => {
    const onFsChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false)
      } else if (document.fullscreenElement === studio.current) {
        setIsFullscreen(true)
      }
    }
    const onKeyDown = (event) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return
      }
      if (event.key === "Escape" && (isFullscreen || wide)) {
        if (document.fullscreenElement) {
          document.exitFullscreen?.().catch(() => {})
        }
        setIsFullscreen(false)
        setWide(false)
      } else if ((event.key === "f" || event.key === "F") && !event.metaKey && !event.ctrlKey) {
        event.preventDefault()
        toggleFullscreen()
      }
    }
    document.addEventListener("fullscreenchange", onFsChange)
    window.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("fullscreenchange", onFsChange)
      window.removeEventListener("keydown", onKeyDown)
    }
  })

  // Pointer dragging for Floating HUD and Floating Pill
  function startHudDrag(event) {
    if (event.target.closest("button, input, select, textarea, a")) return
    event.preventDefault()
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: hudOffset.x,
      originY: hudOffset.y,
    }
    setDraggingHud(true)
  }

  useEffect(() => {
    if (!draggingHud) return
    const onMove = (event) => {
      if (!dragRef.current) return
      const dx = event.clientX - dragRef.current.startX
      const dy = event.clientY - dragRef.current.startY
      setHudOffset({
        x: Math.max(-720, Math.min(720, dragRef.current.originX + dx)),
        y: Math.max(-40, Math.min(520, dragRef.current.originY + dy)),
      })
    }
    const onUp = () => {
      dragRef.current = null
      setDraggingHud(false)
    }
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
    window.addEventListener("pointercancel", onUp)
    return () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
      window.removeEventListener("pointercancel", onUp)
    }
  }, [draggingHud])

  function flipHudSide() {
    setHudSide((prev) => (prev === "right" ? "left" : "right"))
    setHudOffset({ x: 0, y: 0 })
  }

  function computeHuntSystems(target, contextMode = huntContext) {
    if (!atlas || !target) return []
    const targetSys = [
      ...new Set(atlas.parts.filter((p) => target.elements.includes(p.id)).map((p) => p.system)),
    ]
    if (contextMode === "full") {
      return ATLAS_SYSTEMS.map(([id]) => id).filter((id) => id !== "integumentary")
    }
    if (contextMode === "context") {
      return [...new Set([...targetSys, "skeletal"])]
    }
    return targetSys
  }

  function choose(concept) {
    setError("")
    send("select", { name: concept.name, isolate: false, details: false })
    setQuery("")
  }

  function changeMode(next) {
    setMode(next)
    setChallenge(null)
    setAnswer("")
    setFeedback("")
    setChallengeDone(false)
    setHintShown(false)
    setHudMinimized(false)
    send("reset")
    setSelection(null)
    setSystems([])
  }

  function startChallenge(customContext = huntContext) {
    if (!challengeTargets.length) return
    const pool = challengeTargets.filter((item) => item.id !== challenge?.id)
    const target = shuffleItems(pool)[0] ?? challengeTargets[0]
    setChallenge(target)
    setAnswer("")
    setFeedback("")
    setChallengeDone(false)
    setHintShown(false)
    setSelection(null)
    if (mode === "recall") {
      send("challenge", { name: target.name, hideLabels: true })
    } else {
      const huntSystems = computeHuntSystems(target, customContext)
      send("hunt", { systems: huntSystems })
      if (wide || isFullscreen) {
        setHudMinimized(true)
      }
    }
  }

  function triggerHint() {
    if (!challenge || !activeHint) return
    setHintShown(true)
    send("view", { view: activeHint.view, rotate: false })
  }

  function reveal() {
    if (!challenge) return
    setChallengeDone(true)
    setHudMinimized(false)
    setFeedback(`Guided reveal: “${challenge.name}”. Inspect it in 3D, then try another.`)
    record(false, "revealed")
    send("select", { name: challenge.name, isolate: true, details: false })
  }

  function submitRecallGuess(guessText) {
    if (!challenge || challengeDone) return
    const verdict = evaluateAtlasRecall(guessText, challenge.name)
    if (!verdict.correct && verdict.close) {
      setFeedback(verdict.message)
      return
    }
    record(verdict.correct, guessText)
    setChallengeDone(true)
    setHudMinimized(false)
    setFeedback(verdict.message)
    send("select", { name: challenge.name, isolate: true, details: false })
  }

  function checkAnswer(event) {
    event.preventDefault()
    submitRecallGuess(answer)
  }

  function toggleBookmark() {
    if (!selection) return
    const exists = notebook.bookmarks.some((item) => item.id === selection.id)
    onNotebookChange({
      ...notebook,
      bookmarks: exists
        ? notebook.bookmarks.filter((item) => item.id !== selection.id)
        : [
            ...notebook.bookmarks,
            {
              id: selection.id,
              name: selection.name,
              elements: selection.elements,
              system: selection.system,
            },
          ],
    })
  }

  function toggleSystem(id) {
    const next = systems.includes(id) ? systems.filter((item) => item !== id) : [...systems, id]
    setSystems(next)
    send("systems", { systems: next })
  }

  const isOverlayLayout = wide || isFullscreen
  const recentCorrect = (notebook.results ?? []).filter((result) => result.correct).length
  const recentTotal = notebook.results?.length ?? 0
  const floatingStyle = isOverlayLayout || hudMinimized
    ? {
        transform: `translate3d(${hudOffset.x}px, ${hudOffset.y}px, 0)`,
        left: hudSide === "left" ? "16px" : "auto",
        right: hudSide === "right" ? "16px" : "auto",
      }
    : undefined

  return (
    <div className="space-y-4">
      <section className="studio-intro">
        <div>
          <span className="source-tag supplemental">SUPPLEMENTAL / 3D HUMAN ATLAS</span>
          <h2>The body, one layer at a time.</h2>
          <p>
            2,234 structures · Drag to orbit, use the explode slider, or launch fullscreen visual
            drills.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="studio-mode" aria-label="Anatomy activity">
            {[
              ["explore", "Explore"],
              ["hunt", "Find it"],
              ["recall", "Name it"],
            ].map(([id, label], index) => (
              <button
                key={id}
                type="button"
                aria-pressed={mode === id}
                onClick={() => changeMode(id)}
              >
                <span>0{index + 1}</span>
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="action action-secondary"
            onClick={toggleFullscreen}
            title="Full screen 3D studio (Shortcut: F)"
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            {isFullscreen ? "Exit full screen" : "Full screen"}
          </button>
        </div>
      </section>

      <div
        className={`atlas-workbench ${wide ? "is-wide" : ""} ${isFullscreen ? "is-fullscreen" : ""}`}
        ref={studio}
      >
        <section
          className="atlas-frame-wrap"
          aria-label="Anatomy viewer"
          style={draggingHud ? { pointerEvents: "none" } : undefined}
        >
          <div className="atlas-toolbar">
            <div className="flex items-center gap-3">
              <span>
                <span className="viewer-status-dot" />
                {ready ? "LIVE 3D ATLAS" : "PREPARING ATLAS"}
              </span>
              {isOverlayLayout && (
                <div className="atlas-quick-modes" role="group" aria-label="Quick mode switch">
                  {[
                    ["explore", "Explore"],
                    ["hunt", "Find it"],
                    ["recall", "Name it"],
                  ].map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      className={`atlas-mode-chip ${mode === id ? "is-active" : ""}`}
                      onClick={() => changeMode(id)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="atlas-toolbar-actions">
              {streak > 0 && (
                <span className="atlas-streak-pill" title="Current correct streak">
                  <Flame size={13} /> {streak} streak
                </span>
              )}
              <button
                type="button"
                aria-label="Reset anatomy view"
                title="Reset 3D view"
                onClick={() => {
                  send("reset")
                  setSelection(null)
                  setSystems([])
                  setChallenge(null)
                  setHintShown(false)
                }}
                disabled={!ready}
              >
                <RotateCcw size={16} />
              </button>
              <button
                type="button"
                aria-label={hudMinimized ? "Expand study HUD" : "Minimize study HUD to pill"}
                title={
                  hudMinimized
                    ? "Expand study panel"
                    : "Minimize panel so nothing blocks the 3D view"
                }
                onClick={() => setHudMinimized((prev) => !prev)}
                className="atlas-hud-btn"
              >
                {hudMinimized ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                <span>{hudMinimized ? "Show HUD" : "Compact HUD"}</span>
              </button>
              <button
                type="button"
                aria-label={wide ? "Standard split layout" : "Expand wide theater layout"}
                title={wide ? "Split layout" : "Wide layout"}
                onClick={() => setWide((prev) => !prev)}
              >
                <Expand size={16} />
              </button>
              <button
                type="button"
                aria-label={isFullscreen ? "Exit full screen" : "Enter full screen (F)"}
                title={isFullscreen ? "Exit full screen (Esc)" : "Full screen (F)"}
                onClick={toggleFullscreen}
                className="atlas-fs-btn"
              >
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                <span>{isFullscreen ? "Exit" : "Full screen"}</span>
              </button>
              <a
                href={ATLAS_URL}
                target="_blank"
                rel="noreferrer"
                aria-label="Open standalone Human Atlas in a new tab"
                title="Open standalone tab"
              >
                <ExternalLink size={16} />
              </a>
            </div>
          </div>

          <iframe
            key={retry}
            ref={frame}
            src={ATLAS_URL}
            title="Human Atlas — interactive 3D human body explorer"
            onLoad={() => send("ping")}
            allowFullScreen
          />

          {!ready && !error && (
            <div className="atlas-loading" role="status">
              Preparing the anatomy catalogue…{" "}
              {progress > 0
                ? `${Math.round(progress)}% of model data`
                : "Large 3D models may take a moment."}
            </div>
          )}
          {error && (
            <div className="atlas-error" role="alert">
              <p>{error}</p>
              <button
                className="action action-secondary"
                onClick={() => {
                  setReady(false)
                  setError("")
                  setProgress(0)
                  setRetry((value) => value + 1)
                }}
              >
                Reload viewer
              </button>
            </div>
          )}
        </section>

        {/* Draggable Floating Compact Pill when HUD is minimized */}
        {hudMinimized && (
          <div
            className="atlas-floating-pill"
            style={floatingStyle}
            onPointerDown={startHudDrag}
            role="region"
            aria-label="Minimized study controls"
          >
            <span className="atlas-drag-grip" title="Drag to reposition anywhere">
              <GripHorizontal size={14} />
            </span>
            {mode !== "explore" && challenge ? (
              <>
                <span className="atlas-pill-badge">
                  {mode === "hunt"
                    ? `🎯 Find: ${challenge.name}`
                    : challengeDone
                      ? `✓ ${challenge.name}`
                      : "❓ Name this structure"}
                </span>
                {feedback && <span className="atlas-pill-feedback">{feedback}</span>}
                {!challengeDone && mode === "hunt" && (
                  <button type="button" className="atlas-pill-action" onClick={triggerHint}>
                    <Lightbulb size={13} /> Hint
                  </button>
                )}
                {!challengeDone && (
                  <button type="button" className="atlas-pill-action" onClick={reveal}>
                    Show me
                  </button>
                )}
                {challengeDone && (
                  <button
                    type="button"
                    className="atlas-pill-action primary"
                    onClick={() => startChallenge()}
                  >
                    Next <ArrowRight size={13} />
                  </button>
                )}
              </>
            ) : (
              <span className="atlas-pill-badge">
                {selection
                  ? `Selected: ${selection.name}`
                  : "3D Explorer · Drag pill or click any structure"}
              </span>
            )}
            <button
              type="button"
              className="atlas-pill-action"
              onClick={flipHudSide}
              title="Swap left/right corner"
            >
              <ArrowLeftRight size={12} />
            </button>
            <button
              type="button"
              className="atlas-pill-expand"
              onClick={() => setHudMinimized(false)}
              aria-label="Expand study companion"
            >
              Expand <ChevronDown size={14} />
            </button>
          </div>
        )}

        {!hudMinimized && (
          <aside
            className={`atlas-companion ${isOverlayLayout ? "is-floating-hud" : ""}`}
            style={isOverlayLayout ? floatingStyle : undefined}
          >
            <div
              className={`flex items-center justify-between gap-2 pb-2 ${
                isOverlayLayout ? "cursor-grab active:cursor-grabbing border-b border-slate-200/60 mb-2" : ""
              }`}
              onPointerDown={isOverlayLayout ? startHudDrag : undefined}
            >
              <p className="eyebrow flex items-center gap-1.5">
                {isOverlayLayout && (
                  <GripHorizontal
                    size={14}
                    className="text-slate-400"
                    title="Drag HUD anywhere on screen"
                  />
                )}
                {mode === "explore"
                  ? "Field guide"
                  : mode === "hunt"
                    ? "Level 01 / Find it"
                    : "Level 02 / Name it"}
              </p>
              <div className="flex items-center gap-1">
                {isOverlayLayout && (
                  <button
                    type="button"
                    className="atlas-hud-minimize-inline"
                    onClick={flipHudSide}
                    title="Move HUD to opposite side"
                  >
                    <ArrowLeftRight size={12} /> {hudSide === "right" ? "Left" : "Right"}
                  </button>
                )}
                {isOverlayLayout && (hudOffset.x !== 0 || hudOffset.y !== 0) && (
                  <button
                    type="button"
                    className="atlas-hud-minimize-inline"
                    onClick={() => setHudOffset({ x: 0, y: 0 })}
                    title="Snap HUD back to corner"
                  >
                    Reset pos
                  </button>
                )}
                <button
                  type="button"
                  className="atlas-hud-minimize-inline"
                  onClick={() => setHudMinimized(true)}
                  title="Collapse into draggable floating pill"
                >
                  Minimize <ChevronUp size={13} />
                </button>
              </div>
            </div>

            {mode === "explore" ? (
              <>
                <h3>Follow your curiosity.</h3>
                <p className="companion-copy">
                  Click any structure on the body, or jump straight to one below.
                </p>
                <label className="atlas-search">
                  <Search size={16} />
                  <input
                    type="search"
                    aria-label="Find an atlas structure"
                    placeholder="Heart, femur, scapula, brain…"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                  {query && (
                    <button
                      type="button"
                      aria-label="Clear structure search"
                      onClick={() => setQuery("")}
                    >
                      <X size={15} />
                    </button>
                  )}
                </label>
                {query.trim() && (
                  <div className="atlas-search-results">
                    {results.length ? (
                      results.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          disabled={!ready}
                          onClick={() => choose(c)}
                        >
                          {c.name}
                          <ArrowRight size={13} />
                        </button>
                      ))
                    ) : (
                      <p>No matching structures. Try a shorter name.</p>
                    )}
                  </div>
                )}
                {!query && (
                  <div className="quick-structures">
                    {targets.slice(0, 6).map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        disabled={!ready}
                        onClick={() => choose(c)}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}

                <details className="system-disclosure">
                  <summary>
                    <Layers size={16} /> Filter organ systems{" "}
                    {systems.length > 0 && (
                      <span className="ml-auto text-xs text-teal-700">{systems.length} active</span>
                    )}
                  </summary>
                  <p>Toggle systems directly from here without covering the 3D body.</p>
                  <div className="system-picks">
                    {ATLAS_SYSTEMS.map(([id, label]) => (
                      <button
                        key={id}
                        type="button"
                        disabled={!ready}
                        onClick={() => toggleSystem(id)}
                        aria-pressed={systems.includes(id)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {systems.length > 0 && (
                    <button
                      type="button"
                      className="mt-2 text-xs font-semibold text-teal-800 underline"
                      onClick={() => {
                        setSystems([])
                        send("reset")
                      }}
                    >
                      Show all default layers
                    </button>
                  )}
                </details>

                {selection && (
                  <section className="structure-note">
                    <div className="section-heading">
                      <span className="eyebrow">Selected structure</span>
                      <button
                        type="button"
                        aria-label={
                          notebook.bookmarks.some((item) => item.id === selection.id)
                            ? "Unsave structure"
                            : "Save structure"
                        }
                        onClick={toggleBookmark}
                      >
                        <Bookmark
                          size={18}
                          fill={
                            notebook.bookmarks.some((item) => item.id === selection.id)
                              ? "currentColor"
                              : "none"
                          }
                        />
                      </button>
                    </div>
                    <h4>{selection.name}</h4>
                    {selection.description && (
                      <p className="mb-3 text-xs leading-5 text-slate-600">
                        {selection.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="action action-secondary"
                        onClick={() =>
                          send("select", { name: selection.name, isolate: true, details: false })
                        }
                      >
                        <Focus size={15} /> Isolate
                      </button>
                      <button
                        type="button"
                        className="action action-secondary"
                        onClick={() =>
                          send("select", { name: selection.name, isolate: false, details: false })
                        }
                      >
                        <Compass size={15} /> In body
                      </button>
                    </div>
                    <label className="field mt-3">
                      <span>Your study note</span>
                      <textarea
                        className="resize-none"
                        rows={2}
                        maxLength={2000}
                        value={notebook.notes[selection.id] ?? ""}
                        placeholder="A connection or landmark to remember…"
                        onChange={(event) =>
                          onNotebookChange({
                            ...notebook,
                            notes: { ...notebook.notes, [selection.id]: event.target.value },
                          })
                        }
                      />
                    </label>
                  </section>
                )}

                <details className="saved-structures" open={notebook.bookmarks.length > 0}>
                  <summary>
                    Saved structures <span>{notebook.bookmarks.length}</span>
                  </summary>
                  {notebook.bookmarks.length ? (
                    notebook.bookmarks.map((item) => (
                      <div key={item.id}>
                        <button type="button" disabled={!ready} onClick={() => choose(item)}>
                          {item.name}
                        </button>
                        <button
                          type="button"
                          aria-label={`Remove ${item.name} from saved structures`}
                          onClick={() =>
                            onNotebookChange({
                              ...notebook,
                              bookmarks: notebook.bookmarks.filter((saved) => saved.id !== item.id),
                            })
                          }
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p>Bookmark any structure above to build your personal 3D review deck.</p>
                  )}
                </details>
              </>
            ) : (
              <>
                <h3>
                  {mode === "hunt" ? "Find it on the body." : "Name the highlighted piece."}
                </h3>
                <p className="companion-copy">
                  {mode === "hunt"
                    ? "Rotate, zoom, and click the target structure directly on the 3D model. Menus stay out of your way."
                    : "Inspect the isolated 3D structure, then pick or type its anatomical name."}
                </p>

                <label className="field mb-3">
                  <span>Challenge collection</span>
                  <select
                    value={challengePool}
                    onChange={(event) => {
                      setChallengePool(event.target.value)
                      setChallenge(null)
                      setFeedback("")
                      setChallengeDone(false)
                      setHintShown(false)
                      send("reset")
                    }}
                  >
                    <option value="core">Core Essentials · {targets.length}</option>
                    <option value="course-bones">
                      BIOL 2401 Course Bones · {courseBoneTargets.length}
                    </option>
                    <option value="organs">
                      Organs & Nervous System · {organNeuroTargets.length}
                    </option>
                    <option value="saved">
                      Your Saved Structures · {notebook.bookmarks.length}
                    </option>
                    <option value="expanded">Full Atlas Catalogue · Advanced</option>
                  </select>
                </label>

                {mode === "hunt" && (
                  <div className="mb-3">
                    <span className="block text-[11px] font-semibold text-slate-500 mb-1.5">
                      3D body context
                    </span>
                    <div className="atlas-segmented-pills" role="group" aria-label="3D body context">
                      {[
                        ["context", "With skeleton"],
                        ["system", "System only"],
                        ["full", "Full body"],
                      ].map(([id, label]) => (
                        <button
                          key={id}
                          type="button"
                          aria-pressed={huntContext === id}
                          onClick={() => {
                            setHuntContext(id)
                            if (challenge && !challengeDone) {
                              send("hunt", { systems: computeHuntSystems(challenge, id) })
                            }
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {mode === "recall" && (
                  <div className="mb-3">
                    <span className="block text-[11px] font-semibold text-slate-500 mb-1.5">
                      Answer format
                    </span>
                    <div className="atlas-segmented-pills" role="group" aria-label="Answer format">
                      {[
                        ["choices", "4-Choice Pick"],
                        ["typed", "Type Name"],
                      ].map(([id, label]) => (
                        <button
                          key={id}
                          type="button"
                          aria-pressed={recallStyle === id}
                          onClick={() => setRecallStyle(id)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {!challenge && (
                  <button
                    type="button"
                    className="action w-full"
                    disabled={!ready || !challengeTargets.length}
                    onClick={() => startChallenge()}
                  >
                    Start visual challenge <ArrowRight size={16} />
                  </button>
                )}

                {challenge && (
                  <div className="visual-challenge">
                    <div className="flex items-center justify-between gap-2">
                      <span className="source-tag supplemental">
                        {challengePool === "course-bones" ? "Course Bone 3D" : "3D Challenge"}
                      </span>
                      {isOverlayLayout && !challengeDone && (
                        <button
                          type="button"
                          className="text-[11px] font-semibold text-teal-800 underline"
                          onClick={() => setHudMinimized(true)}
                        >
                          Hide panel to click
                        </button>
                      )}
                    </div>

                    <h4>
                      {mode === "hunt"
                        ? `Find: ${challenge.name}`
                        : challengeDone
                          ? challenge.name
                          : "What structure is this?"}
                    </h4>

                    {mode === "recall" && !challengeDone && recallStyle === "choices" && (
                      <div className="mt-3 grid gap-2">
                        {recallChoices.map((option) => (
                          <button
                            key={option}
                            type="button"
                            className="atlas-choice-btn"
                            onClick={() => submitRecallGuess(option)}
                          >
                            <span className="capitalize">{option}</span>
                            <ArrowRight size={13} />
                          </button>
                        ))}
                      </div>
                    )}

                    {mode === "recall" && !challengeDone && recallStyle === "typed" && (
                      <form noValidate onSubmit={checkAnswer}>
                        <label className="field">
                          <span>Your answer (include left/right if paired)</span>
                          <input
                            autoComplete="off"
                            value={answer}
                            placeholder="e.g. left scapula, sternum…"
                            onChange={(event) => setAnswer(event.target.value)}
                          />
                        </label>
                        <button
                          type="submit"
                          className="action mt-3 w-full"
                          disabled={!answer.trim()}
                        >
                          Check answer <Check size={15} />
                        </button>
                      </form>
                    )}

                    {hintShown && activeHint && (
                      <p className="atlas-hint-box" role="status">
                        <Lightbulb size={14} className="shrink-0 mt-0.5" />
                        <span>{activeHint.clue}</span>
                      </p>
                    )}

                    {feedback && (
                      <p className="challenge-feedback" role="status">
                        {feedback}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap gap-2">
                      {!challengeDone && (
                        <>
                          <button
                            type="button"
                            className="action action-secondary flex-1"
                            onClick={triggerHint}
                          >
                            <Lightbulb size={14} />{" "}
                            {hintShown ? "Re-center angle" : "Hint & angle"}
                          </button>
                          <button
                            type="button"
                            className="action action-secondary flex-1"
                            onClick={reveal}
                          >
                            Show me
                          </button>
                        </>
                      )}
                      {challengeDone && (
                        <>
                          <button
                            type="button"
                            className="action w-full"
                            onClick={() => startChallenge()}
                          >
                            Next challenge <ArrowRight size={16} />
                          </button>
                          <button
                            type="button"
                            className="action action-secondary w-full"
                            onClick={() =>
                              send("select", { name: challenge.name, isolate: false, details: false })
                            }
                          >
                            <Sparkles size={14} /> Show in full body context
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <p className="companion-copy mt-4">
                  {recentCorrect} of {recentTotal} recent attempts correct
                  {streak > 1 ? ` · 🔥 ${streak} in a row` : ""}.
                </p>
                <button
                  type="button"
                  className="action action-secondary w-full"
                  onClick={() => onNavigate("bones")}
                >
                  Chapter 7 Bone Landmarks Lab <ArrowRight size={16} />
                </button>
              </>
            )}

            <div className="companion-bottom">
              <p>Connect 3D anatomy to your chapters.</p>
              <button type="button" onClick={() => onNavigate("chapters")}>
                Open course library <ArrowRight size={15} />
              </button>
            </div>
          </aside>
        )}
      </div>

      <div className="atlas-footnote">
        <p>
          Drag to orbit · Scroll or pinch to zoom · Use the explode slider to separate all 2,234
          pieces · Press{" "}
          <kbd className="px-1.5 py-0.5 rounded border border-slate-300 text-[10px]">F</kbd> for
          Fullscreen · Drag the HUD header to move it anywhere.
          <br />
          Reference anatomy: adult male. Atlas descriptions and challenges are supplemental.
        </p>
        <p>
          Human Atlas by Ashe Magalhaes · MIT
          <br />
          BodyParts3D © DBCLS ·{" "}
          <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">
            CC BY 4.0
          </a>{" "}
          ·{" "}
          <a
            href={`${import.meta.env.BASE_URL}human-atlas/ATTRIBUTION.md`}
            target="_blank"
            rel="noreferrer"
          >
            Full attribution
          </a>
        </p>
      </div>
    </div>
  )
}
