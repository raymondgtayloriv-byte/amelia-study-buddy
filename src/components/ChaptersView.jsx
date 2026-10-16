import { useEffect, useRef, useState } from "react"
import {
  BookCheck,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  FolderSync,
  Image as ImageIcon,
  ImagePlus,
  Maximize2,
  PersonStanding,
  Search,
  Trash2,
  XCircle,
} from "lucide-react"
import {
  compressImageFileToDataUrl,
  getFiguresForChapter,
  loadCustomFigures,
  removeCustomFigure,
  saveCustomFigure,
} from "../data/courseVisuals"
import { CHAPTER_ATLAS_SYSTEM, VOCABULARY_DEFINITIONS } from "../data/supplementalChapters"

const confidenceOptions = [
  { id: "needs-review", label: "Needs review" },
  { id: "steady", label: "Steady" },
  { id: "ready", label: "Exam ready" },
]

export function ChaptersView({
  chapters,
  flashcards,
  quizQuestionBank,
  selectedChapter,
  chapterProgress,
  onSelectChapter,
  onUpdateChapterProgress,
  onAddMaterials,
  onExploreIn3D,
  onPracticeChapter,
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterScope, setFilterScope] = useState("all")
  const [activeTab, setActiveTab] = useState("essentials")
  const [activeTerm, setActiveTerm] = useState(null)
  const [revealedCards, setRevealedCards] = useState({})
  const [quizPicks, setQuizPicks] = useState({})
  const [revealedReviews, setRevealedReviews] = useState({})
  const [zoomedFigure, setZoomedFigure] = useState(null)
  const [revealedFigureTakeaways, setRevealedFigureTakeaways] = useState({})

  // Custom photo upload state
  const [customFiguresMap, setCustomFiguresMap] = useState(() => loadCustomFigures())
  const [photoUploading, setPhotoUploading] = useState(false)
  const [photoError, setPhotoError] = useState("")
  const [photoMessage, setPhotoMessage] = useState("")
  const [photoCaption, setPhotoCaption] = useState("")
  const photoInputRef = useRef(null)

  useEffect(() => {
    if (!zoomedFigure) return
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault()
        setZoomedFigure(null)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [zoomedFigure])

  const filteredChapters = chapters.filter((chapter) => {
    const matchesScope =
      filterScope === "all"
        ? true
        : filterScope === "course"
          ? chapter.sourceType !== "supplemental"
          : chapter.sourceType === "supplemental"
    if (!matchesScope) return false
    const text = `${chapter.number} ${chapter.title} ${chapter.summary}`.toLowerCase()
    return text.includes(searchTerm.toLowerCase())
  })

  const progress = chapterProgress[selectedChapter.id] ?? {}
  const relatedCards = flashcards.filter(
    (card) =>
      card.chapterId === selectedChapter.id ||
      selectedChapter.flashcardIds?.includes(card.id),
  )
  const relatedQuizQuestions = quizQuestionBank.filter(
    (question) =>
      question.chapterId === selectedChapter.id ||
      selectedChapter.quizIds?.includes(question.id),
  )
  const chapterFigures = getFiguresForChapter(selectedChapter.id, customFiguresMap)

  const courseCount = chapters.filter((c) => c.sourceType !== "supplemental").length
  const previewCount = chapters.filter((c) => c.sourceType === "supplemental").length
  const atlasSystem = CHAPTER_ATLAS_SYSTEM[selectedChapter.id]

  function handleChapterChange(chapterId) {
    onSelectChapter(chapterId)
    setActiveTerm(null)
    setPhotoError("")
    setPhotoMessage("")
  }

  async function handlePhotoUpload(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setPhotoUploading(true)
    setPhotoError("")
    setPhotoMessage("")
    try {
      const dataUrl = await compressImageFileToDataUrl(file)
      const cleanTitle =
        photoCaption.trim() ||
        file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ") ||
        `Chapter ${selectedChapter.number} Study Photo`
      const newFigure = {
        id: `custom-${selectedChapter.id}-${Date.now()}`,
        title: cleanTitle,
        caption: `Uploaded study figure for Chapter ${selectedChapter.number}: ${selectedChapter.title}.`,
        src: dataUrl,
        source: "course",
        sourceBadge: "Uploaded Course Photo",
        badge: "Uploaded Course Photo",
        isCustom: true,
        keyTakeaway: `Custom figure added from ${file.name}.`,
      }
      const nextMap = saveCustomFigure(selectedChapter.id, newFigure)
      setCustomFiguresMap(nextMap)
      setPhotoCaption("")
      setPhotoMessage(`Added "${cleanTitle}" to Chapter ${selectedChapter.number} figures.`)
      setActiveTab("figures")
    } catch (caught) {
      setPhotoError(
        caught instanceof Error ? caught.message : "Could not add this photo.",
      )
    } finally {
      setPhotoUploading(false)
      if (photoInputRef.current) {
        photoInputRef.current.value = ""
      }
    }
  }

  function handleRemoveCustomFigure(figId) {
    const nextMap = removeCustomFigure(selectedChapter.id, figId)
    setCustomFiguresMap(nextMap)
    if (zoomedFigure?.id === figId) {
      setZoomedFigure(null)
    }
  }

  function getTermDefinition(term) {
    const lower = term.toLowerCase()
    if (VOCABULARY_DEFINITIONS[lower]) return VOCABULARY_DEFINITIONS[lower]
    if (VOCABULARY_DEFINITIONS[term]) return VOCABULARY_DEFINITIONS[term]
    const matchingCard = relatedCards.find(
      (c) =>
        c.front.toLowerCase().includes(lower) ||
        c.back.toLowerCase().includes(lower),
    )
    if (matchingCard) return `${matchingCard.front} → ${matchingCard.back}`
    return `Core term in Chapter ${selectedChapter.number} (${selectedChapter.title}). Practice this concept in Flashcards or Practice Arcade.`
  }

  function renderFigureCard(fig) {
    const takeawayOpen = Boolean(revealedFigureTakeaways[fig.id])
    const isSvgPlate = typeof fig.src === "string" && fig.src.endsWith(".svg")
    const fallbackSrc = `${import.meta.env.BASE_URL || "/"}anatomy/concepts/ch1-fig-1.svg`
    return (
      <article
        key={fig.id}
        className="rounded-2xl border border-slate-200/80 bg-white p-4 flex flex-col justify-between gap-3"
      >
        <div>
          <div className="figure-card-header">
            <span className="figure-card-badge">{fig.sourceBadge || fig.badge}</span>
            <div className="figure-card-actions">
              {fig.isCustom && (
                <button
                  type="button"
                  className="figure-expand-btn"
                  onClick={() => handleRemoveCustomFigure(fig.id)}
                  title="Remove uploaded photo"
                >
                  <Trash2 size={12} /> Remove
                </button>
              )}
              <button
                type="button"
                className="figure-expand-btn"
                onClick={() => setZoomedFigure(fig)}
              >
                <Maximize2 size={12} /> Expand
              </button>
            </div>
          </div>

          <div
            className={`specimen-stage ${isSvgPlate ? "is-svg-plate" : ""}`}
            onClick={() => setZoomedFigure(fig)}
            role="button"
            tabIndex={0}
            aria-label={`Expand ${fig.title}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                setZoomedFigure(fig)
              }
            }}
          >
            <img
              src={fig.src}
              alt={fig.title}
              onError={(e) => {
                if (e.currentTarget.src !== fallbackSrc) {
                  e.currentTarget.src = fallbackSrc
                }
              }}
              className={isSvgPlate ? "specimen-img-svg" : "specimen-img-plate"}
              loading="lazy"
            />
          </div>
          <h4 className="mt-3 text-base font-semibold text-slate-900">{fig.title}</h4>
          <p className="mt-1 text-xs leading-5 text-slate-600">{fig.caption}</p>
        </div>

        {fig.keyTakeaway && (
          <div>
            <button
              type="button"
              onClick={() =>
                setRevealedFigureTakeaways((prev) => ({ ...prev, [fig.id]: !prev[fig.id] }))
              }
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--ink-strong)] hover:underline"
            >
              {takeawayOpen ? <EyeOff size={13} /> : <Eye size={13} />}
              {takeawayOpen ? "Hide exam takeaway" : "Click for exam takeaway"}
            </button>
            {takeawayOpen && (
              <p className="mt-2 rounded-xl bg-teal-50 px-3 py-2 text-xs font-medium leading-5 text-teal-950">
                {fig.keyTakeaway}
              </p>
            )}
          </div>
        )}
      </article>
    )
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
      {/* Hidden non-blocking photo input shared across the chapter view */}
      <input
        ref={photoInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        className="hidden"
        onChange={handlePhotoUpload}
      />

      {/* Compact, scannable chapter navigator */}
      <section className="panel px-4 py-4 sm:px-5 sm:py-5 flex flex-col max-h-[840px]">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="eyebrow">Course roadmap</p>
            <h2 className="text-xl font-semibold text-slate-900">15 Chapters</h2>
          </div>
          <span className="rounded-full bg-[rgba(31,109,112,0.08)] px-3 py-1 text-xs font-semibold text-[var(--ink-strong)]">
            {courseCount} course · {previewCount} preview
          </span>
        </div>

        <div className="mt-3 atlas-segmented-pills" role="group" aria-label="Filter chapters by source">
          {[
            ["all", `All (${chapters.length})`],
            ["course", `Course (${courseCount})`],
            ["preview", `Preview (${previewCount})`],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={filterScope === id}
              onClick={() => setFilterScope(id)}
            >
              {label}
            </button>
          ))}
        </div>

        <label className="mt-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
          <Search size={15} className="text-slate-400 shrink-0" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
            placeholder="Filter chapters…"
            type="search"
            aria-label="Search chapters"
          />
          {searchTerm && (
            <button
              type="button"
              className="text-xs font-semibold text-teal-800"
              aria-label="Clear chapter search"
              onClick={() => setSearchTerm("")}
            >
              Clear
            </button>
          )}
        </label>

        <div className="mt-3 space-y-1.5 overflow-y-auto pr-1 flex-1">
          {!filteredChapters.length && (
            <p role="status" className="p-3 text-xs text-slate-600">
              No matching chapters. Clear the filter to see all units.
            </p>
          )}
          {filteredChapters.map((chapter) => {
            const active = chapter.id === selectedChapter.id
            const chapterState = chapterProgress[chapter.id] ?? {}
            const isPreview = chapter.sourceType === "supplemental"
            const figCount = getFiguresForChapter(chapter.id, customFiguresMap).length

            return (
              <button
                key={chapter.id}
                type="button"
                onClick={() => handleChapterChange(chapter.id)}
                className={`w-full rounded-2xl border px-3.5 py-2.5 text-left transition ${
                  active
                    ? "border-transparent bg-[linear-gradient(135deg,_rgba(31,109,112,0.96),_rgba(18,81,99,0.96))] text-white shadow-soft"
                    : "border-slate-200/80 bg-white text-slate-800 hover:border-teal-600/40"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider ${
                      active ? "text-white/80" : "text-slate-500"
                    }`}
                  >
                    Ch {String(chapter.number).padStart(2, "0")}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {figCount > 0 && (
                      <span
                        className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                          active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                        }`}
                        title={`${figCount} textbook/lecture figures`}
                      >
                        <ImageIcon size={10} /> {figCount}
                      </span>
                    )}
                    {chapterState.completed && (
                      <CheckCircle2
                        size={14}
                        className={active ? "text-emerald-200" : "text-emerald-600"}
                        aria-label="Completed"
                      />
                    )}
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        active
                          ? "bg-white/20 text-white"
                          : isPreview
                            ? "bg-amber-50 text-amber-800"
                            : "bg-emerald-50 text-emerald-800"
                      }`}
                    >
                      {isPreview ? "Preview" : "Course"}
                    </span>
                  </div>
                </div>
                <p className="mt-1 text-sm font-semibold leading-snug line-clamp-1">
                  {chapter.title}
                </p>
              </button>
            )
          })}
        </div>
      </section>

      {/* Minimalist, progressive-disclosure chapter workspace */}
      <section className="panel overflow-hidden flex flex-col">
        <div className="border-b border-slate-200/70 px-5 py-5 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="eyebrow">Chapter {selectedChapter.number}</span>
                <span
                  className={`source-tag ${
                    selectedChapter.sourceType === "supplemental" ? "supplemental" : ""
                  }`}
                >
                  {selectedChapter.isPreviewPack
                    ? "Standard A&P Preview Pack"
                    : selectedChapter.sourceType === "supplemental"
                      ? "Supplemental material"
                      : "Course-based material"}
                </span>
              </div>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
                {selectedChapter.title}
              </h2>
              <p className="mt-1.5 text-sm leading-6 text-slate-600">
                {selectedChapter.summary}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={photoUploading}
                onClick={() => photoInputRef.current?.click()}
                className="action action-secondary"
                title="Upload a textbook photo or slide screenshot to this chapter"
              >
                <ImagePlus size={15} />{" "}
                {photoUploading ? "Adding photo…" : "Add photo"}
              </button>
              {onExploreIn3D && atlasSystem && (
                <button
                  type="button"
                  onClick={() => onExploreIn3D(selectedChapter.id)}
                  className="action action-secondary"
                  title={`Open 3D Human Atlas filtered to ${atlasSystem} system`}
                >
                  <PersonStanding size={15} /> 3D Atlas ({atlasSystem})
                </button>
              )}
              {onPracticeChapter && (
                <button
                  type="button"
                  onClick={() => onPracticeChapter(selectedChapter.id)}
                  className="action"
                >
                  <Brain size={15} /> Practice chapter
                </button>
              )}
            </div>
          </div>

          {photoMessage && (
            <p
              role="status"
              className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-900"
            >
              {photoMessage}
            </p>
          )}
          {photoError && (
            <p
              role="alert"
              className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-900"
            >
              {photoError}
            </p>
          )}

          {/* Progress & Confidence bar */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  onUpdateChapterProgress(selectedChapter.id, {
                    completed: !progress.completed,
                  })
                }
                disabled={selectedChapter.status !== "ready"}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                  progress.completed
                    ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                    : "border-slate-200 bg-white text-slate-700 hover:border-teal-600"
                }`}
              >
                <BookCheck size={14} />
                {progress.completed ? "Completed" : "Mark complete"}
              </button>

              {selectedChapter.status === "ready" && (
                <div className="inline-flex items-center rounded-full bg-slate-100 p-0.5">
                  {confidenceOptions.map((option) => {
                    const active = progress.confidence === option.id
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() =>
                          onUpdateChapterProgress(selectedChapter.id, {
                            confidence: option.id,
                          })
                        }
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                          active
                            ? "bg-[var(--ink-strong)] text-white"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {option.label}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {selectedChapter.isPreviewPack && (
              <button
                type="button"
                onClick={onAddMaterials}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800 hover:underline"
              >
                <FolderSync size={13} /> Upload Amelia’s Ch. {selectedChapter.number} slides
              </button>
            )}
          </div>

          {/* Progressive Disclosure Tabs */}
          {selectedChapter.status === "ready" && (
            <div
              className="mt-4 flex flex-wrap gap-1.5"
              role="tablist"
              aria-label="Chapter study views"
            >
              {[
                ["essentials", "Essentials & Takeaways"],
                ["figures", `Figures & Diagrams (${chapterFigures.length})`],
                ["vocab", `Key Terms (${selectedChapter.vocabulary?.length ?? 0})`],
                [
                  "check",
                  `Self-Check (${
                    relatedQuizQuestions.length + (selectedChapter.reviewQuestions?.length ?? 0)
                  })`,
                ],
                ["cards", `Flashcards (${relatedCards.length})`],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === id}
                  onClick={() => setActiveTab(id)}
                  className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                    activeTab === id
                      ? "bg-[var(--ink-strong)] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tab Body */}
        {selectedChapter.status === "ready" ? (
          <div className="p-5 sm:p-6 space-y-4">
            {activeTab === "essentials" && (
              <>
                <article className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                      {selectedChapter.sourceLabel && !selectedChapter.isPreviewPack
                        ? "Source notes"
                        : "Core picture"}
                    </h3>
                    {selectedChapter.sourceLabel && (
                      <span className="text-xs text-slate-500">{selectedChapter.sourceLabel}</span>
                    )}
                  </div>
                  <p className="mt-2.5 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                    {selectedChapter.notes || selectedChapter.detailSummary}
                  </p>
                </article>

                {/* Featured visual strip inside Essentials */}
                {chapterFigures.length > 0 && (
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div>
                        <span className="eyebrow">Visual Reference</span>
                        <h3 className="text-base font-semibold text-slate-900">
                          {chapterFigures[0].sourceBadge || "Course Figure"} ({chapterFigures.length})
                        </h3>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => photoInputRef.current?.click()}
                          className="text-xs font-semibold text-[var(--ink-strong)] hover:underline"
                        >
                          + Add photo
                        </button>
                        {chapterFigures.length > 2 && (
                          <button
                            type="button"
                            onClick={() => setActiveTab("figures")}
                            className="text-xs font-semibold text-[var(--ink-strong)] hover:underline"
                          >
                            View all {chapterFigures.length} figures →
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      {chapterFigures.slice(0, 2).map((fig) => renderFigureCard(fig))}
                    </div>
                  </div>
                )}

                {selectedChapter.mustKnow?.length > 0 && (
                  <details
                    className="group rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5"
                    open
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-2 font-semibold text-slate-900">
                      <span>Must-know concepts ({selectedChapter.mustKnow.length})</span>
                      <ChevronDown
                        size={16}
                        className="text-slate-400 transition group-open:rotate-180"
                      />
                    </summary>
                    <ul className="mt-3.5 space-y-2.5 text-sm leading-6 text-slate-700">
                      {selectedChapter.mustKnow.map((item) => (
                        <li key={item} className="flex gap-2.5">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--ink-strong)]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}

                {selectedChapter.commonConfusions?.length > 0 && (
                  <details className="group rounded-2xl border border-amber-200/70 bg-amber-50 p-4 sm:p-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-2 font-semibold text-slate-900">
                      <span>
                        Common exam traps — click to reveal ({selectedChapter.commonConfusions.length})
                      </span>
                      <ChevronDown
                        size={16}
                        className="text-slate-400 transition group-open:rotate-180"
                      />
                    </summary>
                    <ul className="mt-3.5 space-y-2.5 text-sm leading-6 text-slate-700">
                      {selectedChapter.commonConfusions.map((item) => (
                        <li key={item} className="flex gap-2.5">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </>
            )}

            {activeTab === "figures" && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-50 p-3.5">
                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      Click any figure to enlarge it in full resolution, or attach your own lecture photo / diagram.
                    </p>
                    {selectedChapter.id === "chapter-7" && onPracticeChapter && (
                      <span className="text-xs font-semibold text-[var(--ink-strong)]">
                        47 total bone views also available in Bone Landmarks Lab
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      value={photoCaption}
                      onChange={(e) => setPhotoCaption(e.target.value)}
                      placeholder="Optional photo title…"
                      aria-label="Optional photo title"
                      className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800"
                    />
                    <button
                      type="button"
                      disabled={photoUploading}
                      onClick={() => photoInputRef.current?.click()}
                      className="action text-xs"
                    >
                      <ImagePlus size={14} />{" "}
                      {photoUploading ? "Processing photo…" : "Upload Photo / Diagram"}
                    </button>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {chapterFigures.map((fig) => renderFigureCard(fig))}
                </div>
              </div>
            )}

            {activeTab === "vocab" && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500">
                  Click any term below to reveal its definition without cluttering the page.
                </p>
                <div className="flex flex-wrap gap-2">
                  {(selectedChapter.vocabulary ?? []).map((term) => {
                    const isSelected = activeTerm === term
                    return (
                      <button
                        key={term}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setActiveTerm(isSelected ? null : term)}
                        className={`rounded-full border px-3.5 py-2 text-xs font-semibold transition ${
                          isSelected
                            ? "border-transparent bg-[var(--ink-strong)] text-white shadow-soft"
                            : "border-slate-200 bg-white text-slate-700 hover:border-teal-600"
                        }`}
                      >
                        {term}
                      </button>
                    )
                  })}
                </div>

                {activeTerm && (
                  <article
                    className="rounded-2xl border border-teal-200 bg-teal-50 p-4 sm:p-5"
                    role="status"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-teal-900">
                        Selected Term
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveTerm(null)}
                        className="text-xs font-semibold text-teal-800 hover:underline"
                      >
                        Close
                      </button>
                    </div>
                    <h4 className="mt-1 text-lg font-semibold capitalize text-slate-900">
                      {activeTerm}
                    </h4>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {getTermDefinition(activeTerm)}
                    </p>
                  </article>
                )}
              </div>
            )}

            {activeTab === "check" && (
              <div className="space-y-4">
                {selectedChapter.reviewQuestions?.length > 0 && (
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Concept prompts — think first, then click to check
                    </h3>
                    {selectedChapter.reviewQuestions.map((prompt, index) => {
                      const key = `${selectedChapter.id}-rev-${index}`
                      const open = Boolean(revealedReviews[key])
                      const hintItem =
                        selectedChapter.mustKnow?.[index % (selectedChapter.mustKnow?.length || 1)] ??
                        selectedChapter.summary
                      return (
                        <div
                          key={prompt}
                          className="rounded-2xl border border-slate-200/80 bg-white p-4"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setRevealedReviews((prev) => ({ ...prev, [key]: !prev[key] }))
                            }
                            className="flex w-full items-start justify-between gap-3 text-left"
                          >
                            <span className="text-sm font-semibold text-slate-900">
                              {index + 1}. {prompt}
                            </span>
                            <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                              {open ? <EyeOff size={12} /> : <Eye size={12} />}
                              {open ? "Hide cue" : "Show cue"}
                            </span>
                          </button>
                          {open && (
                            <p className="mt-3 border-t border-slate-100 pt-3 text-sm leading-6 text-teal-900">
                              <strong>Key anchor:</strong> {hintItem}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {relatedQuizQuestions.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Interactive quick-check questions ({relatedQuizQuestions.length})
                    </h3>
                    {relatedQuizQuestions.map((question, index) => {
                      const picked = quizPicks[question.id]
                      const isCorrect = picked === question.correctAnswer
                      return (
                        <article
                          key={question.id}
                          className="rounded-2xl border border-slate-200/80 bg-white p-4"
                        >
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Question {index + 1}
                          </p>
                          <p className="mt-1.5 text-sm font-semibold text-slate-900">
                            {question.prompt}
                          </p>
                          <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            {(question.options ?? []).map((option) => {
                              const selected = picked === option
                              const showRight = picked && option === question.correctAnswer
                              const showWrong = selected && !showRight
                              return (
                                <button
                                  key={option}
                                  type="button"
                                  onClick={() =>
                                    setQuizPicks((prev) => ({ ...prev, [question.id]: option }))
                                  }
                                  className={`rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition ${
                                    showRight
                                      ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                                      : showWrong
                                        ? "border-rose-300 bg-rose-50 text-rose-900"
                                        : "border-slate-200 bg-slate-50 text-slate-800 hover:border-teal-600"
                                  }`}
                                >
                                  {option}
                                </button>
                              )
                            })}
                          </div>
                          {picked && (
                            <div className="mt-3 flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-700">
                              {isCorrect ? (
                                <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                              ) : (
                                <XCircle size={15} className="text-rose-500 shrink-0 mt-0.5" />
                              )}
                              <div>
                                <span className="font-semibold">
                                  {isCorrect
                                    ? "Correct!"
                                    : `Answer: ${question.correctAnswer}.`}
                                </span>{" "}
                                {question.explanation}
                              </div>
                            </div>
                          )}
                        </article>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === "cards" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-slate-500">
                    Click any card below to flip between prompt and explanation.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {relatedCards.map((card) => {
                    const isFlipped = Boolean(revealedCards[card.id])
                    return (
                      <button
                        key={card.id}
                        type="button"
                        aria-pressed={isFlipped}
                        onClick={() =>
                          setRevealedCards((prev) => ({ ...prev, [card.id]: !prev[card.id] }))
                        }
                        className={`rounded-2xl border p-4 text-left transition ${
                          isFlipped
                            ? "border-teal-700 bg-teal-50 text-slate-900"
                            : "border-slate-200/80 bg-white text-slate-900 hover:border-teal-600"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            {card.category || "Concept"}
                          </span>
                          <span className="text-[11px] font-semibold text-teal-800 inline-flex items-center gap-1">
                            {isFlipped ? "Answer" : "Click to flip"}
                            <ChevronRight size={12} />
                          </span>
                        </div>
                        <p className="mt-2.5 text-sm font-semibold leading-6">
                          {isFlipped ? card.back : card.front}
                        </p>
                        {isFlipped && card.note && (
                          <p className="mt-2 border-t border-teal-200/60 pt-2 text-xs leading-5 text-slate-600">
                            {card.note}
                          </p>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-5 sm:p-6">
            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="text-lg font-semibold text-slate-900">
                Upload notes for this chapter
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Add your instructor slides or notes to populate this unit.
              </p>
              <button type="button" className="action mt-4" onClick={onAddMaterials}>
                Add chapter materials
              </button>
            </article>
          </div>
        )}
      </section>

      {/* Lightbox Modal for Zoomed Textbook Figures */}
      {zoomedFigure && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm"
          onClick={() => setZoomedFigure(null)}
          role="dialog"
          aria-modal="true"
          aria-label={zoomedFigure.title}
        >
          <div
            className="figure-lightbox-card relative max-h-[92dvh] max-w-[92vw] overflow-auto rounded-3xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-900">
                  {zoomedFigure.sourceBadge || zoomedFigure.badge}
                </span>
                <h3 className="text-lg font-bold text-slate-900">{zoomedFigure.title}</h3>
                <p className="text-xs text-slate-600">{zoomedFigure.caption}</p>
              </div>
              <button
                type="button"
                onClick={() => setZoomedFigure(null)}
                className="rounded-full bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white"
              >
                Close (Esc)
              </button>
            </div>
            <div
              className={`specimen-stage is-lightbox-stage ${
                typeof zoomedFigure.src === "string" && zoomedFigure.src.endsWith(".svg")
                  ? "is-svg-plate"
                  : ""
              }`}
            >
              <img
                src={zoomedFigure.src}
                alt={zoomedFigure.title}
                className={
                  typeof zoomedFigure.src === "string" && zoomedFigure.src.endsWith(".svg")
                    ? "specimen-img-svg"
                    : "specimen-img-plate"
                }
              />
            </div>
            {zoomedFigure.keyTakeaway && (
              <p className="mt-3 rounded-xl bg-teal-50 px-4 py-2.5 text-xs font-semibold text-teal-950">
                Exam Takeaway: {zoomedFigure.keyTakeaway}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
