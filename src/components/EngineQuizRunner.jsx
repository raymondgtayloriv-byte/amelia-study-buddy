import { useMemo, useState } from "react"
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Hand,
  Lightbulb,
  MousePointerClick,
  PencilLine,
  RotateCcw,
  Shuffle,
  XCircle,
} from "lucide-react"
import { AtlasBonePractice } from "./AtlasBonePractice"
import { allPacks, getAllSystems } from "../data/packs/index"
import { SUPPORTED_COURSE_BONE_IDS } from "../lib/courseAtlas"
import {
  QUIZ_MODES,
  answerQuestion,
  boneSelectionMatchesTarget,
  buildSession,
  summarizeSession,
} from "../quiz/engine"

const DEFAULT_COUNT = 8

function siblingDrillsFor(pack) {
  return [
    ...(pack.terms ?? []).map((term) => ({
      acceptedTerms: [term.term, ...(term.aliases ?? [])],
      label: term.term,
    })),
    ...(pack.quiz ?? []).map((item) => ({
      acceptedTerms: [item.correctAnswer],
      label: item.correctAnswer,
    })),
  ]
}

function ChoiceQuestion({ question, answered, selected, feedback, onSelect }) {
  return (
    <div className="mt-6 space-y-3">
      {question.options.map((option) => {
        const isSelected = selected === option
        const isCorrect = answered && option === question.grading.correctAnswer
        const isIncorrect = answered && isSelected && !isCorrect

        return (
          <button
            key={option}
            type="button"
            disabled={answered}
            onClick={() => onSelect(option)}
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
      {answered ? null : (
        <p className="text-xs text-slate-500">
          {feedback ? "" : "Pick an answer to lock it in."}
        </p>
      )}
    </div>
  )
}

function TypedQuestion({ answered, input, feedback, onChange, onSubmit, spellCheck }) {
  return (
    <form noValidate
      className="mt-6 space-y-3"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <input
        type="text"
        aria-label="Your course answer"
        value={input}
        disabled={answered}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Type your answer…"
        autoComplete="off"
        className="w-full rounded-[24px] border border-white/70 bg-white/90 px-4 py-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-[rgba(31,109,112,0.4)] focus:outline-none"
      />
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={answered || !input.trim()}
          className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,_rgba(31,109,112,0.95),_rgba(18,81,99,0.95))] px-4 py-3 text-sm font-semibold text-white shadow-soft disabled:cursor-not-allowed disabled:opacity-60"
        >
          <PencilLine size={16} />
          Check answer
        </button>
        <span className="text-xs text-slate-500">
          Spell-check {spellCheck ? "on — near misses are flagged, not punished as wrong" : "off — strict grading"}.
        </span>
      </div>
      {answered && feedback ? (
        <p className="text-xs text-slate-500">{feedback.message}</p>
      ) : null}
    </form>
  )
}

function MatchQuestion({ question, answered, mapping, feedback, onPair }) {
  const [activeLeft, setActiveLeft] = useState(null)
  const pairById = useMemo(
    () => Object.fromEntries(question.pairs.map((pair) => [pair.id, pair])),
    [question],
  )
  const allPaired = question.leftOrder.every((id) => mapping[id])

  const chooseLeft = (id) => {
    if (answered || mapping[id]) return
    setActiveLeft(id)
  }

  const chooseRight = (id) => {
    if (answered || !activeLeft) return
    onPair(activeLeft, id)
    setActiveLeft(null)
  }

  const pairState = (leftId) => {
    if (!answered || !feedback) return null
    const rightId = mapping[leftId]
    return feedback.correctPairs?.includes(leftId)
      ? "correct"
      : rightId
        ? "incorrect"
        : "unpaired"
  }

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Cues
        </p>
        {question.leftOrder.map((id) => {
          const state = pairState(id)
          return (
            <button
              key={id}
              type="button"
              disabled={answered || Boolean(mapping[id])}
              onClick={() => chooseLeft(id)}
              className={`w-full rounded-[20px] border px-4 py-3 text-left text-sm font-medium transition ${
                state === "correct"
                  ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                  : state === "incorrect"
                    ? "border-rose-300 bg-rose-50 text-rose-900"
                    : activeLeft === id
                      ? "border-[rgba(31,109,112,0.4)] bg-[rgba(236,250,248,0.96)] text-slate-900"
                      : "border-white/70 bg-white/90 text-slate-800"
              }`}
            >
              {pairById[id].left}
              {mapping[id] ? (
                <span className="mt-1 block text-xs text-slate-500">matched</span>
              ) : null}
            </button>
          )
        })}
      </div>
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Statements
        </p>
        {question.rightOrder.map((id) => (
          <button
            key={id}
            type="button"
            disabled={answered || !activeLeft}
            onClick={() => chooseRight(id)}
            className="w-full rounded-[20px] border border-white/70 bg-white/90 px-4 py-3 text-left text-sm leading-6 text-slate-800 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pairById[id].right}
          </button>
        ))}
      </div>
      <p className="text-xs text-slate-500 sm:col-span-2">
        {answered
          ? feedback.message
          : "Tap a cue, then tap the statement that pairs with it."}
        {answered || !allPaired ? null : " All paired — submit to grade."}
      </p>
    </div>
  )
}

function BoneQuestion({ question, answered, onBoneSelect }) {
  return (
    <div className="mt-6 space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <MousePointerClick size={16} />
        {answered
          ? "Selection locked in."
          : "Find and click the named bone in the Human Atlas below."}
      </div>
      <div className="overflow-hidden rounded-[24px] border border-white/70">
        <AtlasBonePractice question={question} answered={answered} onBoneSelect={onBoneSelect} />
      </div>
    </div>
  )
}

export function EngineQuizRunner({ onSaveEngineResult }) {
  const systems = useMemo(() => getAllSystems(), [])
  const [packId, setPackId] = useState("pack-bones-ch7")
  const [modeId, setModeId] = useState("multiple-choice")
  const [studyMode, setStudyMode] = useState("study")
  const [spellCheck, setSpellCheck] = useState(true)
  const [session, setSession] = useState(null)
  const [selected, setSelected] = useState("")
  const [typedInput, setTypedInput] = useState("")
  const [matchMapping, setMatchMapping] = useState({})
  const [feedback, setFeedback] = useState(null)
  const [hintCount, setHintCount] = useState(0)
  const [showInfo, setShowInfo] = useState(false)

  const resetSession = () => {
    setSession(null)
    setSelected("")
    setTypedInput("")
    setMatchMapping({})
    setFeedback(null)
    setHintCount(0)
    setShowInfo(false)
  }

  const selectPack = (nextPackId) => {
    if (nextPackId === packId) return
    setPackId(nextPackId)
    resetSession()
  }

  const selectMode = (nextModeId) => {
    if (nextModeId === modeId) return
    setModeId(nextModeId)
    resetSession()
  }

  const selectStudyMode = (nextStudyMode) => {
    if (nextStudyMode === studyMode) return
    setStudyMode(nextStudyMode)
    resetSession()
  }

  const pack = useMemo(
    () => allPacks.find((candidate) => candidate.id === packId) ?? allPacks[0],
    [packId],
  )
  const mode = QUIZ_MODES.find((candidate) => candidate.id === modeId)
  const siblings = useMemo(() => siblingDrillsFor(pack), [pack])
  const canStartClickBone = (pack.bones ?? []).some((bone) =>
    SUPPORTED_COURSE_BONE_IDS.includes(bone.boneId),
  )

  const displayIndex = session && !session.completed
    ? Math.max(0, session.currentIndex - Number(Boolean(feedback)))
    : session?.currentIndex ?? 0
  const activeQuestion = session && !session.completed
    ? session.questions[displayIndex]
    : null

  const startSession = () => {
    const next = buildSession(
      pack,
      modeId,
      {
        count: DEFAULT_COUNT,
        studyMode,
        spellCheck,
      },
      { allPacks, allSystems: systems },
    )

    setSession(next)
    setSelected("")
    setTypedInput("")
    setMatchMapping({})
    setFeedback(null)
    setHintCount(0)
    setShowInfo(false)
  }

  const submitResponse = (response) => {
    if (!activeQuestion || feedback) return

    const { session: next, feedback: result } = answerQuestion(
      session,
      activeQuestion.id,
      response,
      siblings,
    )

    setSession(next)
    setFeedback(result)

    if (next.completed) {
      const summary = summarizeSession(next)
      onSaveEngineResult?.({
        sessionKey: `engine-${modeId}-${pack.id}`,
        scopeLabel: `${mode.label} • ${pack.title}`,
        mode: modeId,
        summary,
      })
    }
  }

  const goToNext = () => {
    setSelected("")
    setTypedInput("")
    setMatchMapping({})
    setFeedback(null)
    setHintCount(0)
    setShowInfo(false)
  }

  const handleBoneSelect = (selection) => {
    if (!activeQuestion || feedback || !selection) return
    if (!boneSelectionMatchesTarget(selection, activeQuestion)) {
      // Still grade the attempt — a miss is real signal for weak spots.
    }
    submitResponse({ boneId: selection.boneId ?? selection.displayName ?? "" })
  }

  const summary = session?.completed ? summarizeSession(session) : null

  return (
    <div className="space-y-4">
      <section className="panel px-5 py-6 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="eyebrow">Course pack practice</p>
            <h3 className="text-2xl font-semibold text-slate-900">
              Choose how to practice
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Practice saved course terms, cards, and questions in six ways.
              Start with study cues, then try without them. Hints help when you
              get stuck, and missed answers build your review list.
            </p>
          </div>
          <button
            type="button"
            onClick={startSession}
            disabled={modeId === "click-the-bone" && !canStartClickBone}
            className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,_rgba(31,109,112,0.95),_rgba(18,81,99,0.95))] px-4 py-3 text-sm font-semibold text-white shadow-soft"
          >
            <Shuffle size={16} />
            {session && !session.completed ? "Restart session" : "Start session"}
          </button>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Content pack
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {allPacks.map((candidate) => (
                <button
                  key={candidate.id}
                  type="button"
                  onClick={() => selectPack(candidate.id)}
                  className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                    candidate.id === packId
                      ? "border-transparent bg-[var(--ink-strong)] text-white"
                      : "border-white/70 bg-white/85 text-slate-700"
                  }`}
                >
                  {candidate.title}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Quiz mode
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {QUIZ_MODES.map((candidate) => (
                <button
                  key={candidate.id}
                  type="button"
                  onClick={() => selectMode(candidate.id)}
                  title={candidate.helper}
                  className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                    candidate.id === modeId
                      ? "border-transparent bg-[var(--ink-strong)] text-white"
                      : "border-white/70 bg-white/85 text-slate-700"
                  }`}
                >
                  {candidate.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center rounded-full bg-[rgba(31,109,112,0.08)] p-1">
            {[
              { id: "study", label: "Study (cues shown)" },
              { id: "blind", label: "Blind (no cues)" },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => selectStudyMode(option.id)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  studyMode === option.id
                    ? "bg-[var(--ink-strong)] text-white shadow-soft"
                    : "text-slate-600"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              setSpellCheck((current) => !current)
              resetSession()
            }}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition ${
              spellCheck
                ? "border-transparent bg-[rgba(31,109,112,0.12)] text-[var(--ink-strong)]"
                : "border-white/70 bg-white/85 text-slate-600"
            }`}
            title="Fuzzy spell tolerance for typed answers (≤2 edits or ≤20% of length counts as a near miss, not a wild miss)"
          >
            {spellCheck ? <Eye size={14} /> : <EyeOff size={14} />}
            Spell-check {spellCheck ? "on" : "off"}
          </button>
          {modeId === "click-the-bone" && !canStartClickBone ? (
            <span className="text-xs font-semibold text-amber-700">
              Choose the Chapter 7 bones pack to play this atlas activity.
            </span>
          ) : null}
        </div>
      </section>

      {session && !session.completed && activeQuestion ? (
        <section className="panel px-5 py-6 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="max-w-3xl">
              <p className="eyebrow">
                {mode.label} • Question {displayIndex + 1} of{" "}
                {session.questions.length}
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                {activeQuestion.prompt}
              </h3>
              {studyMode === "study" && activeQuestion.info ? (
                <button
                  type="button"
                  onClick={() => setShowInfo((current) => !current)}
                  className="mt-3 inline-flex items-center gap-2 rounded-full border border-[rgba(31,109,112,0.16)] bg-white px-3 py-2 text-xs font-semibold text-[var(--ink-strong)]"
                >
                  {showInfo ? <EyeOff size={14} /> : <Eye size={14} />}
                  {showInfo ? "Hide study cues" : "Show study cues"}
                </button>
              ) : null}
              {showInfo && activeQuestion.info ? (
                <div className="mt-3 rounded-[20px] bg-[rgba(236,250,248,0.96)] p-4 text-sm leading-7 text-slate-700">
                  {Object.entries(activeQuestion.info)
                    .filter(([, value]) => value)
                    .map(([key, value]) =>
                      typeof value === "string" ? (
                        <p key={key}>
                          <span className="font-semibold capitalize">{key}:</span> {value}
                        </p>
                      ) : null,
                    )}
                </div>
              ) : null}
              {activeQuestion.hintLevels.length > 0 && !feedback ? (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() =>
                      setHintCount((current) =>
                        Math.min(current + 1, activeQuestion.hintLevels.length),
                      )
                    }
                    disabled={hintCount >= activeQuestion.hintLevels.length}
                    className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/85 px-3 py-2 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Lightbulb size={14} />
                    {hintCount >= activeQuestion.hintLevels.length
                      ? "No more hints"
                      : `Hint ${hintCount + 1} of ${activeQuestion.hintLevels.length}`}
                  </button>
                  {hintCount > 0 ? (
                    <ul className="mt-2 space-y-1">
                      {activeQuestion.hintLevels.slice(0, hintCount).map((hint) => (
                        <li key={hint} className="text-sm text-slate-600">
                          • {hint}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ) : null}
            </div>
            <div className="rounded-2xl bg-[rgba(31,109,112,0.08)] px-3 py-2 text-sm font-semibold text-[var(--ink-strong)]">
              Score {session.score}/{session.questions.length}
            </div>
          </div>

          {activeQuestion.grading.kind === "choice" ? (
            <ChoiceQuestion
              question={activeQuestion}
              answered={Boolean(feedback)}
              selected={selected}
              feedback={feedback}
              onSelect={(option) => {
                setSelected(option)
                submitResponse({ selected: option })
              }}
            />
          ) : null}

          {activeQuestion.grading.kind === "typed" ? (
            <TypedQuestion
              answered={Boolean(feedback)}
              input={typedInput}
              feedback={feedback}
              spellCheck={spellCheck}
              onChange={setTypedInput}
              onSubmit={() => submitResponse({ input: typedInput })}
            />
          ) : null}

          {activeQuestion.grading.kind === "match" ? (
            <MatchQuestion
              key={activeQuestion.id}
              question={activeQuestion}
              answered={Boolean(feedback)}
              mapping={matchMapping}
              feedback={feedback}
              onPair={(leftId, rightId) => {
                const nextMapping = { ...matchMapping, [leftId]: rightId }
                setMatchMapping(nextMapping)

                if (activeQuestion.leftOrder.every((id) => nextMapping[id])) {
                  submitResponse({ mapping: nextMapping })
                }
              }}
            />
          ) : null}

          {activeQuestion.grading.kind === "bone" ? (
            <BoneQuestion
              question={activeQuestion}
              answered={Boolean(feedback)}
              onBoneSelect={handleBoneSelect}
            />
          ) : null}

          {feedback ? (
            <div className="mt-6 rounded-[28px] bg-[rgba(248,251,252,0.96)] p-5">
              <div className="flex items-center gap-3">
                {feedback.correct ? (
                  <CheckCircle2 className="text-emerald-600" size={20} />
                ) : feedback.close ? (
                  <Hand className="text-amber-500" size={20} />
                ) : (
                  <XCircle className="text-rose-500" size={20} />
                )}
                <p className="text-sm font-semibold text-slate-900">
                  {feedback.correct
                    ? "Correct"
                    : feedback.close
                      ? "Close — spelling is off"
                      : `Answer: ${activeQuestion.reveal.answer}`}
                </p>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {feedback.message}
              </p>
              {activeQuestion.reveal.detail ? (
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {activeQuestion.reveal.detail}
                </p>
              ) : null}
              <button
                type="button"
                onClick={goToNext}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,_rgba(31,109,112,0.95),_rgba(18,81,99,0.95))] px-4 py-3 text-sm font-semibold text-white shadow-soft"
              >
                {displayIndex === session.questions.length - 1
                  ? "See results"
                  : "Next question"}
                <ArrowRight size={16} />
              </button>
            </div>
          ) : null}
        </section>
      ) : null}

      {summary ? (
        <section className="rounded-[30px] bg-[linear-gradient(135deg,_rgba(31,109,112,0.95),_rgba(18,81,99,0.96))] px-6 py-7 text-white shadow-soft">
          <p className="eyebrow !text-white/68">Session complete • {mode.label}</p>
          <h3 className="mt-2 text-3xl font-semibold">{summary.percent}%</h3>
          <p className="mt-3 text-sm leading-7 text-white/80 sm:text-base">
            {summary.correct} of {summary.total} correct
            {summary.close ? ` • ${summary.close} near-miss${summary.close === 1 ? "" : "es"} on spelling` : ""}.
            Misses were saved to your weak spots.
          </p>
          <button
            type="button"
            onClick={startSession}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white"
          >
            <RotateCcw size={16} />
            Run it again
          </button>
        </section>
      ) : null}

      {!session ? (
        <section className="panel px-5 py-6 sm:px-6">
          <p className="text-sm leading-7 text-slate-600">
            Pick a pack and a mode above, then start a session. Your best and
            latest scores save under the same study-hub storage, and every miss
            lands in weak spots for review.
          </p>
        </section>
      ) : null}
    </div>
  )
}
