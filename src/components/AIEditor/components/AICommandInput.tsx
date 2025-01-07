import React, { memo, useState, useCallback } from "react"
import { Button, Textarea } from "@nextui-org/react"
import { Icon } from "@iconify/react"

interface AIAgent {
  processCommand: (command: string, onChunk?: (chunk: string) => void) => Promise<any>
}

interface AICommandInputProps {
  agent: AIAgent
  onResult?: (result: any) => void
}

const AICommandInput = memo(({ agent, onResult }: AICommandInputProps) => {
  // 内部状态管理
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // 处理发送消息
  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return

    try {
      setIsLoading(true)
      const result = await agent.processCommand(input)

      onResult?.(result)
      setInput("")
    } catch (error) {
      console.error("Error in AI command:", error)
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, agent, onResult])

  // 处理按键事件
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  return (
    <div className='flex flex-col gap-2 bg-white'>
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder='请输入您的问题,AI 将帮您处理...'
        className='flex-grow'
        classNames={{
          input: "py-2 text-medium",
          inputWrapper: "bg-default-100",
        }}
        minRows={1}
        maxRows={4}
        endContent={
          <div className='flex items-center gap-2'>
            <Button
              isIconOnly
              className={!input || isLoading ? "" : "bg-primary"}
              color={!input || isLoading ? "default" : "primary"}
              isDisabled={!input || isLoading}
              radius='full'
              variant={!input || isLoading ? "flat" : "solid"}
              onClick={handleSend}
              isLoading={isLoading}
            >
              {isLoading ? (
                <Icon className='animate-spin' icon='eos-icons:loading' width={20} />
              ) : (
                <Icon className={!input ? "text-default-500" : "text-white"} icon='solar:arrow-up-linear' width={20} />
              )}
            </Button>
          </div>
        }
      />
    </div>
  )
})

AICommandInput.displayName = "AICommandInput"

export default AICommandInput
