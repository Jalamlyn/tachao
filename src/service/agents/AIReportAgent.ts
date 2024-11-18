import chatChunkClaude from "../chat/chat-chunk-claude-office"
import { Message } from "./AIFormAgentTypes"
import { formulaService } from "@/services/formulaService"
import { markdown as doc } from "@/pages/report-management/components/AnalysisResult.md"
import message from "@/components/Message"

export type ReportColumn = {
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

type ReportOperationResult = AnalysisResult

// 新增：意图分析结果类型
type IntentAnalysisResult = "support" | "unsupported" | "unclear"

interface ProcessCommandOptions {
  data: any[]
  command: string
  onChunk?: (chunk: string) => void
}

export class AIReportAgent {
  private static instance: AIReportAgent
  private _data: any[] = []
  private _currentReport: AnalysisResult | null = null

  private constructor() {
    console.log("[AIReportAgent] Instance created")
  }

  public static getInstance(): AIReportAgent {
    if (!AIReportAgent.instance) {
      AIReportAgent.instance = new AIReportAgent()
      console.log("[AIReportAgent] New instance created")
    }
    return AIReportAgent.instance
  }

  public setData(data: any[]): void {
    console.log("[AIReportAgent] Setting data, length:", data?.length)
    this._data = data
  }

  public getCurrentReport(): AnalysisResult | null {
    return this._currentReport
  }

  private setCurrentReport(report: AnalysisResult | null): void {
    this._currentReport = report
  }

  // 新增：意图分析方法
  private async analyzeIntent(input: string): Promise<IntentAnalysisResult> {
    const aiAnalysisPrompt = `请分析以下用户指令，判断是否是报表创建或编辑相关的指令：
"${input}"

请根据以下规则进行分析：
1. 如果是明确的创建、编辑、修改、更新报表的指令，返回 "support"
2. 如果不是报表相关的指令，返回 "unsupported"
3. 如果是报表相关但指令不够明确或缺少关键信息，返回 "unclear"

请只返回 "support"、"unsupported" 或 "unclear"，不要返回其他内容。`

    try {
      let response = ""
      await chatChunkClaude(
        [
          { role: "system", content: "你是一个专业的报表分析助手，负责判断用户指令的意图。" },
          { role: "user", content: aiAnalysisPrompt },
        ],
        (chunk: string) => {
          response += chunk
        },
        () => {},
        true,
        0
      )

      const cleanResponse = response.trim().toLowerCase()

      if (cleanResponse === "support" || cleanResponse === "unsupported" || cleanResponse === "unclear") {
        return cleanResponse as IntentAnalysisResult
      }

      // 如果AI返回的不是预期的值，使用关键词匹配作为后备方案
      const reportKeywords = /(创建|新建|生成|制作|添加|建立|编辑|修改|更新|调整|改变).*?(报表|图表|分析|统计)/
      if (reportKeywords.test(input)) {
        return "support"
      }

      return "unclear"
    } catch (error) {
      console.error("Error analyzing intent:", error)
      return "unsupported"
    }
  }

  private generateSystemPrompt(data: any[]): string {
    console.log("[AIReportAgent] Generating system prompt")
    const basePrompt = `你是一个智能报表分析助手，负责帮助用户对数据进行分析和生成报表。
请仔细分析用户的需求，生成相应的分析代码。

${this._currentReport ? "当前已有报表分析结果，请基于现有结果进行修改或补充。" : "请创建新的报表分析。"}

数据示例:
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
- 开头和结尾都不要做解释和说明
- 如果数据的列中有 id 字段, 那么明细表格中必须包含该字段`
  }

  private async executeCode(code: string, data: any[]): Promise<any> {
    try {
      console.log("[AIReportAgent] Executing analysis code")
      const wrappedCode = `
        return (function(data, formulajs) {
          ${code}
        })(data, formulajs);
      `
      const executeFunction = new Function("data", "formulajs", wrappedCode)
      const result = executeFunction(data, formulaService)
      console.log("[AIReportAgent] Analysis completed successfully")
      return result
    } catch (error) {
      console.error("[AIReportAgent] Error executing analysis code:", error)
      throw error
    }
  }

  public async processCommand({ data, command, onChunk }: ProcessCommandOptions): Promise<{
    success: boolean
    message: string
    analysis?: AnalysisResult["analysis"]
  }> {
    console.log("[AIReportAgent] Processing analysis command:", command)

    if (!data || !data.length) {
      console.log("[AIReportAgent] Invalid data provided")
      return {
        success: false,
        message: "请提供有效的数据",
      }
    }

    try {
      // 首先进行意图分析
      const intent = await this.analyzeIntent(command)

      if (intent === "unsupported") {
        message.warning("请使用报表创建或编辑相关的指令。")
        return {
          success: false,
          message: "请使用报表创建或编辑相关的指令",
        }
      }

      if (intent === "unclear") {
        const suggestionMessage = `🤔 您的指令不太明确，我需要更多信息来帮助您。
        💡 请尝试使用以下格式的指令：
        - 创建一个展示 **[数据类型]** 的报表，包含 **[分析维度]** 分析
        - 在报表中添加 **[图表类型]** 来展示 **[数据维度]**
        - 分析 **[数据字段]** 的分布情况
        - 统计 **[数据字段]** 的趋势变化
        例如：创建一个销售数据分析报表，包含销售额统计和产品分布分析`

        onChunk?.(suggestionMessage)
        return {
          success: false,
          message: "指令不明确，请提供更具体的分析需求",
        }
      }

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

      console.log("[AIReportAgent] AI response received")

      const regex = /<shata-ai-code>([\s\S]*?)<\/shata-ai-code>/
      const match = aiResponse.match(regex)
      if (!match) {
        console.error("[AIReportAgent] No valid analysis code found in AI response")
        throw new Error("No valid analysis code found in AI response")
      }
      const generatedCode = match[1].trim()

      const result = (await this.executeCode(generatedCode, data)) as ReportOperationResult

      if (!result || !result.type || !result.data) {
        console.error("[AIReportAgent] Invalid analysis result format")
        throw new Error("Invalid analysis result format")
      }

      // 保存当前报表状态
      this.setCurrentReport(result)

      console.log("[AIReportAgent] Analysis completed successfully")
      return {
        success: true,
        message: "分析完成",
        analysis: result.analysis,
      }
    } catch (error) {
      console.error("[AIReportAgent] Error processing analysis command:", error)
      return {
        success: false,
        message: "分析过程中发生错误：" + (error as Error).message,
      }
    }
  }
}

export default AIReportAgent.getInstance()