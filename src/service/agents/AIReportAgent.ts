// import chatChunk from "@/service/chat/chat-chunk-openai-office"
import chatChunk from "@/service/chat/chat-chunk-gemini-office"
import { Message } from "@/service/agents/AIFormAgentTypes"
import { formulaService } from "@/services/formulaService"
import { markdown as doc } from "@/pages/report-management/components/AnalysisResult.md"
import generateSystemPrompt from "@/service/agents/prompts/report-agent-prompt"
import { ProcessedData } from "@/utils/processReportData"
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

  private async executeCode(code: string, data: AnalysisData): Promise<any> {
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

  public async analyzeData(data: ProcessedData, rawConfig: string): Promise<AnalysisResult["analysis"]> {
    try {
      console.log("[AIReportAgent] Analyzing data with rawConfig")
      const regex = /<shata-ai-code>([\s\S]*?)<\/shata-ai-code>/
      const match = this.lastResponseRef.match(regex)
      let generatedCode = rawConfig
      if (match) {
        generatedCode = match[1].trim()
      }

      // 转换数据结构
      const analysisData = prepareAnalysisData(data, this._templateInfoMap)

      // 执行分析
      const result = await this.executeCode(generatedCode, analysisData)

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

      const enhancedCommand = `${command}
      [回答策略:
        * 对于报表直接相关问题：提供具体解决方案
        * 对于业务相关问题：进行分析并给出建议
        * 对于间接相关问题：提供参考信息和最佳实践
        * 对于完全无关问题：礼貌建议咨询其他专业助手
        * [格式要求:所有代码必须使用 \`\`\`mo <shata-ai-code>../</shata-ai-code>\`\`\` 包裹, 必须返回完整代码, 不允许使用 //其他... 这样的方式来省略任何代码或者省略任何字段,因为用户不懂代码, 所以你省略了代码, 会让用户非常困扰, 因此你返回的 shata-ai-code 包裹的代码必须是完整的, 不能用注释来省略任何代码, 不允许分模块提供, 必须一次性提供完整的代码]`

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

      const regex = /<shata-ai-code>([\s\S]*?)<\/shata-ai-code>/
      const match = this.lastResponseRef.match(regex)
      let generatedCode = rawConfig
      if (match) {
        generatedCode = match[1].trim()
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
