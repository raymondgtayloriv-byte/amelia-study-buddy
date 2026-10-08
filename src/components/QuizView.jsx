import { useState } from "react"
import { ArrowRight, CheckCircle2, RotateCcw, XCircle } from "lucide-react"
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
    quizId === "mixed" ? MIXED_QUESTION_COUNT : CHAPTER_QUESTION_COUNT

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
  const [selectedQuizId, setSelectedQuizId] = useState("mixed")
  const [session, setSession] = useState(() =>
    buildQuizSession("mixed", quizQuestionBank),
  )

  const availableQuizzes = [
    {
      id: "mixed",
      label: "Mixed review",
      helper: "Fresh random mix across the currently ready chapters",
      poolCount: quizQuestionBank.length,
      runCount: getQuizRunSize("mixed", quizQuestionBank.length),
    },
    ...chapters.map((chapter) => ({
      id: chapter.id,
      label: `Chapter ${chapter.number}`,
      helper: chapter.title,
      poolCount: quizQuestionBank.filter((question) => question.chapterId === chapter.id)
        .length,
      runCount: getQuizRunSize(
        chapter.id,
        quizQuestionBank.filter((question) => question.chapterId === chapter.id).length,
      ),
    })),
  ]

  const activeQuestion = session.questions[session.currentIndex]
  const bestScore = quizHistory[selectedQuizId]?.bestPercent ?? 0

  const startQuiz = (quizId) => {
    const questionPool =
      quizId === "mixed"
        ? quizQuestionBank
        : quizQuestionBank.filter((question) => question.chapterId === quizId)

    setSelectedQuizId(quizId)
    setSession(buildQuizSession(quizId, questionPool))
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
            <p className="eyebrow">Quiz mode</p>
            <h2 className="font-display text-3xl font-semibold text-slate-900">
              Practice with immediate feedback
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              Choose a chapter quiz or run a mixed review. Each attempt now
              pulls a fresh random set from the available pool so repeat runs
              feel less repetitive.
            </p>
          </div>
          <div className="rounded-[24px] bg-[linear-gradient(135deg,_rgba(236,250,248,0.96),_rgba(232,244,255,0.88))] px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Best score
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {bestScore}% on{" "}
              {availableQuizzes.find((quiz) => quiz.id === selectedQuizId)?.label}
            </p>
          </div>
        </div>
        <div className="mt-5 inline-flex items-center rounded-full bg-[rgba(31,109,112,0.08)] p-1">
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
          <div className="mt-4 space-y-3">
            {availableQuizzes.map((quiz) => {
              const active = quiz.id === selectedQuizId

              return (
                <button
                  key={quiz.id}
                  type="button"
                  onClick={() => startQuiz(quiz.id)}
                  className={`w-full rounded-[24px] border p-4 text-left transition ${
                    active
                      ? "border-transparent bg-[linear-gradient(135deg,_rgba(31,109,112,0.96),_rgba(18,81,99,0.96))] text-white shadow-soft"
                      : "border-white/70 bg-white/85 text-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold">{quiz.label}</span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        active ? "bg-white/16 text-white" : "bg-white text-slate-600"
                      }`}
                    >
                      {quiz.poolCount} in pool
                    </span>
                  </div>
                  <p
                    className={`mt-2 text-sm leading-6 ${
                      active ? "text-white/78" : "text-slate-600"
                    }`}
                  >
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
                  <p className="mt-2 text-sm text-slate-500">
                    This run pulled {session.questions.length} question
                    {session.questions.length === 1 ? "" : "s"} from a{" "}
                    {session.poolSize}-question pool.
                  </p>
                </div>
                <div className="rounded-2xl bg-[rgba(31,109,112,0.08)] px-3 py-2 text-sm font-semibold text-[var(--ink-strong)]">
                  {activeQuestion.type === "true-false"
                    ? "True / False"
                    : "Multiple choice"}
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {activeQuestion.options.map((option) => {
                  const isSelected = session.selectedAnswer === option
                  const isCorrect = session.answered && option === activeQuestion.correctAnswer
                  const isIncorrect =
                    session.answered && isSelected && option !== activeQuestion.correctAnswer

                  return (
                    <button
                      key={option}
                      type="button"
                      disabled={session.answered}
                      onClick={() => selectAnswer(option)}
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

              {session.answered ? (
                <div className="mt-6 rounded-[28px] bg-[rgba(248,251,252,0.96)] p-5">
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
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,_rgba(31,109,112,0.95),_rgba(18,81,99,0.95))] px-4 py-3 text-sm font-semibold text-white shadow-soft"
                  >
                    {session.currentIndex === session.questions.length - 1
                      ? "See results"
                      : "Next question"}
                    <ArrowRight size={16} />
                  </button>
                </div>
              ) : null}
            </>
          ) : (
            <div className="rounded-[30px] bg-[linear-gradient(135deg,_rgba(31,109,112,0.95),_rgba(18,81,99,0.96))] px-6 py-7 text-white shadow-soft">
              <p className="eyebrow !text-white/68">Quiz complete</p>
              <h3 className="mt-2 text-3xl font-semibold">
                {Math.round((session.score / session.questions.length) * 100)}%
              </h3>
              <p className="mt-3 text-sm leading-7 text-white/80 sm:text-base">
                You answered {session.score} out of {session.questions.length} correctly.
                Review the explanations, then retry to strengthen recall.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[24px] bg-white/12 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/68">
                    Last run
                  </p>
                  <p className="mt-2 text-xl font-semibold text-white">
                    {Math.round((session.score / session.questions.length) * 100)}%
                  </p>
                </div>
                <div className="rounded-[24px] bg-white/12 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/68">
                    Best saved
                  </p>
                  <p className="mt-2 text-xl font-semibold text-white">
                    {quizHistory[selectedQuizId]?.bestPercent ?? 0}%
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={restartCurrentQuiz}
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white"
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
