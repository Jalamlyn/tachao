class KnowledgeStore {
  private static instance: KnowledgeStore
  private _knowledge: Record<string, string> = {}

  private constructor() {}

  public static getInstance(): KnowledgeStore {
    if (!KnowledgeStore.instance) {
      KnowledgeStore.instance = new KnowledgeStore()
    }
    return KnowledgeStore.instance
  }

  get knowledge(): Record<string, string> {
    return this._knowledge
  }

  addKnowledge(id: string, content: string) {
    this._knowledge[id] = content
  }

  removeKnowledge(id: string) {
    delete this._knowledge[id]
  }

  clear() {
    this._knowledge = {}
  }

  getKnowledgeContext(): string {
    return Object.entries(this._knowledge)
      .map(([id, content]) => `
知识ID: ${id}
内容:
${content}
`)
      .join('\n---\n')
  }
}

export const knowledgeStore = KnowledgeStore.getInstance()