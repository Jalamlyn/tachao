import chatChunkClaude from "../chat/chat-chunk-claude-office"
import { Message } from "./AIFormAgentTypes"
import { formulaService } from "@/services/formulaService"

export type ResourceColumn = {
  header: string
  accessorKey: string
}

export class AIResourceAgent {
  private static instance: AIResourceAgent
  private _columns: ResourceColumn[] = []
  private _data: any[] = []
  private systemPrompt = `你是一个智能资料助手，负责帮助用户对资料进行操作和分析。
请仔细分析用户的需求，生成相应的代码。

资料列定义:
${JSON.stringify(this._columns, null, 2)}

你可以:
1. 修改资料 - 通过 JavaScript 代码修改数据
2. 分析计算 - 通过 formulajs 进行计算

请直接返回可执行的 JavaScript 代码，不要包含任何标签或额外的包装。
例如:
// 修改数据的代码
data.forEach(row => {
  if(row.amount > 1000) {
    row.type = 'VIP';
  }
});

或者:
// 分析计算的代码
return formulajs.SUM(data.map(row => row.amount));
`

  private constructor() {}

  public static getInstance(): AIResourceAgent {
    if (!AIResourceAgent.instance) {
      AIResourceAgent.instance = new AIResourceAgent()
    }
    return AIResourceAgent.instance
  }

  public setColumns(columns: ResourceColumn[]): void {
    console.log("[AIResourceAgent] Setting columns:", columns)
    this._columns = columns
  }

  public setData(data: any[]): void {
    console.log("[AIResourceAgent] Setting data, length:", data?.length)
    this._data = data
  }

  private async executeCode(code: string): Promise<any> {
    try {
      console.log("[AIResourceAgent] Executing code:", code)
      const executeFunction = new Function("data", "formulajs", code)
      const result = executeFunction(this._data, formulaService)
      console.log("[AIResourceAgent] Code execution result:", result)
      return result
    } catch (error) {
      console.error("[AIResourceAgent] Error executing code:", error)
      throw error
    }
  }

  public async processCommand(
    command: string,
    onChunk?: (chunk: string) => void,
    mode?: string
  ): Promise<{ success: boolean; message: string }> {
    console.log("[AIResourceAgent] Processing command:", command)
    if (!this._columns.length) {
      return {
        success: false,
        message: "请先设置资料列定义",
      }
    }

    const updateProgress = (message: string) => {
      console.log("[AIResourceAgent] Progress:", message)
      onChunk?.(message + "</br>")
    }

    try {
      updateProgress("🤖 AI助手正在分析您的需求...")

      const messages: Message[] = [
        { role: "system", content: this.systemPrompt },
        { role: "user", content: command },
      ]

      let generatedCode = ""
      await chatChunkClaude(
        messages,
        (chunk: string) => {
          generatedCode += chunk
        },
        () => {},
        true,
        0
      )

      console.log("[AIResourceAgent] Generated code:", generatedCode)

      updateProgress("⚡ 正在执行代码...")
      await this.executeCode(generatedCode)

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