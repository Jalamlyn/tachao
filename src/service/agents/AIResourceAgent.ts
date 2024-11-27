import chatChunk from "../chat/chat-chunk-openai-office"
import { Message } from "./AIFormAgentTypes"
import { formulaService } from "@/services/formulaService"
import { markdown as doc } from "@/pages/resource-management/components/AnalysisResult.md"

export type ResourceColumn = {
  header: string
  accessorKey: string
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

type ResourceOperationResult = AnalysisResult

interface ProcessCommandOptions {
  data: any[]
  command: string
  onChunk?: (chunk: string) => void
}

export class AIResourceAgent {
  private static instance: AIResourceAgent
  private _data: any[] = []

  private constructor() {
    console.log("[AIResourceAgent] Instance created")
  }

  public static getInstance(): AIResourceAgent {
    if (!AIResourceAgent.instance) {
      AIResourceAgent.instance = new AIResourceAgent()
      console.log("[AIResourceAgent] New instance created")
    }
    return AIResourceAgent.instance
  }

  public setData(data: any[]): void {
    console.log("[AIResourceAgent] Setting data, length:", data?.length)
    this._data = data
  }

  private generateSystemPrompt(data: any[]): string {
    console.log("[AIResourceAgent] Generating system prompt")
    const basePrompt = `你是一个智能表格分析助手，负责帮助用户对表格进行分析。
请仔细分析用户的需求，生成相应的分析代码。

表格数据示例:
${JSON.stringify(data.slice(0, 3), null, 2)}

数据总行数: ${data.length}`

    return `${basePrompt}

<doc>${doc}</doc>
请使用 <shata-ai-code> 标签包裹你生成的代码，直接返回可执行的 JavaScript 代码。
注意:
1. 不要将代码包装在函数定义中
2. 直接使用传入的 data 参数
3. 直接返回分析结果对象
4. 确保返回对象包含必要的 type 和 data 字段
5. data 字段必须保持原始数据不变
6. 统计结果放在 analysis 字段中

返回 markdown 格式示例,必须 \`\`\`mo 开头 \`\`\`结尾
\`\`\`mo
<shata-ai-code>
// 直接处理数据,使用传入的 data 参数
const result = {
  type: 'analyze',
  data: data,     // 保持原始数据不变
  analysis: {     // 统计结果放在这里, 不要出现英文标签
    summary: {...},
    charts: [...],
    insights: [...]
  }
};
return result;
</shata-ai-code>
\`\`\`
- 开头和结尾都不要做解释和说明`
  }

  private async executeCode(code: string, data: any[]): Promise<any> {
    try {
      console.log("[AIResourceAgent] Executing analysis code")
      const wrappedCode = `
        return (function(data, formulajs) {
          ${code}
        })(data, formulajs);
      `
      const executeFunction = new Function("data", "formulajs", wrappedCode)
      const result = executeFunction(data, formulaService)
      console.log("[AIResourceAgent] Analysis completed successfully")
      return result
    } catch (error) {
      console.error("[AIResourceAgent] Error executing analysis code:", error)
      throw error
    }
  }

  public async processCommand({ data, command, onChunk }: ProcessCommandOptions): Promise<{
    success: boolean
    message: string
    analysis?: AnalysisResult["analysis"]
  }> {
    console.log("[AIResourceAgent] Processing analysis command:", command)

    if (!data || !data.length) {
      console.log("[AIResourceAgent] Invalid data provided")
      return {
        success: false,
        message: "请提供有效的数据",
      }
    }

    try {
      const systemPrompt = this.generateSystemPrompt(data)
      const messages: Message[] = [
        { role: "system", content: systemPrompt },
        { role: "user", content: command },
      ]

      let aiResponse = ""
      await chatChunk(
        messages,
        (chunk: string) => {
          aiResponse += chunk
          onChunk?.(chunk)
        },
        () => {},
        true,
        0
      )

      console.log("[AIResourceAgent] AI response received")

      const regex = /<shata-ai-code>([\s\S]*?)<\/shata-ai-code>/
      const match = aiResponse.match(regex)
      if (!match) {
        console.error("[AIResourceAgent] No valid analysis code found in AI response")
        throw new Error("No valid analysis code found in AI response")
      }
      const generatedCode = match[1].trim()

      const result = (await this.executeCode(generatedCode, data)) as ResourceOperationResult

      if (!result || !result.type || !result.data) {
        console.error("[AIResourceAgent] Invalid analysis result format")
        throw new Error("Invalid analysis result format")
      }

      console.log("[AIResourceAgent] Analysis completed successfully")
      return {
        success: true,
        message: "分析完成",
        analysis: result.analysis,
      }
    } catch (error) {
      console.error("[AIResourceAgent] Error processing analysis command:", error)
      return {
        success: false,
        message: "分析过程中发生错误：" + (error as Error).message,
      }
    }
  }
}

export default AIResourceAgent.getInstance()
