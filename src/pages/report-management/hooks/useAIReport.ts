import { useState, useCallback, useRef } from "react"
import AIReportAgent from "@/service/agents/AIReportAgent"
import { useVersionControl } from "@/hooks/useVersionControl"
import message from "@/components/Message"

interface Message {
  role: "user" | "assistant"
  content: React.ReactNode
  id: string
  timestamp: string
  status?: "success" | "error"
  code?: {
    preview?: React.ReactNode
    content?: string
  }
}

export function useAIReport() {
  const [messages, setMessages] = useState<Message[]>([])
  const [previewContent, setPreviewContent] = useState<string>("")
  const [previewComponent, setPreviewComponent] = useState<React.ReactNode>(null)
  const [selectedTab, setSelectedTab] = useState("data")
  const accumulatedTextRef = useRef("")

  // 添加版本控制
  const versionControl = useVersionControl<{
    analysis: any
    code: string | null
  }>()

  const handleChunk = useCallback((chunk: string) => {
    accumulatedTextRef.current += chunk

    if (accumulatedTextRef.current.includes("<shata-ai-code>") && !previewContent) {
      setMessages((prev) => {
        const lastMessage = prev[prev.length - 1]
        return [
          ...prev.slice(0, -1),
          {
            ...lastMessage,
            content: (
              <div className='flex items-center gap-3 text-primary'>
                <Icon icon='eos-icons:three-dots-loading' className='w-10 h-10' />
                <div className='flex flex-col'>
                  <span className='font-medium text-sm'>AI 正在生成分析代码</span>
                </div>
              </div>
            ),
          },
        ]
      })

      setSelectedTab("code")
    }

    if (previewContent || accumulatedTextRef.current.includes("<shata-ai-code>")) {
      const newContent = accumulatedTextRef.current
      setPreviewContent(newContent)

      if (accumulatedTextRef.current.includes("</shata-ai-code>")) {
        const code = extractShataAICode(accumulatedTextRef.current)
        if (code) {
          setPreviewContent(code)
        }
      }
    } else {
      setMessages((prev) => {
        const lastMessage = prev[prev.length - 1]
        return [
          ...prev.slice(0, -1),
          {
            ...lastMessage,
            content: lastMessage.content + chunk,
          },
        ]
      })
    }
  }, [])

  const handleCommandResult = useCallback(
    (result) => {
      if (result.success) {
        if (result.analysis) {
          // 保存新版本
          versionControl.addVersion({
            analysis: result.analysis,
            code: previewContent,
          })

          setMessages((prev) => {
            const lastMessage = prev[prev.length - 1]
            if (lastMessage.role === "assistant") {
              const regex = /<shata-ai-code>([\s\S]*?)<\/shata-ai-code>/
              const match = lastMessage.content.toString().match(regex)
              const originalCode = match ? match[1].trim() : null

              const messageWithCode = {
                ...lastMessage,
                content: (
                  <div className='flex items-center gap-2 text-success'>
                    <Icon icon='line-md:check-all' className='w-5 h-5' />
                    <span>分析完成</span>
                  </div>
                ),
                status: "success",
                code: {
                  preview: (
                    <ErrorBoundary
                      onReset={() => {
                        const prevVersion = versionControl.rollback()
                        if (prevVersion) {
                          setPreviewContent(prevVersion.code || "")
                          setPreviewComponent(<AnalysisResult analysis={prevVersion.analysis} />)
                        }
                      }}
                    >
                      <AnalysisResult analysis={result.analysis} />
                    </ErrorBoundary>
                  ),
                  content: originalCode,
                },
              }

              setSelectedTab("preview")
              setPreviewComponent(
                <ErrorBoundary
                  onReset={() => {
                    const prevVersion = versionControl.rollback()
                    if (prevVersion) {
                      setPreviewContent(prevVersion.code || "")
                      setPreviewComponent(<AnalysisResult analysis={prevVersion.analysis} />)
                    }
                  }}
                >
                  <AnalysisResult analysis={result.analysis} />
                </ErrorBoundary>
              )

              return [...prev.slice(0, -1), messageWithCode]
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
    [previewContent, versionControl]
  )

  const reportAgent = {
    processCommand: async (command: string) => {
      try {
        accumulatedTextRef.current = ""
        setPreviewContent("")

        const userMessage: Message = {
          role: "user",
          content: command,
          id: Date.now().toString(),
          timestamp: new Date().toLocaleTimeString(),
        }
        setMessages((prev) => [...prev, userMessage])

        const assistantMessage: Message = {
          role: "assistant",
          content: "正在分析您的数据...",
          id: (Date.now() + 1).toString(),
          timestamp: new Date().toLocaleTimeString(),
        }
        setMessages((prev) => [...prev, assistantMessage])

        const result = await AIReportAgent.processCommand({
          data: resourceData,
          command: command,
          onChunk: handleChunk,
        })

        return result
      } catch (error) {
        console.error("Error in chat:", error)
        message.error("分析过程中发生错误")
        throw error
      }
    },
  }

  return {
    messages,
    previewContent,
    previewComponent,
    selectedTab,
    setSelectedTab,
    handleCommandResult,
    reportAgent,
    versionControl,
  }
}

const extractShataAICode = (content: string) => {
  const regex = /<shata-ai-code>([\s\S]*?)<\/shata-ai-code>/
  const match = content.match(regex)
  if (match) {
    return match[1].trim()
  }
  return null
}