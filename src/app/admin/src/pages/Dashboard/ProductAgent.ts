import chatChunkExpert from "@/service/chat/chat-deepseek"

class ProductAgent {
  private static instance: ProductAgent

  private constructor() {}

  public static getInstance(): ProductAgent {
    if (!ProductAgent.instance) {
      ProductAgent.instance = new ProductAgent()
    }
    return ProductAgent.instance
  }

  private systemPrompt = `我是一位专业的产品经理，我的职责是帮助用户明确他们的需求。我会：

1. 以专业且富有同理心的方式与用户交流
2. 帮助用户梳理和完善他们的想法
3. 确保需求描述清晰且可执行
4. 引导用户思考产品的核心价值和用户体验

我会遵循以下原则：
- 提出有见地的问题来深入了解用户需求
- 给出专业的建议和最佳实践
- 保持对话友好且富有建设性
- 确保最终需求能够被开发团队准确理解和实现

让我们开始对话吧！请告诉我您想要开发什么样的应用？`

  public async chat(messages: Array<{ role: string; content: string }>, onChunk?: (chunk: string) => void) {
    const allMessages = [{ role: "system", content: this.systemPrompt }, ...messages]

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

    return response
  }

  public formatRequirementForAppAgent(conversation: Array<{ role: string; content: string }>): string {
    // 过滤出用户的需求描述和产品经理的建议
    const requirements = conversation
      .filter((msg) => msg.role === "user" || msg.role === "assistant")
      .map((msg) => `${msg.role === "user" ? "用户需求" : "需求分析"}：${msg.content}`)
      .join("\n\n")

    return `基于我们的需求讨论：\n${requirements}\n\n请帮我实现这个应用，生成完整的代码。`
  }
}

export default ProductAgent.getInstance()
