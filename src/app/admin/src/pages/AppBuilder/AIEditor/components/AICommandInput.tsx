import React, { memo, useState, useCallback, useRef } from "react"
import {
  Button,
  Textarea,
  Tooltip,
  Progress,
  Badge,
  ScrollShadow,
  Modal,
  ModalContent,
  Chip,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import debounce from "lodash/debounce"

import { cn } from "@/lib/utils"
import { imageStore } from "./ImageStore"
import message from "@/components/Message"
import { AITutorialModal } from "./AITutorialModal"
import { useAICommandButton } from "./hooks/useAICommandButton"

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

interface UploadingFile {
  id: string
  progress: number
  status: "uploading" | "success" | "error"
  url?: string
  fileID?: string
}

const AI_ASSISTANTS = {
  mo: {
    name: "Mo",
    role: "开发模式",
    description: "专注于代码实现和功能开发",
    icon: "line-md:mastodon-filled",
    color: "primary",
    shortcut: "@mo",
  },
  pm: {
    name: "PM",
    role: "交流模式",
    description: "帮助分析需求和解答问题",
    icon: "mdi:account-tie",
    color: "success",
    shortcut: "@pm",
  },
}

// 生成唯一的文件路径
const generateCloudPath = (file: File) => {
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 8)
  const ext = file.name.split(".").pop()
  return `uploads/${timestamp}-${randomStr}.${ext}`
}

const AICommandInput = memo(({ agent, onResult, onStop, aiLevel }: AICommandInputProps) => {
  const [input, setInput] = useState("")
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [selectedPreview, setSelectedPreview] = useState<string>("")
  const [showTutorial, setShowTutorial] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingError, setRecordingError] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const lastTranscriptRef = useRef<string>("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { buttonState, actions } = useAICommandButton({
    input,
    previews: uploadingFiles.filter((f) => f.status === "success").map((f) => f.url!),
    agent,
    onResult: (result) => {
      onResult?.(result)
      setInput("")
      setUploadingFiles([])
      imageStore.clear()
    },
    onStop,
  })

  const handleAssistantShortcut = (shortcut: string) => {
    const cursorPosition = textareaRef.current?.selectionStart || 0
    const newInput = input.slice(0, cursorPosition) + shortcut + " " + input.slice(cursorPosition)
    setInput(newInput)
    setTimeout(() => {
      textareaRef.current?.focus()
      const newPosition = cursorPosition + shortcut.length + 1
      textareaRef.current?.setSelectionRange(newPosition, newPosition)
    }, 0)
  }

  const debouncedSetInput = useCallback(
    debounce((text: string) => {
      setInput(text)
    }, 300),
    []
  )

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        actions.handleSend()
      }
    },
    [actions]
  )

  const handleUploadFile = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      message.error("图片大小不能超过5MB")
      return
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      message.error("只支持 JPG、PNG、GIF 格式图片")
      return
    }

    imageStore.clear()

    const fileId = Date.now().toString()
    setUploadingFiles((prev) => [
      ...prev,
      {
        id: fileId,
        progress: 0,
        status: "uploading",
      },
    ])

    try {
      // 第一步：上传文件
      const cloudPath = generateCloudPath(file)
      const auth = app.auth()
      await auth.signInAnonymously()
      const uploadResult = await app.uploadFile({
        cloudPath,
        filePath: file,
      })

      // 更新上传进度为90%
      setUploadingFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, progress: 90, fileID: uploadResult.fileID } : f))
      )

      // 第二步：获取临时URL
      const urlResult = await app.getTempFileURL({
        fileList: [uploadResult.fileID],
      })

      const tempFileURL = urlResult.fileList[0]?.tempFileURL

      if (!tempFileURL) {
        throw new Error("获取临时URL失败")
      }

      setUploadingFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                status: "success",
                progress: 100,
                url: tempFileURL,
                fileID: uploadResult.fileID,
              }
            : f
        )
      )

      imageStore.addImage(tempFileURL)
      message.success("图片上传成功")
    } catch (error) {
      console.error("Error uploading file:", error)
      setUploadingFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, status: "error" } : f)))
      message.error("图片上传失败，请重试")
    }
  }

  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return

    for (const item of items) {
      if (item.type.indexOf("image") !== -1) {
        e.preventDefault()
        const file = item.getAsFile()
        if (file) {
          await handleUploadFile(file)
        }
      }
    }
  }, [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    for (const file of files) {
      await handleUploadFile(file)
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleDeleteImage = (fileId: string) => {
    const file = uploadingFiles.find((f) => f.id === fileId)
    if (file?.url) {
      imageStore.removeImage(file.url)
    }
    setUploadingFiles((prev) => prev.filter((f) => f.id !== fileId))
    message.success("图片删除成功")
  }

  const handleRetryUpload = async (fileId: string) => {
    const file = uploadingFiles.find((f) => f.id === fileId)
    if (!file) return

    setUploadingFiles((prev) => prev.filter((f) => f.id !== fileId))
    const input = fileInputRef.current
    if (input?.files?.[0]) {
      await handleUploadFile(input.files[0])
    }
  }

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
          {uploadingFiles.map((file) => (
            <Badge
              key={file.id}
              size='sm'
              isOneChar
              className='opacity-100 transition-opacity duration-200'
              content={
                <Button
                  isIconOnly
                  radius='full'
                  size='sm'
                  variant='light'
                  onClick={() => handleDeleteImage(file.id)}
                  className='bg-white/80 backdrop-blur-sm hover:bg-danger-50'
                >
                  <Icon icon='mdi:close' className='w-3 h-3 text-danger' />
                </Button>
              }
            >
              <div className='relative w-16 h-16'>
                {file.status === "uploading" && (
                  <div className='absolute inset-0 flex items-center justify-center bg-default-100/50 backdrop-blur-sm'>
                    <Progress size='sm' value={file.progress} color='primary' className='w-12' />
                  </div>
                )}
                {file.status === "error" && (
                  <div
                    className='absolute inset-0 flex items-center justify-center bg-danger-50/50 backdrop-blur-sm cursor-pointer'
                    onClick={() => handleRetryUpload(file.id)}
                  >
                    <Icon icon='mdi:refresh' className='w-6 h-6 text-danger' />
                  </div>
                )}
                {file.url && (
                  <img
                    src={file.url}
                    alt={`Preview ${file.id}`}
                    className='w-full h-full object-cover rounded-small border-small border-default-200/50 transition-transform duration-200 hover:scale-105 cursor-pointer'
                    onClick={() => {
                      setSelectedPreview(file.url!)
                      setIsPreviewModalOpen(true)
                    }}
                  />
                )}
              </div>
            </Badge>
          ))}
        </div>

        <div className='px-4 flex gap-2'>
          {Object.entries(AI_ASSISTANTS).map(([key, assistant]) => (
            <Tooltip key={key} content={assistant.description}>
              <Chip
                variant='flat'
                color={assistant.color as any}
                startContent={<Icon icon={assistant.icon} className='w-4 h-4' />}
                className='cursor-pointer'
                onClick={() => handleAssistantShortcut(assistant.shortcut)}
              >
                {assistant.name} ({assistant.role})
              </Chip>
            </Tooltip>
          ))}
        </div>

        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          onPaste={handlePaste}
          ref={textareaRef}
          placeholder='输入 @mo 与工程师对话，或 @pm 与产品经理讨论...'
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
            <Tooltip content='支持jpg、png、gif，最大5MB'>
              <Button
                size='sm'
                variant='flat'
                startContent={<Icon className='text-default-500' icon='solar:gallery-minimalistic-linear' width={18} />}
                onClick={handleImageClick}
              >
                图片
              </Button>
            </Tooltip>

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
            <Button
              isIconOnly
              color={buttonState.color}
              isDisabled={buttonState.disabled}
              radius='lg'
              size='sm'
              variant={buttonState.variant}
              onPress={buttonState.isLoading ? actions.handleStop : actions.handleSend}
              className='transition-transform active:scale-95'
            >
              <Icon
                className={cn(
                  "[&>path]:stroke-[2px]",
                  buttonState.color === "primary" ? "text-primary-foreground" : "text-default-600"
                )}
                icon={buttonState.icon}
                width={20}
              />
            </Button>
          </div>
        </div>
      </form>

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

      <AITutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} />
    </>
  )
})

AICommandInput.displayName = "AICommandInput"

export default AICommandInput
