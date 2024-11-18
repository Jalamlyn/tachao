import chatChunkClaude from "../chat/chat-chunk-claude-office"
import { Message } from "./AIFormAgentTypes"
import { formulaService } from "@/services/formulaService"
import { markdown as doc } from "@/pages/report-management/components/AnalysisResult.md"
import generateSystemPrompt from "./prompts/report-agent-prompt"

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
    processAnalysis?: {
      summary?: {
        totalProcessNodes: number
        completedNodes: number
        completionRate: string
        averageProcessTime: string
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

type ResourceOperationResult = AnalysisResult

interface ProcessCommandOptions {
  data: any[]
  command: string
  onChunk?: (chunk: string) => void
}

export class AIReportAgent {
  private static instance: AIReportAgent
  private _data: any[] = []

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
      const systemPrompt = generateSystemPrompt(data, doc)
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

      const result = (await this.executeCode(generatedCode, data)) as ResourceOperationResult

      if (!result || !result.type || !result.data) {
        console.error("[AIReportAgent] Invalid analysis result format")
        throw new Error("Invalid analysis result format")
      }

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