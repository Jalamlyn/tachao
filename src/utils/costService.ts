import { getMetadata, setMetadata } from "@/service/apis/metadata"
import { balanceStore } from "@/stores/balanceStore"
import globalStore from "@/globalStore"

interface TokenUsage {
  promptTokenCount: number
  candidatesTokenCount: number
  model: string
  content?: string
}

interface CostRecord {
  id: number
  timestamp: string
  type: "token_usage" | "subscription" | string
  totalCost: number
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

export const costService = {
  // 计算 Claude 费用
  calculateClaudeCost(content: string, tokenCount: number, isInput: boolean, model: string): number {
    const isCoding = content.includes(`mo-ai-code`)
    const ratePerMillionTokens = {
      EXPERT: {
        input: isCoding ? 219 : 43.8,
        output: isCoding ? 109 : 21.8,
      },
      ADVANCED: {
        input: isCoding ? 219 : 43.8,
        output: isCoding ? 109 : 21.8,
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
        input: isCoding ? 219 : 43.8,
        output: isCoding ? 109 : 21.8,
      },
      ADVANCED: {
        input: isCoding ? 219 : 43.8,
        output: isCoding ? 109 : 21.8,
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

      // 记录总的cost
      await this.addCostRecord({
        type: "token_usage",
        totalCost: totalCost,
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
      const costRecords = await getMetadata(["ai-cost-records"])
      const existingRecords = costRecords?.data[0]?.value ? JSON.parse(costRecords.data[0].value) : []

      const newRecord = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...record,
        userName: accountInfo.name,
      }

      await setMetadata("ai-cost-records", [...existingRecords, newRecord])
    } catch (error) {
      console.error("Error adding cost record:", error)
      throw error
    }
  },
}