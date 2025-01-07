import { useState, useCallback, useMemo, useRef, useEffect } from "react"
import { aiControllerStore } from "../AIControllerStore"
import { imageStore } from "../ImageStore"
import message from "@/components/Message"

interface AIAgent {
  processCommand: (
    command: string | { content: string; images?: string[] },
    onChunk?: (chunk: string) => void
  ) => Promise<any>
}

interface UseAICommandButtonProps {
  input: string
  previews: string[]
  agent: AIAgent
  onResult?: (result: any) => void
  onStop?: () => void
}

interface ButtonState {
  isLoading: boolean
  canSend: boolean
  color: "primary" | "danger" | "default"
  variant: "solid" | "flat"
  icon: string
  disabled: boolean
}

export function useAICommandButton({ input, previews, agent, onResult, onStop }: UseAICommandButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const abortTimeoutRef = useRef<NodeJS.Timeout>()

  // 清理超时计时器
  useEffect(() => {
    return () => {
      if (abortTimeoutRef.current) {
        clearTimeout(abortTimeoutRef.current)
      }
    }
  }, [])

  // 计算按钮状态
  const buttonState = useMemo<ButtonState>(() => {
    const canSend = Boolean(input.trim() || previews.length > 0)

    if (isLoading) {
      return {
        isLoading: true,
        canSend: false,
        color: "danger",
        variant: "flat",
        icon: "mdi:stop",
        disabled: false,
      }
    }

    return {
      isLoading: false,
      canSend,
      color: canSend ? "primary" : "default",
      variant: canSend ? "solid" : "flat",
      icon: "solar:arrow-up-linear",
      disabled: !canSend,
    }
  }, [isLoading, input, previews.length])

  // 处理发送消息
  const handleSend = useCallback(async () => {
    if (!buttonState.canSend || isLoading) return

    try {
      setIsLoading(true)
      const messageContent = {
        content: input.trim(),
        images: previews,
      }

      const result = await agent.processCommand(messageContent)

      // 处理返回结果，确保它是可显示的格式
      const processedResult =
        typeof result === "object"
          ? {
              content: result.content || JSON.stringify(result, null, 2),
              status: result.status,
              role: result.role,
              id: result.id,
              images: previews,
            }
          : {
              content: String(result),
              status: "success",
              role: "assistant",
              id: Date.now().toString(),
              images: previews,
            }

      onResult?.(processedResult)
    } catch (error) {
      console.error("Error in AI command:", error)
      message.error("发送消息失败：" + (error instanceof Error ? error.message : "未知错误"))
    } finally {
      // 设置一个短暂的延时，确保状态正确更新
      abortTimeoutRef.current = setTimeout(() => {
        setIsLoading(false)
      }, 100)
    }
  }, [buttonState.canSend, isLoading, input, previews, agent, onResult])

  // 处理停止生成
  const handleStop = useCallback(() => {
    aiControllerStore.abort()
    // 设置一个短暂的延时，确保状态正确更新
    abortTimeoutRef.current = setTimeout(() => {
      setIsLoading(false)
      onStop?.()
    }, 100)
  }, [onStop])

  return {
    buttonState,
    actions: {
      handleSend,
      handleStop,
    },
  }
}
