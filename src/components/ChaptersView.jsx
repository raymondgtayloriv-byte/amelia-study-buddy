import { useState } from "react"
import { BookCheck, CheckCircle2, Search, Sparkles } from "lucide-react"

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
}) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredChapters = chapters.filter((chapter) => {
    const text = `${chapter.number} ${chapter.title} ${chapter.summary}`.toLowerCase()
    return text.includes(searchTerm.toLowerCase())
  })

  const progress = chapterProgress[selectedChapter.id] ?? {}
  const relatedCards = flashcards.filter((card) =>
    selectedChapter.flashcardIds?.includes(card.id),
  )
  const relatedQuizQuestions = quizQuestionBank.filter((question) =>
    selectedChapter.quizIds?.includes(question.id),
  )

  return (
    <div className="grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
      <section className="panel px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow">Chapters</p>
            <h2 className="text-2xl font-semibold text-slate-900">
              Course roadmap
            </h2>
          </div>
          <div className="rounded-2xl bg-[rgba(31,109,112,0.08)] px-3 py-2 text-sm font-semibold text-[var(--ink-strong)]">
            {chapters.length} chapters
          </div>
        </div>

        <label className="mt-5 flex items-center gap-3 rounded-[22px] border border-white/70 bg-white/80 px-4 py-3">
          <Search size={18} className="text-slate-400" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            placeholder="Search chapter titles or starter summaries"
            type="search"
            aria-label="Search chapters"
          />
          {searchTerm && <button type="button" aria-label="Clear chapter search" onClick={() => setSearchTerm("")}>Clear</button>}
        </label>

        <div className="mt-5 space-y-3">
          {!filteredChapters.length && <p role="status" className="p-4 text-sm text-slate-600">No matching chapters. Clear the search to see your course library.</p>}
          {filteredChapters.map((chapter) => {
            const ready = chapter.status === "ready"
            const active = chapter.id === selectedChapter.id
            const chapterState = chapterProgress[chapter.id] ?? {}

            return (
              <button
                key={chapter.id}
                type="button"
                onClick={() => onSelectChapter(chapter.id)}
                className={`w-full rounded-[24px] border p-4 text-left transition ${
                  active
                    ? "border-transparent bg-[linear-gradient(135deg,_rgba(31,109,112,0.96),_rgba(18,81,99,0.96))] text-white shadow-soft"
                    : "border-white/75 bg-white/85 text-slate-800 hover:-translate-y-0.5"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p
                      className={`text-xs font-semibold uppercase tracking-[0.18em] ${
                        active ? "text-white/72" : "text-slate-500"
                      }`}
                    >
                      Chapter {chapter.number}
                    </p>
                    <h3 className="mt-2 text-base font-semibold">{chapter.title}</h3>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      ready
                        ? active
                          ? "bg-white/16 text-white"
                          : "bg-[rgba(16,185,129,0.12)] text-emerald-700"
                        : active
                          ? "bg-white/16 text-white"
                          : "bg-[rgba(148,163,184,0.14)] text-slate-600"
                    }`}
                  >
                    {ready ? "Ready now" : "Coming soon"}
                  </span>
                </div>
                <p
                  className={`mt-3 text-sm leading-6 ${
                    active ? "text-white/82" : "text-slate-600"
                  }`}
                >
                  {chapter.summary}
                </p>
                {ready ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {chapterState.completed ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/16 px-3 py-1 text-xs font-semibold">
                        <CheckCircle2 size={14} />
                        Completed
                      </span>
                    ) : null}
                    {chapterState.confidence ? (
                      <span className="rounded-full bg-white/16 px-3 py-1 text-xs font-semibold">
                        {chapterState.confidence.replace("-", " ")}
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </button>
            )
          })}
        </div>
      </section>

      <section className="panel overflow-hidden">
        <div className="border-b border-white/60 px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <p className="eyebrow">
                Chapter {selectedChapter.number} detail
              </p>
              <span className="source-tag mt-3">{selectedChapter.sourceType === "supplemental" ? "Supplemental material" : "Course-based study material"}</span>
              {selectedChapter.sourceLabel && <p className="mt-2 text-xs text-slate-500">Source: {selectedChapter.sourceLabel}</p>}
              <h2 className="text-3xl font-semibold text-slate-900">
                {selectedChapter.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                {selectedChapter.summary}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  onUpdateChapterProgress(selectedChapter.id, {
                    completed: !progress.completed,
                  })
                }
                disabled={selectedChapter.status !== "ready"}
                className="inline-flex items-center gap-2 rounded-full border border-[rgba(31,109,112,0.16)] bg-white/85 px-4 py-2 text-sm font-semibold text-[var(--ink-strong)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <BookCheck size={16} />
                {progress.completed ? "Marked complete" : "Mark complete"}
              </button>
              {selectedChapter.status === "ready" ? (
                <div className="inline-flex items-center rounded-full bg-[rgba(31,109,112,0.08)] p-1">
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
                        className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                          active
                            ? "bg-[var(--ink-strong)] text-white shadow-soft"
                            : "text-slate-600"
                        }`}
                      >
                        {option.label}
                      </button>
                    )
                  })}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {selectedChapter.status === "ready" ? (
          <div className="grid gap-4 px-5 py-5 sm:px-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
            <div className="space-y-4">
              <article className="rounded-[28px] bg-[rgba(247,251,252,0.94)] p-5">
                <h3 className="text-lg font-semibold text-slate-900">
                  {selectedChapter.sourceLabel ? "Source notes" : "Plain-English summary"}
                </h3>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700 sm:text-base">
                  {selectedChapter.notes || selectedChapter.detailSummary}
                </p>
              </article>

              <div className={selectedChapter.vocabulary.length || selectedChapter.mustKnow.length ? "grid gap-4 lg:grid-cols-2" : "hidden"}>
                <article className="rounded-[28px] bg-[rgba(238,250,246,0.95)] p-5">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Key vocabulary
                  </h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedChapter.vocabulary.map((term) => (
                      <span key={term} className="pill">
                        {term}
                      </span>
                    ))}
                  </div>
                </article>

                <article className="rounded-[28px] bg-[rgba(237,244,255,0.95)] p-5">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Must-know concepts
                  </h3>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                    {selectedChapter.mustKnow.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="mt-2 h-2 w-2 rounded-full bg-[var(--ink-strong)]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              </div>

              <div className={selectedChapter.commonConfusions.length || selectedChapter.reviewQuestions.length ? "grid gap-4 lg:grid-cols-2" : "hidden"}>
                <article className="rounded-[28px] bg-[rgba(255,247,237,0.95)] p-5">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Common confusions
                  </h3>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                    {selectedChapter.commonConfusions.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="mt-2 h-2 w-2 rounded-full bg-amber-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>

                <article className="rounded-[28px] bg-[rgba(244,247,255,0.95)] p-5">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Quick review questions
                  </h3>
                  <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                    {selectedChapter.reviewQuestions.map((item, index) => (
                      <li key={item} className="flex gap-3">
                        <span className="text-sm font-semibold text-[var(--ink-strong)]">
                          {index + 1}.
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ol>
                </article>
              </div>
            </div>

            <div className="space-y-4">
              <article className="rounded-[28px] bg-[rgba(252,252,255,0.96)] p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.8)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(31,109,112,0.1)] text-[var(--ink-strong)]">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Connected flashcards
                    </h3>
                    <p className="text-sm text-slate-500">
                      Saved prompts tied to this chapter
                    </p>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  {!relatedCards.length && <p className="text-sm leading-6 text-slate-600">This upload contains notes only. Add an authored JSON pack when you have flashcards to practice.</p>}
                  {relatedCards.map((card) => (
                    <div
                      key={card.id}
                      className="rounded-[22px] border border-[rgba(148,163,184,0.15)] bg-white p-4"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        {card.category}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">
                        {card.front}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {card.back}
                      </p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-[28px] bg-[rgba(248,251,252,0.96)] p-5">
                <h3 className="text-lg font-semibold text-slate-900">
                  Connected quiz questions
                </h3>
                <div className="mt-4 space-y-3">
                  {!relatedQuizQuestions.length && <p className="text-sm leading-6 text-slate-600">No authored questions are attached to this chapter yet.</p>}
                  {relatedQuizQuestions.map((question, index) => (
                    <div
                      key={question.id}
                      className="rounded-[22px] border border-[rgba(148,163,184,0.14)] bg-white p-4"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Question {index + 1}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">
                        {question.prompt}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Correct answer: {question.correctAnswer}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 px-5 py-5 sm:px-6 lg:grid-cols-[1fr_0.85fr]">
            <article className="rounded-[28px] bg-[rgba(248,251,252,0.95)] p-5">
              <h3 className="text-lg font-semibold text-slate-900">
                Your notes can fill this chapter.
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                The outline is here; your course materials have not been added.
                Upload your notes or a chapter pack to start studying this unit.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {selectedChapter.outline.map((item) => (
                  <span key={item} className="pill">
                    {item}
                  </span>
                ))}
              </div>
              <button className="action mt-5" onClick={onAddMaterials}>Add this chapter’s materials</button>
            </article>

            <article className="rounded-[28px] bg-[rgba(237,244,255,0.95)] p-5">
              <h3 className="text-lg font-semibold text-slate-900">
                A simple way to add a chapter
              </h3>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                <li className="flex gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-[var(--ink-strong)]" />
                  <span>Short overview and student-friendly concept summary</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-[var(--ink-strong)]" />
                  <span>Key vocabulary, flashcards, and starter quiz bank</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-[var(--ink-strong)]" />
                  <span>Later sync with real lecture slides, modules, and dates</span>
                </li>
              </ul>
            </article>
          </div>
        )}
      </section>
    </div>
  )
}
