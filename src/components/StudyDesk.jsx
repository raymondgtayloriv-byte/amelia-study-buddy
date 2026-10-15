import { ArrowRight, Award, BookOpen, Brain, Layers3, ScanLine, Target, Zap } from "lucide-react"
import { computeGradeSummary } from "../lib/practice"

export function StudyDesk({
  chapters,
  allChapters = [],
  metrics,
  studyState,
  onNavigate,
  onSelectChapter,
  onLaunchPracticeActivity,
}) {
  const next =
    chapters.find((chapter) => !studyState.chapterProgress[chapter.id]?.completed) ??
    chapters[0]
  const attempts = Object.values(studyState.practiceProgress ?? {})
  const previewChapters = allChapters.filter((ch) => ch.isPreviewPack)

  const gradeSummary = computeGradeSummary({
    chapters: allChapters.length ? allChapters : chapters,
    practiceProgress: studyState.practiceProgress,
    quizHistory: studyState.quizHistory,
  })

  const routes = [
    {
      title: "3D Human Atlas",
      description:
        "Full-screen 2,234-piece body explorer with draggable HUD and Find It & Name It drills.",
      icon: ScanLine,
      route: "human-body",
      number: "01",
      accent: "coral",
    },
    {
      title: "Practice & Quick Blitz",
      description:
        "Step-by-step random Study Blitz game, multi-chapter quizzes, and instant grade tracking.",
      icon: Brain,
      route: "practice",
      number: "02",
      accent: "teal",
    },
    {
      title: "Course Library & Figures",
      description:
        "8 verbatim course units + 7 preview packs with textbook figures, terms, and 3D links.",
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
            Start in the 3D studio, play a quick randomized Study Blitz across any chapters, or review textbook figures in the library.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              className="action"
              onClick={() => {
                if (onLaunchPracticeActivity) onLaunchPracticeActivity("blitz")
                else onNavigate("practice")
              }}
            >
              <Zap size={16} /> Play Quick Study Blitz
            </button>
            <button className="action action-secondary" onClick={() => onNavigate("human-body")}>
              Enter 3D studio <ArrowRight size={17} />
            </button>
            <button className="action action-secondary" onClick={() => onNavigate("bones")}>
              Ch. 7 Bone Landmarks Lab
            </button>
          </div>
        </div>
        <div className="desk-session">
          <span className="eyebrow">YOUR NEXT COURSE CHAPTER</span>
          <span className="chapter-number">
            {String(next?.number ?? 1).padStart(2, "0")}
          </span>
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
            {gradeSummary.overallPercent !== null
              ? `${gradeSummary.letterGrade} (${gradeSummary.overallPercent}%)`
              : "—"}
          </strong>
          <span>Current overall grade</span>
        </div>
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
          <p className="eyebrow">Grade & Weak-Spot Tracker</p>
          <h3 className="mt-2 text-xl font-semibold">
            {gradeSummary.weakSpots.length
              ? `${gradeSummary.weakSpots.length} concept${
                  gradeSummary.weakSpots.length === 1 ? "" : "s"
                } flagged to work on`
              : "Your weak-spot tracker is ready"}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {gradeSummary.weakSpots.length
              ? `Next up to review: "${gradeSummary.weakSpots[0].prompt}"`
              : "Any missed question in Quick Study Blitz, Question Rounds, or Bone Landmarks automatically collects here so you can drill weak spots in one click."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              className="action"
              onClick={() => {
                if (onLaunchPracticeActivity) onLaunchPracticeActivity("gradebook")
                else onNavigate("practice")
              }}
            >
              <Award size={16} /> Open Grade & Weak Spots
            </button>
            <button
              className="action action-secondary"
              onClick={() => {
                if (onLaunchPracticeActivity) onLaunchPracticeActivity("blitz")
                else onNavigate("practice")
              }}
            >
              <Target size={16} /> Quick Blitz
            </button>
          </div>
        </section>

        <section className="panel p-6">
          <p className="eyebrow">Course Material vs. Supplemental</p>
          <h3 className="mt-2 text-xl font-semibold">
            8 Verbatim Course Units + {previewChapters.length} Preview Packs
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            All textbook/class material stays strictly separated with a 1-click toggle so you can test on Course Material Only, Supplemental Only, or Both.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              className="action action-secondary"
              onClick={() => {
                onSelectChapter("chapter-6")
                onNavigate("chapters")
              }}
            >
              View Ch. 6 Figures & Notes
            </button>
            <button
              className="action action-secondary"
              onClick={() => onNavigate("flashcards")}
            >
              Browse cards <Layers3 size={16} />
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
