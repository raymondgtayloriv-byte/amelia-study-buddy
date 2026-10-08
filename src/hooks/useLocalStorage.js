import { useCallback, useRef, useState } from "react"
export function useLocalStorage(key, initialValue, normalize = value => value) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return normalize(item ? JSON.parse(item) : initialValue)
    } catch { return initialValue }
  })
  const current = useRef(storedValue)
  const [storageError, setStorageError] = useState("")
  const update = useCallback(value => {
    const next = typeof value === "function" ? value(current.current) : value
    current.current = next
    try {
      window.localStorage.setItem(key, JSON.stringify(next))
      setStorageError("")
    } catch {
      setStorageError("Your changes are in memory, but this browser could not save them. Export a backup in Add chapters before closing this page.")
    }
    setStoredValue(next)
  }, [key])
  return [storedValue, update, storageError]
}
