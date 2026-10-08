/** Return a fresh study state with learning progress cleared and study materials kept. */
export function resetProgressState(studyState) {
  const state = studyState && typeof studyState === "object" ? studyState : {}
  const anatomyProgress = state.anatomyProgress ?? {}
  const atlasNotebook = state.atlasNotebook ?? {}

  return {
    ...state,
    activeSection: "sync",
    chapterProgress: {},
    flashcardProgress: {},
    quizHistory: {},
    engineQuizHistory: {},
    practiceProgress: {},
    anatomyProgress: {
      ...anatomyProgress,
      recall: {},
      quizHistory: {},
      typedHistory: {},
      weakSpots: {},
    },
    atlasNotebook: {
      ...atlasNotebook,
      bookmarks: [],
      notes: {},
      results: [],
    },
  }
}
