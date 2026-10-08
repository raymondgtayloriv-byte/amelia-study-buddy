import {
  ArrowRight,
  Bone,
  BookCopy,
  Brain,
  CalendarClock,
  Crosshair,
  FolderSync,
  Layers3,
  ListChecks,
  ScanSearch,
  ShieldCheck,
} from "lucide-react"

const quickActions = [
  {
    id: "bones",
    label: "Bones Lab",
    description: "Study broad Chapter 7 skeletal landmarks with picture-backed drills.",
    icon: Bone,
    accent: "from-emerald-500/20 to-sky-500/10",
  },
  {
    id: "chapters",
    label: "Chapters",
    description: "Read the ready chapter summaries, concepts, and review prompts.",
    icon: BookCopy,
    accent: "from-sky-500/20 to-cyan-500/10",
  },
  {
    id: "flashcards",
    label: "Flashcards",
    description: "Flip through course-linked review cards across the live chapters.",
    icon: Layers3,
    accent: "from-emerald-500/20 to-teal-500/10",
  },
  {
    id: "quiz",
    label: "Quiz Mode",
    description: "Run a mixed quiz or focus on one completed chapter.",
    icon: Brain,
    accent: "from-blue-500/20 to-indigo-500/10",
  },
  {
    id: "atlas",
    label: "Atlas / Lab",
    description: "Practice starter histology and anatomy identification.",
    icon: ScanSearch,
    accent: "from-cyan-500/20 to-teal-500/10",
  },
]

const progressCards = [
  {
    key: "chapterCompletionPercent",
    label: "Chapter progress",
    helper: "Completed chapter confidence check-ins",
  },
  {
    key: "flashcardCompletionPercent",
    label: "Flashcard mastery",
    helper: "Cards marked known across the starter bank",
  },
  {
    key: "averageQuizScore",
    label: "Quiz readiness",
    helper: "Best recorded scores from practice runs",
  },
]

const confidenceLabels = {
  "needs-review": "Needs review",
  steady: "Steady",
  ready: "Exam ready",
}

export function DashboardView({
  anatomyProgress,
  bonesModule,
  chapterProgress,
  continueStudyTarget,
  courseSyncAssets,
  metrics,
  onNavigate,
  onSelectChapter,
  placeholderExams,
  readyChapters,
}) {
  const structureById = Object.fromEntries(
    (bonesModule?.structures ?? []).map((structure) => [structure.id, structure]),
  )
  const weakSpotEntries = Object.entries(anatomyProgress?.weakSpots ?? {})
    .filter(([, spot]) => (spot?.misses ?? 0) > 0)
    .sort((a, b) => b[1].misses - a[1].misses)
    .slice(0, 5)
  return (
    <div className="space-y-4">
      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.95fr]">
        <div className="panel relative overflow-hidden px-5 py-6 sm:px-6 lg:px-7 lg:py-7">
          <div className="absolute -right-16 top-0 h-56 w-56 rounded-full bg-[radial-gradient(circle,_rgba(61,184,174,0.25),_transparent_68%)]" />
          <div className="absolute left-0 top-12 h-40 w-40 rounded-full bg-[radial-gradient(circle,_rgba(79,139,245,0.18),_transparent_68%)]" />
          <div className="relative">
            <p className="eyebrow">Personalized study companion</p>
            <h2 className="font-display text-3xl leading-tight text-slate-900 sm:text-[2.55rem]">
              Built to feel useful now, and easy to sync later.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              This Version 1 prototype already supports chapter review, atlas
              drills, flashcards, quiz practice, and cram prep while keeping
              real syllabus dates and instructor materials ready to plug in.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  onSelectChapter(continueStudyTarget.id)
                  onNavigate("chapters")
                }}
                className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,_rgba(31,109,112,0.95),_rgba(18,81,99,0.95))] px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5"
              >
                Continue studying {continueStudyTarget.number}
                <ArrowRight size={16} />
              </button>
              <button
                type="button"
                onClick={() => onNavigate("sync")}
                className="inline-flex items-center gap-2 rounded-full border border-[rgba(31,109,112,0.16)] bg-white/85 px-5 py-3 text-sm font-semibold text-[var(--ink-strong)] transition hover:border-[rgba(31,109,112,0.28)]"
              >
                Open course sync
                <FolderSync size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="panel px-5 py-6 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Continue studying</p>
              <h3 className="text-xl font-semibold text-slate-900">
                Chapter {continueStudyTarget.number}: {continueStudyTarget.title}
              </h3>
            </div>
            <div className="rounded-2xl bg-[rgba(31,109,112,0.08)] px-3 py-2 text-sm font-semibold text-[var(--ink-strong)]">
              {metrics.overallProgress}% ready
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {continueStudyTarget.summary}
          </p>
          <div className="mt-5 space-y-3">
            <div className="rounded-[22px] bg-[rgba(242,248,251,0.9)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Focus next
              </p>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-800">
                Review {continueStudyTarget.mustKnow[0]} and then run the linked
                quiz bank for instant feedback.
              </p>
            </div>
            <div className="rounded-[22px] bg-[rgba(236,249,244,0.86)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Confidence tip
              </p>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-800">
                Use the chapter confidence toggle after you can explain the
                topic in plain language without looking at notes.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {progressCards.map((card) => (
          <article key={card.key} className="panel px-5 py-5 sm:px-6">
            <p className="eyebrow">{card.label}</p>
            <div className="mt-3 flex items-end justify-between gap-4">
              <div>
                <p className="text-3xl font-semibold text-slate-900">
                  {metrics[card.key]}%
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {card.helper}
                </p>
              </div>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[rgba(148,163,184,0.18)]">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,_#1f6d70,_#4aa4a0)]"
                style={{ width: `${metrics[card.key]}%` }}
              />
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="panel px-5 py-6 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Study focus</p>
              <h3 className="text-xl font-semibold text-slate-900">
                Weak spots to review next
              </h3>
            </div>
            <Crosshair className="text-[var(--ink-strong)]" size={20} />
          </div>
          {weakSpotEntries.length ? (
            <ul className="mt-5 space-y-2">
              {weakSpotEntries.map(([structureId, spot]) => {
                const structure = structureById[structureId]
                const label = structure?.term ?? structureId

                return (
                  <li
                    key={structureId}
                    className="flex items-center justify-between gap-3 rounded-[20px] bg-[rgba(248,251,252,0.95)] px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {label}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {structure ? `${structure.boneLabel} • ${structure.regionLabel}` : "Missed in Bones Lab drills"}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-[rgba(31,109,112,0.08)] px-3 py-1 text-xs font-semibold text-[var(--ink-strong)]">
                      {spot.misses} {spot.misses === 1 ? "miss" : "misses"}
                    </span>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="mt-5 rounded-[24px] bg-[rgba(248,251,252,0.92)] p-5">
              <p className="text-sm font-semibold text-slate-900">
                No weak spots tracked yet
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Misses from Bones Lab quizzes, typed recall, and quiz mode
                land here automatically, ranked by how often they trip you up.
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={() => onNavigate("bones")}
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--ink-strong)]"
          >
            Open Bones Lab
            <ArrowRight size={15} />
          </button>
        </div>

        <div className="panel px-5 py-6 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Chapter status</p>
              <h3 className="text-xl font-semibold text-slate-900">
                Ready chapters
              </h3>
            </div>
            <ListChecks className="text-[var(--ink-strong)]" size={20} />
          </div>
          <ul className="mt-5 space-y-2">
            {(readyChapters ?? []).map((chapter) => {
              const state = chapterProgress?.[chapter.id] ?? {}
              const status = state.completed
                ? { label: "Complete", classes: "bg-[rgba(16,185,129,0.12)] text-emerald-700" }
                : state.confidence
                  ? { label: confidenceLabels[state.confidence] ?? state.confidence, classes: "bg-[rgba(79,139,245,0.1)] text-sky-800" }
                  : { label: "Not started", classes: "bg-[rgba(148,163,184,0.14)] text-slate-500" }

              return (
                <li key={chapter.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectChapter(chapter.id)
                      onNavigate("chapters")
                    }}
                    className="flex w-full items-center justify-between gap-3 rounded-[20px] border border-white/70 bg-white/85 px-4 py-3 text-left transition hover:-translate-y-0.5"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Chapter {chapter.number}
                      </p>
                      <p className="mt-1 truncate text-sm font-semibold text-slate-900">
                        {chapter.title}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${status.classes}`}
                    >
                      {status.label}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="panel px-5 py-6 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Quick links</p>
              <h3 className="text-xl font-semibold text-slate-900">
                Jump into a study mode
              </h3>
            </div>
            <BookCopy className="text-[var(--ink-strong)]" size={20} />
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {quickActions.map((action) => {
              const Icon = action.icon

              return (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => onNavigate(action.id)}
                  className="group rounded-[24px] border border-white/70 bg-white/85 p-4 text-left transition hover:-translate-y-1 hover:shadow-soft"
                >
                  <div
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${action.accent} text-[var(--ink-strong)]`}
                  >
                    <Icon size={20} />
                  </div>
                  <h4 className="mt-4 text-base font-semibold text-slate-900">
                    {action.label}
                  </h4>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {action.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--ink-strong)]">
                    Open section
                    <ArrowRight
                      size={15}
                      className="transition group-hover:translate-x-0.5"
                    />
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="panel px-5 py-6 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="eyebrow">Exam placeholders</p>
                <h3 className="text-xl font-semibold text-slate-900">
                  Prep windows to personalize later
                </h3>
              </div>
              <CalendarClock className="text-[var(--ink-strong)]" size={20} />
            </div>
            <div className="mt-5 space-y-3">
              {placeholderExams.map((exam) => (
                <article
                  key={exam.id}
                  className="rounded-[24px] border border-[rgba(148,163,184,0.18)] bg-[rgba(248,251,252,0.95)] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-sm font-semibold text-slate-900">
                      {exam.title}
                    </h4>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                      {exam.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {exam.focus}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="panel px-5 py-6 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(16,185,129,0.12)] text-emerald-700">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="eyebrow">Build status</p>
                <h3 className="text-xl font-semibold text-slate-900">
                  Course sync pending, foundation ready
                </h3>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              The shell already supports chapter data, atlas drills, quizzes,
              progress tracking, and instructor-ready placeholders. The next
              step is layering in the real syllabus, exam dates, slides, and
              study guides when they are available.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {courseSyncAssets.slice(0, 4).map((asset) => (
                <div
                  key={asset.id}
                  className="rounded-[22px] bg-[rgba(238,250,246,0.95)] p-4"
                >
                  <p className="text-sm font-semibold text-slate-900">
                    {asset.label}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {asset.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
