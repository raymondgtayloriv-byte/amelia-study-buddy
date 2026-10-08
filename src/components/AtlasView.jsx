import { useState } from "react"
import { Eye, EyeOff, Microscope, ScanSearch } from "lucide-react"

export function AtlasView({ atlasCategories }) {
  const [activeCategory, setActiveCategory] = useState(atlasCategories[0].id)
  const [revealed, setRevealed] = useState({})

  const selectedCategory =
    atlasCategories.find((category) => category.id === activeCategory) ??
    atlasCategories[0]

  const toggleReveal = (itemId) => {
    setRevealed((current) => ({ ...current, [itemId]: !current[itemId] }))
  }

  return (
    <div className="space-y-4">
      <section className="panel px-5 py-6 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="eyebrow">Atlas / lab</p>
            <h2 className="font-display text-3xl font-semibold text-slate-900">
              Starter visual drill dashboard
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              This lab surface is built for a second, image-heavy study stream.
              Version 1 uses text-based identification prompts and polished
              placeholders so real atlas references can be added later without
              changing the interface.
            </p>
          </div>
          <div className="rounded-[24px] bg-[linear-gradient(135deg,_rgba(236,250,248,0.95),_rgba(232,244,255,0.88))] px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Lab build
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              Histology, skeletal landmarks, and soft-tissue ID are scaffolded.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className="panel px-4 py-4 sm:px-5">
          <h3 className="text-lg font-semibold text-slate-900">Categories</h3>
          <div className="mt-4 space-y-3">
            {atlasCategories.map((category) => {
              const active = category.id === activeCategory

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setActiveCategory(category.id)}
                  className={`w-full rounded-[24px] border p-4 text-left transition ${
                    active
                      ? "border-transparent bg-[linear-gradient(135deg,_rgba(31,109,112,0.96),_rgba(18,81,99,0.96))] text-white shadow-soft"
                      : "border-white/70 bg-white/85 text-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                        active ? "bg-white/16" : "bg-[rgba(31,109,112,0.08)]"
                      }`}
                    >
                      {category.id === "histology" ? (
                        <Microscope size={18} />
                      ) : (
                        <ScanSearch size={18} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{category.label}</p>
                      <p
                        className={`mt-1 text-xs ${
                          active ? "text-white/75" : "text-slate-500"
                        }`}
                      >
                        {category.items.length} starter tiles
                      </p>
                    </div>
                  </div>
                  <p
                    className={`mt-3 text-sm leading-6 ${
                      active ? "text-white/82" : "text-slate-600"
                    }`}
                  >
                    {category.description}
                  </p>
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="panel px-5 py-6 sm:px-6">
            <p className="eyebrow">{selectedCategory.label}</p>
            <h3 className="text-2xl font-semibold text-slate-900">
              {selectedCategory.heading}
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {selectedCategory.description}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {selectedCategory.items.map((item) => {
              const isRevealed = revealed[item.id]

              return (
                <article key={item.id} className="panel px-5 py-5">
                  <div className="atlas-placeholder">
                    <span>{item.prompt}</span>
                  </div>
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      What to notice
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {item.clue}
                    </p>
                  </div>
                  <div className="mt-4 rounded-[20px] bg-[rgba(238,250,246,0.95)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Reveal
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {isRevealed ? item.answer : "Tap reveal to check yourself"}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {isRevealed ? item.context : item.hint}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleReveal(item.id)}
                    className="mt-4 inline-flex items-center gap-2 rounded-full border border-[rgba(31,109,112,0.16)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink-strong)]"
                  >
                    {isRevealed ? <EyeOff size={15} /> : <Eye size={15} />}
                    {isRevealed ? "Hide label" : "Reveal label"}
                  </button>
                </article>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
