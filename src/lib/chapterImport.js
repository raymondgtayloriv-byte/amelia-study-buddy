export const MAX_CHAPTER_FILE_BYTES = 2 * 1024 * 1024

const isRecord = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value)

const nonEmpty = (value) =>
  typeof value === "string" && value.trim().length > 0

function exactKeys(value, allowed, required, label, errors) {
  if (!isRecord(value)) {
    errors.push(`${label} must be an object.`)
    return false
  }
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) errors.push(`${label} has an unsupported field: ${key}.`)
  }
  for (const key of required) {
    if (!(key in value)) errors.push(`${label} is missing ${key}.`)
  }
  return true
}

function validateString(value, label, errors, max = 12000) {
  if (!nonEmpty(value)) errors.push(`${label} must be a non-empty string.`)
  else if (value.length > max) errors.push(`${label} must be ${max} characters or fewer.`)
}

function validatePack(pack) {
  const errors = []
  const allowed = ["id", "number", "title", "summary", "notes", "flashcards", "questions"]
  if (!exactKeys(pack, allowed, ["id", "number", "title", "flashcards", "questions"], "Chapter pack", errors)) {
    return errors
  }
  validateString(pack.id, "Chapter id", errors, 100)
  if (nonEmpty(pack.id) && !/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(pack.id)) {
    errors.push("Chapter id may contain only letters, numbers, periods, underscores, and hyphens.")
  }
  if (!Number.isInteger(pack.number) || pack.number < 1 || pack.number > 999) {
    errors.push("Chapter number must be a whole number from 1 to 999.")
  }
  validateString(pack.title, "Chapter title", errors, 200)
  if ("summary" in pack) validateString(pack.summary, "Summary", errors, 2000)
  if ("notes" in pack) validateString(pack.notes, "Notes", errors, 50000)
  if (!Array.isArray(pack.flashcards)) errors.push("Flashcards must be an array.")
  if (!Array.isArray(pack.questions)) errors.push("Questions must be an array.")

  const ids = new Set()
  const checkId = (id, label) => {
    validateString(id, `${label} id`, errors, 120)
    if (nonEmpty(id)) {
      if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(id)) errors.push(`${label} id contains unsupported characters.`)
      if (ids.has(id)) errors.push(`Duplicate item id: ${id}.`)
      ids.add(id)
    }
  }

  if (Array.isArray(pack.flashcards)) {
    pack.flashcards.forEach((card, index) => {
      const label = `Flashcard ${index + 1}`
      if (!exactKeys(card, ["id", "category", "front", "back", "note"], ["id", "front", "back"], label, errors)) return
      checkId(card.id, label)
      validateString(card.front, `${label} front`, errors)
      validateString(card.back, `${label} back`, errors)
      if ("category" in card) validateString(card.category, `${label} category`, errors, 200)
      if ("note" in card) validateString(card.note, `${label} note`, errors, 2000)
    })
  }
  if (Array.isArray(pack.questions)) {
    pack.questions.forEach((question, index) => {
      const label = `Question ${index + 1}`
      if (!exactKeys(question, ["id", "prompt", "options", "correctAnswer", "explanation"], ["id", "prompt", "options", "correctAnswer"], label, errors)) return
      checkId(question.id, label)
      validateString(question.prompt, `${label} prompt`, errors)
      validateString(question.correctAnswer, `${label} correctAnswer`, errors, 2000)
      if (!Array.isArray(question.options) || question.options.length < 2 || question.options.length > 8) {
        errors.push(`${label} options must contain 2 to 8 answers.`)
      } else {
        question.options.forEach((option, optionIndex) => validateString(option, `${label} option ${optionIndex + 1}`, errors, 2000))
        const distinctOptions = new Set(question.options.filter(nonEmpty).map((option) => option.trim()))
        if (distinctOptions.size !== question.options.length) errors.push(`${label} options must be unique.`)
        if (!question.options.includes(question.correctAnswer)) errors.push(`${label} correctAnswer must exactly match one of its options.`)
      }
      if ("explanation" in question) validateString(question.explanation, `${label} explanation`, errors, 4000)
    })
  }
  if (Array.isArray(pack.flashcards) && pack.flashcards.length > 100) errors.push("A chapter pack can include at most 100 flashcards.")
  if (Array.isArray(pack.questions) && pack.questions.length > 100) errors.push("A chapter pack can include at most 100 questions.")
  return errors
}

function makeChapterId(title, number) {
  const slug = title.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "chapter"
  return `imported-${slug}-ch${number}`
}

function makeChapter({ id, number, title, sourceLabel, sourceType, summary, notes, flashcards, questions }) {
  const noteText = notes ?? ""
  const detailSummary = summary || (noteText ? noteText : `Imported chapter ${number}: ${title}.`)
  return {
    id,
    number,
    title,
    sourceLabel,
    sourceType,
    status: "ready",
    summary: summary || `Imported ${sourceType} chapter notes.`,
    detailSummary,
    vocabulary: [],
    mustKnow: [],
    commonConfusions: [],
    reviewQuestions: [],
    flashcardIds: flashcards.map((card) => card.id),
    quizIds: questions.map((question) => question.id),
    notes: noteText,
    flashcards,
    questions,
  }
}

export function parseChapterImport({ fileName, sourceLabel: originalSourceLabel, text, number, title, sourceType }) {
  if (typeof text !== "string") throw new Error("The selected file could not be read as text.")
  if (new TextEncoder().encode(text).byteLength > MAX_CHAPTER_FILE_BYTES) throw new Error("Choose a file smaller than 2 MB.")
  if (!["course", "supplemental"].includes(sourceType)) throw new Error("Choose course material or supplemental material.")
  const extension = fileName?.toLowerCase().split(".").pop()
  const sourceLabel = typeof originalSourceLabel === "string" && originalSourceLabel.length
    ? originalSourceLabel
    : fileName?.trim() || "Imported notes"

  if (extension === "txt" || extension === "md") {
    if (!text.trim()) throw new Error("This notes file is empty.")
    if (!Number.isInteger(Number(number)) || Number(number) < 1 || Number(number) > 999) throw new Error("Enter a chapter number from 1 to 999.")
    if (!nonEmpty(title) || title.trim().length > 200) throw new Error("Enter a chapter title of 1 to 200 characters.")
    const chapterNumber = Number(number)
    const noteText = text.replace(/^\uFEFF/, "")
    return makeChapter({
      id: makeChapterId(title.trim(), chapterNumber), number: chapterNumber, title: title.trim(), sourceLabel, sourceType,
      summary: "", notes: noteText, flashcards: [], questions: [],
    })
  }
  if (extension !== "json") throw new Error("Extract this file to notes before parsing it as a chapter.")

  let pack
  try { pack = JSON.parse(text) } catch { throw new Error("This JSON file could not be parsed. Check its commas, quotes, and braces.") }
  const errors = validatePack(pack)
  if (errors.length) throw new Error(errors.slice(0, 8).join(" "))
  const id = `imported-${pack.id}`
  const namespace = `${id}::`
  const flashcards = pack.flashcards.map((card) => ({ ...card, id: namespace + card.id, chapterId: id, category: card.category || pack.title }))
  const questions = pack.questions.map((question) => ({
    ...question, id: namespace + question.id, chapterId: id, type: "multiple-choice",
  }))
  return makeChapter({
    id, number: pack.number, title: pack.title.trim(), sourceLabel, sourceType,
    summary: pack.summary || "", notes: pack.notes || pack.summary || "",
    flashcards, questions,
  })
}

export function chapterImportTemplate() {
  return JSON.stringify({
    id: "chapter-12", number: 12, title: "Chapter title",
    summary: "A short chapter overview.", notes: "Optional full notes.",
    flashcards: [{ id: "card-1", category: "Key ideas", front: "Question or cue", back: "Answer" }],
    questions: [{ id: "question-1", prompt: "Which answer is correct?", options: ["Correct", "Another option"], correctAnswer: "Correct", explanation: "Optional explanation." }],
  }, null, 2)
}
