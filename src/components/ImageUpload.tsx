import React, { useState, useRef } from "react"
import { Button, Tooltip, Modal } from "@nextui-org/react"
import { Button as SButton } from "@/components/ui/button"
import { Icon } from "@iconify/react"
import message from "@/components/Message"
import { AIEditorProps } from "./AIEditor"
import { AI_LEVELS } from "./AIEditor/type"

interface ImageUploaderProps {
  agent: AIEditorProps["agent"]
  aiLevel?: keyof typeof AI_LEVELS
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ agent, aiLevel = "ADVANCED" }) => {
  const [preview, setPreview] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const isExpertMode = aiLevel === "EXPERT"

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!isExpertMode) {
      message.warning("图片上传功能仅在专家模式下可用")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      message.error("图片大小不能超过5MB")
      return
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      message.error("只支持 JPG, PNG, GIF 格式")
      return
    }

    setIsLoading(true)
    try {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setPreview(base64)
        agent.cacheImage?.(base64)
        setIsLoading(false)
      }
      reader.onerror = () => {
        message.error("图片读取失败")
        setIsLoading(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error("Error uploading image:", error)
      message.error("图片上传失败")
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setPreview("")
    if (inputRef.current) {
      inputRef.current.value = ""
    }
    agent.clearCachedImage?.()
  }

  const handleUploadClick = () => {
    if (!isExpertMode) {
      Modal.warning({
        title: "功能限制",
        content: "图片上传功能仅在专家模式下可用，请切换到专家模式后再试。",
        onOk: () => console.log("Modal closed"),
      })
      return
    }
    inputRef.current?.click()
  }

  return (
    <div className='flex items-center gap-2 mb-2'>
      <input
        type='file'
        ref={inputRef}
        className='hidden'
        accept='image/jpeg,image/png,image/gif'
        onChange={handleUpload}
      />
      <Tooltip
        content={
          !isExpertMode ? (
            <div className="flex items-center gap-2 p-2">
              <Icon icon='mdi:information' className='w-4 h-4' />
              <span>图片上传功能仅在专家模式下可用</span>
            </div>
          ) : null
        }
      >
        <Button
          variant='flat'
          size='sm'
          onClick={handleUploadClick}
          disabled={!isExpertMode || isLoading}
          className={`flex items-center gap-2 relative ${!isExpertMode ? 'opacity-50' : ''}`}
        >
          <Icon icon='mdi:image-plus' className='w-4 h-4' />
          {isLoading ? "上传中..." : "上传图片"}
          {isExpertMode && (
            <div className="absolute -top-1 -right-1">
              <Icon icon='mdi:crown' className='w-3 h-3 text-warning-500' />
            </div>
          )}
        </Button>
      </Tooltip>
      {preview && (
        <div className='relative'>
          <img src={preview} alt='Preview' className='w-16 h-16 object-cover rounded border border-default-200' />
          <SButton
            size='sm'
            variant='ghost'
            className='absolute -top-2 -right-2 p-0 min-w-unit-6 w-unit-6 h-unit-6 rounded-full'
            onClick={handleClear}
          >
            <Icon icon='mdi:close' className='w-3 h-3' />
          </SButton>
        </div>
      )}
    </div>
  )
}