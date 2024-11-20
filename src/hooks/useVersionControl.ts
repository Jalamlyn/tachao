import { useState, useCallback } from "react"

interface Version<T> {
  data: T
  timestamp: number
}

export function useVersionControl<T>(initialData?: T) {
  const [versions, setVersions] = useState<Version<T>[]>(
    initialData ? [{ data: initialData, timestamp: Date.now() }] : []
  )
  const [currentIndex, setCurrentIndex] = useState(initialData ? 0 : -1)

  const addVersion = useCallback((newData: T) => {
    setVersions((prev) => [...prev.slice(0, currentIndex + 1), { data: newData, timestamp: Date.now() }])
    setCurrentIndex((prev) => prev + 1)
  }, [currentIndex])

  const rollback = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
      return versions[currentIndex - 1].data
    }
    return null
  }, [currentIndex, versions])

  const forward = useCallback(() => {
    if (currentIndex < versions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      return versions[currentIndex + 1].data
    }
    return null
  }, [currentIndex, versions])

  return {
    addVersion,
    rollback,
    forward,
    getCurrentVersion: useCallback(() => {
      if (currentIndex >= 0 && versions[currentIndex]) {
        return versions[currentIndex].data
      }
      return null
    }, [currentIndex, versions]),
    hasHistory: currentIndex > 0,
    canRollback: currentIndex > 0,
    canForward: currentIndex < versions.length - 1,
    versions,
    currentIndex,
  }
}