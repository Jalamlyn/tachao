import { useCallback, useRef } from "react"
import AIReportAgent from "@/service/agents/AIReportAgent"
import { Message } from "./useReportMessages"
import { extractShataAICode } from "../utils/messageUtils"

export interface UseReportAIResult {
  processCommand: (command: string) => Promise<{
    success: boolean
    analysis?: any
    message?: string
  }>
  previewContent: string
  handleChunk: (chunk: string) => void
}

export function useReportAI(
  updateMessages: (update: Partial<Message>) => void,
  setPreviewContent: (content: string) => void,
  setSelectedTab: (tab: string) => void
): UseReportAIResult {
  const accumulatedTextRef = useRef("")

  const handleChunk = useCallback(
    (chunk: string) => {
      accumulatedTextRef.current += chunk

      if (accumulatedTextRef.current.includes("<shata-ai-code>") && !previewContent) {
        updateMessages({
          content: (
            <div className='flex items-center gap-3 text-primary'>
              <Icon icon='eos-icons:three-dots-loading' className='w-10 h-10' />
              <div className='flex flex-col'>
                <span className='font-medium text-sm'>AI 正在生成分析代码</span>
              </div>
            </div>
          ),
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
        updateMessages({
          content: accumulatedTextRef.current,
        })
      }
    },
    [updateMessages, setPreviewContent, setSelectedTab]
  )

  const processCommand = useCallback(
    async (command: string) => {
      try {
        accumulatedTextRef.current = ""
        setPreviewContent("")

        const result = await AIReportAgent.processCommand({
          data: resourceData,
          command: command,
          onChunk: handleChunk,
        })

        return {
          success: true,
          analysis: result.analysis,
        }
      } catch (error) {
        console.error("Error in chat:", error)
        return {
          success: false,
          message: "分析过程中发生错误",
        }
      }
    },
    [handleChunk, setPreviewContent]
  )

  return {
    processCommand,
    previewContent: accumulatedTextRef.current,
    handleChunk,
  }
}