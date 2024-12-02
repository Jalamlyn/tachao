import { DynamicFormConfig } from "@/components/common/DynamicForm/types"

// 响应类型定义
export type ResponseType = "error" | "question" | "confirm" | "form"

// 命令结果类型
export type CommandResult = {
  type: ResponseType
  data: any
  generationProcess?: string
  questionCount?: number
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
  metadata?: ResponseMetadata
  images?: string[]
}

// 响应元数据类型
export interface ResponseMetadata {
  questionCount: number
  maxQuestions: number
}

// AI响应类型
export interface AIResponse {
  type: ResponseType
  data: any
  metadata: ResponseMetadata
}

// AI表单代理接口
export interface IAIFormAgent {
  getRawConfig(): string | null
  cacheImage(imageData: string): void
  clearCachedImage(): void
  parseConfig(rawConfig: string): Promise<any>
  processCommand(
    messages: Message[],
    command: string,
    onChunk?: AIResponseHandler,
    rawConfig?: string
  ): Promise<CommandResult>
}