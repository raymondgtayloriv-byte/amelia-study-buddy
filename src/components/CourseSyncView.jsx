import { CheckCircle2, Clock3, FileStack, UploadCloud } from "lucide-react"

const syncPipeline = [
  "Add the real syllabus and exam dates",
  "Map professor modules to chapter cards",
  "Attach lecture slides and study guides",
  "Layer announcements and notes into the dashboard",
]

export function CourseSyncView({ courseSyncAssets }) {
  return (
    <div className="space-y-4">
      <section className="panel relative overflow-hidden px-5 py-6 sm:px-6 lg:px-7">
        <div className="absolute inset-y-0 right-0 hidden w-80 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_65%)] lg:block" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="eyebrow">Course sync</p>
            <h2 className="font-display text-3xl font-semibold text-slate-900">
              Ready to receive real class-specific material
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              This section makes the product feel production-minded: the UI is
              already designed to accept syllabus details, module timing,
              lecture assets, and instructor guidance without any fake backend.
            </p>
          </div>

          <div className="rounded-[26px] bg-[rgba(17,24,39,0.94)] px-4 py-4 text-white shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
              Prototype status
            </p>
            <p className="mt-2 text-sm font-semibold text-white">
              Foundation built. Data layer prepared for patch-in updates.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="panel px-5 py-6 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(31,109,112,0.08)] text-[var(--ink-strong)]">
              <UploadCloud size={18} />
            </div>
            <div>
              <p className="eyebrow">Input surfaces</p>
              <h3 className="text-2xl font-semibold text-slate-900">
                Planned class data sources
              </h3>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {courseSyncAssets.map((asset) => (
              <article
                key={asset.id}
                className="rounded-[24px] border border-[rgba(148,163,184,0.16)] bg-[rgba(248,251,252,0.94)] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">
                      {asset.label}
                    </h4>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {asset.description}
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                    {asset.status}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <article className="panel px-5 py-6 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(59,130,246,0.1)] text-sky-700">
                <FileStack size={18} />
              </div>
              <div>
                <p className="eyebrow">Next integration pass</p>
                <h3 className="text-2xl font-semibold text-slate-900">
                  How real course data will slot in
                </h3>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {syncPipeline.map((item, index) => (
                <div
                  key={item}
                  className="flex gap-3 rounded-[22px] bg-[rgba(237,244,255,0.95)] p-4"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-[var(--ink-strong)]">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-6 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="panel px-5 py-6 sm:px-6">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-[24px] bg-[rgba(238,250,246,0.95)] p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Already live
                  </p>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-700">
                  Navigation, content sections, quiz logic, progress tracking,
                  chapter detail panels, and polished empty states.
                </p>
              </div>
              <div className="rounded-[24px] bg-[rgba(255,247,237,0.96)] p-4">
                <div className="flex items-center gap-2">
                  <Clock3 size={16} className="text-amber-600" />
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Waiting on source data
                  </p>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-700">
                  Exact due dates, module pacing, professor notes, uploaded
                  slides, and any course-portal references.
                </p>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  )
}
