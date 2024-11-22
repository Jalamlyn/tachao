import { useState, useRef, useCallback } from "react"
import { Message } from "../types"
import { Icon } from "@iconify/react"
import React from "react"
import AnalysisResult from "../components/AnalysisResult"
import ErrorBoundary from "@/components/ErrorBoundary"

export function useMessageHandling() {
  const [messages, setMessages] = useState<Message[]>([])
  const accumulatedTextRef = useRef("")

  const handleChunk = useCallback((chunk: string, previewContent: string, setPreviewContent: (content: string) => void, setSelectedTab: (tab: string) => void) => {
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

  return {
    messages,
    setMessages,
    accumulatedTextRef,
    handleChunk,
  }
}

function extractShataAICode(text: string): string | null {
  const startTag = "<shata-ai-code>"
  const endTag = "</shata-ai-code>"
  const startIndex = text.indexOf(startTag)
  const endIndex = text.indexOf(endTag)
  
  if (startIndex !== -1 && endIndex !== -1) {
    return text.substring(startIndex + startTag.length, endIndex).trim()
  }
  return null
}