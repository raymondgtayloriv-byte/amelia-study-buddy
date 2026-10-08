export const STUDY_BACKUP_FORMAT = "amelia-study-buddy-backup"
export const STUDY_BACKUP_VERSION = 1
export const MAX_STUDY_BACKUP_BYTES = 5 * 1024 * 1024

const isRecord = (value) => value !== null && typeof value === "object" && !Array.isArray(value)
const nonEmpty = (value) => typeof value === "string" && value.trim().length > 0

function validateJsonTree(value, errors, depth = 0, counter = { count: 0 }) {
  if (counter.overflow) return
  counter.count += 1
  if (depth > 32) {
    errors.push("Backup data is nested too deeply.")
    counter.overflow = true
    return
  }
  if (counter.count > 200_000) {
    errors.push("Backup contains too many data fields.")
    counter.overflow = true
    return
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      validateJsonTree(item, errors, depth + 1, counter)
      if (counter.overflow) break
    }
    return
  }
  if (isRecord(value)) {
    const prototype = Object.getPrototypeOf(value)
    if (prototype !== Object.prototype && prototype !== null) errors.push("Backup contains an unsupported object.")
    for (const [key, item] of Object.entries(value)) {
      if (["__proto__", "prototype", "constructor"].includes(key)) errors.push(`Unsafe property name: ${key}.`)
      validateJsonTree(item, errors, depth + 1, counter)
      if (counter.overflow) break
    }
    return
  }
  if (value !== null && !["string", "number", "boolean"].includes(typeof value)) errors.push("Backup contains a value that cannot be restored.")
  if (typeof value === "number" && !Number.isFinite(value)) errors.push("Backup contains an invalid number.")
}

function validateString(value, label, errors, max = 100_000) {
  if (!nonEmpty(value)) errors.push(`${label} must be a non-empty string.`)
  else if (value.length > max) errors.push(`${label} is too long.`)
}

function validateImportedChapters(chapters, errors) {
  if (!Array.isArray(chapters)) { errors.push("Imported chapters must be an array."); return }
  if (chapters.length > 500) errors.push("Backup contains too many imported chapters.")
  const chapterIds = new Set()
  for (const [index, chapter] of chapters.entries()) {
    const label = `Imported chapter ${index + 1}`
    if (!isRecord(chapter)) { errors.push(`${label} must be an object.`); continue }
    validateString(chapter.id, `${label} id`, errors, 120)
    validateString(chapter.title, `${label} title`, errors, 200)
    if (nonEmpty(chapter.id)) {
      if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(chapter.id)) errors.push(`${label} id contains unsupported characters.`)
      if (chapterIds.has(chapter.id)) errors.push(`Duplicate imported chapter id: ${chapter.id}.`)
      chapterIds.add(chapter.id)
    }
    if (!Number.isInteger(chapter.number) || chapter.number < 1 || chapter.number > 999) errors.push(`${label} number must be a whole number from 1 to 999.`)
    if (!["course", "supplemental"].includes(chapter.sourceType)) errors.push(`${label} has an invalid source type.`)
    validateString(chapter.sourceLabel, `${label} source label`, errors, 500)
    validateString(chapter.summary, `${label} summary`, errors, 2000)
    // Text and Markdown imports can contain up to 2 MB of verbatim notes;
    // their detailSummary intentionally mirrors that imported source.
    validateString(chapter.detailSummary, `${label} detail summary`, errors, 2 * 1024 * 1024)
    if (chapter.status !== "ready") errors.push(`${label} is missing its ready status.`)
    for (const key of ["vocabulary", "mustKnow", "commonConfusions", "reviewQuestions", "flashcardIds", "quizIds", "flashcards", "questions"]) {
      if (!Array.isArray(chapter[key])) errors.push(`${label} ${key} must be an array.`)
    }
    for (const key of ["vocabulary", "mustKnow", "commonConfusions", "reviewQuestions", "flashcardIds", "quizIds"]) {
      if (Array.isArray(chapter[key]) && chapter[key].some((item) => !nonEmpty(item))) errors.push(`${label} ${key} must contain non-empty text values.`)
    }
    if (!Array.isArray(chapter.flashcards) || !Array.isArray(chapter.questions)) continue
    if (chapter.flashcards.length > 100 || chapter.questions.length > 100) errors.push(`${label} exceeds the item limit.`)
    const itemIds = new Set()
    const checkItem = (item, itemIndex, kind) => {
      const itemLabel = `${label} ${kind} ${itemIndex + 1}`
      if (!isRecord(item)) { errors.push(`${itemLabel} must be an object.`); return }
      validateString(item.id, `${itemLabel} id`, errors, 200)
      if (nonEmpty(item.id)) {
        if (itemIds.has(item.id)) errors.push(`${label} has duplicate content id ${item.id}.`)
        itemIds.add(item.id)
      }
      if (item.chapterId !== chapter.id) errors.push(`${itemLabel} is linked to a different chapter.`)
      if (kind === "flashcard") {
        validateString(item.front, `${itemLabel} front`, errors)
        validateString(item.back, `${itemLabel} back`, errors)
      } else {
        validateString(item.prompt, `${itemLabel} prompt`, errors)
        validateString(item.correctAnswer, `${itemLabel} correct answer`, errors, 2000)
        if (item.options !== undefined) {
          if (!Array.isArray(item.options) || item.options.length < 2 || item.options.some((option) => !nonEmpty(option)) || !item.options.includes(item.correctAnswer)) errors.push(`${itemLabel} options are invalid.`)
          else if (new Set(item.options).size !== item.options.length) errors.push(`${itemLabel} options must be unique.`)
        }
      }
    }
    chapter.flashcards.forEach((item, itemIndex) => checkItem(item, itemIndex, "flashcard"))
    chapter.questions.forEach((item, itemIndex) => checkItem(item, itemIndex, "question"))
  }
}

export function validateStudyState(studyState) {
  const errors = []
  if (!isRecord(studyState)) return ["Study data must be an object."]
  const treeCounter = { count: 0, overflow: false }
  validateJsonTree(studyState, errors, 0, treeCounter)
  if (studyState.uiVersion !== 2) errors.push("Study data must use the supported app data version (2).")
  validateImportedChapters(studyState.importedChapters, errors)
  for (const key of ["practiceProgress", "chapterProgress", "flashcardProgress", "quizHistory", "anatomyProgress"]) {
    if (!isRecord(studyState[key])) errors.push(`${key} must be an object.`)
  }
  for (const [chapterId, entry] of Object.entries(studyState.chapterProgress ?? {})) {
    if (!isRecord(entry)) errors.push(`Chapter progress for ${chapterId} must be an object.`)
    else {
      if (entry.completed !== undefined && typeof entry.completed !== "boolean") errors.push(`Chapter progress for ${chapterId} has an invalid completion value.`)
      if (entry.confidence !== undefined && !["needs-review", "steady", "ready"].includes(entry.confidence)) errors.push(`Chapter progress for ${chapterId} has an invalid confidence value.`)
    }
  }
  for (const [key, status] of Object.entries(studyState.flashcardProgress ?? {})) {
    if (!nonEmpty(key) || !["known", "review"].includes(status)) errors.push(`Flashcard progress for ${key} has an invalid status.`)
  }
  for (const group of ["practiceProgress", "quizHistory"]) {
    for (const [key, entry] of Object.entries(studyState[group] ?? {})) {
      if (!nonEmpty(key) || !isRecord(entry)) errors.push(`${group} entries must be named objects.`)
      else validateProgressEntry(group, key, entry, errors)
    }
  }
  if (studyState.engineQuizHistory !== undefined) {
    if (!isRecord(studyState.engineQuizHistory)) errors.push("engineQuizHistory must be an object.")
    else for (const [key, entry] of Object.entries(studyState.engineQuizHistory)) {
      if (!nonEmpty(key) || !isRecord(entry)) errors.push("Engine quiz entries must be named objects.")
      else validateProgressEntry("engineQuizHistory", key, entry, errors)
    }
  }
  const anatomy = studyState.anatomyProgress
  if (isRecord(anatomy)) {
    for (const key of ["recall", "quizHistory", "typedHistory", "weakSpots"]) {
      if (!isRecord(anatomy[key])) errors.push(`Anatomy ${key} progress must be an object.`)
    }
    for (const [key, status] of Object.entries(anatomy.recall ?? {})) {
      if (!nonEmpty(key) || !["known", "review", "missed"].includes(status)) errors.push(`Anatomy recall status for ${key} is invalid.`)
    }
    for (const group of ["quizHistory", "typedHistory", "weakSpots"]) {
      for (const [key, entry] of Object.entries(anatomy[group] ?? {})) {
        if (!nonEmpty(key) || !isRecord(entry)) errors.push(`Anatomy ${group} entries must be named objects.`)
        else if (group === "weakSpots") {
          if (!Number.isInteger(entry.misses) || entry.misses < 0 || entry.misses > 1_000_000) errors.push(`Anatomy weak spot ${key} has an invalid miss count.`)
          if (entry.sources !== undefined && (!isRecord(entry.sources) || Object.values(entry.sources).some((count) => !Number.isInteger(count) || count < 0 || count > 1_000_000))) errors.push(`Anatomy weak spot ${key} has invalid source counts.`)
        } else validateProgressEntry(`anatomy ${group}`, key, entry, errors)
      }
    }
  }
  if (!isRecord(studyState.atlasNotebook)) errors.push("atlasNotebook must be an object.")
  else {
    const notebook = studyState.atlasNotebook
    if (!Array.isArray(notebook.bookmarks)) errors.push("Bookmarks must be an array.")
    else {
      if (notebook.bookmarks.length > 500) errors.push("Backup contains too many saved structures.")
      notebook.bookmarks.forEach((bookmark, index) => {
        const label = `Bookmark ${index + 1}`
        if (!isRecord(bookmark)) { errors.push(`${label} must be an object.`); return }
        validateString(bookmark.id, `${label} id`, errors, 200)
        validateString(bookmark.name, `${label} name`, errors, 500)
        if (!Array.isArray(bookmark.elements) || bookmark.elements.some((id) => !nonEmpty(id))) errors.push(`${label} elements must be an array of ids.`)
        if (bookmark.system !== undefined) validateString(bookmark.system, `${label} system`, errors, 200)
      })
    }
    if (!isRecord(notebook.notes)) errors.push("Notebook notes must be an object.")
    else for (const [id, note] of Object.entries(notebook.notes)) {
      if (!nonEmpty(id) || typeof note !== "string" || note.length > 2000) errors.push(`Notebook note for ${id} must be text up to 2,000 characters.`)
    }
    if (!Array.isArray(notebook.results)) errors.push("Notebook results must be an array.")
    else {
      if (notebook.results.length > 100) errors.push("Backup contains too many anatomy challenge results.")
      notebook.results.forEach((result, index) => {
        const label = `Anatomy result ${index + 1}`
        if (!isRecord(result)) { errors.push(`${label} must be an object.`); return }
        validateString(result.id, `${label} id`, errors, 200)
        validateString(result.name, `${label} name`, errors, 500)
        if (!["hunt", "recall"].includes(result.mode)) errors.push(`${label} has an invalid mode.`)
        if (typeof result.correct !== "boolean") errors.push(`${label} must contain a correct/incorrect result.`)
        if (typeof result.response !== "string" || result.response.length > 2000) errors.push(`${label} response must be text up to 2,000 characters.`)
        if (typeof result.at !== "string" || Number.isNaN(Date.parse(result.at))) errors.push(`${label} timestamp is invalid.`)
      })
    }
  }
  if (!nonEmpty(studyState.activeSection)) errors.push("Active section is missing.")
  if (!nonEmpty(studyState.selectedChapterId)) errors.push("Selected chapter is missing.")
  return [...new Set(errors)]
}

function validateProgressEntry(group, key, entry, errors) {
  for (const field of ["attempts", "bestPercent", "lastPercent", "percent", "correctCount", "totalQuestions", "bestSpellingPercent", "lastSpellingPercent"]) {
    if (entry[field] === undefined) continue
    const value = entry[field]
    const isPercent = field.toLowerCase().includes("percent")
    if (!Number.isInteger(value) || value < 0 || value > (isPercent ? 100 : 1_000_000)) errors.push(`${group} entry ${key} has an invalid ${field}.`)
  }
  if (entry.misses !== undefined) {
    if (!Array.isArray(entry.misses)) errors.push(`${group} entry ${key} misses must be an array.`)
    else for (const [index, miss] of entry.misses.entries()) {
      const label = `${group} entry ${key} miss ${index + 1}`
      if (!isRecord(miss)) { errors.push(`${label} must be an object.`); continue }
      validateString(miss.questionId, `${label} question id`, errors, 200)
      validateString(miss.prompt, `${label} prompt`, errors, 12_000)
      validateString(miss.correctAnswer, `${label} correct answer`, errors, 2_000)
      if (typeof miss.response !== "string" || miss.response.length > 12_000) errors.push(`${label} response must be text.`)
      if (miss.correct !== false) errors.push(`${label} must represent an incorrect answer.`)
    }
  }
}

export function createStudyBackup(studyState) {
  const errors = validateStudyState(studyState)
  if (errors.length) throw new Error(errors.join(" "))
  return {
    format: STUDY_BACKUP_FORMAT,
    version: STUDY_BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    studyState,
  }
}

export function parseStudyBackup(text) {
  if (typeof text !== "string") throw new Error("The selected backup could not be read as text.")
  if (new TextEncoder().encode(text).byteLength > MAX_STUDY_BACKUP_BYTES) throw new Error("Choose a backup smaller than 5 MB.")
  let backup
  try { backup = JSON.parse(text) } catch { throw new Error("This backup is not valid JSON.") }
  const treeErrors = []
  validateJsonTree(backup, treeErrors)
  if (treeErrors.length) throw new Error(treeErrors[0])
  if (!isRecord(backup) || backup.format !== STUDY_BACKUP_FORMAT) throw new Error("This file is not an Amelia’s Study Buddy backup.")
  if (!Number.isInteger(backup.version) || backup.version < 1) throw new Error("This backup version is invalid.")
  if (backup.version > STUDY_BACKUP_VERSION) throw new Error(`This backup uses a newer format (version ${backup.version}) that this app cannot restore yet.`)
  const errors = validateStudyState(backup.studyState)
  if (errors.length) throw new Error(errors.join(" "))
  return backup.studyState
}

export function summarizeStudyState(studyState) {
  const importedChapters = Array.isArray(studyState?.importedChapters) ? studyState.importedChapters.length : 0
  const progressKeys = ["practiceProgress", "chapterProgress", "flashcardProgress", "quizHistory", "anatomyProgress"]
  const progressEntries = progressKeys.reduce((count, key) => count + Object.values(studyState?.[key] ?? {}).filter((value) => value != null).length, 0)
  const notebook = studyState?.atlasNotebook ?? {}
  const bookmarks = Array.isArray(notebook.bookmarks) ? notebook.bookmarks.length : 0
  const notes = isRecord(notebook.notes) ? Object.values(notebook.notes).filter((value) => typeof value === "string" && value.trim()).length : 0
  return { importedChapters, progressEntries, bookmarks, notes }
}
