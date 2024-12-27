import AIPageAgent from "@/service/agents/AIPageAgent"

export const getPageAgent = (
  addMessage,
  setPreviewContent,
  accumulatedTextRef,
  currentMessageIdRef,
  messages,
  handleChunk,
  pageState,
  updateLastMessage
) => ({
  processCommand: async (command: string) => {
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

      const result = await AIPageAgent.processCommand(
        processMessages,
        command,
        (chunk) => {
          handleChunk(chunk)
        },
        pageState.rawCode
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
      currentMessageIdRef.current = null
      throw error
    }
  },
})
