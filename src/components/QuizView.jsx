import { useMemo, useState } from "react"
import { ArrowRight, CheckCircle2, Layers, RotateCcw, XCircle } from "lucide-react"
import { computeLetterGrade, sourceName } from "../lib/practice"
import { EngineQuizRunner } from "./EngineQuizRunner"

const MIXED_QUESTION_COUNT = 12
const CHAPTER_QUESTION_COUNT = 10

function shuffle(items) {
  const cloned = [...items]

  for (let index = cloned.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[cloned[index], cloned[randomIndex]] = [cloned[randomIndex], cloned[index]]
  }

  return cloned
}

function getQuizRunSize(quizId, questionCount) {
  const target =
    quizId === "mixed" || quizId.startsWith("multi-") ? MIXED_QUESTION_COUNT : CHAPTER_QUESTION_COUNT

  return Math.min(target, questionCount)
}

function buildQuizSession(quizId, questions) {
  const source = shuffle(questions).slice(0, getQuizRunSize(quizId, questions.length))

  return {
    quizId,
    poolSize: questions.length,
    questions: source,
    currentIndex: 0,
    answers: [],
    selectedAnswer: "",
    answered: false,
    score: 0,
    completed: false,
  }
}

export function QuizView({
  chapters,
  quizHistory,
  quizQuestionBank,
  onSaveQuizResult,
  onSaveEngineResult,
}) {
  const [quizTab, setQuizTab] = useState("classic")
  const [sourceFilter, setSourceFilter] = useState("course")
  const [selectedQuizId, setSelectedQuizId] = useState("mixed")
  const [customChapterIds, setCustomChapterIds] = useState([])
  const [multiPickerOpen, setMultiPickerOpen] = useState(false)

  const filteredBank = useMemo(
    () =>
      quizQuestionBank.filter((q) => {
        const itemSource = q.sourceType === "supplemental" ? "supplemental" : "course"
        return sourceFilter === "all" || itemSource === sourceFilter
      }),
    [quizQuestionBank, sourceFilter],
  )

  const [session, setSession] = useState(() =>
    buildQuizSession(
      "mixed",
      quizQuestionBank.filter((q) => q.sourceType !== "supplemental"),
    ),
  )

  const availableQuizzes = [
    {
      id: "mixed",
      label: "Mixed review (All in filter)",
      helper: "Fresh random mix across all chapters in the selected source filter",
      poolCount: filteredBank.length,
      runCount: getQuizRunSize("mixed", filteredBank.length),
    },
    ...chapters
      .filter((chapter) =>
        filteredBank.some((question) => question.chapterId === chapter.id),
      )
      .map((chapter) => {
        const count = filteredBank.filter(
          (question) => question.chapterId === chapter.id,
        ).length
        return {
          id: chapter.id,
          label: `Chapter ${chapter.number}${chapter.isPreviewPack ? " (Preview)" : ""}`,
          helper: chapter.title,
          poolCount: count,
          runCount: getQuizRunSize(chapter.id, count),
        }
      }),
  ]

  const activeQuestion = session.questions[session.currentIndex]
  const bestScore = quizHistory[selectedQuizId]?.bestPercent ?? 0

  const startQuiz = (quizId, nextSource = sourceFilter, overrideChapters = null) => {
    const bank = quizQuestionBank.filter((q) => {
      const itemSource = q.sourceType === "supplemental" ? "supplemental" : "course"
      return nextSource === "all" || itemSource === nextSource
    })
    const chIds = overrideChapters ?? customChapterIds
    const questionPool =
      quizId === "mixed"
        ? bank
        : quizId.startsWith("multi-")
          ? bank.filter((q) => chIds.includes(q.chapterId))
          : bank.filter((question) => question.chapterId === quizId)

    setSelectedQuizId(quizId)
    setSession(buildQuizSession(quizId, questionPool))
  }

  const toggleCustomChapter = (chapterId) => {
    const next = customChapterIds.includes(chapterId)
      ? customChapterIds.filter((id) => id !== chapterId)
      : [...customChapterIds, chapterId]
    setCustomChapterIds(next)
    if (next.length > 0) {
      const multiId = `multi-${next.length}ch`
      startQuiz(multiId, sourceFilter, next)
    }
  }

  const selectAnswer = (answer) => {
    if (session.answered) {
      return
    }

    const correct = answer === activeQuestion.correctAnswer

    setSession((current) => ({
      ...current,
      answered: true,
      selectedAnswer: answer,
      score: correct ? current.score + 1 : current.score,
      answers: [
        ...current.answers,
        {
          questionId: activeQuestion.id,
          selectedAnswer: answer,
          correctAnswer: activeQuestion.correctAnswer,
          correct,
        },
      ],
    }))
  }

  const goToNext = () => {
    const lastQuestion = session.currentIndex === session.questions.length - 1

    if (lastQuestion) {
      onSaveQuizResult({
        quizKey: session.quizId,
        chapterId: session.quizId === "mixed" ? "mixed" : session.quizId,
        correctCount: session.score,
        totalQuestions: session.questions.length,
      })

      setSession((current) => ({
        ...current,
        completed: true,
      }))

      return
    }

    setSession((current) => ({
      ...current,
      currentIndex: current.currentIndex + 1,
      selectedAnswer: "",
      answered: false,
    }))
  }

  const restartCurrentQuiz = () => {
    startQuiz(selectedQuizId)
  }

  return (
    <div className="space-y-4">
      <section className="panel px-5 py-6 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="eyebrow">Quiz & Test Mode</p>
            <h2 className="font-display text-3xl font-semibold text-slate-900">
              Single-chapter, multi-chapter, or full course tests
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Select a single chapter, combine multiple chapters, or run a mixed review across verbatim course material or supplemental packs.
            </p>
          </div>
          <div className="rounded-[24px] bg-teal-50 px-4 py-3.5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Best saved grade
            </p>
            <p className="mt-1.5 text-sm font-semibold text-slate-900">
              {bestScore}% ({computeLetterGrade(bestScore).letter}) on{" "}
              {availableQuizzes.find((quiz) => quiz.id === selectedQuizId)?.label ?? "Custom Multi-Chapter"}
            </p>
          </div>
        </div>

        {/* Material Source Filter + Multi-Chapter Picker */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-50 p-3.5">
          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Quiz material source">
            {[
              ["course", "Course Material Only (Book)"],
              ["supplemental", "Supplemental Only"],
              ["all", "Both (Clearly Labeled)"],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                aria-pressed={sourceFilter === id}
                onClick={() => {
                  setSourceFilter(id)
                  startQuiz("mixed", id)
                }}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  sourceFilter === id
                    ? "bg-[var(--ink-strong)] text-white"
                    : "border border-slate-200 bg-white text-slate-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setMultiPickerOpen((v) => !v)}
            className="action action-secondary text-xs"
          >
            <Layers size={14} />{" "}
            {customChapterIds.length > 0
              ? `Custom Test (${customChapterIds.length} Chapters)`
              : "Build Multi-Chapter Test"}
          </button>
        </div>

        {multiPickerOpen && (
          <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold text-slate-700">
              Select any 2, 4, or custom combination of chapters to generate a multi-chapter test:
            </p>
            <div className="mt-2.5 grid gap-2 sm:grid-cols-3 md:grid-cols-5">
              {chapters.map((ch) => {
                const picked = customChapterIds.includes(ch.id)
                return (
                  <button
                    key={ch.id}
                    type="button"
                    aria-pressed={picked}
                    onClick={() => toggleCustomChapter(ch.id)}
                    className={`rounded-xl border p-2.5 text-left text-xs transition ${
                      picked
                        ? "border-teal-700 bg-teal-50 font-semibold text-slate-900"
                        : "border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">Ch. {ch.number}</span>
                      <span className="text-[10px]">
                        {ch.sourceType === "supplemental" ? "Suppl." : "Course"}
                      </span>
                    </div>
                    <span className="mt-1 block truncate">{ch.title}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div className="mt-4 inline-flex items-center rounded-full bg-[rgba(31,109,112,0.08)] p-1">
          {[
            { id: "classic", label: "Classic banks" },
            { id: "engine", label: "Engine modes" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setQuizTab(tab.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                quizTab === tab.id
                  ? "bg-[var(--ink-strong)] text-white shadow-soft"
                  : "text-slate-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {quizTab === "engine" ? (
        <EngineQuizRunner onSaveEngineResult={onSaveEngineResult} />
      ) : null}

      {quizTab === "classic" ? (
        <section className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="panel px-4 py-4 sm:px-5">
            <h3 className="text-lg font-semibold text-slate-900">Quiz banks</h3>
            <div className="mt-4 space-y-2.5 max-h-[540px] overflow-y-auto pr-1">
              {availableQuizzes.map((quiz) => {
                const active = quiz.id === selectedQuizId

                return (
                  <button
                    key={quiz.id}
                    type="button"
                    onClick={() => startQuiz(quiz.id)}
                    className={`w-full rounded-[20px] border p-3.5 text-left transition ${
                      active
                        ? "border-teal-700 bg-teal-50 text-slate-900"
                        : "border-slate-200 bg-white text-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold">{quiz.label}</span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                        {quiz.poolCount} in pool
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs leading-5 text-slate-600">
                      {quiz.helper} • {quiz.runCount}-question run
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="panel px-5 py-6 sm:px-6">
            {!session.completed && activeQuestion ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="eyebrow">
                      Question {session.currentIndex + 1} of {session.questions.length}
                    </p>
                    <h3 className="text-2xl font-semibold text-slate-900">
                      {activeQuestion.prompt}
                    </h3>
                    <p className="mt-2 text-xs text-slate-500">
                      Pulled {session.questions.length} question
                      {session.questions.length === 1 ? "" : "s"} from a{" "}
                      {session.poolSize}-question pool.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`source-tag ${
                        activeQuestion.sourceType === "supplemental" ? "supplemental" : ""
                      }`}
                    >
                      {sourceName(activeQuestion)}
                    </span>
                    <div className="rounded-2xl bg-[rgba(31,109,112,0.08)] px-3 py-1.5 text-xs font-semibold text-[var(--ink-strong)]">
                      {activeQuestion.type === "true-false"
                        ? "True / False"
                        : "Multiple choice"}
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {activeQuestion.options.map((option) => {
                    const isSelected = session.selectedAnswer === option
                    const isCorrect =
                      session.answered && option === activeQuestion.correctAnswer
                    const isIncorrect =
                      session.answered &&
                      isSelected &&
                      option !== activeQuestion.correctAnswer

                    return (
                      <button
                        key={option}
                        type="button"
                        disabled={session.answered}
                        onClick={() => selectAnswer(option)}
                        className={`w-full rounded-[20px] border px-4 py-3.5 text-left transition ${
                          isCorrect
                            ? "border-emerald-300 bg-emerald-50 text-emerald-900 font-semibold"
                            : isIncorrect
                              ? "border-rose-300 bg-rose-50 text-rose-900"
                              : isSelected
                                ? "border-teal-600 bg-teal-50"
                                : "border-slate-200 bg-white text-slate-800 hover:border-teal-500"
                        }`}
                      >
                        <span className="text-sm font-medium leading-6">{option}</span>
                      </button>
                    )
                  })}
                </div>

                {session.answered ? (
                  <div className="mt-6 rounded-[24px] border border-slate-200/80 bg-slate-50 p-5">
                    <div className="flex items-center gap-3">
                      {session.selectedAnswer === activeQuestion.correctAnswer ? (
                        <CheckCircle2 className="text-emerald-600" size={20} />
                      ) : (
                        <XCircle className="text-rose-500" size={20} />
                      )}
                      <p className="text-sm font-semibold text-slate-900">
                        {session.selectedAnswer === activeQuestion.correctAnswer
                          ? "Correct"
                          : `Correct answer: ${activeQuestion.correctAnswer}`}
                      </p>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {activeQuestion.explanation}
                    </p>
                    <button
                      type="button"
                      onClick={goToNext}
                      className="action mt-5"
                    >
                      {session.currentIndex === session.questions.length - 1
                        ? "See results & grade"
                        : "Next question"}
                      <ArrowRight size={16} />
                    </button>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="rounded-[28px] border border-slate-200 bg-white p-6">
                <p className="eyebrow">Quiz complete</p>
                <div className="mt-2 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-2xl font-bold text-teal-900">
                    {
                      computeLetterGrade(
                        Math.round(
                          (session.score / Math.max(1, session.questions.length)) * 100,
                        ),
                      ).letter
                    }
                  </div>
                  <div>
                    <h3 className="text-3xl font-semibold text-slate-900">
                      {Math.round(
                        (session.score / Math.max(1, session.questions.length)) * 100,
                      )}
                      %
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      You answered {session.score} out of {session.questions.length} correctly.
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Last run
                    </p>
                    <p className="mt-1.5 text-xl font-semibold text-slate-900">
                      {Math.round(
                        (session.score / Math.max(1, session.questions.length)) * 100,
                      )}
                      %
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Best saved
                    </p>
                    <p className="mt-1.5 text-xl font-semibold text-slate-900">
                      {quizHistory[selectedQuizId]?.bestPercent ?? 0}%
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={restartCurrentQuiz}
                  className="action mt-5"
                >
                  <RotateCcw size={16} />
                  Retry quiz
                </button>
              </div>
            )}
          </div>
        </section>
      ) : null}
    </div>
  )
}
