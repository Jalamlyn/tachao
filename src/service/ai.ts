import { message } from "@/components/Message"
import { jsonParse, jsonStringify } from "@/utils"
import { countTokens } from "@/utils/moduleLoader"
import { setMetadata, getMetadata } from "@/service/apis/metadata"
import chatChunk from "@/service/chat/chat-chunk-openai-azure"

// 计算费用的函数
function calculateCost(tokenCount: number, isInput: boolean, model: string): number {
  const ratePerThousandTokens = {
    ADVANCED: {
      input: 0.01,
      output: 0.15,
    },
    EXPERT: {
      input: 0.1,
      output: 1.5,
    },
  }

  const rate = ratePerThousandTokens[model === "ADVANCED" ? "ADVANCED" : "EXPERT"]
  const tokenRate = isInput ? rate.input : rate.output
  return (tokenCount / 1000) * tokenRate
}

interface AIResponse {
  success: boolean
  data?: any
  error?: string
}

class AIService {
  private static instance: AIService
  private baseUrl = "https://service-fpf07h2s-1259692580.usw.apigw.tencentcs.com/release"

  private constructor() {}

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService()
    }
    return AIService.instance
  }

  // 非流式处理方法
  async process(params: { text: string; images?: string[]; temperature?: number }): Promise<AIResponse> {
    const baseModel = "ADVANCED"
    const { text, images = [], temperature = 0 } = params

    try {
      const messages = [
        {
          role: "user",
          content: [
            { type: "text", text },
            ...images.map((img) => ({ type: "image_url", image_url: { url: img, detail: "high" } })),
          ],
        },
      ]

      const payload = {
        messages,
        temperature,
        max_tokens: 2000,
        model: baseModel,
        stream: false,
      }

      const response = await fetch(`${this.baseUrl}/chat-azure`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: jsonStringify(payload),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      // 计算token使用量和费用
      const inputTokens = countTokens(text)
      const outputTokens = countTokens(result.content)

      const inputCost = calculateCost(inputTokens, true, baseModel)
      const outputCost = calculateCost(outputTokens, false, baseModel)

      // 记录费用
      try {
        const costRecords = await getMetadata(["ai-cost-records"])
        const existingRecords = costRecords?.data[0]?.value ? JSON.parse(costRecords.data[0].value) : []

        const newRecord = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          type: "token_usage",
          totalCost: inputCost + outputCost,
          detail: {
            tokenUsage: {
              promptTokenCount: inputTokens,
              candidatesTokenCount: outputTokens,
              inputCost,
              outputCost,
              model: baseModel,
            },
          },
        }

        await setMetadata("ai-cost-records", [...existingRecords, newRecord])
      } catch (e) {
        console.error("Error storing cost records:", e)
      }

      return {
        success: true,
        data: result.content,
      }
    } catch (error) {
      console.error("AI process error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "处理失败",
      }
    }
  }

  // 流式处理方法
  async chat(
    messages: any[],
    onChunk: (chunk: string) => void,
    onCancel: (cancel: () => void) => void,
    isStream = true,
    temperature = 0
  ): Promise<void> {
    await chatChunk(messages, onChunk, onCancel, isStream, temperature)
  }
}

export const ai = AIService.getInstance()
