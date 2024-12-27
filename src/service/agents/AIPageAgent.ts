import chatChunkExpert from "@/service/chat/chat-chunk-openrouter"
import chatChunk from "@/service/chat/chat-deepseek"
import { Message } from "./AIFormAgentTypes"
import { generateSystemPrompt } from "./prompts/page/page-agent-prompt"
import { balanceStore } from "@/stores/balanceStore"
import { imageStore } from "@/components/AIEditor/components/ImageStore"
import { codeStore } from "@/pages/form-temp-manager/components/codeStore"

export class AIPageAgent {
  private static instance: AIPageAgent
  private _rawCode: string | null = null

  private constructor() {}

  public static getInstance(): AIPageAgent {
    if (!AIPageAgent.instance) {
      AIPageAgent.instance = new AIPageAgent()
    }
    return AIPageAgent.instance
  }

  public getRawCode(): string | null {
    return this._rawCode
  }

  public setRawCode(rawCode: string | null): void {
    this._rawCode = rawCode
  }

  public async parseCode(code: string) {
    try {
      if (!code.includes("<shata-ai-code>")) {
        throw new Error("Invalid code format")
      }
      return {
        code,
        success: true,
      }
    } catch (error) {
      console.error("Error parsing page code:", error)
      throw error
    }
  }

  public async processCommand(
    messages: Message[],
    command: string,
    onChunk?: (chunk: string) => void,
    rawCode?: string
  ): Promise<{ success: boolean; code?: string; error?: string }> {
    if (!balanceStore.checkBalance()) {
      throw new Error("余额不足，请前往企业设置-账户进行充值")
    }

    if (rawCode) {
      this.setRawCode(rawCode)
    }

    try {
      const systemPrompt = await generateSystemPrompt()

      // 获取现有代码
      const existingCode = codeStore.code || rawCode

      const enhancedCommand = `
${
  existingCode
    ? `
这是现有的代码,请基于它进行优化或修改:
<existing-code>
${existingCode}
</existing-code>
`
    : ""
}

${command},从设计师角度

<代码生成规范>
1. NextUI组件使用规范：
   - 只能使用以下NextUI 2.6.0版本中实际存在的组件
   禁止使用 Container Gird Text 这些 NextUI V1 版本中的组件
   - 所有组件使用前必须从NextUI中解构：
     const {Button, Input, Card} = NextUI
  样式使用 tailwind css 实现
  所有的 icon 都使用 @iconify/react 的 Icon 组件
  请求数据只使用 fetch
  动画库只使用 framer-motion
  数据存储只使用 const {getMetadata, setMetadata} = api
  const res = await getMetadata([name])
  const jsonData = JSON.parse(res.data?.[0]?.value)
  
  await setMetadata(name, data) // data 不需要序列化
2. 代码必须完整，不能省略
3. 生成的代码必须包按照下列结构返回:
"""
下面是完整代码实现:
\`\`\`jsx
<shata-ai-code>
export default (props) => {
  const {React, NextUI, FramerMotion, Icon, api, ReactRouterDom} = context
  const {useNavigate} = ReactRouterDom
  const {Card, CardBody, CardHeader,TableBody,TableHeader,Modal, ModalContent,ModalBody,ModalHeader,Form,Navbar, 
  NavbarBrand, 
  NavbarContent, 
  NavbarItem, 
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem} = NextUI // next ui v2.6.0 components
  const {motion} = FramerMotion
     // 1. 状态管理
     const [state, setState] = React.useState()
     
     // 2. 副作用处理
     React.useEffect(() => {}, [])
     
     // 3. 事件处理函数
     const handleEvent = React.useCallback(() => {}, [])
     
     // 4. 渲染逻辑
     return (
       <div>
         // 组件内容
       </div>
     )
   }
</shata-ai-code>
\`\`\`
"""
生成代码只能是 js 不能是 ts, 禁止使用类型
</代码生成规范>
      `

      const allMessages = [
        { role: "system", content: systemPrompt },
        ...messages,
        { role: "user", content: enhancedCommand },
      ]

      let response = ""
      const model = sessionStorage.getItem("aiLevel") || "ADVANCED"

      if (model === "ADVANCED") {
        await chatChunk(
          allMessages,
          (chunk: string) => {
            response += chunk
            onChunk?.(chunk)
          },
          () => {},
          true,
          0
        )
      }

      if (model === "EXPERT") {
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
      }

      // 清理图片缓存
      imageStore.images = []

      if (response.includes("<shata-ai-error>")) {
        return {
          success: false,
          error: "生成失败，请重试",
        }
      }

      if (response.includes("<shata-ai-code>")) {
        this.setRawCode(response)
        return {
          success: true,
          code: response,
        }
      }

      return {
        success: true,
      }
    } catch (error) {
      console.error("Error in processCommand:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "未知错误",
      }
    }
  }
}

export default AIPageAgent.getInstance()
