import { useMemo, useState } from "react"
import { CheckCircle2, RotateCcw, Sparkles } from "lucide-react"
import { getChapterMaterials, getNextTierRecommendation, getPracticeResultKey, getQuestionAliases, isAnswerCorrect, PRACTICE_TIERS, scoreAttempt, shuffleItems, sourceName } from "../lib/practice"

function makeQuestions(materials, tier, onlyIds = null, fullExam = false) {
  const pool = materials.questions.filter((question) => !onlyIds || onlyIds.has(question.id))
  const count = tier === "exam" ? (fullExam ? pool.length : Math.min(12, pool.length)) : Math.min(8, pool.length)
  return shuffleItems(pool).slice(0, count).map((question) => ({ ...question, choices: shuffleItems(question.options?.length ? question.options : [question.correctAnswer, ...pool.filter((item) => item.id !== question.id).map((item) => item.correctAnswer).filter(Boolean).slice(0, 3)]) }))
}

export function PracticeArcade({ chapters = [], flashcards = [], questions = [], progress = {}, onSaveResult, onOpenAnatomy, onOpenCourseDrills, initialChapterId }) {
  const [chapterId, setChapterId] = useState(initialChapterId ?? chapters[0]?.id ?? "")
  const [source, setSource] = useState("course")
  const [tier, setTier] = useState("recognition")
  const [activity, setActivity] = useState("questions")
  const [session, setSession] = useState(null)
  const [response, setResponse] = useState("")
  const [pairs, setPairs] = useState(null)
  const [matched, setMatched] = useState([])
  const [selected, setSelected] = useState([])
  const [pairMessage, setPairMessage] = useState("")
  const [fullChapterExam, setFullChapterExam] = useState(false)
  const [latestScores, setLatestScores] = useState({})
  const chapter = chapters.find((item) => item.id === chapterId) ?? chapters[0]
  const materials = useMemo(() => getChapterMaterials({ chapter, chapters, flashcards, questions }), [chapter, chapters, flashcards, questions])
  const scoped = useMemo(() => ({
    ...materials,
    flashcards: materials.flashcards.filter((item) => (item.sourceType ?? materials.chapter.sourceType ?? "course") === source),
    questions: materials.questions.filter((item) => (item.sourceType ?? materials.chapter.sourceType ?? "course") === source),
  }), [materials, source])
  const active = session && !session.submitted ? session.items?.[session.index] : null
  const recommendation = getNextTierRecommendation({ ...progress, ...latestScores }, chapter?.id)
  const selectedSourceLabel = source === "all" ? "study" : sourceName({ sourceType: source }).toLowerCase()

  function begin(nextTier = tier, retryIds = null) {
    const items = makeQuestions(scoped, nextTier, retryIds, fullChapterExam)
    setTier(nextTier)
    setSession({ tier: nextTier, items, index: 0, answers: [], submitted: false })
    setResponse("")
  }

  function answer(value) {
    if (!session || session.submitted || session.answers.some((item) => item.questionId === active.id)) return
    const correct = isAnswerCorrect(value, active.correctAnswer, getQuestionAliases(active))
    const nextAnswers = [...session.answers, { questionId: active.id, prompt: active.prompt, response: value, correctAnswer: active.correctAnswer, correct }]
    if (session.tier === "recognition") setSession({ ...session, answers: nextAnswers, pendingFeedback: true })
    else advance({ ...session, answers: nextAnswers })
    setResponse("")
  }

  function advance(current) {
    const last = current.index >= current.items.length - 1
    if (last) {
      const result = scoreAttempt(current.answers)
      setSession({ ...current, submitted: true, pendingFeedback: false, result })
      const resultKey = getPracticeResultKey(current.tier, chapter.id)
      setLatestScores((old) => ({ ...old, [resultKey]: { ...old[resultKey], percent: result.percent, bestPercent: Math.max(old[resultKey]?.bestPercent ?? progress?.[resultKey]?.bestPercent ?? 0, result.percent ?? 0) } }))
      onSaveResult?.({ chapterId: chapter.id, tier: current.tier, resultKey, ...result })
    } else setSession({ ...current, index: current.index + 1, pendingFeedback: false })
  }

  function startMatching() {
    const cards = shuffleItems(scoped.flashcards).slice(0, Math.min(6, scoped.flashcards.length))
    setPairs(shuffleItems(cards.flatMap((card) => [
      { id: `${card.id}:front`, pairId: card.id, text: card.front, side: "Prompt" },
      { id: `${card.id}:back`, pairId: card.id, text: card.back, side: "Answer" },
    ])))
    setMatched([])
    setSelected([])
    setPairMessage("")
  }

  function choosePair(item) {
    if (selected.length >= 2) return
    if (matched.includes(item.pairId) || selected.some((entry) => entry.id === item.id)) return
    const next = [...selected, item]
    if (next.length < 2) { setSelected(next); setPairMessage(`Selected ${item.side.toLowerCase()}. Choose its matching card.`); return }
    if (next[0].pairId === next[1].pairId && next[0].side !== next[1].side) {
      setMatched((old) => [...old, item.pairId])
      setSelected([])
      setPairMessage("Pair matched.")
    } else {
      setSelected(next)
      setPairMessage("Those cards do not match. Try another pair, or undo your second selection.")
    }
  }

  const tierInfo = PRACTICE_TIERS.find((item) => item.id === tier)
  const review = session?.submitted ? session.result : null
  const missedIds = new Set(review?.misses.map((miss) => miss.questionId) ?? [])

  return <div className="space-y-4">
    <section className="panel p-5 sm:p-6">
      <p className="eyebrow">Practice arcade</p>
      <div className="section-heading mt-1">
        <div><h2 className="text-2xl font-semibold text-slate-900">Build confidence one round at a time</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Practice uses saved chapter cards and questions. It never invents answers. Move between levels whenever you like; the recommendation reflects your recognition score.</p></div>
        <div className="flex flex-wrap gap-2">{onOpenAnatomy && <button className="action action-secondary" type="button" onClick={onOpenAnatomy}><Sparkles size={16} aria-hidden="true" /> Anatomy studio</button>}{onOpenCourseDrills && <button className="action action-secondary" type="button" onClick={onOpenCourseDrills}>Course pack drills</button>}</div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className="field"><span>Chapter</span><select value={chapter?.id ?? ""} onChange={(event) => { setChapterId(event.target.value); setSession(null); setPairs(null) }}>{chapters.map((item) => <option key={item.id} value={item.id}>Chapter {item.number}: {item.title}</option>)}</select></label>
        <label className="field"><span>Material source</span><select value={source} onChange={(event) => { setSource(event.target.value); setSession(null); setPairs(null) }}><option value="course">Course material</option><option value="supplemental">Supplemental material</option></select></label>
      </div>
      <div className="mt-5 flex flex-wrap gap-2" aria-label="Practice activity">
        {[ ["questions", "Question rounds"], ["matching", "Matching game"] ].map(([id, label]) => <button key={id} type="button" aria-pressed={activity === id} className={activity === id ? "action" : "action action-secondary"} onClick={() => { setActivity(id); setSession(null); setPairs(null) }}>{label}</button>)}
      </div>
    </section>

    {activity === "questions" ? <>
      <section className="panel p-5 sm:p-6">
        <div className="grid gap-3 md:grid-cols-3">{PRACTICE_TIERS.map((item, index) => <button key={item.id} type="button" onClick={() => { setTier(item.id); setSession(null) }} aria-pressed={tier === item.id} className={`rounded-[22px] border p-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${tier === item.id ? "border-teal-700 bg-teal-50" : "border-slate-200 bg-white"}`}><span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Level {index + 1}{item.id === recommendation ? " · recommended" : ""}</span><span className="mt-1 block font-semibold text-slate-900">{item.label}</span><span className="mt-1 block text-sm leading-5 text-slate-600">{item.detail}</span></button>)}</div>
        <p className="mt-3 text-sm text-slate-600">{tierInfo?.label} · {scoped.questions.length} {selectedSourceLabel} questions available{progress?.[getPracticeResultKey(tier, chapter?.id)]?.bestPercent != null ? ` · Best ${progress[getPracticeResultKey(tier, chapter.id)].bestPercent}%` : ""}</p>
        {tier === "exam" && <label className="mt-3 flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={fullChapterExam} onChange={(event) => setFullChapterExam(event.target.checked)} />Use all {scoped.questions.length} chapter questions{scoped.questions.length > 12 ? " instead of 12" : ""}</label>}
        {!session && <button className="action mt-4" type="button" disabled={!scoped.questions.length} onClick={() => begin()}>Start {tierInfo?.label.toLowerCase()}</button>}
        {!scoped.questions.length && <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">No {selectedSourceLabel} questions are available for this chapter yet. Try the other material source or choose a chapter with a question set.</p>}
      </section>

      {active && <section className="panel p-5 sm:p-6" aria-live="polite">
        <div className="flex flex-wrap items-center justify-between gap-2"><p className="eyebrow">Question {session.index + 1} of {session.items.length}</p><span className="source-tag">{sourceName(active)}</span></div>
        <h3 className="mt-3 text-xl font-semibold text-slate-900">{active.prompt}</h3>
        {session.tier === "retrieval" ? <form className="mt-4 space-y-3" noValidate onSubmit={(event) => { event.preventDefault(); answer(response) }}><label className="field"><span>Your answer</span><input value={response} onChange={(event) => setResponse(event.target.value)} autoComplete="off" /></label><button className="action" type="submit" disabled={!response.trim()}>Check answer</button></form> : <div className="mt-4 grid gap-2 sm:grid-cols-2">{(active.choices ?? []).map((choice) => <button key={choice} type="button" disabled={Boolean(session.pendingFeedback)} onClick={() => answer(choice)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-800 hover:border-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-700">{choice}</button>)}</div>}
        {session.pendingFeedback && <><p className={`mt-4 rounded-2xl p-3 text-sm ${session.answers.at(-1).correct ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"}`}>{session.answers.at(-1).correct ? "Correct." : `Not quite. The answer is ${active.correctAnswer}.`} {active.explanation ?? ""}</p><button className="action mt-3" type="button" onClick={() => advance(session)}>{session.index === session.items.length - 1 ? "See results" : "Next question"}</button></>}
      </section>}

      {review && <section className="panel p-5 sm:p-6"><p className="eyebrow">Round complete</p><h3 className="mt-1 text-3xl font-semibold text-slate-900">{review.percent}%</h3><p className="mt-1 text-sm text-slate-600">{review.correctCount} of {review.totalQuestions} correct</p><div className="mt-4 space-y-3"><h4 className="section-heading">Answer review</h4>{session.items.map((item) => { const answer = session.answers.find((entry) => entry.questionId === item.id); return <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4"><p className="font-semibold text-slate-800">{item.prompt}</p><p className={`mt-1 text-sm ${answer?.correct ? "text-emerald-700" : "text-amber-800"}`}>{answer?.correct ? "Correct" : `Your answer: ${answer?.response || "No answer"} · Correct answer: ${item.correctAnswer}`}</p>{item.explanation && <p className="mt-1 text-sm leading-6 text-slate-600">{item.explanation}</p>}</article>})}</div><div className="mt-4 flex flex-wrap gap-2"><button className="action" type="button" onClick={() => begin(session.tier)}>Play another round</button>{missedIds.size > 0 && <button className="action action-secondary" type="button" onClick={() => begin(session.tier, missedIds)}>Retry missed ({missedIds.size})</button>}<button className="action action-secondary" type="button" onClick={() => begin(getNextTierRecommendation({ ...progress, ...latestScores, [getPracticeResultKey(session.tier, chapter.id)]: review }, chapter.id))}>Start recommended level</button></div></section>}
    </> : <section className="panel p-5 sm:p-6">
      <div className="section-heading"><div><p className="eyebrow">Match the pairs</p><h2 className="text-xl font-semibold text-slate-900">Connect each prompt to its saved answer</h2><p className="mt-1 text-sm text-slate-600">Every pair comes from this chapter’s {selectedSourceLabel} flashcards.</p></div><button className="action action-secondary" type="button" onClick={startMatching} disabled={!scoped.flashcards.length}><RotateCcw size={16} aria-hidden="true" /> {pairs ? "Shuffle and restart" : "Start matching"}</button></div>
      {!scoped.flashcards.length ? <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">No {selectedSourceLabel} flashcards are available for this chapter yet. Try the other material source or choose another chapter.</p> : pairs && <>
        <p className="mt-4 text-sm text-slate-600" aria-live="polite">{matched.length} of {pairs.length / 2} pairs matched. {pairMessage}</p>
        <div className="mt-3 flex flex-wrap gap-2">{selected.length > 0 && <button className="action action-secondary" type="button" onClick={() => { setSelected([]); setPairMessage("Selection cleared. Choose a prompt and its answer.") }}>{selected.length === 1 ? "Undo selection" : "Try another pair"}</button>}{selected.length === 2 && <button className="action action-secondary" type="button" onClick={() => { setSelected([selected[1]]); setPairMessage("First selection undone. Choose a match for the remaining card.") }}>Undo first card</button>}</div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">{pairs.map((item) => { const done = matched.includes(item.pairId); const picked = selected.some((entry) => entry.id === item.id); return <button key={item.id} type="button" disabled={done} onClick={() => choosePair(item)} aria-pressed={picked} className={`min-h-20 rounded-2xl border p-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-700 ${done ? "border-emerald-200 bg-emerald-50 text-emerald-800" : picked ? "border-teal-600 bg-teal-50" : "border-slate-200 bg-white text-slate-800"}`}><span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">{item.side}</span><span className="mt-1 block text-sm">{item.text}</span>{done && <CheckCircle2 size={16} className="mt-1" aria-label="Matched" />}</button>})}</div>
        {matched.length === pairs.length / 2 && <p className="mt-4 rounded-2xl bg-emerald-50 p-4 font-semibold text-emerald-800">All pairs matched. Nice work!</p>}
      </>}
    </section>}
  </div>
}

export default PracticeArcade
