// ... 前面的代码保持不变直到 handleCommandResult ...

  const handleCommandResult = useCallback(
    (result) => {
      if (result.success) {
        if (result.analysis) {
          setMessages((prev) => {
            const lastMessage = prev[prev.length - 1]
            if (lastMessage.role === "assistant") {
              // 从 result 中提取原始代码
              const regex = /<shata-ai-resource>([\s\S]*?)<\/shata-ai-resource>/
              const match = lastMessage.content.toString().match(regex)
              const originalCode = match ? match[1].trim() : null

              const updatedMessage = {
                ...lastMessage,
                content: <AnalysisResult analysis={result.analysis} />,
                status: "success",
                code: {
                  preview: <AnalysisResult analysis={result.analysis} />,
                  content: originalCode // 存储原始代码而不是结果对象
                }
              }

              // 添加消息结构打印
              console.log("Message Structure:", {
                role: updatedMessage.role,
                content: "AnalysisResult Component",
                id: updatedMessage.id,
                timestamp: updatedMessage.timestamp,
                status: updatedMessage.status,
                code: {
                  preview: "AnalysisResult Component",
                  content: originalCode // 打印原始代码
                }
              })

              // 添加原始代码日志
              console.log("Original AI Generated Code:", {
                code: originalCode,
                length: originalCode?.length || 0,
                hasShataAIResourceTag: Boolean(match)
              })

              return [...prev.slice(0, -1), updatedMessage]
            }
            return prev
          })
        } else if (result.data) {
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
    [updatedResourceData]
  )

// ... 后面的代码保持不变 ...