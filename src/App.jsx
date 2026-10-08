import { lazy, Suspense, useEffect, useState } from "react"
import {
  Bone,
  BookOpen,
  Brain,
  ClipboardList,
  FolderSync,
  LayoutDashboard,
  Layers3,
  Menu,
  Moon,
  PersonStanding,
  Sun,
  X,
} from "lucide-react"
import { ChaptersView } from "./components/ChaptersView"
import { ChapterImportView } from "./components/ChapterImportView"
import { StudyDesk } from "./components/StudyDesk"
import { StudyGuides } from "./components/StudyGuides"
import { PracticeArcade } from "./components/PracticeArcade"
import { BackupPanel } from "./components/BackupPanel"
import { FlashcardsView } from "./components/FlashcardsView"
import { HumanBodyView } from "./components/HumanBodyView"
import { Sidebar } from "./components/Sidebar"
import { bonesLabModule } from "./data/anatomyData"
import { mergeEngineProgress } from "./quiz/engine"
import {
  chapters as baseChapters,
  cramDecks,
  flashcards as baseFlashcards,
  quizQuestionBank as baseQuestions,
} from "./data/studyData"
import { useLocalStorage } from "./hooks/useLocalStorage"

const BonesLabView = lazy(() => import("./components/BonesLabView").then(m => ({ default: m.BonesLabView })))
const QuizView = lazy(() => import("./components/QuizView").then(m => ({ default: m.QuizView })))

const navigationItems = [
  { id: "human-body", label: "Anatomy studio", shortLabel: "Studio", icon: PersonStanding, description: "Explore the real human body in 3D." },
  { id: "dashboard", label: "Study desk", shortLabel: "Desk", icon: LayoutDashboard, description: "Your next useful study session." },
  { id: "chapters", label: "Course library", shortLabel: "Library", icon: BookOpen, description: "Chapter notes and essential concepts." },
  { id: "practice", label: "Practice arcade", shortLabel: "Practice", icon: Brain, description: "Match, recall, and rehearse." },
  { id: "bones", label: "Bone landmarks", shortLabel: "Bones", icon: Bone, description: "Chapter 7 visual drills and weak spots." },
  { id: "flashcards", label: "Flashcards", shortLabel: "Cards", icon: Layers3, description: "Recall first. Flip second." },
  { id: "cram", label: "Study guides", shortLabel: "Guides", icon: ClipboardList, description: "Explain it, sketch it, check it." },
  { id: "sync", label: "Add chapters", shortLabel: "Import", icon: FolderSync, description: "Upload notes or a chapter pack." },
]
const legacySections = new Set(["atlas", "explorer", "body-explorer", "skeleton3d"])
function migrateStudyState(value) {
  const safe = value && typeof value === "object" && !Array.isArray(value) ? value : {}
  return { ...defaultStudyState, ...safe, activeSection: safe.uiVersion !== 2 || legacySections.has(safe.activeSection) || ![...navigationItems.map(item => item.id), "quiz"].includes(safe.activeSection) ? "human-body" : safe.activeSection, uiVersion: 2 }
}

const defaultStudyState = {
  activeSection: "human-body",
  uiVersion: 2,
  importedChapters: [],
  practiceProgress: {},
  atlasNotebook: { bookmarks: [], notes: {}, results: [] },
  selectedChapterId: "chapter-1",
  chapterProgress: {},
  flashcardProgress: {},
  quizHistory: {},
  anatomyProgress: {
    recall: {},
    quizHistory: {},
    typedHistory: {},
    weakSpots: {},
  },
}

function App() {
  const [theme, setTheme] = useLocalStorage("study-buddy-theme", "light", value => value === "dark" ? "dark" : "light")
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])
  const [studyState, setStudyState, storageError] = useLocalStorage(
    "biol2401-study-hub-v1",
    defaultStudyState,
    migrateStudyState,
  )
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const importedChapters = studyState.importedChapters ?? []
  const chapters = [
    ...baseChapters.filter(chapter => chapter.status === "ready" || !importedChapters.some(item => item.number === chapter.number && item.sourceType === "course")),
    ...importedChapters,
  ].sort((a, b) => a.number - b.number)
  const flashcards = [...baseFlashcards.map(card => ({ ...card, sourceType: "course" })), ...importedChapters.flatMap(chapter => chapter.flashcards.map(card => ({ ...card, sourceType: chapter.sourceType })))]
  const quizQuestionBank = [...baseQuestions.map(question => ({ ...question, sourceType: "course" })), ...importedChapters.flatMap(chapter => chapter.questions.map(question => ({ ...question, sourceType: chapter.sourceType })))]
  const [undoImport, setUndoImport] = useState(null)
  const [importMessage, setImportMessage] = useState("")
  const activeSection = studyState.activeSection
  useEffect(() => {
    document.title = `${navigationItems.find(item => item.id === activeSection)?.label ?? "Anatomy drills"} · Amelia’s Study Buddy`
    document.getElementById("study-main")?.focus({ preventScroll: true })
  }, [activeSection])
  const anatomyProgress =
    studyState.anatomyProgress ?? defaultStudyState.anatomyProgress

  const readyChapters = chapters.filter((chapter) => chapter.status === "ready")
  const courseChapters = readyChapters.filter(chapter => chapter.sourceType !== "supplemental")
  const chapterLinkedFlashcards = flashcards.filter((card) => card.chapterId && card.sourceType !== "supplemental")
  const completedReadyChapters = courseChapters.filter(
    (chapter) => studyState.chapterProgress[chapter.id]?.completed,
  ).length
  const knownFlashcards = chapterLinkedFlashcards.filter(
    (card) => studyState.flashcardProgress[card.id] === "known",
  ).length
  const quizScoreEntries = Object.values(studyState.quizHistory)
  const averageQuizScore = quizScoreEntries.length
    ? Math.round(
        quizScoreEntries.reduce((sum, entry) => sum + entry.bestPercent, 0) /
          quizScoreEntries.length,
      )
    : 0
  const chapterCompletionPercent = Math.round(
    (completedReadyChapters / Math.max(1, courseChapters.length)) * 100,
  )
  const flashcardCompletionPercent = Math.round(
    (knownFlashcards / Math.max(1, chapterLinkedFlashcards.length)) * 100,
  )
  const overallProgress = Math.round(
    (chapterCompletionPercent + flashcardCompletionPercent + averageQuizScore) / 3,
  )

  const selectedChapter =
    chapters.find((chapter) => chapter.id === studyState.selectedChapterId) ??
    chapters[0]

  const setActiveSection = (sectionId) => {
    setStudyState((current) => ({ ...current, activeSection: sectionId }))
    setMobileNavOpen(false)
    window.scrollTo({ top: 0, behavior: "instant" })
  }

  const setSelectedChapter = (chapterId) => {
    setStudyState((current) => ({ ...current, selectedChapterId: chapterId }))
  }

  const updateChapterProgress = (chapterId, updates) => {
    setStudyState((current) => ({
      ...current,
      chapterProgress: {
        ...current.chapterProgress,
        [chapterId]: {
          ...current.chapterProgress[chapterId],
          ...updates,
        },
      },
    }))
  }

  const updateFlashcardProgress = (cardId, status) => {
    setStudyState((current) => ({
      ...current,
      flashcardProgress: {
        ...current.flashcardProgress,
        [cardId]: status,
      },
    }))
  }

  const registerWeakSpotMisses = (weakSpots, ids, source) => {
    const timestamp = new Date().toISOString()

    ids.forEach((structureId) => {
      weakSpots[structureId] = {
        misses: (weakSpots[structureId]?.misses ?? 0) + 1,
        lastMissedAt: timestamp,
        sources: {
          quiz: weakSpots[structureId]?.sources?.quiz ?? 0,
          typed: weakSpots[structureId]?.sources?.typed ?? 0,
          recall: weakSpots[structureId]?.sources?.recall ?? 0,
          [source]: (weakSpots[structureId]?.sources?.[source] ?? 0) + 1,
        },
      }
    })
  }

  const updateAnatomyRecall = (itemId, status) => {
    setStudyState((current) => {
      const weakSpots = { ...(current.anatomyProgress?.weakSpots ?? {}) }

      if (status === "missed") {
        registerWeakSpotMisses(weakSpots, [itemId], "recall")
      }

      return {
        ...current,
        anatomyProgress: {
          recall: {
            ...(current.anatomyProgress?.recall ?? {}),
            [itemId]: status,
          },
          quizHistory: current.anatomyProgress?.quizHistory ?? {},
          typedHistory: current.anatomyProgress?.typedHistory ?? {},
          weakSpots,
        },
      }
    })
  }

  const saveAnatomyQuizResult = ({
    quizKey,
    scopeLabel,
    correctCount,
    totalQuestions,
    missedIds = [],
  }) => {
    const percent = Math.round((correctCount / totalQuestions) * 100)

    setStudyState((current) => {
      const previous = current.anatomyProgress?.quizHistory?.[quizKey]
      const weakSpots = { ...(current.anatomyProgress?.weakSpots ?? {}) }

      registerWeakSpotMisses(weakSpots, missedIds, "quiz")

      return {
        ...current,
        anatomyProgress: {
          recall: current.anatomyProgress?.recall ?? {},
          quizHistory: {
            ...(current.anatomyProgress?.quizHistory ?? {}),
            [quizKey]: {
              scopeLabel,
              attempts: (previous?.attempts ?? 0) + 1,
              bestPercent: Math.max(previous?.bestPercent ?? 0, percent),
              lastPercent: percent,
            },
          },
          typedHistory: current.anatomyProgress?.typedHistory ?? {},
          weakSpots,
        },
      }
    })
  }

  const saveAnatomyTypedResult = ({
    sessionKey,
    scopeLabel,
    correctCount,
    spellingCount,
    totalQuestions,
    reviewIds,
  }) => {
    const accuracyPercent = Math.round((correctCount / totalQuestions) * 100)
    const spellingPercent = Math.round((spellingCount / totalQuestions) * 100)

    setStudyState((current) => {
      const previous = current.anatomyProgress?.typedHistory?.[sessionKey]
      const weakSpots = { ...(current.anatomyProgress?.weakSpots ?? {}) }

      registerWeakSpotMisses(weakSpots, reviewIds, "typed")

      return {
        ...current,
        anatomyProgress: {
          recall: current.anatomyProgress?.recall ?? {},
          quizHistory: current.anatomyProgress?.quizHistory ?? {},
          typedHistory: {
            ...(current.anatomyProgress?.typedHistory ?? {}),
            [sessionKey]: {
              scopeLabel,
              attempts: (previous?.attempts ?? 0) + 1,
              bestPercent: Math.max(previous?.bestPercent ?? 0, accuracyPercent),
              bestSpellingPercent: Math.max(
                previous?.bestSpellingPercent ?? 0,
                spellingPercent,
              ),
              lastPercent: accuracyPercent,
              lastSpellingPercent: spellingPercent,
            },
          },
          weakSpots,
        },
      }
    })
  }

  const saveQuizResult = ({ quizKey, chapterId, correctCount, totalQuestions }) => {
    const percent = Math.round((correctCount / totalQuestions) * 100)

    setStudyState((current) => {
      const previous = current.quizHistory[quizKey]

      return {
        ...current,
        quizHistory: {
          ...current.quizHistory,
          [quizKey]: {
            chapterId,
            attempts: (previous?.attempts ?? 0) + 1,
            bestPercent: Math.max(previous?.bestPercent ?? 0, percent),
            lastPercent: percent,
          },
        },
      }
    })
  }

  const saveEngineQuizResult = ({ sessionKey, scopeLabel, mode, summary }) => {
    setStudyState((current) => mergeEngineProgress(current, {
      sessionKey,
      scopeLabel,
      mode,
      summary,
    }))
  }

  const metrics = {
    overallProgress,
    chapterCompletionPercent,
    flashcardCompletionPercent,
    averageQuizScore,
    completedReadyChapters,
    totalReadyChapters: courseChapters.length,
    knownFlashcards,
    totalFlashcards: chapterLinkedFlashcards.length,
  }

  const currentSection = navigationItems.find(item => item.id === activeSection) ?? { label: "Anatomy drills", description: "Six ways to practice the original course packs." }
  const savePractice = result => setStudyState(current => ({ ...current, practiceProgress: { ...current.practiceProgress, [result.resultKey]: { ...result, attempts: (current.practiceProgress?.[result.resultKey]?.attempts ?? 0) + 1, bestPercent: Math.max(current.practiceProgress?.[result.resultKey]?.bestPercent ?? 0, result.percent ?? 0) } } }))
  const saveAtlasNotebook = notebook => setStudyState(current => ({ ...current, atlasNotebook: notebook }))
  const importChapter = chapter => {
    const previous = importedChapters.find(item => item.id === chapter.id)
    setUndoImport({ previous, id: chapter.id })
    setStudyState(current => ({ ...current, importedChapters: [...(current.importedChapters ?? []).filter(item => item.id !== chapter.id), chapter], selectedChapterId: chapter.id }))
    setImportMessage(`Chapter ${chapter.number} saved. Open the course library to read it.`)
  }
  const removeImport = id => {
    setUndoImport({ previous: importedChapters.find(item => item.id === id), id })
    setStudyState(current => ({ ...current, importedChapters: current.importedChapters.filter(item => item.id !== id) }))
    setImportMessage("Imported chapter removed. You can undo this below.")
  }
  const undoChapter = () => {
    setStudyState(current => ({ ...current, importedChapters: [...current.importedChapters.filter(item => item.id !== undoImport.id), ...(undoImport.previous ? [undoImport.previous] : [])] }))
    setUndoImport(null)
    setImportMessage("Change undone.")
  }
  return (
    <div className="app-shell">
      <a className="skip-link" href="#study-main">Skip to study content</a>
      <Sidebar navigationItems={navigationItems} activeSection={activeSection} metrics={metrics} onSectionChange={setActiveSection} />
      <div className="workspace">
        <header className="workspace-header">
          <div><p className="eyebrow">BIOL 2401 / Amelia’s Study Buddy</p><h1>{currentSection.label}</h1></div>
          <div className="header-actions"><span className="local-status"><span /> {storageError ? "Changes need a backup" : "Saved on this device"}</span><button type="button" className="theme-toggle" aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"} title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"} onClick={() => setTheme(theme === "light" ? "dark" : "light")}>{theme === "light" ? <Moon size={18}/> : <Sun size={18}/>}<span>{theme === "light" ? "Dark" : "Light"}</span></button><button type="button" className="action action-secondary mobile-menu" onClick={() => setMobileNavOpen(!mobileNavOpen)} aria-expanded={mobileNavOpen} aria-controls="mobile-navigation" aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"}>{mobileNavOpen ? <X size={20}/> : <Menu size={20}/>}</button></div>
        </header>
        {mobileNavOpen && <nav id="mobile-navigation" className="mobile-navigation" aria-label="Study navigation">{navigationItems.map(item => <button type="button" key={item.id} aria-current={activeSection === item.id ? "page" : undefined} onClick={() => setActiveSection(item.id)}>{item.label}</button>)}</nav>}
        <main id="study-main" className="study-main" tabIndex={-1}>
          {storageError && <div className="import-feedback" role="alert">{storageError}<button className="action action-secondary" onClick={() => setActiveSection("sync")}>Open backups</button></div>}
          {["bones", "quiz"].includes(activeSection) && <div className="course-ribbon"><span className="source-tag">Course-based study material</span><p>Preserved chapter content and practice packs. Your instructor determines exam scope.</p>{activeSection === "quiz" && <button className="action action-secondary" onClick={() => setActiveSection("practice")}>Back to practice arcade</button>}</div>}
          <Suspense fallback={<div className="panel p-6" role="status">Preparing your study tools…</div>}>

            {activeSection === "dashboard" && <StudyDesk chapters={courseChapters} metrics={metrics} studyState={studyState} onNavigate={setActiveSection} onSelectChapter={setSelectedChapter} />}
            {activeSection === "practice" && <PracticeArcade key={selectedChapter.id} initialChapterId={selectedChapter.id} chapters={readyChapters} questions={quizQuestionBank} flashcards={flashcards} progress={studyState.practiceProgress} onSaveResult={savePractice} onOpenAnatomy={() => setActiveSection("human-body")} onOpenCourseDrills={() => setActiveSection("quiz")} />}
            {studyState.activeSection === "chapters" ? (
              <ChaptersView
                chapters={chapters}
                flashcards={flashcards}
                onSelectChapter={setSelectedChapter}
                quizQuestionBank={quizQuestionBank}
                selectedChapter={selectedChapter}
                chapterProgress={studyState.chapterProgress}
                onUpdateChapterProgress={updateChapterProgress}
                onAddMaterials={() => setActiveSection("sync")}
              />
            ) : null}

            {studyState.activeSection === "bones" ? (
              <BonesLabView
                unit={bonesLabModule}
                progress={anatomyProgress}
                onSaveQuizResult={saveAnatomyQuizResult}
                onSaveTypedResult={saveAnatomyTypedResult}
                onUpdateRecall={updateAnatomyRecall}
              />
            ) : null}

            {activeSection === "human-body" && <HumanBodyView notebook={studyState.atlasNotebook ?? defaultStudyState.atlasNotebook} onNotebookChange={saveAtlasNotebook} onNavigate={setActiveSection} />}
            {studyState.activeSection === "flashcards" ? (
              <FlashcardsView
                chapters={chapters}
                flashcards={flashcards}
                flashcardProgress={studyState.flashcardProgress}
                onUpdateFlashcardProgress={updateFlashcardProgress}
              />
            ) : null}

            {studyState.activeSection === "quiz" ? (
              <QuizView
                chapters={readyChapters.filter(chapter => chapter.sourceType !== "supplemental" && quizQuestionBank.some(question => question.chapterId === chapter.id))}
                quizHistory={studyState.quizHistory}
                quizQuestionBank={quizQuestionBank.filter(question => question.sourceType !== "supplemental")}
                onSaveQuizResult={saveQuizResult}
                onSaveEngineResult={saveEngineQuizResult}
              />
            ) : null}

            {activeSection === "cram" && <StudyGuides chapters={readyChapters} selectedChapter={selectedChapter} onSelectChapter={setSelectedChapter} onPractice={() => setActiveSection("practice")} cramDecks={cramDecks} />}
            {activeSection === "sync" && <>
              <ChapterImportView initialNumber={selectedChapter.status === "ready" ? 5 : selectedChapter.number} initialTitle={selectedChapter.status === "ready" ? "" : selectedChapter.title} importedChapters={importedChapters} onImport={importChapter} onRemove={removeImport}/>
              {importMessage && <div className="import-feedback" role="status">{importMessage} {undoImport && <button className="action action-secondary" onClick={undoChapter}>Undo</button>}<button className="action action-secondary" onClick={() => setActiveSection("chapters")}>Open library</button></div>}
              <BackupPanel studyState={studyState} onRestore={setStudyState}/>
            </>}
          </Suspense>
        </main>
      </div>
    </div>
  )
}
export default App
