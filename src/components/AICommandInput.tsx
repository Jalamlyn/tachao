import React, { memo, useState, useCallback } from "react"
import { Button, Textarea, Tabs, Tab } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import message from "./Message"

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
  const [selectedMode, setSelectedMode] = useState<"modify" | "analyze">("modify")

  // 获取占位符文本
  const getPlaceholder = useCallback(() => {
    switch (selectedMode) {
      case "modify":
        return "请输入修改指令，例如：将第一行的姓名改为张三..."
      case "analyze":
        return "请输入分析需求，例如：统计所有销售金额的总和..."
      default:
        return "输入您的问题，AI 将帮您分析数据..."
    }
  }, [selectedMode])

  // 处理发送消息
  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return

    try {
      setIsLoading(true)
      const result = await agent.processCommand(input, (chunk: string) => {
        // 处理流式响应
        console.log("Chunk received:", chunk)
      })

      onResult?.(result)
      setInput("")
    } catch (error) {
      console.error("Error in AI command:", error)
      message.error("处理指令时发生错误")
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
    <div className='flex flex-col gap-2 p-4 bg-white'>
      <Tabs
        selectedKey={selectedMode}
        onSelectionChange={(key) => setSelectedMode(key as "modify" | "analyze")}
        size='sm'
        color='primary'
        variant='light'
        classNames={{
          tabList: "gap-4",
          cursor: "w-full",
          tab: "max-w-fit px-4",
        }}
      >
        <Tab
          key='modify'
          title={
            <div className='flex items-center gap-2'>
              <Icon icon='mdi:pencil' />
              <span>资料修改</span>
            </div>
          }
        />
        <Tab
          key='analyze'
          title={
            <div className='flex items-center gap-2'>
              <Icon icon='mdi:chart-bar' />
              <span>资料分析</span>
            </div>
          }
        />
      </Tabs>

      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={getPlaceholder()}
        className='flex-grow'
        classNames={{
          input: "py-2 text-medium",
          inputWrapper: "bg-default-100",
        }}
        minRows={1}
        maxRows={4}
        endContent={
          <div className='flex items-center gap-2 pr-2'>
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
                <Icon
                  className={!input ? "text-default-500" : "text-white"}
                  icon='solar:arrow-up-linear'
                  width={20}
                />
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