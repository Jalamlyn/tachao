import message from "@/components/Message"
import AIFormAgent from "@/service/agents/AIFormAgent"

export const getFormAgent = (
  addMessage,
  setPreviewContent,
  accumulatedTextRef,
  currentMessageIdRef,
  messages,
  handleChunk,
  formState,
  updateLastMessage
) => ({
  processCommand: async (command: string, onChunk?: (chunk: string) => void) => {
    const userMessage = {
      role: "user",
      content: command,
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
    }
    addMessage(userMessage)
    // 立即添加一个"正在思考"的 assistant 消息
    const assistantMessage = {
      role: "assistant",
      content: "",
      id: (Date.now() + 1).toString(),
      timestamp: new Date().toLocaleTimeString(),
      status: "thinking",
    }
    addMessage(assistantMessage)
    setPreviewContent("")
    accumulatedTextRef.current = ""
    currentMessageIdRef.current = null

    try {
      const processMessages = messages.map((msg) => ({
        role: msg.role,
        content: typeof msg.content === "string" ? msg.content : String(msg.content),
      }))

      const result = await AIFormAgent.processCommand(
        processMessages,
        command,
        (chunk) => {
          onChunk?.(chunk)
          handleChunk(chunk)
        },
        formState.rawConfig
      )

      currentMessageIdRef.current = null
      return result
    } catch (error) {
      console.error("Error in chat:", error)
      // 更新最后一条消息为错误状态
      updateLastMessage({
        content: error.message || "生成过程中发生错误",
        status: "error",
      })
      message.error("生成过程中发生错误")
      currentMessageIdRef.current = null
      throw error
    }
  },
})
