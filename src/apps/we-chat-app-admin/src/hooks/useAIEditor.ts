import { useState, useCallback } from 'react'
import { AIPageAgent } from '@/components/common/DynamicPage'
import message from '@/components/Message'

interface Message {
  role: 'user' | 'assistant'
  content: string
  id: string
  timestamp: string
}

interface UseAIEditorProps {
  onConfigChange?: (config: any) => void
}

export const useAIEditor = ({ onConfigChange }: UseAIEditorProps = {}) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [pageConfig, setPageConfig] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleSendMessage = useCallback(async (content: string) => {
    // 添加用户消息
    const userMessage: Message = {
      role: 'user',
      content,
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString()
    }
    setMessages(prev => [...prev, userMessage])
    setIsGenerating(true)

    try {
      // 使用 AIPageAgent 生成页面配置
      const response = await AIPageAgent.generatePage(
        content,
        (chunk) => {
          // 实时显示 AI 响应
          setMessages(prev => {
            const newMessages = [...prev]
            const lastMessage = newMessages[newMessages.length - 1]
            if (lastMessage.role === 'assistant') {
              lastMessage.content += chunk
              return [...newMessages]
            } else {
              return [
                ...newMessages,
                {
                  role: 'assistant',
                  content: chunk,
                  id: (Date.now() + 1).toString(),
                  timestamp: new Date().toLocaleTimeString()
                }
              ]
            }
          })
        }
      )

      if (response.type === 'success' && response.data) {
        setPageConfig(response.data)
        onConfigChange?.(response.data)
      } else {
        message.error('生成页面失败')
      }
    } catch (error) {
      console.error('Error generating page:', error)
      message.error('生成过程中发生错误')
    } finally {
      setIsGenerating(false)
    }
  }, [onConfigChange])

  const handleConfigUpdate = useCallback((newConfig: any) => {
    setPageConfig(newConfig)
    onConfigChange?.(newConfig)
  }, [onConfigChange])

  return {
    messages,
    pageConfig,
    isGenerating,
    handleSendMessage,
    handleConfigUpdate
  }
}

export default useAIEditor