import { context } from "@/lib/context"

const {
  wpm,
  React,
  observer,
  Icon,
  NextUI,
  ReactRouterDom,
  ReactHookForm,
  ReactToPrint,
  FramerMotion,
  message,
  appId,
  api,
  ai,
  mobx,
  recharts,
  cn,
  xlsx,
  esm,
} = context

const { makeAutoObservable, runInAction } = mobx

class ChatStore {
  messages = []
  loading = false
  error = null
  needsHumanSupport = false

  constructor() {
    makeAutoObservable(this)
    api.log.info("ChatStore 初始化")
  }

  sendMessage = async (content) => {
    if (!content?.trim()) {
      api.log.warn("发送空消息")
      return
    }

    try {
      this.loading = true

      // 添加用户消息
      this.addMessage({
        id: Date.now(),
        content,
        sender: "user",
        timestamp: new Date().toISOString(),
      })

      // 分析情绪
      const emotionResult = await this.analyzeEmotion(content)

      if (emotionResult.needsSupport) {
        this.needsHumanSupport = true
        this.addMessage({
          id: Date.now() + 1,
          content: "我理解您现在的心情。建议您与我们的专业咨询师沟通，她们可以提供更专业的帮助。是否需要转接人工客服？",
          sender: "ai",
          timestamp: new Date().toISOString(),
          isSupport: true,
        })
      } else {
        // 正常AI对话
        await this.getAIResponse(content)
      }

      api.log.info("发送消息成功", {
        content,
        needsSupport: emotionResult.needsSupport,
      })
    } catch (error) {
      api.log.error("发送消息失败", {
        error: error.message,
        content,
      })

      runInAction(() => {
        this.error = error.message
        this.loading = false
      })

      message.error("发送消息失败")
    } finally {
      runInAction(() => {
        this.loading = false
      })
    }
  }

  addMessage = (message) => {
    runInAction(() => {
      this.messages.push(message)
    })
  }

  analyzeEmotion = async (content) => {
    try {
      // 使用AI分析情绪
      let response = ""
      await ai.chat(
        [
          {
            role: "system",
            content:
              "你是一个情绪分析专家，需要判断用户的情绪状态是否需要人工干预。如果检测到焦虑、抑郁等负面情绪，返回 true。",
          },
          {
            role: "user",
            content,
          },
        ],
        {
          onChunk: (chunk) => {
            response += chunk
          },
        }
      )

      const needsSupport = response.toLowerCase().includes("true")

      api.log.info("情绪分析完成", {
        content,
        needsSupport,
      })

      return { needsSupport }
    } catch (error) {
      api.log.error("情绪分析失败", {
        error: error.message,
        content,
      })
      throw error
    }
  }

  getAIResponse = async (content) => {
    try {
      let response = ""
      await ai.chat(
        [
          {
            role: "system",
            content: "你是一个专业的育儿顾问，为宝妈们提供温暖、专业的建议。",
          },
          {
            role: "user",
            content,
          },
        ],
        {
          onChunk: (chunk) => {
            response += chunk
            this.updateLastAIMessage(response)
          },
        }
      )

      api.log.info("AI响应成功", {
        content,
        responseLength: response.length,
      })
    } catch (error) {
      api.log.error("AI响应失败", {
        error: error.message,
        content,
      })
      throw error
    }
  }

  updateLastAIMessage = (content) => {
    runInAction(() => {
      const lastMessage = this.messages[this.messages.length - 1]
      if (lastMessage && lastMessage.sender === "ai") {
        lastMessage.content = content
      } else {
        this.addMessage({
          id: Date.now(),
          content,
          sender: "ai",
          timestamp: new Date().toISOString(),
        })
      }
    })
  }

  transferToHuman = () => {
    // 这里应该调用客服系统API
    message.success("正在转接人工客服...")
    this.needsHumanSupport = false
  }

  get hasMessages() {
    return Array.isArray(this.messages) && this.messages.length > 0
  }
}

// 创建单例实例并导出
const chatStore = new ChatStore()
context.wpm.export("store_chat", chatStore)
