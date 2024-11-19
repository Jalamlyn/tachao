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
    setVersions((prev) => [...prev, { data: newData, timestamp: Date.now() }])
    setCurrentIndex((prev) => prev + 1)
  }, [])

  const rollback = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
      return versions[currentIndex - 1].data
    }
    return null
  }, [currentIndex, versions])

  const getCurrentVersion = useCallback(() => {
    if (currentIndex >= 0 && versions[currentIndex]) {
      return versions[currentIndex].data
    }
    return null
  }, [currentIndex, versions])

  return {
    addVersion,
    rollback,
    getCurrentVersion,
    hasHistory: currentIndex > 0,
    versions,
    currentIndex,
  }
}
