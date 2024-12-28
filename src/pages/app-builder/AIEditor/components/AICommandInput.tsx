import React, { memo, useState, useCallback } from "react"
import { Button, Textarea, Tooltip } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import message from "../../Message"
import { cn } from "@/lib/utils"

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

  // 处理图片上传
  const handleImageUpload = () => {
    // 保留原有的图片上传功能接口
    // 这里可以集成原有的图片上传逻辑
  }

  return (
    <form className="flex w-full items-start gap-2">
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder='请输入您的问题,AI 将帮您处理...'
        classNames={{
          innerWrapper: "relative w-full",
          input: "pt-1 pb-6 !pr-10 text-medium",
        }}
        minRows={3}
        radius="lg"
        startContent={
          <Tooltip showArrow content="添加图片">
            <Button isIconOnly radius="full" size="sm" variant="light" onClick={handleImageUpload}>
              <Icon
                className="text-default-500"
                icon="solar:gallery-minimalistic-linear"
                width={20}
              />
            </Button>
          </Tooltip>
        }
        endContent={
          <div className="absolute right-0 flex h-full flex-col items-end justify-between gap-2">
            <Tooltip showArrow content="语音输入">
              <Button isIconOnly radius="full" size="sm" variant="light">
                <Icon className="text-default-500" icon="solar:microphone-3-linear" width={20} />
              </Button>
            </Tooltip>
            <div className="flex items-end gap-2">
              <p className="py-1 text-tiny text-default-400">{input.length}/2000</p>
              <Tooltip showArrow content="发送消息">
                <Button
                  isIconOnly
                  color={!input || isLoading ? "default" : "primary"}
                  isDisabled={!input || isLoading}
                  radius="lg"
                  size="sm"
                  variant={!input || isLoading ? "flat" : "solid"}
                  onClick={handleSend}
                >
                  {isLoading ? (
                    <Icon className='animate-spin' icon='eos-icons:loading' width={20} />
                  ) : (
                    <Icon
                      className={cn(
                        "[&>path]:stroke-[2px]",
                        !input ? "text-default-600" : "text-primary-foreground"
                      )}
                      icon="solar:arrow-up-linear"
                      width={20}
                    />
                  )}
                </Button>
              </Tooltip>
            </div>
          </div>
        }
      />
    </form>
  )
})

AICommandInput.displayName = "AICommandInput"

export default AICommandInput