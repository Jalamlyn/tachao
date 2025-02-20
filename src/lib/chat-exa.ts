import { message } from "@/lib/Message"
import { costService } from "@/lib/costService"
import { balanceStore } from "@/lib/balanceStore"

// Exa搜索结果的类型定义
interface ExaSearchResult {
  text: string
  score: number
  metadata?: {
    [key: string]: any
  }
}

interface ExaResponse {
  results: ExaSearchResult[]
  error?: string
  data?: {
    costDollars?: {
      total: number
      breakDown: Array<{
        search?: number
        contents?: number
        breakdown: {
          keywordSearch?: number
          neuralSearch?: number
          contentText?: number
          contentHighlight?: number
          contentSummary?: number
        }
      }>
    }
  }
}

// URL内容抓取结果的类型定义
interface ExaContentResult {
  url: string
  text: string
  error?: string
}

interface ExaContentsResponse {
  results: ExaContentResult[]
  error?: string
  data?: {
    costDollars?: {
      total: number
    }
  }
}

/**
 * 使用Exa搜索内容
 * @param query 搜索查询字符串
 * @returns 搜索结果
 */
export async function searchExa(query: string): Promise<ExaResponse> {
  try {
    // 检查余额 - 预估最小消费0.005美元 x 8 = 0.04塔币
    const hasEnoughBalance = await balanceStore.checkBalance(0.04)
    if (!hasEnoughBalance) {
      throw new Error("余额不足,请充值后继续使用")
    }

    const response = await fetch("https://1259692580-b9dznk0gp5.na-siliconvalley.tencentscf.com/exa-search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`搜索失败: ${response.status} ${response.statusText}. ${errorText}`)
    }

    const result = await response.json()

    if (result.error) {
      throw new Error(result.error)
    }

    // 处理费用
    if (result.costDollars?.total) {
      const costInTokens = result.costDollars.total * 8 // 美元转塔币
      await costService.addCostRecord({
        type: "exa_search",
        totalCost: costInTokens,
        detail: {
          exaSearch: {
            query,
            resultCount: result.results?.length || 0,
            costBreakdown: result.costDollars.breakDown,
          },
        },
        userInput: query,
      })
    }

    return result
  } catch (error) {
    console.error("Exa搜索失败:", error)
    message.error(`搜索失败: ${error.message}`)
    throw error
  }
}

/**
 * 使用Exa获取指定URL的内容
 * @param urls URL地址数组
 * @returns URL内容结果
 */
export async function getExaContents(urls: string[]): Promise<ExaContentsResponse> {
  try {
    // 检查余额 - 预估最小消费0.001美元/页 x 8 x urls.length
    const minCost = 0.001 * 8 * urls.length
    const hasEnoughBalance = await balanceStore.checkBalance(minCost)
    if (!hasEnoughBalance) {
      throw new Error("余额不足,请充值后继续使用")
    }

    const response = await fetch("https://1259692580-b9dznk0gp5.na-siliconvalley.tencentscf.com/exa-get-content", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(urls),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`获取内容失败: ${response.status} ${response.statusText}. ${errorText}`)
    }

    const result = await response.json()

    if (result.error) {
      throw new Error(result.error)
    }

    // 处理费用
    if (result.costDollars?.total) {
      const costInTokens = result.costDollars.total * 8 // 美元转塔币
      await costService.addCostRecord({
        type: "exa_content",
        totalCost: costInTokens,
        detail: {
          exaContent: {
            urls,
            resultCount: result.results?.length || 0,
          },
        },
      })
    }

    return result
  } catch (error) {
    console.error("Exa内容获取失败:", error)
    message.error(`获取内容失败: ${error.message}`)
    throw error
  }
}

/**
 * 使用示例:
 *
 * import { searchExa, getExaContents } from '@/service/chat/chat-exa'
 *
 * // 搜索示例
 * try {
 *   const searchResults = await searchExa('HeroUI Select 用法')
 *   console.log(searchResults)
 * } catch (error) {
 *   console.error(error)
 * }
 *
 * // 获取URL内容示例
 * try {
 *   const contentResults = await getExaContents(['tesla.com'])
 *   console.log(contentResults)
 * } catch (error) {
 *   console.error(error)
 * }
 */
