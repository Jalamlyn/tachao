import { DynamicFormConfig } from "@/components/common/DynamicForm/types"

// 命令结果类型
export type CommandResult = {
  type: "create"
  data: any
  generationProcess?: string
}

// AI表单代理配置类型
export type AIFormAgentConfig = {
  rawConfig: string | null
  cachedImage: string | null
  systemPrompt: string
}

// 创建表单结果类型
export type CreateFormResult = {
  config: DynamicFormConfig
  rawConfig: string
  title: string
} | null

// 意图分析结果类型
export type IntentAnalysisResult = "create" | "unsupported"

// AI响应处理函数类型
export type AIResponseHandler = (chunk: string) => void

// 消息类型
export type Message = {
  role: "system" | "user" | "assistant"
  content: string
}

// AI表单代理接口
export interface IAIFormAgent {
  getRawConfig(): string | null
  cacheImage(imageData: string): void
  clearCachedImage(): void
  parseConfig(rawConfig: string): Promise<any>
  processCommand(
    command: string,
    onChunk?: AIResponseHandler,
    config?: DynamicFormConfig,
    rawConfig?: string
  ): Promise<CommandResult>
  analyzeIntent(input: string): Promise<IntentAnalysisResult>
}