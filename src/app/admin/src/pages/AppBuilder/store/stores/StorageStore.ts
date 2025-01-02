import { BaseStore } from "./BaseStore"
import { Version } from "../types"

export class StorageStore extends BaseStore {
  private readonly STORAGE_KEY = "appCode"

  saveToStorage(version: Version) {
    try {
      if (!this.appId) return

      localStorage.setItem(`${this.getStorageKey(this.STORAGE_KEY)}_app`, JSON.stringify(version.app))

      Object.entries(version.modules).forEach(([moduleId, moduleData]) => {
        localStorage.setItem(`${this.getStorageKey(this.STORAGE_KEY)}_module_${moduleId}`, JSON.stringify(moduleData))
      })

      localStorage.setItem(
        `${this.getStorageKey(this.STORAGE_KEY)}_versions`,
        JSON.stringify({
          versions: [{
            timestamp: version.timestamp,
            moduleIds: Object.keys(version.modules),
          }],
          currentIndex: 0,
        })
      )
    } catch (error) {
      console.error("Error saving to storage:", error)
    }
  }

  loadFromStorage(): Version | null {
    try {
      if (!this.appId) return null

      const versionsData = localStorage.getItem(`${this.getStorageKey(this.STORAGE_KEY)}_versions`)
      if (!versionsData) return null

      const { versions, currentIndex } = JSON.parse(versionsData)

      const appData = localStorage.getItem(`${this.getStorageKey(this.STORAGE_KEY)}_app`)
      if (!appData) return null

      const currentVersion = versions[currentIndex]
      const modules = {}

      for (const moduleId of currentVersion.moduleIds) {
        const moduleData = localStorage.getItem(`${this.getStorageKey(this.STORAGE_KEY)}_module_${moduleId}`)
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

  clearStorage() {
    if (!this.appId) return

    const keys = Object.keys(localStorage)
    const prefix = `${this.STORAGE_KEY}_${this.appId}`
    keys.forEach((key) => {
      if (key.startsWith(prefix)) {
        localStorage.removeItem(key)
      }
    })
  }
}