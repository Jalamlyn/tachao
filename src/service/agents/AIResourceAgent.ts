import chatChunkClaude from "../chat/chat-chunk-claude-office"
import { Message } from "./AIFormAgentTypes"
import { formulaService } from "@/services/formulaService"
import { markdown as doc } from "@/pages/resource-management/components/AnalysisResult.md"

export type ResourceColumn = {
  header: string
  accessorKey: string
}

// 新增类型定义
interface ModifyResult {
  type: "modify"
  data: any[]
  changes: {
    row: number
    field: string
    oldValue: any
    newValue: any
  }[]
}

interface AnalysisResult {
  type: "analyze"
  data: any[]
  analysis: {
    summary: Record<string, number | string>
    charts?: {
      type: string
      data: {
        labels: string[]
        values: number[]
      }
    }[]
    insights: string[]
  }
}

type ResourceOperationResult = ModifyResult | AnalysisResult

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

  private generateSystemPrompt(data: any[], mode: string = "modify"): string {
    const basePrompt = `你是一个智能资料助手，负责帮助用户对资料进行操作和分析。
请仔细分析用户的需求，生成相应的代码。

资料数据示例:
${JSON.stringify(data.slice(0, 3), null, 2)}

数据总行数: ${data.length}`

    const modeSpecificPrompt =
      mode === "modify"
        ? `你需要返回如下结构:
{
  type: 'modify',
  data: modifiedData,  // 修改后的数据
}`
        : `你需要返回如下结构:
{
  type: 'analyze',
  data: originalData,  // 保持原始数据不变
  analysis: {
    summary: {         // 统计摘要
      [key: string]: number | string
    },
    charts?: [{        // 可选的图表数据
      type: string,
      data: {
        labels: string[],
        values: number[]
      }
    }],
    insights: string[] // 数据洞察
  }
}
<doc>${doc}</doc>
`

    return `${basePrompt}

${modeSpecificPrompt}

请使用 <shata-ai-resource> 标签包裹你生成的代码，直接返回可执行的 JavaScript 代码。
注意:
1. 不要将代码包装在函数定义中
2. 直接使用传入的 data 参数
3. 直接返回处理结果对象
4. 确保返回对象包含必要的 type 和 data 字段
5. data 字段必须保持原始数据不变
6. 统计结果放在 analysis 字段中

返回格式示例:
\`\`\`mo
<shata-ai-resource>
// 直接处理数据,使用传入的 data 参数
const result = {
  type: 'analyze',
  data: data,     // 保持原始数据不变
  analysis: {     // 统计结果放在这里
    summary: {...},
    charts: [...],
    insights: [...]
  }
};
return result;
</shata-ai-resource>
\`\`\`
- 开头和结尾都不要做解释和说明`
  }

  private async executeCode(code: string, data: any[]): Promise<any> {
    try {
      console.log("[AIResourceAgent] Executing code:", code)
      // 构造一个自执行函数,传入 data 参数
      const wrappedCode = `
        return (function(data, formulajs) {
          ${code}
        })(data, formulajs);
      `
      const executeFunction = new Function("data", "formulajs", wrappedCode)
      const result = executeFunction(data, formulaService)
      console.log("[AIResourceAgent] Code execution result:", result)
      return result
    } catch (error) {
      console.error("[AIResourceAgent] Error executing code:", error)
      throw error
    }
  }

  public async processCommand({ data, command, onChunk, mode = "modify" }: ProcessCommandOptions): Promise<{
    success: boolean
    message: string
    data?: any[]
    analysis?: AnalysisResult["analysis"]
  }> {
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

      const systemPrompt = this.generateSystemPrompt(data, mode)
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
      const result = (await this.executeCode(generatedCode, data)) as ResourceOperationResult

      if (!result || !result.type || !result.data) {
        throw new Error("Invalid result format")
      }

      return {
        success: true,
        message: mode === "modify" ? "操作执行成功" : "分析完成",
        data: result.data,
        ...(result.type === "analyze" ? { analysis: result.analysis } : {}),
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
