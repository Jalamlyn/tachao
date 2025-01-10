import { makeAutoObservable } from "mobx"

class GuideManager {
  private static instance: GuideManager
  private readonly STORAGE_PREFIX = "mo_guide_"

  private constructor() {
    makeAutoObservable(this)
  }

  public static getInstance(): GuideManager {
    if (!GuideManager.instance) {
      GuideManager.instance = new GuideManager()
    }
    return GuideManager.instance
  }

  shouldShowGuide(guideId: string): boolean {
    return localStorage.getItem(this.STORAGE_PREFIX + guideId) !== "hidden"
  }

  hideGuide(guideId: string) {
    localStorage.setItem(this.STORAGE_PREFIX + guideId, "hidden")
  }

  resetGuide(guideId: string) {
    localStorage.removeItem(this.STORAGE_PREFIX + guideId)
  }

  resetAllGuides() {
    const keys = Object.keys(localStorage)
    keys.forEach((key) => {
      if (key.startsWith(this.STORAGE_PREFIX)) {
        localStorage.removeItem(key)
      }
    })
  }
}

export const guideManager = GuideManager.getInstance()
