import { makeAutoObservable, runInAction, computed } from "mobx"

interface KnowledgeItem {
  id: string
  title: string
  content: string
  createdAt: number
  updatedAt: number
}

class KnowledgeStore {
  private static instance: KnowledgeStore
  private readonly STORAGE_KEY = "mo_knowledge_store"

  // 使用 observable 标记响应式数据
  knowledge: Record<string, KnowledgeItem> = {}

  private constructor() {
    makeAutoObservable(this, {
      // 明确指定计算属性
      knowledgeList: computed,
      // 明确指定动作
      addKnowledge: true,
      updateKnowledge: true,
      removeKnowledge: true,
      clear: true
    })
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
        runInAction(() => {
          this.knowledge = JSON.parse(stored)
        })
      }
    } catch (error) {
      console.error("Error loading knowledge from storage:", error)
      runInAction(() => {
        this.knowledge = {}
      })
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.knowledge))
    } catch (error) {
      console.error("Error saving knowledge to storage:", error)
    }
  }

  // 使用计算属性优化派生数据
  get knowledgeList() {
    return Object.values(this.knowledge).sort((a, b) => b.updatedAt - a.updatedAt)
  }

  // 生成唯一ID的方法
  private generateId(prefix: string = 'k'): string {
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    return `${prefix}-${timestamp}-${randomStr}`
  }

  // 添加知识的动作
  addKnowledge(id: string | null, title: string, content: string) {
    const timestamp = Date.now()
    const actualId = id || this.generateId()
    
    runInAction(() => {
      this.knowledge[actualId] = {
        id: actualId,
        title,
        content,
        createdAt: timestamp,
        updatedAt: timestamp,
      }
    })
    
    this.saveToStorage()
    return actualId
  }

  // 更新知识的动作
  updateKnowledge(id: string, updates: Partial<KnowledgeItem>) {
    if (this.knowledge[id]) {
      runInAction(() => {
        this.knowledge[id] = {
          ...this.knowledge[id],
          ...updates,
          updatedAt: Date.now(),
        }
      })
      this.saveToStorage()
    }
  }

  // 删除知识的动作
  removeKnowledge(id: string) {
    runInAction(() => {
      delete this.knowledge[id]
    })
    this.saveToStorage()
  }

  // 清空知识的动作
  clear() {
    runInAction(() => {
      this.knowledge = {}
    })
    this.saveToStorage()
  }

  // 获取知识上下文
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

  // 搜索知识的计算属性方法
  searchKnowledge(query: string): KnowledgeItem[] {
    const lowercaseQuery = query.toLowerCase()
    return this.knowledgeList.filter(
      (item) => item.title.toLowerCase().includes(lowercaseQuery) || 
                item.content.toLowerCase().includes(lowercaseQuery)
    )
  }
}

export const knowledgeStore = KnowledgeStore.getInstance()