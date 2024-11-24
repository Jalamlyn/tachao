import chatChunkClaude from "@/service/chat/chat-chunk-claude-office"
import { Message } from "@/service/agents/AIFormAgentTypes"
import { formulaService } from "@/services/formulaService"
import { markdown as doc } from "@/pages/report-management/components/AnalysisResult.md"
import generateSystemPrompt from "@/service/agents/prompts/report-agent-prompt"
import { ProcessedData } from "@/pages/report-management/utils/processReportData"
import { AnalysisDataGroup, AnalysisData, AnalysisResult } from "./types/report-agent.types"

export type ReportColumn = {
  header: string
  accessorKey: string
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

interface AIReportAgentConfig {
  templateInfoMap?: Record<string, string>
}

function prepareAnalysisData(data: ProcessedData, templateInfoMap: Record<string, string>): AnalysisData {
  // 按模板ID分组
  const groups = data.originalData.reduce(
    (acc, item) => {
      const templateId = item._sourceTemplateId
      if (!acc[templateId]) {
        acc[templateId] = {
          id: templateId,
          title: templateInfoMap[templateId] || `模板 ${templateId}`,
          data: [],
        }
      }
      acc[templateId].data.push(item)
      return acc
    },
    {} as Record<string, AnalysisDataGroup>
  )

  return {
    groups,
    metadata: {
      templateInfoMap,
      columns: data.columns,
    },
  }
}

export class AIReportAgent {
  private static instance: AIReportAgent
  private _data: ProcessedData | null = null
  private _rawConfig: string | null = null
  private _templateInfoMap: Record<string, string> = {}

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

  private async executeCode(code: string, data: AnalysisData): Promise<any> {
    try {
      console.log("[AIReportAgent] Executing analysis code")
      const wrappedCode = `
        return (function(data, formulajs) {
          // data 结构:
          // interface AnalysisData {
          //   groups: Record<string, {
          //     id: string
          //     title: string
          //     data: any[]
          //   }>
          //   metadata: {
          //     templateInfoMap: Record<string, string>
          //     columns: any[]
          //   }
          // }
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

  public async analyzeData(data: ProcessedData, rawConfig: string): Promise<AnalysisResult["analysis"]> {
    try {
      console.log("[AIReportAgent] Analyzing data with rawConfig")

      // 转换数据结构
      const analysisData = prepareAnalysisData(data, this._templateInfoMap)

      // 执行分析
      const result = await this.executeCode(rawConfig, analysisData)

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

  public async processCommand({
    data,
    command,
    onChunk,
    rawConfig,
  }: ProcessCommandOptions & { rawConfig?: string }): Promise<CommandResult> {
    console.log("[AIReportAgent] Processing analysis command:", command)

    if (!data || !data.flattenedData.length || !data.originalData.length) {
      console.log("[AIReportAgent] Invalid or incomplete data provided")
      return {
        success: false,
        message: "数据不完整,请检查数据源",
      }
    }

    try {
      if (rawConfig) {
        this.setRawConfig(rawConfig)
      }

      const systemPrompt = generateSystemPrompt({
        data: data.originalData,
        doc,
        existingConfig: this._rawConfig,
        templateInfoMap: this._templateInfoMap,
      })

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

      if (!this.validateConfig(aiResponse)) {
        throw new Error("Invalid generated configuration")
      }

      // 转换数据结构
      const analysisData = prepareAnalysisData(data, this._templateInfoMap)
      const result = (await this.executeCode(generatedCode, analysisData)) as ResourceOperationResult

      if (!result || !result.type || !result.data) {
        console.error("[AIReportAgent] Invalid analysis result format")
        throw new Error("Invalid analysis result format")
      }

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
