// import chatChunk from "@/service/chat/chat-chunk-gemini-office"
// import chatChunk from "@/service/chat/chat-chunk-openai-azure"
import chatChunk from "@/service/chat/chat-chunk-claude-wild"
import { Message } from "@/service/agents/AIFormAgentTypes"
import { markdown as doc } from "@/pages/report-management/components/AnalysisResult.md"
import generateSystemPrompt from "@/service/agents/prompts/report/report-agent-prompt"
import { ProcessedData } from "@/utils/processReportData"

interface CommandResult {
  success: boolean
  message: string
  rawConfig?: string
}

interface ProcessCommandOptions {
  data: ProcessedData
  command: string
  onChunk?: (chunk: string) => void
}

interface AIReportAgentConfig {
  templateInfoMap?: Record<string, string>
}

export class AIReportAgent {
  private static instance: AIReportAgent
  private _templateInfoMap: Record<string, string> = {}
  private lastResponseRef: string = ""

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

  public configure(config: AIReportAgentConfig): void {
    if (config.templateInfoMap) {
      this._templateInfoMap = config.templateInfoMap
    }
  }

  public async processCommand({
    data,
    command,
    onChunk,
    rawConfig,
  }: ProcessCommandOptions & { rawConfig?: string }): Promise<CommandResult> {
    console.log("[AIReportAgent] Processing command:", command)

    if (!data || !data.flattenedData.length || !data.originalData.length) {
      console.log("[AIReportAgent] Invalid or incomplete data provided")
      return {
        success: false,
        message: "数据不完整,请检查数据源",
      }
    }

    try {
      const systemPrompt = generateSystemPrompt({
        data: data.originalData,
        doc,
        templateInfoMap: this._templateInfoMap,
      })

      // 在 processCommand 方法中
      const basePrompt = `[回答策略:
        * 对于报表直接相关问题：提供具体解决方案
        * 对于业务相关问题：进行分析并给出建议
        * 对于间接相关问题：提供参考信息和最佳实践
        * 对于完全无关问题：礼貌建议咨询其他专业助手
        * 一次只生成一份 <shata-ai-code></shata-ai-code>
        * [格式要求:所有代码必须使用 
        \`\`\`mo 
        <shata-ai-code>
        代码
        </shata-ai-code>
        \`\`\` 
        包裹, 必须返回完整代码, 不要使用注释来省略任何代码或逻辑]`

      const enhancedCommand = rawConfig
        ? `基于以下现有代码进行修改或优化：\n${rawConfig}\n\n用户指令：${command}\n${basePrompt}`
        : `创建新的分析报表：\n${command}\n${basePrompt}`
      const messages: Message[] = [
        { role: "system", content: systemPrompt },
        { role: "user", content: enhancedCommand },
      ]

      this.lastResponseRef = ""
      await chatChunk(
        messages,
        (chunk: string) => {
          this.lastResponseRef += chunk
          onChunk?.(chunk)
        },
        () => {},
        true,
        0
      )

      console.log("[AIReportAgent] AI response received")

      const componentCode = await this.parseComponentCode(this.lastResponseRef)
      if (!componentCode) {
        throw new Error("Invalid component code format")
      }

      console.log("[AIReportAgent] Code generation completed successfully")
      return {
        success: true,
        message: "代码生成完成",
        rawConfig: componentCode,
      }
    } catch (error) {
      console.error("[AIReportAgent] Error processing command:", error)
      return {
        success: false,
        message: "处理过程中发生错误：" + (error as Error).message,
      }
    }
  }

  private async parseComponentCode(code: string): Promise<string | null> {
    try {
      const regex = /<shata-ai-code>([\s\S]*?)<\/shata-ai-code>/
      const match = code?.match(regex)
      if (match) {
        return match[1].trim()
      }
      return null
    } catch (error) {
      console.error("[AIReportAgent] Error parsing component code:", error)
      return null
    }
  }
}

export default AIReportAgent.getInstance()
