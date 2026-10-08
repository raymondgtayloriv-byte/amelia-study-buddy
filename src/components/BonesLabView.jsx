import { useState } from "react"
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  PencilLine,
  RefreshCw,
  ScanSearch,
  ShieldCheck,
  X,
} from "lucide-react"
import {
  buildQuizSession,
  buildTypedSession,
  evaluateTypedAnswer,
  getAcceptedTerms,
  getAvailableBones,
  getAvailableViews,
  getFilteredStructures,
  getScopeLabel,
  getViewPoint,
  shuffle,
  summarizeTypedResponses,
} from "./bonesLabUtils"

function getRecallPrompt(structure, index) {
  if (index % 3 === 0) {
    return `What is this structure? ${structure.identifyPrompt}`
  }

  if (index % 3 === 1) {
    return `Name a landmark on the ${structure.boneLabel.toLowerCase()} that matches this clue: ${structure.hint}`
  }

  return `Where is the ${structure.term}?`
}

function ViewStudySurface({
  view,
  structureId,
  markerVisible,
  markerLabel,
  markerHint,
}) {
  const point = getViewPoint(view, structureId)
  const showReferenceCallout = !point && markerVisible

  return (
    <div className="rounded-[30px] border border-white/70 bg-white/88 p-4 shadow-soft">
      <div className="relative overflow-hidden rounded-[24px] bg-[linear-gradient(135deg,_rgba(248,251,252,0.96),_rgba(237,244,255,0.92))]">
        <img
          src={view.imageSrc}
          alt={view.imageAlt}
          className="h-[420px] w-full object-contain"
        />

        {point && markerVisible ? (
          <div
            className="absolute"
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
          >
            <span className="absolute -left-4 -top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--ink-strong)] text-xs font-bold text-white shadow-soft ring-4 ring-white/80">
              1
            </span>
            <div className="absolute left-7 top-[-0.4rem] w-52 rounded-[20px] bg-[rgba(17,24,39,0.94)] px-3 py-2 text-xs leading-5 text-white shadow-soft">
              <p className="font-semibold">{markerLabel}</p>
              <p className="mt-1 text-white/78">
                {point.approximate ? "Approximate deep/internal location." : markerHint}
              </p>
            </div>
          </div>
        ) : null}

        {showReferenceCallout ? (
          <div className="absolute bottom-4 left-4 max-w-xs rounded-[20px] bg-[rgba(17,24,39,0.9)] px-3 py-3 text-xs leading-5 text-white shadow-soft">
            <p className="font-semibold">{markerLabel}</p>
            <p className="mt-1 text-white/78">{markerHint}</p>
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            {view.label}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">{view.studySurface}</p>
        </div>
        <div className="rounded-[20px] bg-[rgba(248,251,252,0.96)] px-3 py-3 text-xs leading-5 text-slate-600 lg:max-w-xs">
          {view.imageCredit}
        </div>
      </div>
    </div>
  )
}

export function BonesLabView({
  unit,
  progress = { recall: {}, quizHistory: {}, typedHistory: {}, weakSpots: {} },
  onSaveQuizResult,
  onSaveTypedResult,
  onUpdateRecall,
}) {
  const [activeMode, setActiveMode] = useState("study")
  const [studyMode, setStudyMode] = useState("picture")
  const [selectedRegionId, setSelectedRegionId] = useState("all")
  const [selectedBoneId, setSelectedBoneId] = useState("all")
  const [selectedViewId, setSelectedViewId] = useState("all")
  const [studyIndex, setStudyIndex] = useState(0)
  const [studyRevealed, setStudyRevealed] = useState(false)
  const [quizSession, setQuizSession] = useState(() =>
    buildQuizSession(unit, unit.structures, `${unit.id}:all:all:all`),
  )
  const [typedSession, setTypedSession] = useState(() =>
    buildTypedSession(unit.structures, `${unit.id}:typed:all:all:all`),
  )
  const [typedInput, setTypedInput] = useState("")
  const [typedFeedback, setTypedFeedback] = useState(null)
  const [typedWeakOnly, setTypedWeakOnly] = useState(false)
  const [recallDeck, setRecallDeck] = useState(() => shuffle(unit.structures))
  const [recallIndex, setRecallIndex] = useState(0)
  const [recallRevealed, setRecallRevealed] = useState(false)
  const [recallWeakOnly, setRecallWeakOnly] = useState(false)

  const structures = getFilteredStructures(
    unit,
    selectedRegionId,
    selectedBoneId,
    selectedViewId,
  )
  const viewMap = Object.fromEntries(unit.views.map((view) => [view.id, view]))
  const availableBones = getAvailableBones(unit, selectedRegionId)
  const availableViews = getAvailableViews(unit, selectedRegionId, selectedBoneId)
  const studyCard = structures[studyIndex] ?? structures[0]
  const studyView =
    viewMap[selectedViewId === "all" ? studyCard?.viewId : selectedViewId] ?? null
  const studyPoint = studyView ? getViewPoint(studyView, studyCard?.id) : null
  const quizKey = `${unit.id}:${selectedRegionId}:${selectedBoneId}:${selectedViewId}`
  const typedSessionKey = `${unit.id}:typed:${selectedRegionId}:${selectedBoneId}:${selectedViewId}`
  const bestScore = progress.quizHistory?.[quizKey]?.bestPercent ?? 0
  const bestTypedScore = progress.typedHistory?.[typedSessionKey]?.bestPercent ?? 0
  const bestSpellingScore =
    progress.typedHistory?.[typedSessionKey]?.bestSpellingPercent ?? 0
  const recallCard = recallDeck[recallIndex] ?? recallDeck[0]
  const knownCount = structures.filter(
    (structure) => progress.recall?.[structure.id] === "known",
  ).length
  const missedCount = structures.filter(
    (structure) => progress.recall?.[structure.id] === "missed",
  ).length
  const savedWeakSpotIds = structures
    .filter((structure) => (progress.weakSpots?.[structure.id]?.misses ?? 0) > 0)
    .map((structure) => structure.id)
  const globalWeakSpotIds = unit.structures
    .filter((structure) => (progress.weakSpots?.[structure.id]?.misses ?? 0) > 0)
    .map((structure) => structure.id)
  const typedCard = typedSession.questions[typedSession.currentIndex] ?? null
  const typedView = typedCard ? viewMap[typedCard.viewId] : null

  const resetScopedState = (regionId, boneId, viewId, options = {}) => {
    const scopedStructures = getFilteredStructures(unit, regionId, boneId, viewId)
    const nextQuizKey = `${unit.id}:${regionId}:${boneId}:${viewId}`
    const nextTypedSessionKey = `${unit.id}:typed:${regionId}:${boneId}:${viewId}`
    const nextReviewIds = options.reviewIds ?? []
    const reviewPool = options.weakOnly
      ? scopedStructures
          .filter((structure) => nextReviewIds.includes(structure.id))
          .map((structure) => structure.id)
      : nextReviewIds

    setStudyIndex(0)
    setStudyRevealed(false)
    setQuizSession(buildQuizSession(unit, scopedStructures, nextQuizKey))
    setTypedSession(
      buildTypedSession(scopedStructures, nextTypedSessionKey, reviewPool),
    )
    setTypedInput("")
    setTypedFeedback(null)
    setTypedWeakOnly(options.weakOnly ?? false)
    setRecallDeck(shuffle(scopedStructures))
    setRecallIndex(0)
    setRecallRevealed(false)
    setRecallWeakOnly(false)
  }

  const handleRegionChange = (regionId) => {
    const nextAvailableBones = getAvailableBones(unit, regionId)
    const nextBoneId =
      selectedBoneId !== "all" &&
      !nextAvailableBones.some((bone) => bone.id === selectedBoneId)
        ? "all"
        : selectedBoneId
    const nextAvailableViews = getAvailableViews(unit, regionId, nextBoneId)
    const nextViewId =
      selectedViewId !== "all" &&
      !nextAvailableViews.some((view) => view.id === selectedViewId)
        ? "all"
        : selectedViewId

    setSelectedRegionId(regionId)
    setSelectedBoneId(nextBoneId)
    setSelectedViewId(nextViewId)
    resetScopedState(regionId, nextBoneId, nextViewId)
  }

  const handleBoneChange = (boneId) => {
    const nextAvailableViews = getAvailableViews(unit, selectedRegionId, boneId)
    const nextViewId =
      selectedViewId !== "all" &&
      !nextAvailableViews.some((view) => view.id === selectedViewId)
        ? "all"
        : selectedViewId

    setSelectedBoneId(boneId)
    setSelectedViewId(nextViewId)
    resetScopedState(selectedRegionId, boneId, nextViewId)
  }

  const handleViewChange = (viewId) => {
    setSelectedViewId(viewId)
    resetScopedState(selectedRegionId, selectedBoneId, viewId)
  }

  const handleStudyModeChange = (mode) => {
    setStudyMode(mode)
    setStudyIndex(0)
    setStudyRevealed(false)
  }

  const moveStudyCard = () => {
    setStudyIndex((current) => {
      if (!structures.length) {
        return 0
      }

      return current + 1 >= structures.length ? 0 : current + 1
    })
    setStudyRevealed(false)
  }

  const restartQuiz = () => {
    setQuizSession(buildQuizSession(unit, structures, quizKey))
  }

  const selectQuizAnswer = (answer) => {
    if (quizSession.answered) {
      return
    }

    const activeQuestion = quizSession.questions[quizSession.currentIndex]
    const correct = answer === activeQuestion.correctAnswer

    setQuizSession((current) => ({
      ...current,
      answered: true,
      selectedAnswer: answer,
      score: correct ? current.score + 1 : current.score,
      answers: [
        ...current.answers,
        {
          structureId: activeQuestion.structureId,
          correct,
        },
      ],
    }))
  }

  const goToNextQuizQuestion = () => {
    const lastQuestion =
      quizSession.currentIndex === quizSession.questions.length - 1

    if (lastQuestion) {
      const missedIds = quizSession.answers
        .filter((answer) => !answer.correct)
        .map((answer) => answer.structureId)

      onSaveQuizResult({
        quizKey,
        scopeLabel: getScopeLabel(unit, selectedRegionId, selectedBoneId, selectedViewId),
        correctCount: quizSession.score,
        totalQuestions: quizSession.questions.length,
        missedIds,
      })

      setQuizSession((current) => ({
        ...current,
        completed: true,
      }))

      return
    }

    setQuizSession((current) => ({
      ...current,
      currentIndex: current.currentIndex + 1,
      selectedAnswer: "",
      answered: false,
    }))
  }

  const submitTypedAnswer = () => {
    if (!typedCard) {
      return
    }

    const feedback = evaluateTypedAnswer(typedInput, typedCard, unit.structures)

    if (feedback.kind === "blank") {
      setTypedFeedback(feedback)
      return
    }

    setTypedFeedback(feedback)
    setTypedSession((current) => ({
      ...current,
      submitted: true,
      responses: [
        ...current.responses,
        {
          structure: typedCard,
          input: typedInput,
          feedback,
        },
      ],
    }))
  }

  const goToNextTypedQuestion = () => {
    if (!typedCard) {
      return
    }

    const lastQuestion = typedSession.currentIndex === typedSession.questions.length - 1

    if (lastQuestion) {
      const summary = summarizeTypedResponses(typedSession.responses)

      onSaveTypedResult({
        sessionKey: typedSessionKey,
        scopeLabel: getScopeLabel(unit, selectedRegionId, selectedBoneId, selectedViewId),
        correctCount: summary.correctCount,
        spellingCount: summary.spellingCount,
        totalQuestions: summary.totalQuestions,
        reviewIds: summary.reviewIds,
      })

      setTypedSession((current) => ({
        ...current,
        completed: true,
      }))

      return
    }

    setTypedSession((current) => ({
      ...current,
      currentIndex: current.currentIndex + 1,
      submitted: false,
    }))
    setTypedInput("")
    setTypedFeedback(null)
  }

  const restartTypedSession = (reviewIds = [], weakOnly = false) => {
    resetScopedState(selectedRegionId, selectedBoneId, selectedViewId, {
      reviewIds,
      weakOnly,
    })
  }

  const restartRapidReview = (reviewIds = [], weakOnly = false) => {
    const selectedIds = new Set(reviewIds)
    const source = weakOnly
      ? structures.filter((structure) => selectedIds.has(structure.id))
      : structures

    setRecallDeck(shuffle(source))
    setRecallIndex(0)
    setRecallRevealed(false)
    setRecallWeakOnly(weakOnly)
  }

  const startWeakSpotTypedReview = () => {
    if (savedWeakSpotIds.length) {
      restartTypedSession(savedWeakSpotIds, true)
      return
    }

    if (!globalWeakSpotIds.length) {
      return
    }

    setSelectedRegionId("all")
    setSelectedBoneId("all")
    setSelectedViewId("all")
    resetScopedState("all", "all", "all", {
      reviewIds: globalWeakSpotIds,
      weakOnly: true,
    })
  }

  const startWeakSpotRapidReview = () => {
    if (savedWeakSpotIds.length) {
      restartRapidReview(savedWeakSpotIds, true)
      return
    }

    if (!globalWeakSpotIds.length) {
      return
    }

    setSelectedRegionId("all")
    setSelectedBoneId("all")
    setSelectedViewId("all")
    resetScopedState("all", "all", "all")
    const fullSet = getFilteredStructures(unit, "all", "all", "all")
    setRecallDeck(shuffle(fullSet.filter((structure) => globalWeakSpotIds.includes(structure.id))))
    setRecallIndex(0)
    setRecallRevealed(false)
    setRecallWeakOnly(true)
  }

  const markRecall = (status) => {
    if (!recallCard) {
      return
    }

    onUpdateRecall(recallCard.id, status)
    setRecallRevealed(false)
    setRecallIndex((current) => {
      if (!recallDeck.length) {
        return 0
      }

      return current + 1 >= recallDeck.length ? 0 : current + 1
    })
  }

  const activeQuizQuestion = quizSession.questions[quizSession.currentIndex]
  const typedSummary = summarizeTypedResponses(typedSession.responses)
  const missedQuizTerms = quizSession.answers
    .filter((answer) => !answer.correct)
    .map(
      (answer) =>
        unit.structures.find((structure) => structure.id === answer.structureId)?.term,
    )
    .filter(Boolean)

  return (
    <div className="space-y-4">
      <section className="panel px-5 py-6 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="eyebrow">{unit.category}</p>
            <h2 className="font-display text-3xl font-semibold text-slate-900">
              {unit.label}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              {unit.examFocus} Focus on one region, hide the answers, and come
              back to missed landmarks in your review list.
            </p>
          </div>
          <div className="rounded-[24px] bg-[linear-gradient(135deg,_rgba(236,250,248,0.96),_rgba(232,244,255,0.88))] px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Chapter 7 scope
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {unit.structures.length} structures across {unit.regions.length} regions
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <div className="panel px-4 py-4 sm:px-5">
            <h3 className="text-lg font-semibold text-slate-900">Study modes</h3>
            <div className="mt-4 space-y-3">
              {[
                {
                  id: "study",
                  label: "Picture study",
                  helper:
                    "Image-first study with mapped markers where available and lecture-reference slides elsewhere.",
                },
                {
                  id: "typed",
                  label: "Typed recall",
                  helper: "Type the exact landmark name and get spelling feedback.",
                },
                {
                  id: "quiz",
                  label: "Quiz mode",
                  helper: "Randomized multiple choice with immediate feedback.",
                },
                {
                  id: "rapid-review",
                  label: "Rapid review",
                  helper: "Short-answer style recall with I knew it / I missed it.",
                },
              ].map((mode) => {
                const active = mode.id === activeMode

                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setActiveMode(mode.id)}
                    className={`w-full rounded-[24px] border p-4 text-left transition ${
                      active
                        ? "border-transparent bg-[linear-gradient(135deg,_rgba(31,109,112,0.96),_rgba(18,81,99,0.96))] text-white shadow-soft"
                        : "border-white/70 bg-white/85 text-slate-800"
                    }`}
                  >
                    <p className="text-sm font-semibold">{mode.label}</p>
                    <p
                      className={`mt-2 text-sm leading-6 ${
                        active ? "text-white/80" : "text-slate-600"
                      }`}
                    >
                      {mode.helper}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="panel px-4 py-4 sm:px-5">
            <h3 className="text-lg font-semibold text-slate-900">Filter set</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Narrow the session by region, bone, and view so the expanded
              Chapter 7 set stays practical to study.
            </p>

            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Region
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleRegionChange("all")}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    selectedRegionId === "all"
                      ? "bg-[var(--ink-strong)] text-white shadow-soft"
                      : "bg-[rgba(31,109,112,0.08)] text-slate-700"
                  }`}
                >
                  All regions
                </button>
                {unit.regions.map((region) => (
                  <button
                    key={region.id}
                    type="button"
                    onClick={() => handleRegionChange(region.id)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      selectedRegionId === region.id
                        ? "bg-[var(--ink-strong)] text-white shadow-soft"
                        : "bg-[rgba(31,109,112,0.08)] text-slate-700"
                    }`}
                  >
                    {region.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Bone
              </p>
              <div className="mt-3 flex flex-wrap gap-2 max-h-[300px] overflow-y-auto pr-2 pb-2">
                <button
                  type="button"
                  onClick={() => handleBoneChange("all")}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    selectedBoneId === "all"
                      ? "bg-[var(--ink-strong)] text-white shadow-soft"
                      : "bg-[rgba(31,109,112,0.08)] text-slate-700"
                  }`}
                >
                  All bones
                </button>
                {availableBones.map((bone) => (
                  <button
                    key={bone.id}
                    type="button"
                    onClick={() => handleBoneChange(bone.id)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      selectedBoneId === bone.id
                        ? "bg-[var(--ink-strong)] text-white shadow-soft"
                        : "bg-[rgba(31,109,112,0.08)] text-slate-700"
                    }`}
                  >
                    {bone.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                View
              </p>
              <div className="mt-3 flex flex-wrap gap-2 max-h-[300px] overflow-y-auto pr-2 pb-2">
                <button
                  type="button"
                  onClick={() => handleViewChange("all")}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    selectedViewId === "all"
                      ? "bg-[var(--ink-strong)] text-white shadow-soft"
                      : "bg-[rgba(31,109,112,0.08)] text-slate-700"
                  }`}
                >
                  All views
                </button>
                {availableViews.map((view) => (
                  <button
                    key={view.id}
                    type="button"
                    onClick={() => handleViewChange(view.id)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      selectedViewId === view.id
                        ? "bg-[var(--ink-strong)] text-white shadow-soft"
                        : "bg-[rgba(31,109,112,0.08)] text-slate-700"
                    }`}
                  >
                    {view.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="panel px-4 py-4 sm:px-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Progress snapshot
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-[24px] bg-[rgba(238,250,246,0.95)] p-4">
                <p className="text-sm font-semibold text-slate-900">
                  Rapid review wins
                </p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">
                  {knownCount}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  marked &quot;I knew it&quot; in this filter
                </p>
              </div>

              <div className="rounded-[24px] bg-[rgba(255,247,237,0.96)] p-4">
                <p className="text-sm font-semibold text-slate-900">Needs more reps</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">
                  {missedCount}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  marked &quot;I missed it&quot; in this filter
                </p>
              </div>

              <div className="rounded-[24px] bg-[rgba(237,244,255,0.95)] p-4">
                <p className="text-sm font-semibold text-slate-900">Best typed score</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">
                  {bestTypedScore}%
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  spelling {bestSpellingScore}% for{" "}
                  {getScopeLabel(unit, selectedRegionId, selectedBoneId, selectedViewId)}
                </p>
              </div>

              <div className="rounded-[24px] bg-[rgba(247,250,255,0.95)] p-4">
                <p className="text-sm font-semibold text-slate-900">Saved weak spots</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">
                  {savedWeakSpotIds.length}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {globalWeakSpotIds.length
                    ? `${savedWeakSpotIds.length} in this filter • ${globalWeakSpotIds.length} chapter-wide`
                    : "Misses from typed recall, quiz mode, and rapid review appear here."}
                </p>
              </div>
            </div>
          </div>
        </aside>

        <div className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          {activeMode === "study" ? (
            <>
              <div className="panel px-5 py-6 sm:px-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="eyebrow">Picture study mode</p>
                    <h3 className="text-2xl font-semibold text-slate-900">
                      Image-first landmark practice
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      Use mapped bone views when they exist and Chapter 7
                      lecture-reference slides for the rest. The current filter
                      contains {structures.length} structures.
                    </p>
                  </div>
                  <div className="inline-flex items-center rounded-full bg-[rgba(31,109,112,0.08)] p-1">
                    {[
                      { id: "picture", label: "Picture prompt" },
                      { id: "structure", label: "Name the structure" },
                    ].map((mode) => {
                      const active = mode.id === studyMode

                      return (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => handleStudyModeChange(mode.id)}
                          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                            active
                              ? "bg-[var(--ink-strong)] text-white shadow-soft"
                              : "text-slate-600"
                          }`}
                        >
                          {mode.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {studyCard && studyView ? (
                <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                  <article className="panel px-5 py-6 sm:px-6">
                    <p className="eyebrow">
                      {studyCard.boneLabel} • {studyView.label}
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                      {studyMode === "picture"
                        ? "Find the marked structure"
                        : studyCard.term}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {studyMode === "picture"
                        ? studyCard.identifyPrompt
                        : `Use the picture and your own words first, then reveal the location and notes.`}
                    </p>

                    <div className="mt-6">
                      <ViewStudySurface
                        view={studyView}
                        structureId={studyCard.id}
                        markerVisible={studyRevealed}
                        markerLabel={studyCard.term}
                        markerHint={studyCard.regionLabel}
                      />
                    </div>
                  </article>

                  <article className="panel px-5 py-6 sm:px-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="eyebrow">Reveal and self-check</p>
                        <h3 className="text-2xl font-semibold text-slate-900">
                          {studyMode === "picture"
                            ? "Name the landmark"
                            : "What or where is it?"}
                        </h3>
                      </div>
                      <div className="rounded-2xl bg-[rgba(31,109,112,0.08)] px-3 py-2 text-sm font-semibold text-[var(--ink-strong)]">
                        Card {studyIndex + 1} of {structures.length}
                      </div>
                    </div>

                    <div className="mt-6 rounded-[28px] bg-[rgba(238,250,246,0.95)] p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Prompt
                      </p>
                      <p className="mt-3 text-lg font-semibold leading-8 text-slate-900">
                        {studyMode === "picture" ? studyCard.hint : studyCard.term}
                      </p>
                      <p className="mt-3 text-sm leading-7 text-slate-600">
                        {studyMode === "picture"
                          ? "Try to name it before revealing the marker."
                          : "Describe its location and nearby structures before checking."}
                      </p>
                    </div>

                    <div className="mt-4 rounded-[28px] bg-[rgba(244,247,255,0.95)] p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Reveal
                      </p>
                      <p className="mt-3 text-xl font-semibold text-slate-900">
                        {studyRevealed
                          ? studyMode === "picture"
                            ? studyCard.term
                            : studyCard.definition
                          : "Tap reveal to check"}
                      </p>
                      <p className="mt-3 text-sm leading-7 text-slate-600">
                        {studyRevealed
                          ? `It is ${studyCard.location}.`
                          : studyCard.hint}
                      </p>
                      {studyPoint?.approximate && studyRevealed ? (
                        <p className="mt-3 text-sm leading-6 text-slate-600">
                          Marker note: this point shows an approximate deep or
                          internal location on the current view.
                        </p>
                      ) : null}
                      {studyRevealed ? (
                        <>
                          {studyCard.aliases.length ? (
                            <p className="mt-3 text-sm leading-6 text-slate-600">
                              Accepted aliases: {getAcceptedTerms(studyCard).join(", ")}
                            </p>
                          ) : null}
                          <p className="mt-3 text-sm leading-6 text-slate-700">
                            {studyCard.note}
                          </p>
                        </>
                      ) : null}
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => setStudyRevealed((current) => !current)}
                        className="inline-flex items-center gap-2 rounded-full border border-[rgba(31,109,112,0.16)] bg-white px-4 py-3 text-sm font-semibold text-[var(--ink-strong)]"
                      >
                        {studyRevealed ? <EyeOff size={16} /> : <Eye size={16} />}
                        {studyRevealed
                          ? studyPoint
                            ? "Hide marker"
                            : "Hide clue"
                          : studyPoint
                            ? "Reveal marker"
                            : "Reveal clue"}
                      </button>
                      <button
                        type="button"
                        onClick={moveStudyCard}
                        className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,_rgba(31,109,112,0.95),_rgba(18,81,99,0.95))] px-4 py-3 text-sm font-semibold text-white shadow-soft"
                      >
                        Next prompt
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </article>
                </section>
              ) : (
                <div className="panel px-5 py-6 sm:px-6">
                  <h3 className="text-xl font-semibold text-slate-900">
                    No landmarks in this bone/view filter yet
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Switch to another view or broaden the bone filter to keep studying.
                  </p>
                </div>
              )}
            </>
          ) : null}

          {activeMode === "typed" ? (
            <section className="space-y-4">
              <div className="panel px-5 py-6 sm:px-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="eyebrow">Typed recall</p>
                    <h3 className="text-2xl font-semibold text-slate-900">
                      Exact naming and spelling practice
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      Type the structure name from the mapped image when a
                      point exists, or from the Chapter 7 reference slide and
                      clue when it does not. Results separate correct answers,
                      close misspellings, and wrong structures.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={startWeakSpotTypedReview}
                      disabled={!globalWeakSpotIds.length}
                      className="inline-flex items-center gap-2 rounded-full border border-[rgba(31,109,112,0.16)] bg-white px-4 py-3 text-sm font-semibold text-[var(--ink-strong)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <RefreshCw size={16} />
                      Review weak spots
                    </button>
                    <button
                      type="button"
                      onClick={() => restartTypedSession()}
                      className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,_rgba(31,109,112,0.95),_rgba(18,81,99,0.95))] px-4 py-3 text-sm font-semibold text-white shadow-soft"
                    >
                      <PencilLine size={16} />
                      Restart typed set
                    </button>
                  </div>
                  <p className="text-sm leading-6 text-slate-600">
                    {globalWeakSpotIds.length
                      ? savedWeakSpotIds.length
                        ? `Starts with ${savedWeakSpotIds.length} saved weak spots in the current filter.`
                        : `No weak spots in this filter, so review falls back to ${globalWeakSpotIds.length} saved Chapter 7 weak spots.`
                      : "No weak spots saved yet. Miss a term in typed recall, quiz mode, or rapid review to build this list."}
                  </p>
                </div>
              </div>

              {typedCard && typedView ? (
                !typedSession.completed ? (
                  <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                    <article className="panel px-5 py-6 sm:px-6">
                      <p className="eyebrow">
                        {typedCard.boneLabel} • {typedView.label}
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                        Type the structure name
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-slate-600">
                        Question {typedSession.currentIndex + 1} of{" "}
                        {typedSession.questions.length}
                        {typedWeakOnly ? " • weak-spot review" : ""}
                      </p>

                      <div className="mt-6">
                      <ViewStudySurface
                        view={typedView}
                        structureId={typedCard.id}
                        markerVisible
                        markerLabel={
                          typedSession.submitted ? typedCard.term : "Study clue"
                        }
                        markerHint={
                          typedSession.submitted
                            ? typedCard.regionLabel
                            : typedCard.identifyPrompt
                        }
                      />
                    </div>
                    </article>

                    <article className="panel px-5 py-6 sm:px-6">
                      <div className="rounded-[28px] bg-[rgba(248,251,252,0.96)] p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Input
                        </p>
                        <input
                          value={typedInput}
                          onChange={(event) => setTypedInput(event.target.value)}
                          disabled={typedSession.submitted}
                          placeholder="Type the exact structure name"
                          className="mt-4 w-full rounded-[22px] border border-[rgba(148,163,184,0.18)] bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-[rgba(31,109,112,0.28)]"
                        />
                        <p className="mt-3 text-sm leading-6 text-slate-600">
                          {typedView.kind === "mapped"
                            ? "Use the mapped image and type the exact structure name."
                            : typedCard.identifyPrompt}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-3">
                          {!typedSession.submitted ? (
                            <button
                              type="button"
                              onClick={submitTypedAnswer}
                              className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,_rgba(31,109,112,0.95),_rgba(18,81,99,0.95))] px-4 py-3 text-sm font-semibold text-white shadow-soft"
                            >
                              Check answer
                              <ArrowRight size={16} />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={goToNextTypedQuestion}
                              className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,_rgba(31,109,112,0.95),_rgba(18,81,99,0.95))] px-4 py-3 text-sm font-semibold text-white shadow-soft"
                            >
                              {typedSession.currentIndex === typedSession.questions.length - 1
                                ? "See results"
                                : "Next question"}
                              <ArrowRight size={16} />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 rounded-[28px] bg-[rgba(238,250,246,0.95)] p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Feedback
                        </p>
                        <p className="mt-3 text-xl font-semibold text-slate-900">
                          {typedFeedback
                            ? typedFeedback.message
                            : "Submit your answer to see grading feedback."}
                        </p>
                        <p className="mt-3 text-sm leading-7 text-slate-600">
                          {typedFeedback
                            ? `Target answer: ${typedCard.term}. Accepted answers: ${getAcceptedTerms(
                                typedCard,
                              ).join(", ")}.`
                            : "Normalized casing differences are accepted. Near-miss spellings are called out separately so anatomy spelling still gets practiced."}
                        </p>
                      </div>
                    </article>
                  </div>
                ) : (
                  <div className="panel px-5 py-6 sm:px-6">
                    <div className="rounded-[30px] bg-[linear-gradient(135deg,_rgba(31,109,112,0.95),_rgba(18,81,99,0.96))] px-6 py-7 text-white shadow-soft">
                      <p className="eyebrow !text-white/70">Typed session complete</p>
                      <h3 className="mt-2 text-3xl font-semibold">
                        {Math.round(
                          (typedSummary.correctCount / Math.max(typedSummary.totalQuestions, 1)) *
                            100,
                        )}
                        %
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-white/82">
                        Typed-answer accuracy: {typedSummary.correctCount}/
                        {typedSummary.totalQuestions}. Spelling accuracy:{" "}
                        {typedSummary.spellingCount}/{typedSummary.totalQuestions}.
                      </p>

                      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-[24px] bg-white/12 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                            Typed accuracy
                          </p>
                          <p className="mt-2 text-xl font-semibold text-white">
                            {typedSummary.correctCount}/{typedSummary.totalQuestions}
                          </p>
                        </div>
                        <div className="rounded-[24px] bg-white/12 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                            Spelling accuracy
                          </p>
                          <p className="mt-2 text-xl font-semibold text-white">
                            {typedSummary.spellingCount}/{typedSummary.totalQuestions}
                          </p>
                        </div>
                        <div className="rounded-[24px] bg-white/12 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                            Close misspellings
                          </p>
                          <p className="mt-2 text-xl font-semibold text-white">
                            {typedSummary.closeCount}
                          </p>
                        </div>
                        <div className="rounded-[24px] bg-white/12 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                            Best saved
                          </p>
                          <p className="mt-2 text-xl font-semibold text-white">
                            {bestTypedScore}% / {bestSpellingScore}%
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                      <div className="rounded-[28px] bg-[rgba(248,251,252,0.96)] p-5">
                        <h4 className="text-lg font-semibold text-slate-900">
                          Missed terms
                        </h4>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {typedSummary.missedTerms.length ? (
                            typedSummary.missedTerms.map((term) => (
                              <span key={term} className="pill">
                                {term}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-slate-600">
                              No missed terms this round.
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="rounded-[28px] bg-[rgba(237,244,255,0.95)] p-5">
                        <h4 className="text-lg font-semibold text-slate-900">
                          Review again
                        </h4>
                        <p className="mt-3 text-sm leading-7 text-slate-600">
                          Use weak-spot review to rerun only close misses and incorrect answers.
                        </p>
                        <div className="mt-5 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => restartTypedSession(typedSummary.reviewIds, true)}
                            disabled={!typedSummary.reviewIds.length}
                            className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,_rgba(31,109,112,0.95),_rgba(18,81,99,0.95))] px-4 py-3 text-sm font-semibold text-white shadow-soft disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <RefreshCw size={16} />
                            Review missed only
                          </button>
                          <button
                            type="button"
                            onClick={() => restartTypedSession()}
                            className="inline-flex items-center gap-2 rounded-full border border-[rgba(31,109,112,0.16)] bg-white px-4 py-3 text-sm font-semibold text-[var(--ink-strong)]"
                          >
                            <PencilLine size={16} />
                            Start full typed set
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              ) : (
                <div className="panel px-5 py-6 sm:px-6">
                  <h3 className="text-xl font-semibold text-slate-900">
                    No typed prompts in this bone/view filter yet
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Switch to another view or broaden the filter to keep practicing.
                  </p>
                </div>
              )}
            </section>
          ) : null}

          {activeMode === "quiz" ? (
            <section className="panel px-5 py-6 sm:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="eyebrow">Quiz mode</p>
                  <h3 className="text-2xl font-semibold text-slate-900">
                    Multiple choice with immediate feedback
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Distractors are pulled from the same bone or nearby region
                    first so the quiz feels exam-relevant instead of random.
                  </p>
                </div>
                <div className="rounded-[24px] bg-[linear-gradient(135deg,_rgba(236,250,248,0.96),_rgba(232,244,255,0.88))] px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Scope
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {getScopeLabel(unit, selectedRegionId, selectedBoneId, selectedViewId)}
                  </p>
                </div>
              </div>

              {structures.length < 2 ? (
                <div className="mt-6 rounded-[28px] bg-[rgba(248,251,252,0.96)] p-5">
                  <h4 className="text-lg font-semibold text-slate-900">
                    Choose a broader filter for quiz mode
                  </h4>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    A multiple-choice question needs at least two landmarks in
                    the current pool so the distractors stay believable.
                  </p>
                </div>
              ) : !quizSession.completed && activeQuizQuestion ? (
                <>
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="eyebrow">
                        Question {quizSession.currentIndex + 1} of{" "}
                        {quizSession.questions.length}
                      </p>
                      <h4 className="text-2xl font-semibold text-slate-900">
                        {activeQuizQuestion.prompt}
                      </h4>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {activeQuizQuestion.helper}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[rgba(31,109,112,0.08)] px-3 py-2 text-sm font-semibold text-[var(--ink-strong)]">
                      Best {bestScore}%
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    {activeQuizQuestion.options.map((option) => {
                      const isSelected = quizSession.selectedAnswer === option
                      const isCorrect =
                        quizSession.answered &&
                        option === activeQuizQuestion.correctAnswer
                      const isIncorrect =
                        quizSession.answered &&
                        isSelected &&
                        option !== activeQuizQuestion.correctAnswer

                      return (
                        <button
                          key={option}
                          type="button"
                          disabled={quizSession.answered}
                          onClick={() => selectQuizAnswer(option)}
                          className={`w-full rounded-[24px] border px-4 py-4 text-left transition ${
                            isCorrect
                              ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                              : isIncorrect
                                ? "border-rose-300 bg-rose-50 text-rose-900"
                                : isSelected
                                  ? "border-[rgba(31,109,112,0.28)] bg-[rgba(236,250,248,0.96)]"
                                  : "border-white/70 bg-white/90 text-slate-800 hover:-translate-y-0.5"
                          }`}
                        >
                          <span className="text-sm font-medium leading-6">{option}</span>
                        </button>
                      )
                    })}
                  </div>

                  {quizSession.answered ? (
                    <div className="mt-6 rounded-[28px] bg-[rgba(248,251,252,0.96)] p-5">
                      <div className="flex items-center gap-3">
                        {quizSession.selectedAnswer === activeQuizQuestion.correctAnswer ? (
                          <ShieldCheck className="text-emerald-600" size={20} />
                        ) : (
                          <X className="text-rose-500" size={20} />
                        )}
                        <p className="text-sm font-semibold text-slate-900">
                          {quizSession.selectedAnswer === activeQuizQuestion.correctAnswer
                            ? "Correct"
                            : `Correct answer: ${activeQuizQuestion.correctAnswer}`}
                        </p>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-slate-600">
                        {activeQuizQuestion.explanation}
                      </p>
                      <button
                        type="button"
                        onClick={goToNextQuizQuestion}
                        className="mt-5 inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,_rgba(31,109,112,0.95),_rgba(18,81,99,0.95))] px-4 py-3 text-sm font-semibold text-white shadow-soft"
                      >
                        {quizSession.currentIndex === quizSession.questions.length - 1
                          ? "See results"
                          : "Next question"}
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="mt-6 rounded-[30px] bg-[linear-gradient(135deg,_rgba(31,109,112,0.95),_rgba(18,81,99,0.96))] px-6 py-7 text-white shadow-soft">
                  <p className="eyebrow !text-white/70">Quiz complete</p>
                  <h4 className="mt-2 text-3xl font-semibold">
                    {Math.round(
                      (quizSession.score / quizSession.questions.length) * 100,
                    )}
                    %
                  </h4>
                  <p className="mt-3 text-sm leading-7 text-white/82 sm:text-base">
                    You answered {quizSession.score} out of{" "}
                    {quizSession.questions.length} correctly.
                  </p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[24px] bg-white/12 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                        Last run
                      </p>
                      <p className="mt-2 text-xl font-semibold text-white">
                        {Math.round(
                          (quizSession.score / quizSession.questions.length) * 100,
                        )}
                        %
                      </p>
                    </div>
                    <div className="rounded-[24px] bg-white/12 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                        Best saved
                      </p>
                      <p className="mt-2 text-xl font-semibold text-white">
                        {progress.quizHistory?.[quizKey]?.bestPercent ?? 0}%
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-[24px] bg-white/12 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                      Terms to review
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {missedQuizTerms.length ? (
                        missedQuizTerms.map((term) => (
                          <span
                            key={term}
                            className="rounded-full bg-white/16 px-3 py-1 text-xs font-semibold text-white"
                          >
                            {term}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-white/80">
                          No missed terms this round.
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={restartQuiz}
                    className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white"
                  >
                    <RefreshCw size={16} />
                    Retry quiz
                  </button>
                </div>
              )}
            </section>
          ) : null}

          {activeMode === "rapid-review" ? (
            <section className="panel px-5 py-6 sm:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="eyebrow">Rapid review</p>
                  <h3 className="text-2xl font-semibold text-slate-900">
                    Short-answer style recall
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Use this when you need fast reps: think, reveal, then mark
                    whether you knew it.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={startWeakSpotRapidReview}
                    disabled={!globalWeakSpotIds.length}
                    className="inline-flex items-center gap-2 rounded-full border border-[rgba(31,109,112,0.16)] bg-white px-4 py-3 text-sm font-semibold text-[var(--ink-strong)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <RefreshCw size={16} />
                    Review weak spots
                  </button>
                  <button
                    type="button"
                    onClick={() => restartRapidReview()}
                    className="inline-flex items-center gap-2 rounded-full border border-[rgba(31,109,112,0.16)] bg-white px-4 py-3 text-sm font-semibold text-[var(--ink-strong)]"
                  >
                    <RefreshCw size={16} />
                    Restart deck
                  </button>
                </div>
              </div>

              {recallCard ? (
                <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.85fr]">
                  <article className="rounded-[30px] bg-[linear-gradient(135deg,_rgba(248,251,252,0.98),_rgba(237,244,255,0.96))] p-6">
                    <p className="eyebrow">
                      Card {recallIndex + 1} of {recallDeck.length}
                    </p>
                    <h4 className="mt-2 text-2xl font-semibold text-slate-900">
                      {getRecallPrompt(recallCard, recallIndex)}
                    </h4>
                    <p className="mt-4 text-sm leading-7 text-slate-600">
                      Bone: {recallCard.boneLabel} • Region: {recallCard.regionLabel}
                      {recallWeakOnly ? " • weak-spot deck" : ""}
                    </p>

                    <div className="mt-6 rounded-[28px] bg-white/88 p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Reveal
                      </p>
                      <p className="mt-3 text-xl font-semibold text-slate-900">
                        {recallRevealed ? recallCard.term : "Think first, then reveal"}
                      </p>
                      <p className="mt-3 text-sm leading-7 text-slate-600">
                        {recallRevealed
                          ? `${recallCard.definition} It is ${recallCard.location}.`
                          : recallCard.hint}
                      </p>
                      {recallRevealed ? (
                        <p className="mt-3 text-sm leading-6 text-slate-700">
                          {recallCard.note}
                        </p>
                      ) : null}
                    </div>
                  </article>

                  <article className="rounded-[30px] bg-[rgba(238,250,246,0.95)] p-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[var(--ink-strong)]">
                        <ScanSearch size={18} />
                      </div>
                      <div>
                        <p className="eyebrow">Confidence check</p>
                        <h4 className="text-xl font-semibold text-slate-900">
                          Mark the rep honestly
                        </h4>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setRecallRevealed((current) => !current)}
                      className="mt-6 inline-flex items-center gap-2 rounded-full border border-[rgba(31,109,112,0.16)] bg-white px-4 py-3 text-sm font-semibold text-[var(--ink-strong)]"
                    >
                      {recallRevealed ? <EyeOff size={16} /> : <Eye size={16} />}
                      {recallRevealed ? "Hide answer" : "Reveal answer"}
                    </button>

                    <div className="mt-6 grid gap-3">
                      <button
                        type="button"
                        onClick={() => markRecall("known")}
                        disabled={!recallRevealed}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,_rgba(31,109,112,0.95),_rgba(18,81,99,0.95))] px-4 py-3 text-sm font-semibold text-white shadow-soft disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Check size={16} />
                        I knew it
                      </button>
                      <button
                        type="button"
                        onClick={() => markRecall("missed")}
                        disabled={!recallRevealed}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(148,163,184,0.22)] bg-white px-4 py-3 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <X size={16} />
                        I missed it
                      </button>
                    </div>

                    <div className="mt-6 rounded-[24px] bg-white/84 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Current saved status
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">
                        {progress.recall?.[recallCard.id] === "known"
                          ? "Saved as knew it"
                          : progress.recall?.[recallCard.id] === "missed"
                            ? "Saved as missed it"
                            : "No rating yet"}
                      </p>
                    </div>
                  </article>
                </div>
              ) : (
                <div className="mt-6 rounded-[28px] bg-[rgba(248,251,252,0.96)] p-5">
                  <h4 className="text-lg font-semibold text-slate-900">
                    No recall cards in this filter yet
                  </h4>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Clear the view filter or switch bones to refill the deck.
                  </p>
                </div>
              )}
            </section>
          ) : null}
        </div>
      </section>
    </div>
  )
}


