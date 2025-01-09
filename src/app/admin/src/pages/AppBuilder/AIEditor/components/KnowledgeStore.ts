interface KnowledgeItem {
  id: string
  title: string
  content: string
  createdAt: number
  updatedAt: number
}

class KnowledgeStore {
  private static instance: KnowledgeStore
  private _knowledge: Record<string, KnowledgeItem> = {}
  private readonly STORAGE_KEY = "mo_knowledge_store"

  private constructor() {
    this.loadFromStorage()
  }

  public static getInstance(): KnowledgeStore {
    if (!KnowledgeStore.instance) {
      KnowledgeStore.instance = new KnowledgeStore()
    }
    return KnowledgeStore.instance
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        this._knowledge = JSON.parse(stored)
      }
    } catch (error) {
      console.error("Error loading knowledge from storage:", error)
      this._knowledge = {}
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this._knowledge))
    } catch (error) {
      console.error("Error saving knowledge to storage:", error)
    }
  }

  // 新增：生成唯一ID的方法
  generateId(prefix: string = 'k'): string {
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    return `${prefix}-${timestamp}-${randomStr}`
  }

  get knowledge(): Record<string, KnowledgeItem> {
    return this._knowledge
  }

  get knowledgeList(): KnowledgeItem[] {
    return Object.values(this._knowledge).sort((a, b) => b.updatedAt - a.updatedAt)
  }

  addKnowledge(id: string | null, title: string, content: string) {
    const timestamp = Date.now()
    const actualId = id || this.generateId()
    this._knowledge[actualId] = {
      id: actualId,
      title,
      content,
      createdAt: timestamp,
      updatedAt: timestamp,
    }
    this.saveToStorage()
    return actualId
  }

  updateKnowledge(id: string, updates: Partial<KnowledgeItem>) {
    if (this._knowledge[id]) {
      this._knowledge[id] = {
        ...this._knowledge[id],
        ...updates,
        updatedAt: Date.now(),
      }
      this.saveToStorage()
    }
  }

  removeKnowledge(id: string) {
    delete this._knowledge[id]
    this.saveToStorage()
  }

  clear() {
    this._knowledge = {}
    this.saveToStorage()
  }

  getKnowledgeContext(): string {
    return this.knowledgeList
      .map(
        (item) => `
知识ID: ${item.id}
标题: ${item.title}
内容:
${item.content}
`
      )
      .join("\n---\n")
  }

  searchKnowledge(query: string): KnowledgeItem[] {
    const lowercaseQuery = query.toLowerCase()
    return this.knowledgeList.filter(
      (item) => item.title.toLowerCase().includes(lowercaseQuery) || item.content.toLowerCase().includes(lowercaseQuery)
    )
  }
}

export const knowledgeStore = KnowledgeStore.getInstance()