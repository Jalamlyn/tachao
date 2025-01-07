import chatChunkExpert from "@/service/chat/chat-chunk-openrouter"
import { AppBuilderMessage } from "../types"
import { balanceStore } from "@/stores/balanceStore"
import { appCodeStore } from "../store/appCodeStore"

class ProductManagerAgent {
  private static instance: ProductManagerAgent

  private constructor() {}

  public static getInstance(): ProductManagerAgent {
    if (!ProductManagerAgent.instance) {
      ProductManagerAgent.instance = new ProductManagerAgent()
    }
    return ProductManagerAgent.instance
  }

  public async processCommand(
    appId: string,
    messages: AppBuilderMessage[],
    command: string,
    onChunk?: (chunk: string) => void
  ): Promise<{
    success: boolean
    content?: string
    error?: string
  }> {
    if (!balanceStore.checkBalance()) {
      throw new Error("余额不足，请前往企业设置-账户进行充值")
    }

    try {
      // 构建系统提示词
      const systemPrompt = `你是一个专业的产品经理，擅长需求分析和产品规划。你的主要任务是帮助用户理解需求、分析问题、提供建议。

在回答用户问题时，请：

1. 需求分析：
   - 深入理解用户的真实需求
   - 考虑业务价值和实现成本
   - 分析潜在的风险和挑战

2. 解决方案：
   - 提供具体、可行的解决方案
   - 考虑用户体验和技术实现的平衡
   - 给出清晰的优先级建议

3. 沟通反馈：
   - 使用专业但易懂的语言
   - 积极引导用户思考
   - 及时确认理解是否准确

你的回答应该：
- 专业性：体现产品经理的专业视角
- 实用性：提供可执行的建议
- 全面性：考虑各个相关方面
- 清晰性：结构化的表达方式`

      // 构建上下文信息
      const moduleContext = Object.entries(appCodeStore.currentVersion?.modules || {})
        .map(
          ([id, module]) => `
模块ID: ${id}
模块名称: ${module.data.name}
模块标题: ${module.data.title}
模块类型: ${module.data.type}
`
        )
        .join("\n---\n")

      const enhancedCommand = `
项目上下文：
${moduleContext}

用户问题：
${command}

请从产品经理的角度分析并回答这个问题。`

      const allMessages = [
        { role: "system", content: systemPrompt },
        ...messages,
        { role: "user", content: enhancedCommand },
      ]

      let response = ""

      await chatChunkExpert(
        allMessages,
        (chunk: string) => {
          response += chunk
          onChunk?.(chunk)
        },
        () => {},
        true,
        0
      )

      return {
        success: true,
        content: response,
      }
    } catch (error) {
      console.error("Error in ProductManager processCommand:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }
}

export default ProductManagerAgent.getInstance()
