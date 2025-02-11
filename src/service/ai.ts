// import chatChunk from "@/service/chat/chat-chunk-sc"
import chatChunk from "@/service/chat/chat-chunk-openrouter"

// 计算费用的函数

interface ChatOptions {
  onChunk?: (chunk: string) => void
  onResult?: (result: string) => void
  onError?: (error: Error) => void
  temperature?: number
}

class AIService {
  private static instance: AIService

  private constructor() {}

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService()
    }
    return AIService.instance
  }

  // 检查消息是否包含图片
  private hasImageContent(messages: any[]): boolean {
    return messages.some((msg) => {
      // 检查数组形式的content
      if (Array.isArray(msg.content)) {
        return msg.content.some(
          (item) =>
            item.type === "image" ||
            item.type === "image_url" ||
            (item.type === "text" && item.images && item.images.length > 0)
        )
      }
      // 检查对象形式的content
      if (typeof msg.content === "object" && msg.content !== null) {
        return (
          msg.content.type === "image" ||
          msg.content.type === "image_url" ||
          (msg.content.images && msg.content.images.length > 0)
        )
      }
      // 检查消息中的images字段
      return msg.images && msg.images.length > 0
    })
  }

  // 统一的chat方法
  async chat(messages: any[], options: ChatOptions = {}): Promise<void> {
    const { onChunk, onResult, onError, temperature = 0, stop } = options
    let fullContent = ""

    try {
      // 检查消息是否包含图片
      const containsImage = this.hasImageContent(messages)

      // 根据消息类型选择合适的接口
      if (containsImage) {
        // 使用支持图片的Azure接口
        await chatChunk(
          messages,
          (chunk: string) => {
            fullContent += chunk
            onChunk?.(chunk)
          },
          () => {}, // onCancel callback
          true, // isStream
          temperature,
          "YES",
          "",
          stop,
          true
        )
      } else {
        // 使用Deepseek接口处理纯文本消息
        await chatChunk(
          messages,
          (chunk: string) => {
            fullContent += chunk
            onChunk?.(chunk)
          },
          () => {}, // onCancel callback
          true, // isStream
          temperature,
          "YES",
          "",
          stop,
          true
        )
      }

      onResult?.(fullContent)
    } catch (error) {
      onError?.(error)
      throw error
    }
  }
}

export const ai = AIService.getInstance()
