import { makeAutoObservable } from "mobx"

class GuideManager {
  private static instance: GuideManager
  private readonly STORAGE_PREFIX = "mo_guide_"
  
  // 添加响应式状态
  private hiddenGuides: Set<string> = new Set()

  private constructor() {
    makeAutoObservable(this)
    this.initializeState()
  }

  private initializeState() {
    // 从 localStorage 初始化状态
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(this.STORAGE_PREFIX) && localStorage.getItem(key) === "hidden") {
        this.hiddenGuides.add(key.replace(this.STORAGE_PREFIX, ""))
      }
    })
  }

  public static getInstance(): GuideManager {
    if (!GuideManager.instance) {
      GuideManager.instance = new GuideManager()
    }
    return GuideManager.instance
  }

  shouldShowGuide(guideId: string): boolean {
    return !this.hiddenGuides.has(guideId)
  }

  hideGuide(guideId: string) {
    // 同时更新 localStorage 和响应式状态
    localStorage.setItem(this.STORAGE_PREFIX + guideId, "hidden")
    this.hiddenGuides.add(guideId)
  }

  resetGuide(guideId: string) {
    localStorage.removeItem(this.STORAGE_PREFIX + guideId)
    this.hiddenGuides.delete(guideId)
  }

  resetAllGuides() {
    const keys = Object.keys(localStorage)
    keys.forEach((key) => {
      if (key.startsWith(this.STORAGE_PREFIX)) {
        localStorage.removeItem(key)
      }
    })
    this.hiddenGuides.clear()
  }
}

export const guideManager = GuideManager.getInstance()