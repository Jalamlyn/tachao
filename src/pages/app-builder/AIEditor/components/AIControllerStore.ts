class AIControllerStore {
  private static instance: AIControllerStore
  private _controller: AbortController | null = null

  private constructor() {}

  public static getInstance(): AIControllerStore {
    if (!AIControllerStore.instance) {
      AIControllerStore.instance = new AIControllerStore()
    }
    return AIControllerStore.instance
  }

  get controller(): AbortController | null {
    return this._controller
  }

  setController(controller: AbortController) {
    this._controller = controller
  }

  abort() {
    if (this._controller) {
      this._controller.abort()
      this._controller = null
    }
  }

  clear() {
    this._controller = null
  }
}

export const aiControllerStore = AIControllerStore.getInstance()