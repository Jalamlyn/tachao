import chatChunkClaude from "../chat/chat-chunk-claude-office"
import { jsonParse, jsonStringify } from "@/utils"
import DynamicFormConfigStr from "./DynamicFormConfigStr"
import { DynamicFormConfig } from "@/components/common/DynamicForm/types"
import { parseFormConfig, parseFormEditOperations } from "@/utils/codeParser"
import message from "@/components/Message"
import { set, cloneDeep } from 'lodash'

interface FormIndex {
  id: string
  templateId: string
  status: string
  title: string
}

export class AIFormAgent {
  private static instance: AIFormAgent
  private systemPrompt = `你是一个智能表单助手，负责帮助用户创建和检索表单。
创建表单时，你需要生成一个符合 DynamicFormConfig 类型的配置对象。
检索表单时，你需要根据用户的描述在表单索引中查找匹配的表单。

${DynamicFormConfigStr}
不要生成 订单编号 的配置，系统会自动生成。
生成的表单必须包含3个部分
- 基本信息
- 明细信息
- 流程信息
生成明细信息如果涉及到计算的，要生成正确的行计算和合计计算逻辑
生成必要的校验逻辑函数，用于保存的时候对表单数据进行校验
`

  private constructor() {}

  public static getInstance(): AIFormAgent {
    if (!AIFormAgent.instance) {
      AIFormAgent.instance = new AIFormAgent()
    }
    return AIFormAgent.instance
  }

  private async processAIResponse(userInput: string, onChunk: (chunk: string) => void): Promise<string> {
    let response = ""
    await chatChunkClaude(
      [
        { role: "system", content: this.systemPrompt },
        { role: "user", content: userInput },
      ],
      (chunk: string) => {
        response += chunk
        // 新增：将每个 chunk 传递给回调函数
        onChunk(chunk)
      },
      () => {},
      true,
      0
    )
    return response
  }

  private async validateIntent(action: string, input: string): Promise<boolean> {
    const intent = await this.analyzeIntent(input)
    if (intent === "unsupported") {
      return false
    }
    if (intent !== action) {
      message.error(`当前操作需要 ${action} 类型的指令，但收到的是 ${intent} 类型的指令`)
      return false
    }
    return true
  }

  public async createForm(
    description: string,
    onChunk: (chunk: string) => void
  ): Promise<{
    config: DynamicFormConfig
    title: string
  } | null> {
    // 验证意图
    const isValid = await this.validateIntent("create", description)
    if (!isValid) {
      return null
    }

    const prompt = `请根据以下描述生成一个表单配置代码：
${description}

请生成包含两部分内容的 js 代码：
1. 表单标题(title)：简要概括表单的主要内容
2. 表单配置(config)：一个符合 DynamicFormConfig 类型的配置 js 对象

请使用如下格式返回：
<mo-ai-form>
export default {

  // 完整的表单配置对象

}
</mo-ai-form>`

    try {
      const response = await this.processAIResponse(prompt, onChunk)
      const parsedConfig = await parseFormConfig(response)

      if (!parsedConfig) {
        throw new Error("解析表单配置失败")
      }

      const { title, config } = parsedConfig

      if (!title || !config) {
        throw new Error("表单配置缺少必要的字段")
      }

      return {
        config: config as DynamicFormConfig,
        title: title as string,
      }
    } catch (error) {
      console.error("Error creating form:", error)
      throw new Error("创建表单失败：" + (error as Error).message)
    }
  }

  // ... 其他现有方法保持不变
}

export default AIFormAgent.getInstance()