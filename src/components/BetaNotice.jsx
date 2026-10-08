import { useState } from "react"
import { X } from "lucide-react"

const KEY = "study-buddy-beta-notice-dismissed"

function wasDismissed() {
  try { return window.localStorage.getItem(KEY) === "1" } catch { return false }
}

export function BetaNotice() {
  const [open, setOpen] = useState(() => !wasDismissed())
  if (!open) return null
  function dismiss() {
    try { window.localStorage.setItem(KEY, "1") } catch { /* private mode: dismiss for this visit only */ }
    setOpen(false)
  }
  return (
    <aside className="beta-notice" role="note" aria-label="Beta preview notice">
      <div>
        <strong>Study Buddy — Beta Preview</strong>
        <p>This app is still growing! Some course chapters and study activities are being added or refined. Your progress is saved in this browser. For assignments and exams, always follow your instructor's course materials.</p>
      </div>
      <button type="button" className="beta-notice-close" onClick={dismiss} aria-label="Dismiss beta notice"><X size={16} aria-hidden="true" /></button>
    </aside>
  )
}
