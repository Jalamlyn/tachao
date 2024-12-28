import React, { memo, useState, useCallback, useRef } from "react"
import { Button, Textarea, Tooltip, Progress } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import message from "../../Message"
import { cn } from "@/lib/utils"
import { imageStore } from "./ImageStore"

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
  const [preview, setPreview] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      message.error("图片大小不能超过5MB")
      return
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      message.error("只支持 JPG, PNG, GIF 格式")
      return
    }

    setIsUploading(true)
    try {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64 = reader.result as string
        
        // 清除之前的图片
        if (preview) {
          imageStore.removeImage(preview)
        }
        
        setPreview(base64)
        imageStore.addImage(base64)
        
        setIsUploading(false)
        message.success("图片上传成功")
      }
      reader.onerror = () => {
        message.error("图片读取失败")
        setIsUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error("Error uploading image:", error)
      message.error("图片上传失败")
      setIsUploading(false)
    }
  }

  // 触发文件选择
  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <form className="flex w-full items-start gap-2">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/jpeg,image/png,image/gif"
        onChange={handleImageUpload}
      />
      
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
            <Button 
              isIconOnly 
              radius="full" 
              size="sm" 
              variant="light" 
              onClick={handleImageClick}
              isDisabled={isUploading}
            >
              {isUploading ? (
                <Icon className="animate-spin" icon="eos-icons:loading" width={20} />
              ) : (
                <Icon
                  className="text-default-500"
                  icon="solar:gallery-minimalistic-linear"
                  width={20}
                />
              )}
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
      
      {preview && (
        <div className="relative">
          <img 
            src={preview} 
            alt="Preview" 
            className="w-16 h-16 object-cover rounded border border-default-200" 
          />
          <Button
            size="sm"
            variant="light"
            isIconOnly
            className="absolute -top-2 -right-2 p-0 min-w-unit-6 w-unit-6 h-unit-6 rounded-full bg-white/80 backdrop-blur-sm hover:bg-danger-50"
            onClick={() => {
              setPreview("")
              imageStore.removeImage(preview)
              if (fileInputRef.current) {
                fileInputRef.current.value = ""
              }
            }}
          >
            <Icon icon="mdi:close" className="w-3 h-3" />
          </Button>
        </div>
      )}
    </form>
  )
})

AICommandInput.displayName = "AICommandInput"

export default AICommandInput