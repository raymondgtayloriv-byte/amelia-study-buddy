import { useEffect, useMemo, useState } from "react"
import { Check, ChevronLeft, ChevronRight, RotateCcw, Shuffle } from "lucide-react"

const sourceOf = (card) => (card.sourceType === "supplemental" ? "supplemental" : "course")
const chapterLabel = (chapter, chapterId) =>
  chapter?.title
    ? `Ch. ${chapter.number}: ${chapter.title}`
    : chapterId
      ? `Ch. ${String(chapterId).replace(/^chapter-/, "")}`
      : "Unsorted cards"

function shuffled(items) {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1))
    ;[result[index], result[swap]] = [result[swap], result[index]]
  }
  return result
}

export function FlashcardsView({
  flashcards = [],
  flashcardProgress = {},
  onUpdateFlashcardProgress,
  chapters = [],
}) {
  const [selectedChapter, setSelectedChapter] = useState("all")
  const [selectedSource, setSelectedSource] = useState("all")
  const [activeCategory, setActiveCategory] = useState("all")
  const [studySet, setStudySet] = useState("learning")
  const [activeIndex, setActiveIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [cardOrder, setCardOrder] = useState(null)

  const chapterOptions = useMemo(() => {
    const ids = [...new Set(flashcards.map((card) => card.chapterId).filter(Boolean))]
    return ids.map((id) => ({
      id,
      label: chapterLabel(
        chapters.find((chapter) => chapter.id === id),
        id,
      ),
    }))
  }, [chapters, flashcards])

  const chapterSourceCards = flashcards.filter(
    (card) =>
      (selectedChapter === "all" || card.chapterId === selectedChapter) &&
      (selectedSource === "all" || sourceOf(card) === selectedSource),
  )
  const categories = [...new Set(chapterSourceCards.map((card) => card.category || "General"))]
  const scopedCards = chapterSourceCards.filter(
    (card) => activeCategory === "all" || (card.category || "General") === activeCategory,
  )
  const knownCount = scopedCards.filter((card) => flashcardProgress[card.id] === "known").length
  const progressPercent = scopedCards.length
    ? Math.round((knownCount / scopedCards.length) * 100)
    : 0
  const deckCards = scopedCards.filter(
    (card) => studySet === "all" || flashcardProgress[card.id] !== "known",
  )
  const orderedCards =
    cardOrder && cardOrder.length === deckCards.length
      ? [...deckCards].sort((a, b) => cardOrder.indexOf(a.id) - cardOrder.indexOf(b.id))
      : deckCards
  const currentCard = orderedCards[activeIndex] ?? orderedCards[0]
  const currentNumber = currentCard
    ? orderedCards.findIndex((card) => card.id === currentCard.id) + 1
    : 0
  const currentChapter =
    currentCard && chapters.find((chapter) => chapter.id === currentCard.chapterId)
  const updateFilter = (setter) => (event) => {
    setter(event.target.value)
    if (setter !== setActiveCategory) setActiveCategory("all")
    setActiveIndex(0)
    setFlipped(false)
    setCardOrder(null)
  }

  function showNext() {
    if (!orderedCards.length) return
    setActiveIndex((index) => (index + 1 >= orderedCards.length ? 0 : index + 1))
    setFlipped(false)
  }

  function showPrevious() {
    if (!orderedCards.length) return
    setActiveIndex((index) => (index <= 0 ? orderedCards.length - 1 : index - 1))
    setFlipped(false)
  }

  function markCard(status) {
    if (!currentCard) return
    onUpdateFlashcardProgress?.(currentCard.id, status)
    setFlipped(false)
    if (studySet === "learning" && status === "known") {
      setActiveIndex((index) => (index >= deckCards.length - 1 ? 0 : index))
    } else {
      showNext()
    }
  }

  function shuffleDeck() {
    setCardOrder(shuffled(deckCards).map((card) => card.id))
    setActiveIndex(0)
    setFlipped(false)
  }

  function resetDeck() {
    setCardOrder(null)
    setActiveIndex(0)
    setFlipped(false)
  }

  useEffect(() => {
    const onKey = (event) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return
      }
      if (!currentCard) return
      if (event.key === " ") {
        event.preventDefault()
        setFlipped((v) => !v)
      } else if (event.key === "ArrowRight") {
        event.preventDefault()
        showNext()
      } else if (event.key === "ArrowLeft") {
        event.preventDefault()
        showPrevious()
      } else if (event.key === "1") {
        event.preventDefault()
        markCard("review")
      } else if (event.key === "2") {
        event.preventDefault()
        markCard("known")
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  return (
    <div className="space-y-4">
      <section className="panel p-5 sm:p-6">
        <div className="section-heading flex-wrap">
          <div>
            <p className="eyebrow">Flashcards</p>
            <h2 className="font-display text-2xl font-semibold text-slate-900 sm:text-3xl">
              Recall first. Flip second.
            </h2>
          </div>
          <div className="rounded-2xl bg-teal-50 px-4 py-2.5 text-xs text-slate-700">
            <span className="font-semibold text-teal-900">
              {knownCount} of {scopedCards.length} known
            </span>
            <span className="ml-2 text-slate-500">{progressPercent}%</span>
            <div className="mt-1.5 h-1.5 w-36 overflow-hidden rounded-full bg-white">
              <div
                className="h-full rounded-full bg-teal-700 transition-[width]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <label className="field">
            <span>Chapter</span>
            <select value={selectedChapter} onChange={updateFilter(setSelectedChapter)}>
              <option value="all">All 15 chapters</option>
              {chapterOptions.map((chapter) => (
                <option key={chapter.id} value={chapter.id}>
                  {chapter.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Material source</span>
            <select value={selectedSource} onChange={updateFilter(setSelectedSource)}>
              <option value="all">All sources ({flashcards.length})</option>
              <option value="course">Course material</option>
              <option value="supplemental">Supplemental / Preview</option>
            </select>
          </label>
          <label className="field">
            <span>Category</span>
            <select value={activeCategory} onChange={updateFilter(setActiveCategory)}>
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Deck</span>
            <select value={studySet} onChange={updateFilter(setStudySet)}>
              <option value="learning">Still learning</option>
              <option value="all">All cards</option>
            </select>
          </label>
        </div>
      </section>

      <section className="panel p-4 sm:p-6">
        <div className="section-heading flex-wrap">
          <div>
            <p className="eyebrow">Active deck</p>
            <h3 className="text-lg font-semibold text-slate-900">
              {currentCard
                ? chapterLabel(currentChapter, currentCard.chapterId)
                : selectedChapter === "all"
                  ? "All chapters"
                  : chapterLabel(
                      chapters.find((chapter) => chapter.id === selectedChapter),
                      selectedChapter,
                    )}
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              className="action action-secondary"
              type="button"
              onClick={shuffleDeck}
              disabled={deckCards.length < 2}
            >
              <Shuffle size={15} aria-hidden="true" /> Shuffle
            </button>
            {cardOrder && (
              <button className="action action-secondary" type="button" onClick={resetDeck}>
                <RotateCcw size={15} aria-hidden="true" /> Reset order
              </button>
            )}
          </div>
        </div>

        {currentCard ? (
          <>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  className={`source-tag ${
                    sourceOf(currentCard) === "supplemental" ? "supplemental" : ""
                  }`}
                >
                  {sourceOf(currentCard) === "supplemental" ? "Preview / Supplemental" : "Course material"}
                </span>
                {currentCard.category && (
                  <span className="text-xs font-medium text-slate-500">
                    {currentCard.category}
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-slate-500">
                Card {currentNumber} of {orderedCards.length}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setFlipped((value) => !value)}
              aria-label={flipped ? "Show flashcard prompt" : "Reveal flashcard answer"}
              className={`mt-3 flex min-h-[300px] w-full flex-col rounded-[26px] border p-6 text-left shadow-soft transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700 sm:p-8 ${
                flipped
                  ? "border-teal-900 bg-[linear-gradient(145deg,_#175b68,_#1f6d70)] text-white"
                  : "border-teal-100 bg-[linear-gradient(145deg,_#ffffff,_#edf8f6)] text-slate-900"
              }`}
            >
              <span
                className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                  flipped ? "bg-white/15 text-white/80" : "bg-teal-100 text-teal-900"
                }`}
              >
                {flipped ? "Answer" : "Prompt"}
              </span>
              <span className="my-auto block whitespace-pre-wrap break-words py-6 text-xl font-semibold leading-snug sm:text-2xl">
                {flipped ? currentCard.back : currentCard.front}
              </span>
              {flipped && currentCard.note && (
                <span className="mt-2 block whitespace-pre-wrap break-words border-t border-white/20 pt-3 text-xs leading-5 text-white/85">
                  {currentCard.note}
                </span>
              )}
              <span className={`mt-4 text-xs ${flipped ? "text-white/75" : "text-slate-500"}`}>
                {flipped ? "Click or press Space to flip back." : "Click or press Space to reveal answer."}
              </span>
            </button>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={showPrevious}
                  disabled={orderedCards.length < 2}
                  className="action action-secondary"
                  aria-label="Previous flashcard"
                >
                  <ChevronLeft size={16} aria-hidden="true" /> Prev
                </button>
                <button
                  type="button"
                  onClick={showNext}
                  disabled={orderedCards.length < 2}
                  className="action action-secondary"
                  aria-label="Next flashcard"
                >
                  Next <ChevronRight size={16} aria-hidden="true" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => markCard("review")}
                  className="action action-secondary"
                  title="Shortcut: 1"
                >
                  <RotateCcw size={15} aria-hidden="true" /> Still learning
                </button>
                <button
                  type="button"
                  onClick={() => markCard("known")}
                  className="action"
                  title="Shortcut: 2"
                >
                  <Check size={15} aria-hidden="true" /> Mark known
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="mt-5 rounded-2xl bg-slate-50 p-5" role="status">
            <h3 className="text-base font-semibold text-slate-900">
              {scopedCards.length > 0 && studySet === "learning"
                ? "Every card in this filter is marked known!"
                : "No cards in this filter"}
            </h3>
            <p className="mt-1.5 text-xs leading-5 text-slate-600">
              {scopedCards.length > 0 && studySet === "learning"
                ? "Switch Deck to All cards to review them again."
                : "Choose All sources or another chapter to load flashcards."}
            </p>
            {scopedCards.length > 0 && studySet === "learning" && (
              <button
                type="button"
                className="action mt-3"
                onClick={() => {
                  setStudySet("all")
                  setActiveIndex(0)
                  setFlipped(false)
                  setCardOrder(null)
                }}
              >
                Show all cards
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
