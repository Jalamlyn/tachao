// 只展示修改的部分,其他代码保持不变
const handleCommandResult = useCallback(
  (result) => {
    console.log("[handleCommandResult] Processing result:", result)
    if (result.success) {
      if (result.analysis) {
        console.log("[handleCommandResult] Analysis result received")
        
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1]
          if (lastMessage.role === "assistant") {
            const regex = /<shata-ai-resource>([\s\S]*?)<\/shata-ai-resource>/
            const match = lastMessage.content.toString().match(regex)
            const originalCode = match ? match[1].trim() : null

            const messageWithCode = {
              ...lastMessage,
              content: <AnalysisResult analysis={result.analysis} />,
              status: "success",
              code: {
                preview: <AnalysisResult analysis={result.analysis} />,
                content: originalCode,
              }
            }

            // 直接调用预览逻辑
            handlePreview(messageWithCode.code)

            return [...prev.slice(0, -1), messageWithCode]
          }
          return prev
        })
      } else if (result.data) {
        console.log("[handleCommandResult] Data result received")
        updatedResourceData(result.data)
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1]
          if (lastMessage.role === "assistant") {
            return [
              ...prev.slice(0, -1),
              {
                ...lastMessage,
                content: "✅ 数据已更新",
                status: "success",
              },
            ]
          }
          return prev
        })
      }
    } else {
      console.log("[handleCommandResult] Error result received")
      setMessages((prev) => {
        const lastMessage = prev[prev.length - 1]
        if (lastMessage.role === "assistant") {
          return [
            ...prev.slice(0, -1),
            {
              ...lastMessage,
              content: result.message,
              status: "error",
            },
          ]
        }
        return prev
      })
    }
  },
  [handlePreview, updatedResourceData] // 添加handlePreview依赖
)