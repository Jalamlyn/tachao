import { jsonParse, jsonStringify } from "@/utils"
import { countTokens } from "@/utils/moduleLoader"
import { setMetadata, getMetadata } from "@/service/apis/metadata"
import chatChunk from "@/service/chat/chat-deepseek"

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

interface ChatOptions {
  onChunk?: (chunk: string) => void
  onResult?: (result: string) => void
  onError?: (error: Error) => void
  temperature?: number
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
  // 新的统一chat方法
  async chat(messages: any[], options: ChatOptions = {}): Promise<void> {
    const { onChunk, onResult, onError, temperature = 0 } = options

    let fullContent = ""

    try {
      await chatChunk(
        messages,
        (chunk: string) => {
          fullContent += chunk
          onChunk?.(chunk)
        },
        () => {}, // onCancel callback
        true, // isStream
        temperature
      )

      onResult?.(fullContent)
    } catch (error) {
      onError?.(error)
      throw error
    }
  }
}

export const ai = AIService.getInstance()
