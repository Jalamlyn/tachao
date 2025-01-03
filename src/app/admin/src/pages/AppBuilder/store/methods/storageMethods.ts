import { AppCodeStore, Version } from "../types"

const STORAGE_KEY = "appCode"

export function saveToStorage(this: AppCodeStore) {
  try {
    const appId = this.appId
    if (!appId) return

    localStorage.setItem(`${STORAGE_KEY}_${appId}_app`, JSON.stringify(this.currentVersion?.app))

    Object.entries(this.currentVersion?.modules || {}).forEach(([moduleId, moduleData]) => {
      localStorage.setItem(`${STORAGE_KEY}_${appId}_module_${moduleId}`, JSON.stringify(moduleData))
    })

    localStorage.setItem(
      `${STORAGE_KEY}_${appId}_versions`,
      JSON.stringify({
        versions: this.versions.map((v) => ({
          timestamp: v.timestamp,
          moduleIds: Object.keys(v.modules),
        })),
        currentIndex: this.currentIndex,
      })
    )
  } catch (error) {
    console.error("Error saving to storage:", error)
  }
}

export function loadFromStorage(this: AppCodeStore): Version | null {
  try {
    const appId = this.appId
    if (!appId) return null

    const versionsData = localStorage.getItem(`${STORAGE_KEY}_${appId}_versions`)
    if (!versionsData) return null

    const { versions, currentIndex } = JSON.parse(versionsData)

    const appData = localStorage.getItem(`${STORAGE_KEY}_${appId}_app`)
    if (!appData) return null

    const currentVersion = versions[currentIndex]
    const modules = {}

    for (const moduleId of currentVersion.moduleIds) {
      const moduleData = localStorage.getItem(`${STORAGE_KEY}_${appId}_module_${moduleId}`)
      if (moduleData) {
        modules[moduleId] = JSON.parse(moduleData)
      }
    }

    return {
      timestamp: currentVersion.timestamp,
      app: JSON.parse(appData),
      modules,
    }
  } catch (error) {
    console.error("Error loading from storage:", error)
    return null
  }
}

export function clearStorage(this: AppCodeStore) {
  if (!this.appId) return

  const keys = Object.keys(localStorage)
  const prefix = `${STORAGE_KEY}_${this.appId}`
  keys.forEach((key) => {
    if (key.startsWith(prefix)) {
      localStorage.removeItem(key)
    }
  })
}
