import chatChunkClaude from "../chat/chat-chunk-claude-office"
import { Message } from "./AIFormAgentTypes"
import { formulaService } from "@/services/formulaService"

export type ResourceColumn = {
  header: string
  accessorKey: string
}

interface ProcessCommandOptions {
  data: any[]
  command: string
  onChunk?: (chunk: string) => void
  mode?: string
}

export class AIResourceAgent {
  private static instance: AIResourceAgent
  private _data: any[] = []

  private constructor() {}

  public static getInstance(): AIResourceAgent {
    if (!AIResourceAgent.instance) {
      AIResourceAgent.instance = new AIResourceAgent()
    }
    return AIResourceAgent.instance
  }

  public setData(data: any[]): void {
    console.log("[AIResourceAgent] Setting data, length:", data?.length)
    this._data = data
  }

  private generateSystemPrompt(data: any[]): string {
    return `你是一个智能资料助手，负责帮助用户对资料进行操作和分析。
请仔细分析用户的需求，生成相应的代码。

资料数据示例:
${JSON.stringify(data.slice(0, 3), null, 2)}

数据总行数: ${data.length}

你可以:
1. 修改资料 - 通过 JavaScript 代码修改数据
2. 分析计算 - 通过 formulajs 进行计算

请使用 <shata-ai-resource> 标签包裹你生成的代码，直接返回可执行的 JavaScript 代码。`
  }

  private async executeCode(code: string, data: any[]): Promise<any> {
    try {
      console.log("[AIResourceAgent] Executing code:", code)
      const executeFunction = new Function("data", "formulajs", code)
      const result = executeFunction(data, formulaService)
      console.log("[AIResourceAgent] Code execution result:", result)
      return result
    } catch (error) {
      console.error("[AIResourceAgent] Error executing code:", error)
      throw error
    }
  }

  public async processCommand({
    data,
    command,
    onChunk,
    mode,
  }: ProcessCommandOptions): Promise<{ success: boolean; message: string }> {
    console.log("[AIResourceAgent] Processing command with data:", command)

    if (!data || !data.length) {
      return {
        success: false,
        message: "请提供有效的数据",
      }
    }

    const updateProgress = (message: string) => {
      console.log("[AIResourceAgent] Progress:", message)
      onChunk?.(message + "</br>")
    }

    try {
      updateProgress("🤖 AI助手正在分析您的需求...")

      const systemPrompt = this.generateSystemPrompt(data)
      const messages: Message[] = [
        { role: "system", content: systemPrompt },
        { role: "user", content: command },
      ]

      let aiResponse = ""
      await chatChunkClaude(
        messages,
        (chunk: string) => {
          aiResponse += chunk
          onChunk?.(chunk)
        },
        () => {},
        true,
        0
      )

      console.log("[AIResourceAgent] AI response:", aiResponse)

      const regex = /<shata-ai-resource>([\s\S]*?)<\/shata-ai-resource>/
      const match = aiResponse.match(regex)
      if (!match) {
        throw new Error("No valid code found in AI response")
      }
      const generatedCode = match[1].trim()

      updateProgress("⚡ 正在执行代码...")
      await this.executeCode(generatedCode, data)

      return {
        success: true,
        message: "操作执行成功",
      }
    } catch (error) {
      console.error("[AIResourceAgent] Error processing command:", error)
      return {
        success: false,
        message: "处理指令时发生错误：" + (error as Error).message,
      }
    }
  }
}

export default AIResourceAgent.getInstance()