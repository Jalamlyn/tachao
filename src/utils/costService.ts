import { getMetadata, setMetadata } from "@/service/apis/metadata"
import { balanceStore } from "@/stores/balanceStore"
import globalStore from "@/globalStore"

interface TokenUsage {
  promptTokenCount: number
  candidatesTokenCount: number
  model: string
  content?: string
  userInput?: string
}

interface CostRecord {
  id: number
  timestamp: string
  type: "token_usage" | "subscription" | string
  totalCost: number
  userInput?: string
  detail: {
    tokenUsage?: {
      promptTokenCount: number
      candidatesTokenCount: number
      inputCost: number
      outputCost: number
      model: string
    }
    subscription?: {
      plan: string
      duration: number
      features: any
    }
  }
}

interface CostTotal {
  totalCost: number
  totalRecords: number
  currentPage: number
  lastUpdate: string
}

const RECORDS_PER_PAGE = 50
const COST_TOTAL_KEY = "ai-cost-total"

export const costService = {
  // 计算 Claude 费用
  calculateClaudeCost(content: string, tokenCount: number, isInput: boolean, model: string): number {
    const isCoding = content.includes(`mo-ai-code`)
    const ratePerMillionTokens = {
      EXPERT: {
        input: 31.2,
        output: 156,
      },
      ADVANCED: {
        input: 31.2,
        output: 156,
      },
    }

    const rate = ratePerMillionTokens[model] || ratePerMillionTokens["EXPERT"]
    const tokenRate = isInput ? rate.input : rate.output
    return (tokenCount / 1000000) * tokenRate
  },

  // 计算 Claude Wild 模式费用
  calculateClaudeWildCost(content: string, tokenCount: number, isInput: boolean, model: string): number {
    const isCoding = content.includes(`mo-ai-code`)
    const ratePerMillionTokens = {
      EXPERT: {
        input: 31.2,
        output: 156,
      },
      ADVANCED: {
        input: 31.2,
        output: 156,
      },
    }

    const rate = ratePerMillionTokens[model] || ratePerMillionTokens["ADVANCED"]
    const tokenRate = isInput ? rate.input : rate.output
    return (tokenCount / 1000000) * tokenRate
  },

  // 计算 DeepSeek 费用
  calculateDeepSeekCost(content: string, tokenCount: number, isInput: boolean, model: string): number {
    const ratePerMillionTokens = {
      input: 20,
      output: 80,
    }
    const tokenRate = isInput ? ratePerMillionTokens.input : ratePerMillionTokens.output
    return (tokenCount / 1000000) * tokenRate
  },

  // 获取或初始化成本统计
  async getCostTotal(): Promise<CostTotal> {
    try {
      const result = await getMetadata([COST_TOTAL_KEY])
      if (result?.data?.[0]?.value) {
        return JSON.parse(result.data[0].value)
      }
      const initialTotal: CostTotal = {
        totalCost: 0,
        totalRecords: 0,
        currentPage: 1,
        lastUpdate: new Date().toISOString(),
      }
      await setMetadata(COST_TOTAL_KEY, initialTotal)
      return initialTotal
    } catch (error) {
      console.error("Error getting cost total:", error)
      throw error
    }
  },

  // 更新成本统计
  async updateCostTotal(newCost: number): Promise<void> {
    try {
      const costTotal = await this.getCostTotal()
      const updatedTotal: CostTotal = {
        totalCost: costTotal.totalCost + newCost,
        totalRecords: costTotal.totalRecords + 1,
        currentPage: Math.floor(costTotal.totalRecords / RECORDS_PER_PAGE) + 1,
        lastUpdate: new Date().toISOString(),
      }
      await setMetadata(COST_TOTAL_KEY, updatedTotal)
    } catch (error) {
      console.error("Error updating cost total:", error)
      throw error
    }
  },

  // 获取指定页的记录
  async getPageRecords(page: number): Promise<CostRecord[]> {
    try {
      const result = await getMetadata([`ai-cost-records-${page}`])
      return result?.data?.[0]?.value ? JSON.parse(result.data[0].value) : []
    } catch (error) {
      console.error("Error getting page records:", error)
      throw error
    }
  },

  // 保存页面记录
  async savePageRecords(page: number, records: CostRecord[]): Promise<void> {
    try {
      await setMetadata(`ai-cost-records-${page}`, records)
    } catch (error) {
      console.error("Error saving page records:", error)
      throw error
    }
  },

  // 记录 token 使用成本
  async recordTokenUsage(usage: TokenUsage, isWild: boolean = false): Promise<void> {
    try {
      let costCalculator
      if (usage.model.startsWith("deepseek")) {
        costCalculator = this.calculateDeepSeekCost
      } else {
        costCalculator = isWild ? this.calculateClaudeWildCost : this.calculateClaudeCost
      }

      const inputCost = costCalculator(usage.content || "", usage.promptTokenCount, true, usage.model)
      const outputCost = costCalculator(usage.content || "", usage.candidatesTokenCount, false, usage.model)
      const totalCost = inputCost + outputCost

      await this.addCostRecord({
        type: "token_usage",
        totalCost: totalCost,
        userInput: usage.userInput,
        detail: {
          tokenUsage: {
            promptTokenCount: usage.promptTokenCount,
            candidatesTokenCount: usage.candidatesTokenCount,
            inputCost,
            outputCost,
            model: usage.model,
          },
        },
      })

      // 更新账号已使用额度
      const currentUserId = globalStore.currentUser?.id
      if (currentUserId) {
        await balanceStore.updateAccountUsage(currentUserId, totalCost)
      }
    } catch (error) {
      console.error("Error recording token usage:", error)
      throw error
    }
  },

  // 记录订阅成本
  async recordSubscriptionCost(plan: string, duration: number, price: number, features: any): Promise<void> {
    try {
      await this.addCostRecord({
        type: "subscription",
        totalCost: price,
        detail: {
          subscription: {
            plan,
            duration,
            features,
          },
        },
      })
    } catch (error) {
      console.error("Error recording subscription cost:", error)
      throw error
    }
  },

  // 添加成本记录
  async addCostRecord(record: Partial<CostRecord>): Promise<void> {
    try {
      const accountInfo = JSON.parse(localStorage.getItem("@@currentAccountInfo") || "{}")
      const costTotal = await this.getCostTotal()
      const pageNumber = costTotal.currentPage

      const newRecord = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...record,
        userName: accountInfo.name,
      }

      // 获取当前页记录
      const currentPageRecords = await this.getPageRecords(pageNumber)

      // 如果当前页已满,创建新页
      if (currentPageRecords.length >= RECORDS_PER_PAGE) {
        await this.savePageRecords(pageNumber + 1, [newRecord])
      } else {
        currentPageRecords.unshift(newRecord)
        await this.savePageRecords(pageNumber, currentPageRecords)
      }

      // 更新总计
      await this.updateCostTotal(record.totalCost || 0)
    } catch (error) {
      console.error("Error adding cost record:", error)
      throw error
    }
  },
}
