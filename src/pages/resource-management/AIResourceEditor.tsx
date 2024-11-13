// ... 前面的代码保持不变 ...

const handleCommandResult = useCallback(
    (result) => {
      if (result.success) {
        if (result.analysis) {
          setMessages((prev) => {
            const lastMessage = prev[prev.length - 1]
            if (lastMessage.role === "assistant") {
              const updatedMessage = {
                ...lastMessage,
                content: <AnalysisResult analysis={result.analysis} />,
                status: "success",
                code: {
                  preview: <AnalysisResult analysis={result.analysis} />,
                  content: JSON.stringify(result.analysis, null, 2)
                }
              }
              
              // 添加消息结构打印
              console.log('Message Structure:', {
                role: updatedMessage.role,
                content: "AnalysisResult Component",
                id: updatedMessage.id,
                timestamp: updatedMessage.timestamp,
                status: updatedMessage.status,
                code: {
                  preview: "AnalysisResult Component",
                  content: JSON.stringify(result.analysis, null, 2)
                }
              })
              
              return [
                ...prev.slice(0, -1),
                updatedMessage,
              ]
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