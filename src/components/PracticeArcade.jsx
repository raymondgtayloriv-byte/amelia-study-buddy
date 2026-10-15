import { useEffect, useMemo, useState } from "react"
import { ArrowRight, CheckCircle2, Flame, RotateCcw, Sparkles, Zap } from "lucide-react"
import {
  getChapterMaterials,
  getNextTierRecommendation,
  getPracticeResultKey,
  getQuestionAliases,
  isAnswerCorrect,
  PRACTICE_TIERS,
  scoreAttempt,
  shuffleItems,
  sourceName,
} from "../lib/practice"

function makeQuestions(materials, tier, onlyIds = null, fullExam = false) {
  const pool = materials.questions.filter((question) => !onlyIds || onlyIds.has(question.id))
  const count = tier === "exam" ? (fullExam ? pool.length : Math.min(12, pool.length)) : Math.min(8, pool.length)
  return shuffleItems(pool)
    .slice(0, count)
    .map((question) => ({
      ...question,
      choices: shuffleItems(
        question.options?.length
          ? question.options
          : [
              question.correctAnswer,
              ...pool
                .filter((item) => item.id !== question.id)
                .map((item) => item.correctAnswer)
                .filter(Boolean)
                .slice(0, 3),
            ],
      ),
    }))
}

export function PracticeArcade({
  chapters = [],
  flashcards = [],
  questions = [],
  progress = {},
  onSaveResult,
  onOpenAnatomy,
  onOpenCourseDrills,
  initialChapterId,
}) {
  const [chapterId, setChapterId] = useState(initialChapterId ?? chapters[0]?.id ?? "")
  const chapter = chapters.find((item) => item.id === chapterId) ?? chapters[0]
  const [source, setSource] = useState(() =>
    chapter?.sourceType === "supplemental" ? "supplemental" : "course",
  )
  const [tier, setTier] = useState("recognition")
  const [activity, setActivity] = useState("questions")
  const [session, setSession] = useState(null)
  const [response, setResponse] = useState("")
  const [pairs, setPairs] = useState(null)
  const [matched, setMatched] = useState([])
  const [selected, setSelected] = useState([])
  const [mismatchIds, setMismatchIds] = useState([])
  const [moves, setMoves] = useState(0)
  const [pairMessage, setPairMessage] = useState("")
  const [fullChapterExam, setFullChapterExam] = useState(false)
  const [instantExamFeedback, setInstantExamFeedback] = useState(true)
  const [latestScores, setLatestScores] = useState({})
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)

  const materials = useMemo(
    () => getChapterMaterials({ chapter, chapters, flashcards, questions }),
    [chapter, chapters, flashcards, questions],
  )
  const scoped = useMemo(
    () => ({
      ...materials,
      flashcards: materials.flashcards.filter(
        (item) => source === "all" || (item.sourceType ?? materials.chapter.sourceType ?? "course") === source,
      ),
      questions: materials.questions.filter(
        (item) => source === "all" || (item.sourceType ?? materials.chapter.sourceType ?? "course") === source,
      ),
    }),
    [materials, source],
  )

  const active = session && !session.submitted ? session.items?.[session.index] : null
  const recommendation = getNextTierRecommendation({ ...progress, ...latestScores }, chapter?.id)
  const selectedSourceLabel =
    source === "all" ? "combined" : sourceName({ sourceType: source }).toLowerCase()

  function handleChapterSelect(nextId) {
    setChapterId(nextId)
    const nextChapter = chapters.find((item) => item.id === nextId)
    if (nextChapter) {
      setSource(nextChapter.sourceType === "supplemental" ? "supplemental" : "course")
    }
    setSession(null)
    setPairs(null)
  }

  function begin(nextTier = tier, retryIds = null) {
    const items = makeQuestions(scoped, nextTier, retryIds, fullChapterExam)
    setTier(nextTier)
    setSession({ tier: nextTier, items, index: 0, answers: [], submitted: false, pendingFeedback: false })
    setResponse("")
    setStreak(0)
  }

  function answer(value) {
    if (!session || session.submitted || !active || session.answers.some((item) => item.questionId === active.id)) {
      return
    }
    const correct = isAnswerCorrect(value, active.correctAnswer, getQuestionAliases(active))
    const nextStreak = correct ? streak + 1 : 0
    setStreak(nextStreak)
    if (nextStreak > bestStreak) setBestStreak(nextStreak)

    const nextAnswers = [
      ...session.answers,
      {
        questionId: active.id,
        prompt: active.prompt,
        response: value,
        correctAnswer: active.correctAnswer,
        correct,
      },
    ]
    const showFeedback = session.tier !== "exam" || instantExamFeedback
    if (showFeedback) {
      setSession({ ...session, answers: nextAnswers, pendingFeedback: true })
    } else {
      advance({ ...session, answers: nextAnswers })
    }
    setResponse("")
  }

  function advance(current) {
    const last = current.index >= current.items.length - 1
    if (last) {
      const result = scoreAttempt(current.answers)
      setSession({ ...current, submitted: true, pendingFeedback: false, result })
      const resultKey = getPracticeResultKey(current.tier, chapter.id)
      setLatestScores((old) => ({
        ...old,
        [resultKey]: {
          ...old[resultKey],
          percent: result.percent,
          bestPercent: Math.max(
            old[resultKey]?.bestPercent ?? progress?.[resultKey]?.bestPercent ?? 0,
            result.percent ?? 0,
          ),
        },
      }))
      onSaveResult?.({ chapterId: chapter.id, tier: current.tier, resultKey, ...result })
    } else {
      setSession({ ...current, index: current.index + 1, pendingFeedback: false })
    }
  }

  useEffect(() => {
    if (activity !== "questions" || !session || session.submitted) return
    const onKey = (event) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return
      }
      if (session.pendingFeedback && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault()
        advance(session)
        return
      }
      if (!session.pendingFeedback && session.tier !== "retrieval" && active?.choices) {
        const idx = Number(event.key) - 1
        if (idx >= 0 && idx < active.choices.length) {
          event.preventDefault()
          answer(active.choices[idx])
        }
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  function startMatching() {
    const cards = shuffleItems(scoped.flashcards).slice(0, Math.min(6, scoped.flashcards.length))
    setPairs(
      shuffleItems(
        cards.flatMap((card) => [
          { id: `${card.id}:front`, pairId: card.id, text: card.front, side: "Prompt" },
          { id: `${card.id}:back`, pairId: card.id, text: card.back, side: "Answer" },
        ]),
      ),
    )
    setMatched([])
    setSelected([])
    setMismatchIds([])
    setMoves(0)
    setPairMessage("Select any prompt and its matching answer.")
  }

  function choosePair(item) {
    if (matched.includes(item.pairId)) return
    if (selected.some((entry) => entry.id === item.id)) {
      setSelected((old) => old.filter((entry) => entry.id !== item.id))
      return
    }
    const baseSelected = selected.length >= 2 ? [] : selected
    const next = [...baseSelected, item]
    setMismatchIds([])
    if (next.length < 2) {
      setSelected(next)
      setPairMessage(`Selected ${item.side.toLowerCase()} — pick its match.`)
      return
    }
    setMoves((m) => m + 1)
    if (next[0].pairId === next[1].pairId && next[0].side !== next[1].side) {
      setMatched((old) => [...old, item.pairId])
      setSelected([])
      setStreak((s) => s + 1)
      setPairMessage("Matched!")
    } else {
      setSelected(next)
      setMismatchIds([next[0].id, next[1].id])
      setStreak(0)
      setPairMessage("Not a match — cards reset automatically, or click any card to continue.")
      window.setTimeout(() => {
        setSelected((curr) => (curr.length === 2 ? [] : curr))
        setMismatchIds([])
      }, 700)
    }
  }

  const tierInfo = PRACTICE_TIERS.find((item) => item.id === tier)
  const review = session?.submitted ? session.result : null
  const missedIds = new Set(review?.misses.map((miss) => miss.questionId) ?? [])

  return (
    <div className="space-y-4">
      <section className="panel p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Practice arcade</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-900">
              Active recall & matching rounds
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {streak > 0 && (
              <span className="atlas-streak-pill">
                <Flame size={14} /> {streak} streak
              </span>
            )}
            {onOpenAnatomy && (
              <button className="action action-secondary" type="button" onClick={onOpenAnatomy}>
                <Sparkles size={15} aria-hidden="true" /> 3D Studio
              </button>
            )}
            {onOpenCourseDrills && (
              <button className="action action-secondary" type="button" onClick={onOpenCourseDrills}>
                6-Mode Pack Drills
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="field">
            <span>Chapter</span>
            <select value={chapter?.id ?? ""} onChange={(event) => handleChapterSelect(event.target.value)}>
              {chapters.map((item) => (
                <option key={item.id} value={item.id}>
                  Ch. {item.number}: {item.title} {item.isPreviewPack ? "(Preview)" : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Material source</span>
            <select
              value={source}
              onChange={(event) => {
                setSource(event.target.value)
                setSession(null)
                setPairs(null)
              }}
            >
              <option value="course">Course material</option>
              <option value="supplemental">Supplemental / Preview material</option>
              <option value="all">All available material</option>
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2" aria-label="Practice activity">
            {[
              ["questions", "Question rounds"],
              ["matching", "Matching game"],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                aria-pressed={activity === id}
                className={activity === id ? "action" : "action action-secondary"}
                onClick={() => {
                  setActivity(id)
                  setSession(null)
                  setPairs(null)
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <span className="text-xs text-slate-500">
            {scoped.questions.length} questions · {scoped.flashcards.length} cards ready
          </span>
        </div>
      </section>

      {activity === "questions" ? (
        <>
          <section className="panel p-5 sm:p-6">
            <div className="grid gap-3 md:grid-cols-3">
              {PRACTICE_TIERS.map((item, index) => {
                const key = getPracticeResultKey(item.id, chapter?.id)
                const savedBest = latestScores[key]?.bestPercent ?? progress?.[key]?.bestPercent
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setTier(item.id)
                      setSession(null)
                    }}
                    aria-pressed={tier === item.id}
                    className={`rounded-2xl border p-4 text-left transition ${
                      tier === item.id
                        ? "border-teal-700 bg-teal-50/80"
                        : "border-slate-200 bg-white hover:border-teal-600/40"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Level 0{index + 1}
                        {item.id === recommendation ? " · Next up" : ""}
                      </span>
                      {savedBest != null && (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                          Best {savedBest}%
                        </span>
                      )}
                    </div>
                    <span className="mt-1.5 block font-semibold text-slate-900">{item.label}</span>
                    <span className="mt-1 block text-xs leading-5 text-slate-600">{item.detail}</span>
                  </button>
                )
              })}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                {tier === "exam" && (
                  <>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={fullChapterExam}
                        onChange={(event) => setFullChapterExam(event.target.checked)}
                      />
                      Use all {scoped.questions.length} questions
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={instantExamFeedback}
                        onChange={(event) => setInstantExamFeedback(event.target.checked)}
                      />
                      Show immediate feedback
                    </label>
                  </>
                )}
              </div>

              {!session && scoped.questions.length > 0 && (
                <button className="action" type="button" onClick={() => begin()}>
                  <Zap size={15} /> Start {tierInfo?.label.toLowerCase()}
                </button>
              )}
            </div>

            {!scoped.questions.length && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                <span>No {selectedSourceLabel} questions for this chapter in the current filter.</span>
                <button
                  type="button"
                  className="action action-secondary"
                  onClick={() => setSource("all")}
                >
                  Show all sources
                </button>
              </div>
            )}
          </section>

          {active && (
            <section className="panel p-5 sm:p-6" aria-live="polite">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <p className="eyebrow">
                    Question {session.index + 1} of {session.items.length}
                  </p>
                  <div className="h-1.5 w-28 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[var(--ink-strong)] transition-all"
                      style={{
                        width: `${Math.round(((session.index + 1) / session.items.length) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {streak > 1 && (
                    <span className="atlas-streak-pill">
                      <Flame size={12} /> {streak} in a row
                    </span>
                  )}
                  <span className="source-tag">{sourceName(active)}</span>
                </div>
              </div>

              <h3 className="mt-3 text-lg font-semibold text-slate-900 sm:text-xl">
                {active.prompt}
              </h3>

              {session.tier === "retrieval" ? (
                <form
                  className="mt-4 space-y-3"
                  noValidate
                  onSubmit={(event) => {
                    event.preventDefault()
                    answer(response)
                  }}
                >
                  <label className="field">
                    <span>Type your answer from memory</span>
                    <input
                      value={response}
                      disabled={Boolean(session.pendingFeedback)}
                      onChange={(event) => setResponse(event.target.value)}
                      placeholder="Type answer and press Enter…"
                      autoComplete="off"
                      autoFocus
                    />
                  </label>
                  {!session.pendingFeedback && (
                    <button className="action" type="submit" disabled={!response.trim()}>
                      Check answer
                    </button>
                  )}
                </form>
              ) : (
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {(active.choices ?? []).map((choice, idx) => {
                    const lastAns = session.pendingFeedback ? session.answers.at(-1) : null
                    const isPicked = lastAns?.response === choice
                    const isRightChoice = session.pendingFeedback && choice === active.correctAnswer
                    const isWrongPick = session.pendingFeedback && isPicked && !lastAns?.correct

                    return (
                      <button
                        key={choice}
                        type="button"
                        disabled={Boolean(session.pendingFeedback)}
                        onClick={() => answer(choice)}
                        className={`flex items-center justify-between gap-2 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${
                          isRightChoice
                            ? "border-emerald-300 bg-emerald-50 text-emerald-900 font-semibold"
                            : isWrongPick
                              ? "border-rose-300 bg-rose-50 text-rose-900"
                              : "border-slate-200 bg-white text-slate-800 hover:border-teal-500"
                        }`}
                      >
                        <span>{choice}</span>
                        <kbd className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-400">
                          {idx + 1}
                        </kbd>
                      </button>
                    )
                  })}
                </div>
              )}

              {session.pendingFeedback && (
                <div className="mt-4 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
                  <p
                    className={`text-sm font-semibold ${
                      session.answers.at(-1).correct ? "text-emerald-800" : "text-amber-900"
                    }`}
                  >
                    {session.answers.at(-1).correct
                      ? "✓ Correct!"
                      : `Answer: ${active.correctAnswer}`}
                  </p>
                  {active.explanation && (
                    <p className="mt-1.5 text-xs leading-5 text-slate-600">
                      {active.explanation}
                    </p>
                  )}
                  <button
                    className="action mt-3"
                    type="button"
                    onClick={() => advance(session)}
                  >
                    {session.index === session.items.length - 1 ? "See results" : "Next question"}{" "}
                    <ArrowRight size={15} />
                  </button>
                </div>
              )}
            </section>
          )}

          {review && (
            <section className="panel p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="eyebrow">Round complete</p>
                  <h3 className="mt-1 text-3xl font-semibold text-slate-900">
                    {review.percent}%
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {review.correctCount} of {review.totalQuestions} correct
                    {bestStreak > 1 ? ` · Best streak: 🔥 ${bestStreak}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="action" type="button" onClick={() => begin(session.tier)}>
                    Play another round
                  </button>
                  {missedIds.size > 0 && (
                    <button
                      className="action action-secondary"
                      type="button"
                      onClick={() => begin(session.tier, missedIds)}
                    >
                      Retry missed ({missedIds.size})
                    </button>
                  )}
                  <button
                    className="action action-secondary"
                    type="button"
                    onClick={() =>
                      begin(
                        getNextTierRecommendation(
                          {
                            ...progress,
                            ...latestScores,
                            [getPracticeResultKey(session.tier, chapter.id)]: review,
                          },
                          chapter.id,
                        ),
                      )
                    }
                  >
                    Start recommended level
                  </button>
                </div>
              </div>

              <details className="mt-4 group rounded-2xl border border-slate-200 p-4" open={missedIds.size > 0}>
                <summary className="cursor-pointer font-semibold text-sm text-slate-900">
                  Review question breakdown ({session.items.length})
                </summary>
                <div className="mt-3 space-y-2.5">
                  {session.items.map((item) => {
                    const ans = session.answers.find((entry) => entry.questionId === item.id)
                    return (
                      <article
                        key={item.id}
                        className="rounded-xl border border-slate-200/80 bg-white p-3.5"
                      >
                        <p className="text-sm font-semibold text-slate-800">{item.prompt}</p>
                        <p
                          className={`mt-1 text-xs font-medium ${
                            ans?.correct ? "text-emerald-700" : "text-amber-800"
                          }`}
                        >
                          {ans?.correct
                            ? `✓ Correct (${item.correctAnswer})`
                            : `Your answer: ${ans?.response || "None"} · Correct: ${item.correctAnswer}`}
                        </p>
                        {item.explanation && (
                          <p className="mt-1 text-xs leading-5 text-slate-600">
                            {item.explanation}
                          </p>
                        )}
                      </article>
                    )
                  })}
                </div>
              </details>
            </section>
          )}
        </>
      ) : (
        <section className="panel p-5 sm:p-6">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Match the pairs</p>
              <h2 className="text-xl font-semibold text-slate-900">
                Connect each prompt to its answer
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Mismatched selections auto-reset after a moment so you can keep moving fast.
              </p>
            </div>
            <button
              className="action"
              type="button"
              onClick={startMatching}
              disabled={!scoped.flashcards.length}
            >
              <RotateCcw size={15} aria-hidden="true" />{" "}
              {pairs ? "Shuffle new board" : "Start matching"}
            </button>
          </div>

          {!scoped.flashcards.length ? (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <span>No {selectedSourceLabel} flashcards in this filter.</span>
              <button
                type="button"
                className="action action-secondary"
                onClick={() => setSource("all")}
              >
                Show all sources
              </button>
            </div>
          ) : (
            pairs && (
              <>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600" aria-live="polite">
                  <span>
                    <strong>
                      {matched.length} of {pairs.length / 2}
                    </strong>{" "}
                    pairs matched · {moves} moves
                  </span>
                  <span>{pairMessage}</span>
                </div>

                <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {pairs.map((item) => {
                    const done = matched.includes(item.pairId)
                    const picked = selected.some((entry) => entry.id === item.id)
                    const isMismatch = mismatchIds.includes(item.id)
                    return (
                      <button
                        key={item.id}
                        type="button"
                        disabled={done}
                        onClick={() => choosePair(item)}
                        aria-pressed={picked}
                        className={`min-h-20 rounded-2xl border p-3.5 text-left transition ${
                          done
                            ? "border-emerald-200 bg-emerald-50/70 text-emerald-800 opacity-75"
                            : isMismatch
                              ? "border-amber-400 bg-amber-50 text-amber-900"
                              : picked
                                ? "border-teal-600 bg-teal-50 ring-2 ring-teal-600/20"
                                : "border-slate-200 bg-white text-slate-800 hover:border-teal-600/40"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {item.side}
                          </span>
                          {done && <CheckCircle2 size={14} className="text-emerald-600" aria-label="Matched" />}
                        </div>
                        <span className="mt-1.5 block text-xs font-medium leading-5">
                          {item.text}
                        </span>
                      </button>
                    )
                  })}
                </div>

                {matched.length === pairs.length / 2 && (
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-900">
                    <span>Board cleared in {moves} moves!</span>
                    <button type="button" className="action" onClick={startMatching}>
                      Play another board
                    </button>
                  </div>
                )}
              </>
            )
          )}
        </section>
      )}
    </div>
  )
}

export default PracticeArcade
