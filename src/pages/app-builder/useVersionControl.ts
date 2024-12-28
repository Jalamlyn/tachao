import { codeStore } from "@/pages/form-temp-manager/components/codeStore"
import { useState, useCallback, useRef } from "react"

export interface Version<T> {
  timestamp: number
  data: T
}

export function useVersionControl<T>() {
  const [versions, setVersions] = useState<Version<T>[]>([])
  const [currentIndex, setCurrentIndex] = useState<number>(-1)
  const versionsRef = useRef(versions)
  const currentIndexRef = useRef(currentIndex)

  const canRollback = currentIndex > 0
  const canForward = currentIndex < versions.length - 1

  const addVersion = useCallback((data: T) => {
    const newVersion: Version<T> = {
      timestamp: Date.now(),
      data,
    }
    // 使用 push 添加新版本到数组末尾
    setVersions((prev) => [...prev, newVersion])
    versionsRef.current = [...versionsRef.current, newVersion]
    // 设置当前索引为最新版本的索引
    setCurrentIndex((prev) => prev + 1)
    currentIndexRef.current = currentIndex + 1
  }, [])

  const getCurrentVersion = useCallback(() => {
    if (currentIndexRef.current >= 0 && currentIndexRef.current < versionsRef.current.length) {
      return versionsRef.current[currentIndexRef.current].data
    }
    return null
  }, [])

  const getVersion = useCallback(
    (index: number) => {
      if (index >= 0 && index < versions.length) {
        return versions[index].data
      }
      return null
    },
    [versions]
  )

  const rollback = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
      codeStore.code = versions[currentIndex - 1].data.rawConfig
      return versions[currentIndex - 1].data
    }
    return null
  }, [versions, currentIndex])

  const forward = useCallback(() => {
    if (currentIndex < versions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      codeStore.code = versions[currentIndex + 1].data.rawConfig
      return versions[currentIndex + 1].data
    }
    return null
  }, [versions, currentIndex])

  const getVersionInfo = useCallback(
    (index: number) => {
      if (index >= 0 && index < versions.length) {
        return {
          timestamp: versions[index].timestamp,
          isLatest: index === versions.length - 1,
          isCurrent: index === currentIndex,
        }
      }
      return null
    },
    [versions, currentIndex]
  )

  const clear = useCallback(() => {
    setVersions([])
    setCurrentIndex(-1)
  }, [])

  return {
    versions,
    currentIndex,
    addVersion,
    getCurrentVersion,
    setCurrentIndex,
    getVersion,
    rollback,
    forward,
    getVersionInfo,
    clear,
    canRollback,
    canForward,
  }
}
