import { useState } from "react"
import {
  ArrowRight,
  BookCheck,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  FolderSync,
  Layers3,
  PersonStanding,
  Search,
  Sparkles,
  XCircle,
} from "lucide-react"
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

  const courseCount = chapters.filter((c) => c.sourceType !== "supplemental").length
  const previewCount = chapters.filter((c) => c.sourceType === "supplemental").length
  const atlasSystem = CHAPTER_ATLAS_SYSTEM[selectedChapter.id]

  function handleChapterChange(chapterId) {
    onSelectChapter(chapterId)
    setActiveTerm(null)
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

  return (
    <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
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

            return (
              <button
                key={chapter.id}
                type="button"
                onClick={() => handleChapterChange(chapter.id)}
                className={`w-full rounded-2xl border px-3.5 py-2.5 text-left transition ${
                  active
                    ? "border-transparent bg-[linear-gradient(135deg,_rgba(31,109,112,0.96),_rgba(18,81,99,0.96))] text-white shadow-soft"
                    : "border-slate-200/80 bg-white/90 text-slate-800 hover:border-teal-600/40"
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
                <article className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 sm:p-5">
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
                  <details className="group rounded-2xl border border-amber-200/70 bg-amber-50/40 p-4 sm:p-5">
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
                        className={`rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${
                          isSelected
                            ? "border-transparent bg-[var(--ink-strong)] text-white shadow-soft"
                            : "border-slate-200 bg-white text-slate-800 hover:border-teal-600"
                        }`}
                      >
                        {term}
                      </button>
                    )
                  })}
                </div>

                {activeTerm ? (
                  <article
                    className="rounded-2xl border border-teal-200 bg-teal-50/60 p-4 sm:p-5"
                    role="status"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="eyebrow">Term definition</span>
                      <button
                        type="button"
                        className="text-xs font-semibold text-teal-900 underline"
                        onClick={() => setActiveTerm(null)}
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
                ) : (
                  <p className="rounded-2xl border border-dashed border-slate-200 p-4 text-xs text-slate-500">
                    Select any vocabulary pill above to inspect its meaning.
                  </p>
                )}
              </div>
            )}

            {activeTab === "check" && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-slate-500">
                    Answers stay hidden so you can test yourself first. Click an option to check.
                  </p>
                  {Object.keys(quizPicks).length > 0 && (
                    <button
                      type="button"
                      className="text-xs font-semibold text-teal-800 underline"
                      onClick={() => setQuizPicks({})}
                    >
                      Reset all answers
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {relatedQuizQuestions.map((question, index) => {
                    const picked = quizPicks[question.id]
                    const isAnswered = Boolean(picked)
                    const isCorrect = picked === question.correctAnswer

                    return (
                      <article
                        key={question.id}
                        className="rounded-2xl border border-slate-200 bg-white p-4"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="eyebrow">Question {index + 1}</span>
                          {isAnswered && (
                            <span
                              className={`inline-flex items-center gap-1 text-xs font-semibold ${
                                isCorrect ? "text-emerald-700" : "text-amber-800"
                              }`}
                            >
                              {isCorrect ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                              {isCorrect ? "Correct" : "Review"}
                            </span>
                          )}
                        </div>
                        <p className="mt-1.5 text-sm font-semibold text-slate-900">
                          {question.prompt}
                        </p>

                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          {(question.options ?? []).map((option) => {
                            const selected = picked === option
                            const showRight = isAnswered && option === question.correctAnswer
                            const showWrong = isAnswered && selected && !showRight
                            return (
                              <button
                                key={option}
                                type="button"
                                onClick={() =>
                                  setQuizPicks((prev) => ({ ...prev, [question.id]: option }))
                                }
                                className={`rounded-xl border px-3 py-2 text-left text-xs font-medium transition ${
                                  showRight
                                    ? "border-emerald-300 bg-emerald-50 text-emerald-900 font-semibold"
                                    : showWrong
                                      ? "border-rose-300 bg-rose-50 text-rose-900"
                                      : "border-slate-200 bg-slate-50/60 text-slate-800 hover:border-teal-600"
                                }`}
                              >
                                {option}
                              </button>
                            )
                          })}
                        </div>

                        {isAnswered && question.explanation && (
                          <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">
                            <strong className="text-slate-800">Why:</strong> {question.explanation}
                          </p>
                        )}
                      </article>
                    )
                  })}
                </div>

                {selectedChapter.reviewQuestions?.length > 0 && (
                  <div className="pt-2 space-y-2">
                    <h4 className="eyebrow">Open-ended reflection prompts</h4>
                    {selectedChapter.reviewQuestions.map((prompt, index) => {
                      const open = Boolean(revealedReviews[prompt])
                      return (
                        <div
                          key={prompt}
                          className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setRevealedReviews((prev) => ({ ...prev, [prompt]: !open }))
                            }
                            className="flex w-full items-center justify-between gap-2 text-left text-xs font-semibold text-slate-800"
                          >
                            <span>
                              {index + 1}. {prompt}
                            </span>
                            <span className="shrink-0 text-teal-800">
                              {open ? "Hide cue" : "Study cue"}
                            </span>
                          </button>
                          {open && (
                            <p className="mt-2 text-xs leading-5 text-slate-600">
                               Key takeaway to include:{" "}
                              {selectedChapter.mustKnow?.[
                                index % Math.max(1, selectedChapter.mustKnow.length)
                              ] ?? selectedChapter.summary}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === "cards" && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500">
                  Click any card to flip between prompt and answer.
                </p>
                {!relatedCards.length && (
                  <p className="text-sm text-slate-600">
                    No flashcards attached to this chapter yet.
                  </p>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  {relatedCards.map((card) => {
                    const isFlipped = Boolean(revealedCards[card.id])
                    return (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() =>
                          setRevealedCards((prev) => ({ ...prev, [card.id]: !isFlipped }))
                        }
                        className={`flex min-h-[148px] flex-col justify-between rounded-2xl border p-4 text-left transition ${
                          isFlipped
                            ? "border-teal-800 bg-[linear-gradient(145deg,_#175b68,_#1f6d70)] text-white"
                            : "border-slate-200 bg-white text-slate-900 hover:border-teal-600"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 w-full">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider ${
                              isFlipped ? "text-white/75" : "text-slate-400"
                            }`}
                          >
                            {card.category}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-semibold ${
                              isFlipped ? "text-teal-100" : "text-teal-800"
                            }`}
                          >
                            {isFlipped ? <EyeOff size={12} /> : <Eye size={12} />}
                            {isFlipped ? "Answer" : "Click to reveal"}
                          </span>
                        </div>
                        <p className="my-3 text-sm font-semibold leading-6">
                          {isFlipped ? card.back : card.front}
                        </p>
                        {isFlipped && card.note && (
                          <p className="border-t border-white/20 pt-2 text-xs text-white/80">
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
          <div className="p-6">
            <article className="rounded-2xl bg-slate-50 p-5">
              <h3 className="text-lg font-semibold text-slate-900">
                Upload notes or slides for Chapter {selectedChapter.number}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Add a PowerPoint, PDF, Markdown, or JSON chapter pack to start practicing.
              </p>
              <button className="action mt-4" onClick={onAddMaterials}>
                Add chapter materials
              </button>
            </article>
          </div>
        )}
      </section>
    </div>
  )
}
