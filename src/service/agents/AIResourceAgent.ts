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

资料数据示例:
${JSON.stringify(this._data.slice(0, 3), null, 2)}

数据总行数: ${this._data.length}

你可以:
1. 修改资料 - 通过 JavaScript 代码修改数据
2. 分析计算 - 通过 formulajs 进行计算

请使用 <shata-ai-resource> 标签包裹你生成的代码，直接返回可执行的 JavaScript 代码。
按照下列结构返回:
\`\`\`mo
<shata-ai-resource>
data.forEach(row => {
  if(row.amount > 1000) {
    row.type = 'VIP';
  }
});
</shata-ai-resource>
\`\`\`
或者:
\`\`\`mo
<shata-ai-resource>
return formulajs.SUM(data.map(row => row.amount));
</shata-ai-resource>
\`\`\`
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

  private extractCode(content: string): string {
    const regex = /<shata-ai-resource>([\s\S]*?)<\/shata-ai-resource>/
    const match = content.match(regex)
    if (!match) {
      throw new Error("No valid code found in AI response")
    }
    return match[1].trim()
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

      const generatedCode = this.extractCode(aiResponse)
      console.log("[AIResourceAgent] Extracted code:", generatedCode)

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