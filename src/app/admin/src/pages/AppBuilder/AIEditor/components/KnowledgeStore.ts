import { makeAutoObservable, runInAction } from "mobx"
import localforage from "localforage"

interface KnowledgeItem {
  id: string
  title: string
  content: string
  createdAt: number
  updatedAt: number
  isSelected: boolean
}

class KnowledgeStore {
  private static instance: KnowledgeStore
  private readonly STORAGE_KEY = "mo_knowledge_store"
  private readonly MAX_CONTEXT_SIZE = 100 * 1024 // 100KB限制

  knowledge: Record<string, KnowledgeItem> = {}

  private constructor() {
    makeAutoObservable(this)
    this.initLocalForage()
    this.loadFromStorage()
  }

  private initLocalForage() {
    localforage.config({
      name: 'MoKnowledge',
      storeName: 'knowledge',
      description: 'Storage for Mo AI knowledge base'
    })
  }

  public static getInstance(): KnowledgeStore {
    if (!KnowledgeStore.instance) {
      KnowledgeStore.instance = new KnowledgeStore()
    }
    return KnowledgeStore.instance
  }

  private async loadFromStorage() {
    try {
      const stored = await localforage.getItem<Record<string, KnowledgeItem>>(this.STORAGE_KEY)
      if (stored) {
        runInAction(() => {
          this.knowledge = stored
        })
      }
    } catch (error) {
      console.error("Error loading knowledge from storage:", error)
      runInAction(() => {
        this.knowledge = {}
      })
    }
  }

  private async saveToStorage() {
    try {
      await localforage.setItem(this.STORAGE_KEY, this.knowledge)
    } catch (error) {
      console.error("Error saving knowledge to storage:", error)
      throw error
    }
  }

  get knowledgeList() {
    return Object.values(this.knowledge).sort((a, b) => b.updatedAt - a.updatedAt)
  }

  get selectedKnowledgeSize() {
    return Object.values(this.knowledge)
      .filter((item) => item.isSelected)
      .reduce((total, item) => total + new Blob([item.title, item.content]).size, 0)
  }

  get sizeLimit() {
    return this.MAX_CONTEXT_SIZE
  }

  get isOverSizeLimit() {
    return this.selectedKnowledgeSize > this.MAX_CONTEXT_SIZE
  }

  private generateId(): string {
    return `k-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
  }

  async addKnowledge(id: string | null, title: string, content: string) {
    const timestamp = Date.now()
    const actualId = id || this.generateId()

    runInAction(() => {
      this.knowledge[actualId] = {
        id: actualId,
        title,
        content,
        createdAt: timestamp,
        updatedAt: timestamp,
        isSelected: false,
      }
    })

    await this.saveToStorage()
    return actualId
  }

  async updateKnowledge(id: string, updates: Partial<KnowledgeItem>) {
    if (this.knowledge[id]) {
      runInAction(() => {
        this.knowledge[id] = {
          ...this.knowledge[id],
          ...updates,
          updatedAt: Date.now(),
        }
      })
      await this.saveToStorage()
    }
  }

  async toggleKnowledgeSelection(id: string): Promise<boolean> {
    const item = this.knowledge[id]
    if (!item) return false

    const newIsSelected = !item.isSelected
    if (newIsSelected) {
      const newSize = this.selectedKnowledgeSize + new Blob([item.title, item.content]).size
      if (newSize > this.MAX_CONTEXT_SIZE) {
        return false
      }
    }

    runInAction(() => {
      this.knowledge[id] = {
        ...item,
        isSelected: newIsSelected,
        updatedAt: Date.now(),
      }
    })
    
    await this.saveToStorage()
    return true
  }

  async removeKnowledge(id: string) {
    runInAction(() => {
      delete this.knowledge[id]
    })
    await this.saveToStorage()
  }

  searchKnowledge(query: string): KnowledgeItem[] {
    const lowercaseQuery = query.toLowerCase()
    return this.knowledgeList.filter(
      (item) => item.title.toLowerCase().includes(lowercaseQuery) || item.content.toLowerCase().includes(lowercaseQuery)
    )
  }

  getKnowledgeContext(): string {
    const selectedKnowledge = Object.values(this.knowledge).filter((item) => item.isSelected)

    if (this.isOverSizeLimit) {
      return "警告：选中的知识内容超过大小限制（100KB），请取消选择一些知识。"
    }

    return selectedKnowledge
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

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB"
    return (bytes / (1024 * 1024)).toFixed(2) + " MB"
  }
}

export const knowledgeStore = KnowledgeStore.getInstance()