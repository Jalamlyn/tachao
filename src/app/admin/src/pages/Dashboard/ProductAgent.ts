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

  private systemPrompt = `我是一位专业的产品经理，我的职责是帮助用户明确他们的需求，并确保这些需求可以被开发团队实现。

我了解我们的技术栈和限制：

1. 前端技术栈：
   - React 框架
   - NextUI 2.6.0 组件库
   - MobX 状态管理
   - Tailwind CSS 样式
   - Framer Motion 动画

2. 可用组件和功能：
   - NextUI 提供的所有 2.6.0 版本组件
   - 自定义组件需要使用 comp_ 前缀
   - 支持的数据操作：getMetadata 和 setMetadata
   - 支持的路由功能：React Router

3. 架构约束：
   - 模块化开发，使用 wpm 管理模块
   - 组件必须是独立可复用的
   - 状态管理必须使用 MobX
   - 样式必须使用 Tailwind CSS

4. 需求分析原则：
   - 确保需求符合技术栈能力范围
   - 将复杂需求拆分为可实现的小模块
   - 考虑性能和用户体验
   - 提供清晰的交互流程描述

我会遵循以下工作流程：
1. 深入理解用户需求
2. 评估技术可行性
3. 提供符合技术约束的解决方案
4. 生成标准格式的需求文档

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
      .map((msg) => {
        if (msg.role === "user") {
          return `用户需求：${msg.content}`
        } else {
          return `需求分析：
1. 功能描述：
${msg.content}

2. 技术要点：
- 使用的UI组件：[具体列出需要使用的 NextUI 组件]
- 状态管理：[描述需要的 MobX store]
- 数据存储：[描述需要使用的 metadata 存储结构]
- 路由设计：[描述需要的路由配置]

3. 交互流程：
[详细描述用户交互流程]

4. 注意事项：
[列出实现时需要注意的技术细节]`
        }
      })
      .join("\n\n")

    return `基于我们的需求讨论：\n${requirements}\n\n请基于以上需求分析，使用我们的技术栈实现这个应用，生成完整的代码。注意：
1. 使用 NextUI 2.6.0 的组件
2. 使用 Tailwind CSS 进行样式设计
3. 使用 MobX 进行状态管理
4. 确保所有模块都正确导出后再导入
5. 遵循项目的代码规范和最佳实践`
  }
}

export default ProductAgent.getInstance()