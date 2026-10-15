import { ArrowRight, BookOpen, Brain, Layers3, ScanLine } from "lucide-react"

export function StudyDesk({ chapters, allChapters = [], metrics, studyState, onNavigate, onSelectChapter }) {
  const next = chapters.find((chapter) => !studyState.chapterProgress[chapter.id]?.completed) ?? chapters[0]
  const attempts = Object.values(studyState.practiceProgress ?? {})
  const misses = attempts.flatMap((attempt) => attempt.misses ?? [])
  const previewChapters = allChapters.filter((ch) => ch.isPreviewPack)

  const routes = [
    {
      title: "3D Human Atlas",
      description: "Full-screen 2,234-piece body explorer with visual Find It & Name It drills.",
      icon: ScanLine,
      route: "human-body",
      number: "01",
      accent: "coral",
    },
    {
      title: "Practice Arcade",
      description: "Active recall tiers, matching boards, and instant question feedback.",
      icon: Brain,
      route: "practice",
      number: "02",
      accent: "teal",
    },
    {
      title: "Course Library (Ch. 1–15)",
      description: "8 course units + 7 preview packs with click-to-reveal terms and self-checks.",
      icon: BookOpen,
      route: "chapters",
      number: "03",
      accent: "gold",
    },
  ]

  return (
    <div className="space-y-5">
      <section className="desk-welcome panel">
        <div>
          <p className="eyebrow">A little curiosity goes a long way</p>
          <h2>
            Learn the body.
            <br />
            <em>Build the picture.</em>
          </h2>
          <p>
            Start in the 3D studio, test yourself in the arcade, or jump straight into any of the 15 chapters.
          </p>
          <div className="flex flex-wrap gap-2">
            <button className="action" onClick={() => onNavigate("human-body")}>
              Enter 3D studio <ArrowRight size={17} />
            </button>
            <button className="action action-secondary" onClick={() => onNavigate("bones")}>
              Ch. 7 Bone Landmarks Lab
            </button>
          </div>
        </div>
        <div className="desk-session">
          <span className="eyebrow">YOUR NEXT COURSE CHAPTER</span>
          <span className="chapter-number">{String(next?.number ?? 1).padStart(2, "0")}</span>
          <h3>{next?.title}</h3>
          <button
            className="action action-secondary"
            onClick={() => {
              onSelectChapter(next.id)
              onNavigate("chapters")
            }}
          >
            Open chapter <ArrowRight size={16} />
          </button>
        </div>
      </section>

      <div className="desk-stats">
        <div>
          <strong>
            {metrics.completedReadyChapters}
            <small> / {metrics.totalReadyChapters}</small>
          </strong>
          <span>Course chapters reviewed</span>
        </div>
        <div>
          <strong>{metrics.knownFlashcards}</strong>
          <span>Course cards marked known</span>
        </div>
        <div>
          <strong>{attempts.reduce((sum, attempt) => sum + (attempt.attempts ?? 0), 0)}</strong>
          <span>Practice rounds completed</span>
        </div>
        <div>
          <strong>{studyState.atlasNotebook?.bookmarks?.length ?? 0}</strong>
          <span>3D structures saved</span>
        </div>
      </div>

      <section className="study-path">
        {routes.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.route}
              className={`path-step ${item.accent}`}
              onClick={() => onNavigate(item.route)}
            >
              <div className="path-step-top">
                <span>{item.number} /</span>
                <Icon size={25} />
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <ArrowRight size={20} />
            </button>
          )
        })}
      </section>

      <div className="grid gap-5 md:grid-cols-2">
        <section className="panel p-6">
          <p className="eyebrow">Back to the tricky bits</p>
          <h3 className="mt-2 text-xl font-semibold">
            {misses.length
              ? `${new Set(misses.map((item) => item.questionId)).size} questions to revisit`
              : "Your review list starts here"}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {misses.length
              ? misses[0].prompt
              : "Missed questions in Practice Arcade or Bone Landmarks automatically collect for targeted retry."}
          </p>
          <button
            className="action action-secondary mt-4"
            onClick={() => onNavigate("practice")}
          >
            Open practice <Brain size={16} />
          </button>
        </section>

        <section className="panel p-6">
          <p className="eyebrow">All 15 chapters active</p>
          <h3 className="mt-2 text-xl font-semibold">
            8 Course Units + {previewChapters.length} Standard A&P Previews
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Chapters 5 and 10–15 include full Marieb A&P preview summaries, vocabulary, flashcards, and quizzes now — ready to swap with Amelia’s class slides anytime.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              className="action action-secondary"
              onClick={() => {
                onSelectChapter("chapter-5")
                onNavigate("chapters")
              }}
            >
              Preview Ch. 5 (Integumentary)
            </button>
            <button
              className="action action-secondary"
              onClick={() => onNavigate("flashcards")}
            >
              Browse all cards <Layers3 size={16} />
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
