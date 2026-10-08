import { AlertCircle, Zap } from "lucide-react"

export function CramView({ cramDecks }) {
  return (
    <div className="space-y-4">
      <section className="panel px-5 py-6 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="eyebrow">Cram mode</p>
            <h2 className="font-display text-3xl font-semibold text-slate-900">
              High-yield review for last-minute focus
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              Designed for the moment when a student needs a calm, compact
              review path. These cards surface the ideas that tend to show up
              again in explanations, quizzes, and exam-style reasoning.
            </p>
          </div>
          <div className="rounded-[24px] bg-[linear-gradient(135deg,_rgba(255,247,237,0.96),_rgba(254,242,242,0.86))] px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Quick strategy
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              Read the card, explain it out loud, then test yourself in quiz
              mode.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {cramDecks.map((deck) => (
          <article key={deck.id} className="panel px-5 py-6 sm:px-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow">{deck.label}</p>
                <h3 className="text-2xl font-semibold text-slate-900">
                  {deck.title}
                </h3>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(31,109,112,0.08)] text-[var(--ink-strong)]">
                <Zap size={18} />
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div className="rounded-[24px] bg-[rgba(237,244,255,0.94)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Must know before exam
                </p>
                <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-700">
                  {deck.mustKnow.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-2 h-2 w-2 rounded-full bg-[var(--ink-strong)]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[24px] bg-[rgba(255,247,237,0.96)] p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="text-amber-600" />
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Common mistakes
                  </p>
                </div>
                <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-700">
                  {deck.mistakes.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-2 h-2 w-2 rounded-full bg-amber-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-4 rounded-[24px] bg-[rgba(238,250,246,0.95)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Rapid review bullets
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {deck.rapidReview.map((item) => (
                  <span key={item} className="pill">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}
