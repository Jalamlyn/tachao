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

  private systemPrompt = `我是一位专注于产品需求分析的AI产品经理。请告诉我您想要开发什么产品,我会帮您分析:

1. 产品定位
- 解决什么问题?
- 目标用户是谁?
- 核心价值是什么?

2. 功能规划
- 核心功能有哪些?
- 用户操作流程?
- 关键数据和状态?

3. 界面要求
- 页面布局结构
- 交互设计要点
- 视觉风格建议

我会基于您的描述,输出清晰的产品需求文档,包含:
1. 产品定位与价值
2. 功能需求清单
3. 用户界面规范
4. 数据与规则
5. 验收标准

让我们开始吧,请描述您想要开发的产品。`

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
    const requirements = conversation
      .filter((msg) => msg.role === "user" || msg.role === "assistant")
      .map((msg) => {
        if (msg.role === "user") {
          return `用户需求：${msg.content}`
        } else {
          return `产品需求规格：

1. 产品定位与价值
[产品定位、目标用户、核心价值]

2. 功能需求清单
[核心功能列表、操作流程、数据规则]

3. 界面规范
[页面布局、交互设计、视觉风格]

4. 验收标准
[功能验收条件、界面要求、数据规则]`
        }
      })
      .join("\n\n")

    return `基于产品需求分析：\n${requirements}\n\n请按照需求规格开发。`
  }
}

export default ProductAgent.getInstance()