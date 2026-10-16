import { useState } from "react"
import { ArrowRight, ChevronDown, Eye, EyeOff, Printer } from "lucide-react"
import { VOCABULARY_DEFINITIONS } from "../data/supplementalChapters"

export function StudyGuides({ chapters, selectedChapter, onSelectChapter, onPractice, cramDecks }) {
  const [revealed, setRevealed] = useState(false)
  const [activeTerm, setActiveTerm] = useState(null)
  const [checkedPrompts, setCheckedPrompts] = useState({})
  const chapter = chapters.find((item) => item.id === selectedChapter.id) ?? chapters[0]

  function getDefinition(term) {
    return (
      VOCABULARY_DEFINITIONS[term.toLowerCase()] ??
      VOCABULARY_DEFINITIONS[term] ??
      `Key concept in Chapter ${chapter.number}: ${chapter.title}.`
    )
  }

  return (
    <div className="space-y-4 guide-print">
      <section className="panel p-5 sm:p-6">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Study guides</p>
            <h2 className="mt-1 text-2xl font-semibold sm:text-3xl">
              Understand it. Explain it. Remember it.
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Start without the answers. Click any prompt or term to peek when you need a cue, or print as a clean worksheet.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 print-hidden">
            <button type="button" className="action action-secondary" onClick={() => window.print()}>
              <Printer size={16} /> Print worksheet
            </button>
            <button type="button" className="action" onClick={onPractice}>
              Practice chapter <ArrowRight size={16} />
            </button>
          </div>
        </div>
        <label className="field mt-4 print-hidden">
          <span>Chapter guide</span>
          <select
            value={chapter.id}
            onChange={(event) => {
              onSelectChapter(event.target.value)
              setRevealed(false)
              setActiveTerm(null)
            }}
          >
            {chapters.map((item) => (
              <option key={item.id} value={item.id}>
                Chapter {item.number} — {item.title}{" "}
                {item.isPreviewPack ? "(Preview Pack)" : ""}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="panel p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span
            className={`source-tag ${
              chapter.sourceType === "supplemental" ? "supplemental" : ""
            }`}
          >
            {chapter.isPreviewPack
              ? "Standard A&P Preview Pack"
              : chapter.sourceType === "supplemental"
                ? "Supplemental"
                : "Course-based study material"}
          </span>
          <button
            type="button"
            className="action action-secondary print-hidden"
            onClick={() => setRevealed(!revealed)}
            aria-expanded={revealed}
          >
            {revealed ? <EyeOff size={15} /> : <Eye size={15} />}
            {revealed ? "Hide answer key" : "Reveal full answer key"}
          </button>
        </div>

        <h2 className="mt-3 text-2xl font-semibold">{chapter.title}</h2>

        <div className="guide-columns mt-5">
          <div>
            <p className="eyebrow">01 / Retrieve</p>
            <h3>Explain from memory</h3>
            <p className="text-xs text-slate-500 mb-3 print-hidden">
              Click any prompt to toggle its takeaway check.
            </p>
            <ol className="guide-questions space-y-2">
              {(chapter.reviewQuestions?.length
                ? chapter.reviewQuestions
                : [
                    "What are the main ideas in these notes?",
                    "Which terms can you explain without looking?",
                  ]
              ).map((question, index) => {
                const isOpen = Boolean(checkedPrompts[question])
                return (
                  <li key={question}>
                    <button
                      type="button"
                      onClick={() =>
                        setCheckedPrompts((prev) => ({ ...prev, [question]: !isOpen }))
                      }
                      className="w-full text-left font-medium text-slate-800 hover:text-teal-800 print-hidden"
                    >
                      {question}{" "}
                      <span className="ml-1 text-[11px] font-semibold text-teal-700 underline">
                        {isOpen ? "hide check" : "check cue"}
                      </span>
                    </button>
                    <span className="hidden print:inline">{question}</span>
                    {isOpen && (
                      <p className="mt-1.5 rounded-xl bg-teal-50 p-2.5 text-xs leading-5 text-slate-700 print-hidden">
                        <strong>Check:</strong>{" "}
                        {chapter.mustKnow?.[
                          index % Math.max(1, chapter.mustKnow?.length ?? 1)
                        ] ?? chapter.summary}
                      </p>
                    )}
                    <div className="writing-lines" aria-hidden="true" />
                  </li>
                )
              })}
            </ol>
          </div>

          <div>
            <p className="eyebrow">02 / Connect</p>
            <h3>Map the key terms</h3>
            <p className="text-xs text-slate-500 mt-1 print-hidden">
              Click any term pill to peek at its definition while building your concept map.
            </p>
            <div className="concept-cloud">
              {(chapter.vocabulary ?? []).map((term) => {
                const selected = activeTerm === term
                return (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setActiveTerm(selected ? null : term)}
                    className={`rounded-md border px-2.5 py-1.5 text-xs font-medium transition ${
                      selected
                        ? "border-transparent bg-[var(--ink-strong)] text-white"
                        : "border-[var(--studio-border)] bg-[#edf4f1] text-slate-800 hover:border-teal-600"
                    }`}
                  >
                    {term}
                  </button>
                )
              })}
            </div>
            {activeTerm && (
              <div className="mt-3 rounded-xl border border-teal-200 bg-teal-50 p-3 text-xs leading-5 text-slate-700 print-hidden">
                <strong className="capitalize text-slate-900">{activeTerm}:</strong>{" "}
                {getDefinition(activeTerm)}
              </div>
            )}
            <div className="sketch-space" aria-label="Space for your diagram when printed">
              <span>Your concept map goes here when printed.</span>
            </div>
          </div>
        </div>

        <div className={`guide-answer ${revealed ? "is-revealed" : ""}`}>
          <h3 className="text-lg font-semibold mt-6">03 / Course notes & takeaways</h3>
          <p className="whitespace-pre-wrap mt-2 text-sm leading-7 text-slate-700">
            {chapter.notes || chapter.detailSummary}
          </p>
          <ul className="mt-4 space-y-2">
            {(chapter.mustKnow ?? []).map((item) => (
              <li className="text-sm leading-6 flex gap-2" key={item}>
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--ink-strong)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          {chapter.commonConfusions?.length > 0 && (
            <>
              <h4 className="mt-5 font-semibold text-sm">Watch for these traps</h4>
              <ul className="mt-2 space-y-2">
                {chapter.commonConfusions.map((item) => (
                  <li className="text-sm leading-6 text-slate-700 flex gap-2" key={item}>
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>

      <details className="panel p-5 sm:p-6 print-hidden group">
        <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
          <span>Quick cram sheets ({cramDecks.length} units)</span>
          <ChevronDown size={16} className="text-slate-400 transition group-open:rotate-180" />
        </summary>
        <div className="grid gap-4 md:grid-cols-2 mt-4">
          {cramDecks.map((deck) => (
            <article key={deck.id} className="rounded-2xl border border-slate-200/80 p-4">
              <p className="eyebrow">{deck.label} / course-based</p>
              <h3 className="mt-1 text-base font-semibold">{deck.title}</h3>
              <ul className="mt-2.5 space-y-1.5 text-xs leading-5 text-slate-700">
                {deck.mustKnow.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
              <h4 className="mt-3 font-semibold text-xs text-amber-900">Common mistakes</h4>
              <ul className="mt-1.5 space-y-1.5 text-xs leading-5 text-slate-600">
                {deck.mistakes.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </details>
    </div>
  )
}
