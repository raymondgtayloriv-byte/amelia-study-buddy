import { useEffect, useMemo, useState } from "react"
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Eye,
  Flame,
  Layers,
  RotateCcw,
  Sparkles,
  Target,
  Zap,
} from "lucide-react"
import { CHAPTER_FIGURES as courseVisuals } from "../data/courseVisuals"
import {
  buildStudyBlitzSteps,
  computeGradeSummary,
  computeLetterGrade,
  getMultiChapterMaterials,
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
  const count =
    tier === "exam"
      ? fullExam
        ? pool.length
        : Math.min(15, pool.length)
      : Math.min(10, pool.length)
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
  quizHistory = {},
  onSaveResult,
  onOpenAnatomy,
  onExploreChapterIn3D,
  onOpenCourseDrills,
  initialChapterId,
  initialActivity = "questions",
}) {
  const defaultChapterId = initialChapterId ?? chapters[0]?.id ?? "chapter-1"
  const [selectedChapterIds, setSelectedChapterIds] = useState([defaultChapterId])
  const [chapterPickerOpen, setChapterPickerOpen] = useState(false)

  const primaryChapter =
    chapters.find((item) => item.id === selectedChapterIds[0]) ?? chapters[0]

  const [source, setSource] = useState(() =>
    primaryChapter?.sourceType === "supplemental" ? "all" : "course",
  )
  const [tier, setTier] = useState("recognition")
  const [activity, setActivity] = useState(initialActivity)
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

  // Quick Study Blitz state
  const [blitzLength, setBlitzLength] = useState(10)
  const [blitzSession, setBlitzSession] = useState(null)
  const [blitzMiniMatched, setBlitzMiniMatched] = useState([])
  const [blitzMiniSelected, setBlitzMiniSelected] = useState([])
  const [blitzMiniMismatch, setBlitzMiniMismatch] = useState([])
  const [blitzMiniMistakes, setBlitzMiniMistakes] = useState(0)

  const courseChapterIds = useMemo(
    () => chapters.filter((ch) => ch.sourceType !== "supplemental").map((ch) => ch.id),
    [chapters],
  )
  const allChapterIds = useMemo(() => chapters.map((ch) => ch.id), [chapters])

  const scoped = useMemo(
    () =>
      getMultiChapterMaterials({
        chapterIds: selectedChapterIds,
        chapters,
        flashcards,
        questions,
        source,
      }),
    [selectedChapterIds, chapters, flashcards, questions, source],
  )

  const gradeSummary = useMemo(
    () =>
      computeGradeSummary({
        chapters,
        practiceProgress: { ...progress, ...latestScores },
        quizHistory,
      }),
    [chapters, progress, latestScores, quizHistory],
  )

  const active = session && !session.submitted ? session.items?.[session.index] : null
  const activeBlitz =
    blitzSession && !blitzSession.submitted
      ? blitzSession.steps?.[blitzSession.index]
      : null

  const scopeKey =
    selectedChapterIds.length === 1
      ? selectedChapterIds[0]
      : selectedChapterIds.length === courseChapterIds.length &&
          selectedChapterIds.every((id) => courseChapterIds.includes(id))
        ? "all-course"
        : selectedChapterIds.length === allChapterIds.length
          ? "all-chapters"
          : `multi-${selectedChapterIds.length}ch`

  const scopeTitle = useMemo(() => {
    if (selectedChapterIds.length === 1) {
      const ch = chapters.find((item) => item.id === selectedChapterIds[0])
      return ch ? `Ch. ${ch.number}: ${ch.title}` : "1 Chapter"
    }
    if (
      selectedChapterIds.length === courseChapterIds.length &&
      selectedChapterIds.every((id) => courseChapterIds.includes(id))
    ) {
      return `All ${courseChapterIds.length} Course Chapters`
    }
    if (selectedChapterIds.length === allChapterIds.length) {
      return `All ${allChapterIds.length} Chapters`
    }
    const nums = chapters
      .filter((ch) => selectedChapterIds.includes(ch.id))
      .map((ch) => ch.number)
    return `${selectedChapterIds.length} Chapters (Ch. ${nums.join(", ")})`
  }, [selectedChapterIds, chapters, courseChapterIds, allChapterIds])

  const recommendation = getNextTierRecommendation(
    { ...progress, ...latestScores },
    primaryChapter?.id,
  )
  const selectedSourceLabel =
    source === "all" ? "combined" : sourceName({ sourceType: source }).toLowerCase()

  function resetActiveRuns() {
    setSession(null)
    setPairs(null)
    setBlitzSession(null)
  }

  function handleSingleChapterSelect(nextId) {
    setSelectedChapterIds([nextId])
    const nextChapter = chapters.find((item) => item.id === nextId)
    if (nextChapter?.sourceType === "supplemental" && source === "course") {
      setSource("all")
    }
    resetActiveRuns()
  }

  function toggleChapterInSelection(chId) {
    setSelectedChapterIds((current) => {
      const exists = current.includes(chId)
      const next = exists
        ? current.length > 1
          ? current.filter((id) => id !== chId)
          : current
        : [...current, chId]
      const hasSupplemental = chapters.some(
        (ch) => next.includes(ch.id) && ch.sourceType === "supplemental",
      )
      if (hasSupplemental && source === "course") {
        setSource("all")
      }
      return next
    })
    resetActiveRuns()
  }

  function selectChapterPreset(preset) {
    if (preset === "single") {
      setSelectedChapterIds([primaryChapter?.id ?? chapters[0]?.id ?? "chapter-1"])
    } else if (preset === "course") {
      setSelectedChapterIds(courseChapterIds)
      setSource("course")
    } else if (preset === "all") {
      setSelectedChapterIds(allChapterIds)
      setSource("all")
    }
    resetActiveRuns()
  }

  function begin(nextTier = tier, retryIds = null) {
    const items = makeQuestions(scoped, nextTier, retryIds, fullChapterExam)
    setTier(nextTier)
    setSession({
      tier: nextTier,
      items,
      index: 0,
      answers: [],
      submitted: false,
      pendingFeedback: false,
    })
    setResponse("")
    setStreak(0)
  }

  function answer(value) {
    if (
      !session ||
      session.submitted ||
      !active ||
      session.answers.some((item) => item.questionId === active.id)
    ) {
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
      const resultKey = getPracticeResultKey(current.tier, scopeKey)
      setLatestScores((old) => ({
        ...old,
        [resultKey]: {
          ...old[resultKey],
          chapterId: scopeKey,
          percent: result.percent,
          bestPercent: Math.max(
            old[resultKey]?.bestPercent ?? progress?.[resultKey]?.bestPercent ?? 0,
            result.percent ?? 0,
          ),
          misses: result.misses,
        },
      }))
      onSaveResult?.({
        chapterId: scopeKey,
        tier: current.tier,
        resultKey,
        ...result,
      })
    } else {
      setSession({ ...current, index: current.index + 1, pendingFeedback: false })
    }
  }

  // Study Blitz Game Engine
  function startBlitz(onlyQuestionIds = null, overrideChapterIds = null) {
    const targetIds = overrideChapterIds ?? selectedChapterIds
    const steps = buildStudyBlitzSteps({
      chapterIds: targetIds,
      chapters,
      flashcards,
      questions,
      visualsByChapter: courseVisuals,
      source,
      stepCount: blitzLength,
      onlyQuestionIds,
    })
    if (!steps.length) return
    const firstStep = steps[0]
    setBlitzSession({
      steps,
      index: 0,
      answers: [],
      submitted: false,
      pendingFeedback: false,
      boardTokens:
        firstStep?.stepType === "mini-match"
          ? shuffleItems(
              firstStep.pairs.flatMap((p) => [
                { id: `${p.pairId}:front`, pairId: p.pairId, text: p.front, side: "Term" },
                { id: `${p.pairId}:back`, pairId: p.pairId, text: p.back, side: "Match" },
              ]),
            )
          : [],
    })
    setBlitzMiniMatched([])
    setBlitzMiniSelected([])
    setBlitzMiniMismatch([])
    setBlitzMiniMistakes(0)
    setStreak(0)
  }

  function answerBlitzStep(choiceText, isCorrectOverride = null) {
    if (!blitzSession || blitzSession.submitted || !activeBlitz || blitzSession.pendingFeedback) {
      return
    }
    const correct =
      typeof isCorrectOverride === "boolean"
        ? isCorrectOverride
        : isAnswerCorrect(choiceText, activeBlitz.correctAnswer)

    const nextStreak = correct ? streak + 1 : 0
    setStreak(nextStreak)
    if (nextStreak > bestStreak) setBestStreak(nextStreak)

    const nextAnswers = [
      ...blitzSession.answers,
      {
        questionId: activeBlitz.questionId,
        prompt: activeBlitz.prompt,
        response: String(choiceText),
        correctAnswer: activeBlitz.correctAnswer,
        correct,
      },
    ]
    setBlitzSession({
      ...blitzSession,
      answers: nextAnswers,
      pendingFeedback: true,
    })
  }

  function advanceBlitz() {
    if (!blitzSession) return
    const isLast = blitzSession.index >= blitzSession.steps.length - 1
    if (isLast) {
      const result = scoreAttempt(blitzSession.answers)
      setBlitzSession({
        ...blitzSession,
        submitted: true,
        pendingFeedback: false,
        result,
      })
      const resultKey = getPracticeResultKey("blitz", scopeKey)
      setLatestScores((old) => ({
        ...old,
        [resultKey]: {
          ...old[resultKey],
          chapterId: scopeKey,
          percent: result.percent,
          bestPercent: Math.max(
            old[resultKey]?.bestPercent ?? progress?.[resultKey]?.bestPercent ?? 0,
            result.percent ?? 0,
          ),
          misses: result.misses,
        },
      }))
      onSaveResult?.({
        chapterId: scopeKey,
        tier: "blitz",
        resultKey,
        ...result,
      })
    } else {
      const nextIndex = blitzSession.index + 1
      const nextStep = blitzSession.steps[nextIndex]
      setBlitzMiniMatched([])
      setBlitzMiniSelected([])
      setBlitzMiniMismatch([])
      setBlitzMiniMistakes(0)
      setBlitzSession({
        ...blitzSession,
        index: nextIndex,
        pendingFeedback: false,
        boardTokens:
          nextStep?.stepType === "mini-match"
            ? shuffleItems(
                nextStep.pairs.flatMap((p) => [
                  { id: `${p.pairId}:front`, pairId: p.pairId, text: p.front, side: "Term" },
                  { id: `${p.pairId}:back`, pairId: p.pairId, text: p.back, side: "Match" },
                ]),
              )
            : [],
      })
    }
  }

  function handleBlitzMiniPick(token) {
    if (!activeBlitz || activeBlitz.stepType !== "mini-match" || blitzSession.pendingFeedback) {
      return
    }
    if (blitzMiniMatched.includes(token.pairId)) return
    if (blitzMiniSelected.some((entry) => entry.id === token.id)) {
      setBlitzMiniSelected((curr) => curr.filter((entry) => entry.id !== token.id))
      return
    }
    const base = blitzMiniSelected.length >= 2 ? [] : blitzMiniSelected
    const next = [...base, token]
    setBlitzMiniMismatch([])
    if (next.length < 2) {
      setBlitzMiniSelected(next)
      return
    }
    if (next[0].pairId === next[1].pairId && next[0].side !== next[1].side) {
      const nextMatched = [...blitzMiniMatched, token.pairId]
      setBlitzMiniMatched(nextMatched)
      setBlitzMiniSelected([])
      if (nextMatched.length === activeBlitz.pairs.length) {
        const cleanSweep = blitzMiniMistakes <= 1
        answerBlitzStep(
          cleanSweep
            ? activeBlitz.correctAnswer
            : `Matched with ${blitzMiniMistakes} misses`,
          cleanSweep,
        )
      }
    } else {
      setBlitzMiniSelected(next)
      setBlitzMiniMismatch([next[0].id, next[1].id])
      setBlitzMiniMistakes((m) => m + 1)
      window.setTimeout(() => {
        setBlitzMiniSelected((curr) => (curr.length === 2 ? [] : curr))
        setBlitzMiniMismatch([])
      }, 650)
    }
  }

  useEffect(() => {
    if (activity === "questions" && session && !session.submitted) {
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
    }
    if (activity === "blitz" && blitzSession && !blitzSession.submitted) {
      const onKey = (event) => {
        if (
          event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement ||
          event.target instanceof HTMLSelectElement
        ) {
          return
        }
        if (blitzSession.pendingFeedback && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault()
          advanceBlitz()
          return
        }
        if (!blitzSession.pendingFeedback && activeBlitz?.choices) {
          const idx = Number(event.key) - 1
          if (idx >= 0 && idx < activeBlitz.choices.length) {
            event.preventDefault()
            answerBlitzStep(activeBlitz.choices[idx])
          }
        }
      }
      window.addEventListener("keydown", onKey)
      return () => window.removeEventListener("keydown", onKey)
    }
  })

  function startMatching() {
    const cards = shuffleItems(scoped.flashcards).slice(0, Math.min(6, scoped.flashcards.length))
    setPairs(
      shuffleItems(
        cards.flatMap((card) => [
          {
            id: `${card.id}:front`,
            pairId: card.id,
            text: card.front,
            side: "Prompt",
            chapterNumber: card.chapterNumber,
            sourceType: card.sourceType,
          },
          {
            id: `${card.id}:back`,
            pairId: card.id,
            text: card.back,
            side: "Answer",
            chapterNumber: card.chapterNumber,
            sourceType: card.sourceType,
          },
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

  function drillWeakSpots() {
    if (!gradeSummary.weakSpots.length) return
    const weakQuestionIds = new Set(gradeSummary.weakSpots.map((w) => w.questionId))
    setSelectedChapterIds(allChapterIds)
    setSource("all")
    setActivity("questions")
    const allMats = getMultiChapterMaterials({
      chapterIds: allChapterIds,
      chapters,
      flashcards,
      questions,
      source: "all",
    })
    const items = makeQuestions(allMats, "recognition", weakQuestionIds, true)
    if (items.length > 0) {
      setTier("recognition")
      setSession({
        tier: "recognition",
        items,
        index: 0,
        answers: [],
        submitted: false,
        pendingFeedback: false,
      })
      setResponse("")
      setStreak(0)
    }
  }

  const tierInfo = PRACTICE_TIERS.find((item) => item.id === tier)
  const review = session?.submitted ? session.result : null
  const missedIds = new Set(review?.misses.map((miss) => miss.questionId) ?? [])
  const blitzReview = blitzSession?.submitted ? blitzSession.result : null
  const blitzMissedIds = new Set(blitzReview?.misses.map((miss) => miss.questionId) ?? [])

  return (
    <div className="space-y-4">
      <section className="panel p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Practice arcade · Multi-chapter & Blitz ready</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-900">
              Quizzes, Quick Blitz Game & Grade Tracker
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {gradeSummary.overallPercent !== null && (
              <button
                type="button"
                onClick={() => setActivity("gradebook")}
                className="inline-flex items-center gap-2 rounded-full border border-teal-600/30 bg-teal-50/90 px-3.5 py-1.5 text-xs font-semibold text-teal-950 transition hover:border-teal-600"
                title="View your overall grade and weak spots"
              >
                <Award size={14} className="text-teal-700" />
                <span>
                  Grade: <strong>{gradeSummary.letterGrade}</strong> ({gradeSummary.overallPercent}%)
                </span>
              </button>
            )}
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

        {/* Material Source Prominent Toggle (Course Verbatim vs Supplemental vs Both) */}
        <div className="mt-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Material Source Filter
              </span>
              <p className="mt-0.5 text-xs text-slate-600">
                {source === "course"
                  ? "Strictly verbatim course & textbook material (what will be on the exam)."
                  : source === "supplemental"
                    ? "Showing extra supplemental & preview chapters only."
                    : "Combining verbatim Course Material + Supplemental (every card & question is clearly badged)."}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Material source">
              {[
                ["course", "Course Material Only (Book)"],
                ["supplemental", "Supplemental Only"],
                ["all", "Both (Clearly Labeled)"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={source === id}
                  onClick={() => {
                    setSource(id)
                    resetActiveRuns()
                  }}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                    source === id
                      ? "bg-[var(--ink-strong)] text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-700 hover:border-teal-600/40"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Single / Multi / All Chapter Selection */}
        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto]">
          <div className="flex flex-wrap items-end gap-3">
            <label className="field flex-1 min-w-[230px]">
              <span>Quick Chapter Jump ({scopeTitle})</span>
              <select
                value={selectedChapterIds.length === 1 ? selectedChapterIds[0] : "multi"}
                onChange={(event) => {
                  const val = event.target.value
                  if (val === "all-course") selectChapterPreset("course")
                  else if (val === "all-15") selectChapterPreset("all")
                  else if (val !== "multi") handleSingleChapterSelect(val)
                }}
              >
                {selectedChapterIds.length > 1 && (
                  <option value="multi">Custom / Multi: {scopeTitle}</option>
                )}
                <option value="all-course">★ All 8 Course Chapters (Exam Core)</option>
                <option value="all-15">✦ All 15 Chapters (Course + Previews)</option>
                {chapters.map((item) => (
                  <option key={item.id} value={item.id}>
                    Ch. {item.number}: {item.title} {item.isPreviewPack ? "(Supplemental Preview)" : "(Course Book)"}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setChapterPickerOpen((v) => !v)}
                aria-expanded={chapterPickerOpen}
                className={`action ${chapterPickerOpen || selectedChapterIds.length > 1 ? "" : "action-secondary"}`}
              >
                <Layers size={15} />
                {selectedChapterIds.length > 1
                  ? `${selectedChapterIds.length} Chapters Selected`
                  : "Select Multiple Chapters"}
              </button>
              <button
                type="button"
                onClick={() => selectChapterPreset("course")}
                className="action action-secondary"
              >
                All Course (8)
              </button>
              <button
                type="button"
                onClick={() => selectChapterPreset("all")}
                className="action action-secondary"
              >
                All 15
              </button>
            </div>
          </div>
        </div>

        {chapterPickerOpen && (
          <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold text-slate-700">
                Click any combination of chapters (1, 2, 4, or all) to include in your Blitz, Quiz, or Matching round:
              </p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-teal-600"
                  onClick={() => selectChapterPreset("single")}
                >
                  Just Ch. {primaryChapter?.number ?? 1}
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-teal-600"
                  onClick={() => selectChapterPreset("course")}
                >
                  All 8 Course Chapters
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-teal-600"
                  onClick={() => selectChapterPreset("all")}
                >
                  Select All 15
                </button>
              </div>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {chapters.map((ch) => {
                const isSelected = selectedChapterIds.includes(ch.id)
                const isCourse = ch.sourceType !== "supplemental"
                return (
                  <button
                    key={ch.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => toggleChapterInSelection(ch.id)}
                    className={`flex flex-col justify-between rounded-xl border p-2.5 text-left text-xs transition ${
                      isSelected
                        ? "border-teal-700 bg-teal-50/90 text-slate-900 ring-2 ring-teal-600/20"
                        : "border-slate-200 bg-white text-slate-600 hover:border-teal-600/40"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-slate-900">Ch. {ch.number}</span>
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                          isCourse
                            ? "bg-teal-100/80 text-teal-900"
                            : "bg-amber-100/80 text-amber-900"
                        }`}
                      >
                        {isCourse ? "Course" : "Suppl."}
                      </span>
                    </div>
                    <span className="mt-1 line-clamp-1 font-medium">{ch.title}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Activity Switcher */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2" aria-label="Practice activity">
            {[
              ["blitz", "⚡ Quick Study Blitz Game"],
              ["questions", "Question Rounds & Tests"],
              ["matching", "Matching Game"],
              [
                "gradebook",
                `Grade & Weak Spots${
                  gradeSummary.weakSpots.length ? ` (${gradeSummary.weakSpots.length})` : ""
                }`,
              ],
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
            {scoped.questions.length} questions · {scoped.flashcards.length} cards in {scopeTitle}
          </span>
        </div>
      </section>

      {/* ACTIVITY 1: QUICK STUDY BLITZ (Step-by-step mixed challenge game) */}
      {activity === "blitz" && (
        <section className="panel p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Step-by-step random game · {scopeTitle}</p>
              <h3 className="mt-1 text-xl font-semibold text-slate-900">
                ⚡ Quick Study Blitz
              </h3>
              <p className="mt-1 text-xs text-slate-600">
                Jumps randomly between textbook diagrams, 3D body systems, lightning true/false, 3-pair speed matches, and concept checks.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {[
                [6, "Quick 6"],
                [10, "Standard 10"],
                [15, "Marathon 15"],
              ].map(([count, label]) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setBlitzLength(count)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                    blitzLength === count
                      ? "bg-[var(--ink-strong)] text-white"
                      : "border border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  {label}
                </button>
              ))}
              <button
                type="button"
                className="action"
                onClick={() => startBlitz()}
                disabled={!scoped.questions.length && !scoped.flashcards.length}
              >
                <Zap size={15} /> {blitzSession ? "Restart Blitz" : "Launch Blitz Game"}
              </button>
            </div>
          </div>

          {!scoped.questions.length && !scoped.flashcards.length && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <span>No {selectedSourceLabel} material found for the selected chapter(s).</span>
              <button
                type="button"
                className="action action-secondary"
                onClick={() => setSource("all")}
              >
                Include all sources
              </button>
            </div>
          )}

          {!blitzSession && (scoped.questions.length > 0 || scoped.flashcards.length > 0) && (
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => startBlitz()}
                className="rounded-2xl border border-teal-600/30 bg-teal-50/60 p-4 text-left transition hover:border-teal-600"
              >
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-900">
                  Selected Scope
                </span>
                <span className="mt-1 block text-base font-semibold text-slate-900">
                  Play {scopeTitle}
                </span>
                <span className="mt-1 block text-xs text-slate-600">
                  {blitzLength} randomized steps from your active selection.
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedChapterIds(courseChapterIds)
                  setSource("course")
                  startBlitz(null, courseChapterIds)
                }}
                className="rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-teal-600/40"
              >
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Verbatim Exam Prep
                </span>
                <span className="mt-1 block text-base font-semibold text-slate-900">
                  All 8 Course Chapters Blitz
                </span>
                <span className="mt-1 block text-xs text-slate-600">
                  Strictly verbatim book & lecture material across every ready course unit.
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedChapterIds(allChapterIds)
                  setSource("all")
                  startBlitz(null, allChapterIds)
                }}
                className="rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-teal-600/40"
              >
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Full Everything Random
                </span>
                <span className="mt-1 block text-base font-semibold text-slate-900">
                  All 15 Chapters Chaos Blitz
                </span>
                <span className="mt-1 block text-xs text-slate-600">
                  Jumps across the entire body, skeleton, muscles, and nervous system.
                </span>
              </button>
            </div>
          )}

          {/* Active Blitz Step */}
          {activeBlitz && (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5" aria-live="polite">
              {/* Step-by-step progress rail */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Step {blitzSession.index + 1} of {blitzSession.steps.length}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {blitzSession.steps.map((step, idx) => {
                      const ans = blitzSession.answers[idx]
                      const isCurrent = idx === blitzSession.index
                      return (
                        <span
                          key={step.id}
                          className={`h-2.5 rounded-full transition-all ${
                            isCurrent
                              ? "w-6 bg-teal-700"
                              : ans
                                ? ans.correct
                                  ? "w-2.5 bg-emerald-500"
                                  : "w-2.5 bg-amber-500"
                                : "w-2.5 bg-slate-200"
                          }`}
                          title={`Step ${idx + 1}: ${step.badge}`}
                        />
                      )
                    })}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-900">
                    {activeBlitz.badge}
                  </span>
                  {activeBlitz.chapterNumber && (
                    <span className="rounded-full border border-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                      Ch. {activeBlitz.chapterNumber}
                    </span>
                  )}
                  <span
                    className={`source-tag ${
                      activeBlitz.sourceType === "supplemental" ? "supplemental" : ""
                    }`}
                  >
                    {activeBlitz.sourceType === "supplemental"
                      ? "Supplemental Preview"
                      : "Course Material (Book)"}
                  </span>
                </div>
              </div>

              {/* Optional Figure / 3D System Spotlight */}
              {(activeBlitz.figure || activeBlitz.atlasSystem) && (
                <div className="mt-4 grid gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 md:grid-cols-[240px_1fr]">
                  {activeBlitz.figure && (
                    <div className="specimen-stage flex items-center justify-center rounded-xl p-2">
                      <img
                        src={activeBlitz.figure.src}
                        alt={activeBlitz.figure.title}
                        className="max-h-40 w-auto object-contain"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="flex flex-col justify-center">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800">
                      {activeBlitz.figure
                        ? activeBlitz.figure.badge
                        : `3D System Target · ${activeBlitz.atlasLabel}`}
                    </span>
                    <h4 className="mt-1 text-sm font-semibold text-slate-900">
                      {activeBlitz.figure ? activeBlitz.figure.title : activeBlitz.atlasLabel}
                    </h4>
                    {activeBlitz.figure?.caption && (
                      <p className="mt-1 text-xs leading-5 text-slate-600">
                        {activeBlitz.figure.caption}
                      </p>
                    )}
                    {activeBlitz.chapterId && (onExploreChapterIn3D || onOpenAnatomy) && (
                      <div className="mt-2.5">
                        <button
                          type="button"
                          className="action action-secondary text-xs"
                          onClick={() =>
                            onExploreChapterIn3D
                              ? onExploreChapterIn3D(activeBlitz.chapterId)
                              : onOpenAnatomy?.()
                          }
                        >
                          <Eye size={14} /> Inspect Ch. {activeBlitz.chapterNumber} in 3D Studio
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <h3 className="mt-4 text-lg font-semibold text-slate-900 sm:text-xl">
                {activeBlitz.prompt}
              </h3>

              {/* Step Content: Mini-Match vs Multiple Choice / Rapid T-F */}
              {activeBlitz.stepType === "mini-match" ? (
                <div className="mt-4">
                  <p className="text-xs text-slate-500">
                    Matched {blitzMiniMatched.length} of {activeBlitz.pairs.length} pairs
                  </p>
                  <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                    {(blitzSession.boardTokens ?? []).map((token) => {
                      const done = blitzMiniMatched.includes(token.pairId)
                      const picked = blitzMiniSelected.some((e) => e.id === token.id)
                      const wrong = blitzMiniMismatch.includes(token.id)
                      return (
                        <button
                          key={token.id}
                          type="button"
                          disabled={done || blitzSession.pendingFeedback}
                          onClick={() => handleBlitzMiniPick(token)}
                          className={`min-h-16 rounded-2xl border p-3 text-left text-xs transition ${
                            done
                              ? "border-emerald-300 bg-emerald-50/80 text-emerald-900 opacity-75"
                              : wrong
                                ? "border-rose-300 bg-rose-50 text-rose-900"
                                : picked
                                  ? "border-teal-600 bg-teal-50 ring-2 ring-teal-600/20"
                                  : "border-slate-200 bg-white text-slate-800 hover:border-teal-600/40"
                          }`}
                        >
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {token.side}
                          </span>
                          <span className="mt-1 block font-medium leading-5">{token.text}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {(activeBlitz.choices ?? []).map((choice, idx) => {
                    const lastAns = blitzSession.pendingFeedback
                      ? blitzSession.answers.at(-1)
                      : null
                    const isPicked = lastAns?.response === choice
                    const isRightChoice =
                      blitzSession.pendingFeedback && choice === activeBlitz.correctAnswer
                    const isWrongPick =
                      blitzSession.pendingFeedback && isPicked && !lastAns?.correct

                    return (
                      <button
                        key={choice}
                        type="button"
                        disabled={Boolean(blitzSession.pendingFeedback)}
                        onClick={() => answerBlitzStep(choice)}
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

              {blitzSession.pendingFeedback && (
                <div className="mt-4 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
                  <p
                    className={`text-sm font-semibold ${
                      blitzSession.answers.at(-1)?.correct
                        ? "text-emerald-800"
                        : "text-amber-900"
                    }`}
                  >
                    {blitzSession.answers.at(-1)?.correct
                      ? "✓ Spot on!"
                      : `Answer: ${activeBlitz.correctAnswer}`}
                  </p>
                  {activeBlitz.explanation && (
                    <p className="mt-1.5 text-xs leading-5 text-slate-600">
                      {activeBlitz.explanation}
                    </p>
                  )}
                  <button className="action mt-3" type="button" onClick={advanceBlitz}>
                    {blitzSession.index === blitzSession.steps.length - 1
                      ? "Finish Blitz & See Grade"
                      : "Next Step"}{" "}
                    <ArrowRight size={15} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Blitz Complete Summary */}
          {blitzReview && (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-2xl font-bold text-teal-900">
                    {computeLetterGrade(blitzReview.percent).letter}
                  </div>
                  <div>
                    <p className="eyebrow">Blitz Complete · {scopeTitle}</p>
                    <h4 className="mt-0.5 text-2xl font-semibold text-slate-900">
                      {blitzReview.percent}% ({blitzReview.correctCount} of{" "}
                      {blitzReview.totalQuestions} steps)
                    </h4>
                    <p className="mt-0.5 text-xs text-slate-600">
                      {computeLetterGrade(blitzReview.percent).label}
                      {bestStreak > 1 ? ` · Best streak: 🔥 ${bestStreak}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="action" type="button" onClick={() => startBlitz()}>
                    Play Fresh Blitz
                  </button>
                  {blitzMissedIds.size > 0 && (
                    <button
                      className="action action-secondary"
                      type="button"
                      onClick={() => startBlitz(blitzMissedIds)}
                    >
                      Replay Missed ({blitzMissedIds.size})
                    </button>
                  )}
                  <button
                    className="action action-secondary"
                    type="button"
                    onClick={() => setActivity("gradebook")}
                  >
                    View Gradebook & Weak Spots
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ACTIVITY 2: QUESTION ROUNDS & TESTS */}
      {activity === "questions" && (
        <>
          <section className="panel p-5 sm:p-6">
            <div className="grid gap-3 md:grid-cols-3">
              {PRACTICE_TIERS.map((item, index) => {
                const key = getPracticeResultKey(item.id, scopeKey)
                const savedBest =
                  latestScores[key]?.bestPercent ?? progress?.[key]?.bestPercent
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
                          Best {savedBest}% ({computeLetterGrade(savedBest).letter})
                        </span>
                      )}
                    </div>
                    <span className="mt-1.5 block font-semibold text-slate-900">{item.label}</span>
                    <span className="mt-1 block text-xs leading-5 text-slate-600">
                      {item.detail}
                    </span>
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
                      Use all {scoped.questions.length} questions in {scopeTitle}
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
                  <Zap size={15} /> Start {tierInfo?.label.toLowerCase()} ({scopeTitle})
                </button>
              )}
            </div>

            {!scoped.questions.length && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                <span>No {selectedSourceLabel} questions for this chapter selection.</span>
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
                        width: `${Math.round(
                          ((session.index + 1) / session.items.length) * 100,
                        )}%`,
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
                  {active.chapterNumber && (
                    <span className="rounded-full border border-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                      Ch. {active.chapterNumber}
                    </span>
                  )}
                  <span
                    className={`source-tag ${
                      active.sourceType === "supplemental" ? "supplemental" : ""
                    }`}
                  >
                    {sourceName(active)}
                  </span>
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
                    const isRightChoice =
                      session.pendingFeedback && choice === active.correctAnswer
                    const isWrongPick =
                      session.pendingFeedback && isPicked && !lastAns?.correct

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
                    {session.index === session.items.length - 1
                      ? "See results"
                      : "Next question"}{" "}
                    <ArrowRight size={15} />
                  </button>
                </div>
              )}
            </section>
          )}

          {review && (
            <section className="panel p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-2xl font-bold text-teal-900">
                    {computeLetterGrade(review.percent).letter}
                  </div>
                  <div>
                    <p className="eyebrow">Round complete · {scopeTitle}</p>
                    <h3 className="mt-1 text-3xl font-semibold text-slate-900">
                      {review.percent}%
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {review.correctCount} of {review.totalQuestions} correct ·{" "}
                      {computeLetterGrade(review.percent).label}
                      {bestStreak > 1 ? ` · Best streak: 🔥 ${bestStreak}` : ""}
                    </p>
                  </div>
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
                            [getPracticeResultKey(session.tier, scopeKey)]: review,
                          },
                          scopeKey,
                        ),
                      )
                    }
                  >
                    Start recommended level
                  </button>
                </div>
              </div>

              <details
                className="mt-4 group rounded-2xl border border-slate-200 p-4"
                open={missedIds.size > 0}
              >
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
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-800">{item.prompt}</p>
                          <span
                            className={`source-tag ${
                              item.sourceType === "supplemental" ? "supplemental" : ""
                            }`}
                          >
                            {sourceName(item)}
                          </span>
                        </div>
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
      )}

      {/* ACTIVITY 3: MATCHING GAME */}
      {activity === "matching" && (
        <section className="panel p-5 sm:p-6">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Match the pairs · {scopeTitle}</p>
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
                <div
                  className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600"
                  aria-live="polite"
                >
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
                            {item.side} {item.chapterNumber ? `· Ch. ${item.chapterNumber}` : ""}
                          </span>
                          {done && (
                            <CheckCircle2
                              size={14}
                              className="text-emerald-600"
                              aria-label="Matched"
                            />
                          )}
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

      {/* ACTIVITY 4: GRADEBOOK & WEAK-SPOT TRACKER */}
      {activity === "gradebook" && (
        <section className="panel p-5 sm:p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-2xl font-bold text-teal-900">
                {gradeSummary.letterGrade}
              </div>
              <div>
                <p className="eyebrow">Overall Standing & Diagnostic Tracker</p>
                <h3 className="mt-0.5 text-2xl font-semibold text-slate-900">
                  {gradeSummary.overallPercent !== null
                    ? `${gradeSummary.overallPercent}% Overall (${gradeSummary.gradeLabel})`
                    : "Complete any Quiz or Blitz to calculate your grade"}
                </h3>
                <p className="mt-0.5 text-xs text-slate-600">
                  {gradeSummary.totalAttempts} graded rounds completed ·{" "}
                  {gradeSummary.weakSpots.length} specific items flagged for review
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {gradeSummary.weakSpots.length > 0 && (
                <button type="button" className="action" onClick={drillWeakSpots}>
                  <Target size={15} /> Drill Weak Spots Now ({gradeSummary.weakSpots.length})
                </button>
              )}
              <button
                type="button"
                className="action action-secondary"
                onClick={() => {
                  setActivity("blitz")
                  startBlitz()
                }}
              >
                <Zap size={15} /> Play Quick Blitz
              </button>
            </div>
          </div>

          {/* What you need to work on (Missed Questions / Weak Spots) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="eyebrow">Priority Review Queue</p>
                <h4 className="text-base font-semibold text-slate-900">
                  {gradeSummary.weakSpots.length > 0
                    ? `What to work on next (${gradeSummary.weakSpots.length} missed concepts)`
                    : "No missed questions on record yet"}
                </h4>
              </div>
              {gradeSummary.weakSpots.length > 0 && (
                <button type="button" className="action action-secondary" onClick={drillWeakSpots}>
                  Retry these {gradeSummary.weakSpots.length} items
                </button>
              )}
            </div>

            {gradeSummary.weakSpots.length > 0 ? (
              <div className="mt-3 grid gap-2.5 md:grid-cols-2">
                {gradeSummary.weakSpots.slice(0, 8).map((item) => (
                  <article
                    key={item.questionId}
                    className="rounded-xl border border-amber-200/80 bg-amber-50/40 p-3"
                  >
                    <div className="flex items-center justify-between gap-2 text-[11px] font-semibold text-amber-900">
                      <span>{String(item.chapterId).replace("chapter-", "Chapter ")}</span>
                      <span>Missed {item.missCount}×</span>
                    </div>
                    <p className="mt-1 text-xs font-semibold text-slate-900">{item.prompt}</p>
                    <p className="mt-1 text-xs text-emerald-800">
                      <strong>Target answer:</strong> {item.correctAnswer}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-xs text-slate-600">
                Any question you miss in Question Rounds or Quick Study Blitz automatically appears here so you know what to focus on before exam day.
              </p>
            )}
          </div>

          {/* Per-chapter grade breakdown */}
          <div>
            <p className="eyebrow">Chapter-by-chapter readiness</p>
            <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {gradeSummary.chapterBreakdown.map((ch) => (
                <div
                  key={ch.chapterId}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900">
                        Ch. {ch.number}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          ch.sourceType === "supplemental"
                            ? "bg-amber-100/80 text-amber-900"
                            : "bg-teal-100/80 text-teal-900"
                        }`}
                      >
                        {ch.sourceType === "supplemental" ? "Suppl." : "Course"}
                      </span>
                      {ch.needsWork && (
                        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-900">
                          Needs work
                        </span>
                      )}
                    </div>
                    <p className="mt-1 truncate text-xs font-medium text-slate-700">
                      {ch.title}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {ch.percent !== null
                        ? `${ch.percent}% (${ch.letter}) · ${ch.attempts} run${ch.attempts === 1 ? "" : "s"}`
                        : "Not tested yet"}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="action action-secondary shrink-0 text-xs"
                    onClick={() => {
                      setSelectedChapterIds([ch.chapterId])
                      setSource(ch.sourceType === "supplemental" ? "all" : "course")
                      setActivity("blitz")
                      startBlitz(null, [ch.chapterId])
                    }}
                  >
                    Blitz
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default PracticeArcade
