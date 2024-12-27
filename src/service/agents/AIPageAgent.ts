import chatChunkExpert from "@/service/chat/chat-chunk-openrouter"
import chatChunk from "@/service/chat/chat-deepseek"
import { Message } from "./AIFormAgentTypes"
import { generateSystemPrompt } from "./prompts/page/page-agent-prompt"
import { balanceStore } from "@/stores/balanceStore"

export class AIPageAgent {
  private static instance: AIPageAgent
  private _rawCode: string | null = null

  private constructor() {}

  public static getInstance(): AIPageAgent {
    if (!AIPageAgent.instance) {
      AIPageAgent.instance = new AIPageAgent()
    }
    return AIPageAgent.instance
  }

  public getRawCode(): string | null {
    return this._rawCode
  }

  public setRawCode(rawCode: string | null): void {
    this._rawCode = rawCode
  }

  public async parseCode(code: string) {
    try {
      // 验证代码格式
      if (!code.includes("<shata-ai-code>")) {
        throw new Error("Invalid code format")
      }
      return {
        code,
        success: true
      }
    } catch (error) {
      console.error("Error parsing page code:", error)
      throw error
    }
  }

  public async processCommand(
    messages: Message[],
    command: string,
    onChunk?: (chunk: string) => void,
    rawCode?: string
  ): Promise<{ success: boolean; code?: string; error?: string }> {
    if (!balanceStore.checkBalance()) {
      throw new Error("余额不足，请前往企业设置-账户进行充值")
    }

    if (rawCode) {
      this.setRawCode(rawCode)
    }

    try {
      const systemPrompt = generateSystemPrompt()
      const enhancedCommand = `
      ${command}
      
      <代码生成规范>
      1. 必须使用 NextUI 组件库
      2. 必须使用 Framer Motion 做动画
      3. 代码必须完整，不能省略
      4. 必须包含在 <shata-ai-code></shata-ai-code> 标签中
      5. 生成的代码必须是一个完整的 React 组件
      6. 所有依赖都从 context 中解构获取
      7. 不能使用 import/export 语句
      </代码生成规范>
      `

      const allMessages = [
        { role: "system", content: systemPrompt },
        ...messages,
        { role: "user", content: enhancedCommand }
      ]

      let response = ""
      const model = sessionStorage.getItem("aiLevel") || "ADVANCED"
      
      if (model === "ADVANCED") {
        await chatChunk(
          allMessages,
          (chunk: string) => {
            response += chunk
            onChunk?.(chunk)
          },
          () => {},
          true,
          0
        )
      }

      if (model === "EXPERT") {
        await chatChunkExpert(
          allMessages,
          (chunk: string) => {
            response += chunk
            onChunk?.(chunk)
          },
          () => {},
          true,
          0
        )
      }

      if (response.includes("<shata-ai-error>")) {
        return {
          success: false,
          error: "生成失败，请重试"
        }
      }

      if (response.includes("<shata-ai-code>")) {
        this.setRawCode(response)
        return {
          success: true,
          code: response
        }
      }

      return {
        success: true
      }
    } catch (error) {
      console.error("Error in processCommand:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "未知错误"
      }
    }
  }
}

export default AIPageAgent.getInstance()