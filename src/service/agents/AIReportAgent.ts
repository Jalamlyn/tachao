import chatChunkClaude from "@/service/chat/chat-chunk-claude-office"
import { Message } from "@/service/agents/AIFormAgentTypes"
import { formulaService } from "@/services/formulaService"
import { markdown as doc } from "@/pages/report-management/components/AnalysisResult.md"
import generateSystemPrompt from "@/service/agents/prompts/report-agent-prompt"
import { ProcessedData } from "@/pages/report-management/utils/processReportData"

export type ReportColumn = {
  header: string
  accessorKey: string
}

interface AnalysisResult {
  type: "analyze"
  data: any[]
  analysis: {
    summary: {
      [key: string]: {
        value: number | string | Record<string, any>
        label: string
      }
    }
    charts?: Array<{
      type: string
      title: string
      data: Array<{
        name: string
        value: number
      }>
    }>
    insights: string[]
    processAnalysis?: {
      summary?: {
        totalProcessNodes: { value: number; label: string }
        completedNodes: { value: number; label: string }
        completionRate: { value: string; label: string }
        averageProcessTime: { value: string; label: string }
      }
      nodeStatus?: Record<string, string>
      processDuration?: {
        total: string
        nodesDuration: Record<string, string>
      }
      approvers?: Record<string, number>
      processStatus?: Record<string, number>
    }
  }
}

interface CommandResult {
  success: boolean
  message: string
  rawConfig?: string
  analysis?: AnalysisResult["analysis"]
}

type ResourceOperationResult = AnalysisResult

interface ProcessCommandOptions {
  data: ProcessedData
  command: string
  onChunk?: (chunk: string) => void
}

export class AIReportAgent {
  private static instance: AIReportAgent
  private _data: ProcessedData | null = null
  private _rawConfig: string | null = null

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

  public setData(data: ProcessedData): void {
    console.log("[AIReportAgent] Setting data, length:", data?.flattenedData?.length)
    this._data = data
  }

  public getRawConfig(): string | null {
    console.log("[AIReportAgent] getRawConfig called, returning:", this._rawConfig?.substring(0, 100) + "...")
    return this._rawConfig
  }

  private setRawConfig(rawConfig: string | null): void {
    console.log("[AIReportAgent] setRawConfig called with:", rawConfig?.substring(0, 100) + "...")
    this._rawConfig = rawConfig
  }

  private validateConfig(config: string): boolean {
    try {
      // 验证配置格式
      const regex = /<shata-ai-code>([\s\S]*?)<\/shata-ai-code>/
      const match = config.match(regex)
      if (!match) {
        throw new Error("Invalid configuration format")
      }
      return true
    } catch (error) {
      throw new Error(`Invalid report configuration: ${error.message}`)
    }
  }

  private async executeCode(code: string, data: ProcessedData): Promise<any> {
    try {
      console.log("[AIReportAgent] Executing analysis code")
      const wrappedCode = `
        return (function(data, formulajs) {
          ${code}
        })(data, formulajs);
      `
      const executeFunction = new Function("data", "formulajs", wrappedCode)
      const result = executeFunction(data.flattenedData, formulaService)
      console.log("[AIReportAgent] Analysis completed successfully")
      return result
    } catch (error) {
      console.error("[AIReportAgent] Error executing analysis code:", error)
      throw error
    }
  }

  public async analyzeData(data: ProcessedData, rawConfig: string): Promise<AnalysisResult["analysis"]> {
    try {
      console.log("[AIReportAgent] Analyzing data with rawConfig")
      const result = await this.executeCode(rawConfig, data)
      if (!result || !result.type || !result.data) {
        throw new Error("Invalid analysis result format")
      }
      console.log("[AIReportAgent] Data analysis completed successfully")
      return result.analysis
    } catch (error) {
      console.error("[AIReportAgent] Error analyzing data:", error)
      throw error
    }
  }

  public async processCommand({ data, command, onChunk, rawConfig }: ProcessCommandOptions & { rawConfig?: string }): Promise<CommandResult> {
    console.log("[AIReportAgent] Processing analysis command:", command)

    if (!data || !data.flattenedData.length) {
      console.log("[AIReportAgent] Invalid data provided")
      return {
        success: false,
        message: "请提供有效的数据",
      }
    }

    try {
      if (rawConfig) {
        this.setRawConfig(rawConfig)
      }

      const systemPrompt = generateSystemPrompt(data.flattenedData, doc, this._rawConfig)
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

      // 验证生成的配置
      if (!this.validateConfig(aiResponse)) {
        throw new Error("Invalid generated configuration")
      }

      const result = (await this.executeCode(generatedCode, data)) as ResourceOperationResult

      if (!result || !result.type || !result.data) {
        console.error("[AIReportAgent] Invalid analysis result format")
        throw new Error("Invalid analysis result format")
      }

      // 更新当前配置
      this.setRawConfig(generatedCode)

      console.log("[AIReportAgent] Analysis completed successfully")
      return {
        success: true,
        message: "分析完成",
        rawConfig: generatedCode,
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