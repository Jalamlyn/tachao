import React, { memo, useState, useCallback, useRef } from "react"
import { Button, Textarea, Tooltip, Progress, Badge, ScrollShadow, Modal, ModalContent } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import debounce from "lodash/debounce"

import { cn } from "@/lib/utils"
import { imageStore } from "./ImageStore"
import { aiControllerStore } from "./AIControllerStore"
import message from "@/components/Message"
import { AITutorialModal } from "./AITutorialModal"

interface AIAgent {
  processCommand: (
    command: string | { content: string; images?: string[] },
    onChunk?: (chunk: string) => void
  ) => Promise<any>
}

interface AICommandInputProps {
  agent: AIAgent
  onResult?: (result: any) => void
  onStop?: () => void
  aiLevel?: string
}

const AICommandInput = memo(({ agent, onResult, onStop, aiLevel }: AICommandInputProps) => {
  // 内部状态管理
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [previews, setPreviews] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingError, setRecordingError] = useState<string>("")
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [selectedPreview, setSelectedPreview] = useState<string>("")
  const [showTutorial, setShowTutorial] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const lastTranscriptRef = useRef<string>("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 使用防抖处理输入更新
  const debouncedSetInput = useCallback(
    debounce((text: string) => {
      setInput(text)
    }, 300),
    []
  )

  // 处理发送消息
  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return

    try {
      setIsLoading(true)
      const result = await agent.processCommand({
        content: input,
        images: previews,
      })

      // 处理返回结果，确保它是可显示的格式
      const processedResult = typeof result === 'object' 
        ? { 
            content: result.content || JSON.stringify(result, null, 2),
            status: result.status,
            role: result.role,
            id: result.id
          }
        : { 
            content: String(result),
            status: 'success',
            role: 'assistant',
            id: Date.now().toString()
          }

      onResult?.(processedResult)
      setInput("")
      setPreviews([]) // 清空预览图片
    } catch (error) {
      console.error("Error in AI command:", error)
      message.error("发送消息失败：" + (error instanceof Error ? error.message : "未知错误"))
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, agent, onResult, previews])

  // 处理停止生成
  const handleStop = useCallback(() => {
    aiControllerStore.abort()
    setIsLoading(false)
    onStop?.()
  }, [onStop])

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

  // 处理剪贴板粘贴
  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return

    for (const item of items) {
      if (item.type.indexOf("image") !== -1) {
        e.preventDefault()
        const file = item.getAsFile()
        if (file) {
          if (file.size > 5 * 1024 * 1024) {
            message.error("图片大小不能超过5MB")
            return
          }

          setIsUploading(true)
          try {
            const reader = new FileReader()
            reader.onloadend = () => {
              const base64 = reader.result as string
              setPreviews((prev) => [...prev, base64])
              imageStore.addImage(base64)
              setIsUploading(false)
              message.success("图片粘贴成功")
            }
            reader.onerror = () => {
              message.error("图片读取失败")
              setIsUploading(false)
            }
            reader.readAsDataURL(file)
          } catch (error) {
            console.error("Error processing pasted image:", error)
            message.error("图片处理失败")
            setIsUploading(false)
          }
        }
      }
    }
  }, [])

  // 处理图片上传
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const maxSize = 5 * 1024 * 1024 // 5MB
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"]

    for (const file of files) {
      if (file.size > maxSize) {
        message.error(`图片 ${file.name} 大小不能超过5MB`)
        continue
      }

      if (!allowedTypes.includes(file.type)) {
        message.error(`图片 ${file.name} 格式不支持，只支持 JPG, PNG, GIF`)
        continue
      }

      setIsUploading(true)
      try {
        const reader = new FileReader()
        reader.onloadend = async () => {
          const base64 = reader.result as string
          setPreviews((prev) => [...prev, base64])
          imageStore.addImage(base64)
          setIsUploading(false)
          message.success(`图片 ${file.name} 上传成功`)
        }
        reader.onerror = () => {
          message.error(`图片 ${file.name} 读取失败`)
          setIsUploading(false)
        }
        reader.readAsDataURL(file)
      } catch (error) {
        console.error("Error uploading image:", error)
        message.error(`图片 ${file.name} 上传失败`)
        setIsUploading(false)
      }
    }

    // 清空文件输入以支持重复上传相同文件
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // 触发文件选择
  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  // 删除单张图片
  const handleDeleteImage = (imageToDelete: string) => {
    setPreviews((prev) => prev.filter((img) => img !== imageToDelete))
    imageStore.removeImage(imageToDelete)
    message.success("图片删除成功")
  }

  // 初始化语音识别
  const initSpeechRecognition = () => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!SpeechRecognition) {
        throw new Error("浏览器不支持语音识别")
      }

      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = "zh-CN"

      recognition.onstart = () => {
        setIsRecording(true)
        setRecordingError("")
        lastTranscriptRef.current = ""
      }

      recognition.onend = () => {
        setIsRecording(false)
      }

      recognition.onresult = (event) => {
        const lastResult = event.results[event.results.length - 1]
        const transcript = lastResult[0].transcript

        if (transcript === lastTranscriptRef.current) {
          return
        }

        lastTranscriptRef.current = transcript
        debouncedSetInput(transcript)
      }

      recognition.onerror = (event) => {
        setRecordingError(event.error)
        setIsRecording(false)
        message.error("语音识别出错: " + event.error)
      }

      recognitionRef.current = recognition
    } catch (error) {
      console.error("Error initializing speech recognition:", error)
      message.error("初始化语音识别失败")
    }
  }

  // 处理语音输入
  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      initSpeechRecognition()
    }

    if (isRecording) {
      recognitionRef.current?.stop()
    } else {
      try {
        recognitionRef.current?.start()
      } catch (error) {
        console.error("Error starting speech recognition:", error)
        message.error("启动语音识别失败")
      }
    }
  }

  return (
    <>
      <form className='flex w-full flex-col gap-2 rounded-medium bg-default-100 transition-colors hover:bg-default-200/70'>
        <input
          type='file'
          ref={fileInputRef}
          className='hidden'
          accept='image/jpeg,image/png,image/gif'
          onChange={handleImageUpload}
          multiple
        />

        <div className='group flex flex-wrap gap-2 px-4 pt-4'>
          {previews.map((preview, index) => (
            <Badge
              key={index}
              size='sm'
              isOneChar
              className='opacity-100 transition-opacity duration-200'
              content={
                <Button
                  isIconOnly
                  radius='full'
                  size='sm'
                  variant='light'
                  onClick={() => handleDeleteImage(preview)}
                  className='bg-white/80 backdrop-blur-sm hover:bg-danger-50'
                >
                  <Icon icon='mdi:close' className='w-3 h-3 text-danger' />
                </Button>
              }
            >
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className='w-16 h-16 object-cover rounded-small border-small border-default-200/50 transition-transform duration-200 hover:scale-105 cursor-pointer'
                onClick={() => {
                  setSelectedPreview(preview)
                  setIsPreviewModalOpen(true)
                }}
              />
            </Badge>
          ))}
        </div>

        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          onPaste={handlePaste}
          ref={textareaRef}
          placeholder='请输入您的问题,AI 将帮您处理...'
          classNames={{
            inputWrapper: "!bg-transparent shadow-none",
            innerWrapper: "relative",
            input: "pt-1 pb-6 !pr-10 text-medium",
          }}
          minRows={3}
          radius='lg'
        />

        <div className='flex w-full flex-wrap items-center justify-between gap-2 px-4 pb-4'>
          <div className='flex flex-wrap gap-3'>
            <Button
              size='sm'
              variant='flat'
              startContent={
                isUploading ? (
                  <Icon className='animate-spin' icon='eos-icons:loading' width={18} />
                ) : (
                  <Icon className='text-default-500' icon='solar:gallery-minimalistic-linear' width={18} />
                )
              }
              onClick={handleImageClick}
            >
              图片
            </Button>

            <Button
              size='sm'
              variant='flat'
              startContent={
                <Icon
                  className={cn("text-default-500", isRecording && "text-primary")}
                  icon='solar:soundwave-linear'
                  width={18}
                />
              }
              onClick={handleVoiceInput}
            >
              语音
            </Button>

            <Button
              size='sm'
              variant='flat'
              startContent={<Icon className='text-default-500' icon='solar:question-circle-linear' width={18} />}
              onClick={() => setShowTutorial(true)}
            >
              教程
            </Button>
          </div>

          <div className='flex items-center gap-3'>
            {isLoading ? (
              <Button
                isIconOnly
                color='danger'
                radius='lg'
                size='sm'
                variant='flat'
                onClick={handleStop}
                className='transition-transform active:scale-95'
              >
                <Icon icon='mdi:stop' width={20} />
              </Button>
            ) : (
              <Button
                isIconOnly
                color={!input || isLoading ? "default" : "primary"}
                isDisabled={!input || isLoading}
                radius='lg'
                size='sm'
                variant={!input || isLoading ? "flat" : "solid"}
                onClick={handleSend}
                className='transition-transform active:scale-95'
              >
                {isLoading ? (
                  <Icon className='animate-spin' icon='eos-icons:loading' width={20} />
                ) : (
                  <Icon
                    className={cn("[&>path]:stroke-[2px]", !input ? "text-default-600" : "text-primary-foreground")}
                    icon='solar:arrow-up-linear'
                    width={20}
                  />
                )}
              </Button>
            )}
          </div>
        </div>
      </form>

      {/* 图片预览Modal */}
      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => {
          setIsPreviewModalOpen(false)
          setSelectedPreview("")
        }}
        size='4xl'
        classNames={{
          wrapper: "items-center",
        }}
      >
        <ModalContent>
          <div className='relative'>
            <img src={selectedPreview} alt='Preview' className='w-full h-full object-contain max-h-[80vh]' />
            <Button
              isIconOnly
              className='absolute top-2 right-2'
              color='danger'
              variant='light'
              onClick={() => {
                setIsPreviewModalOpen(false)
                setSelectedPreview("")
              }}
            >
              <Icon icon='mdi:close' className='w-6 h-6' />
            </Button>
          </div>
        </ModalContent>
      </Modal>

      {/* 教程Modal */}
      <AITutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} />
    </>
  )
})

AICommandInput.displayName = "AICommandInput"

export default AICommandInput