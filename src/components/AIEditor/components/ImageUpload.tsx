import React, { useState, useRef } from "react"
import { Button, Tooltip, Modal } from "@nextui-org/react"
import { Button as SButton } from "@/components/ui/button"
import { Icon } from "@iconify/react"
import message from "@/components/Message"
import { AIEditorProps } from "./AIEditor"
import { AI_LEVELS } from "./AIEditor/type"
import { localDB } from "@/utils/localDB"

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
        localDB.setItem("cachedImage", base64)
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
          <div className='flex flex-col gap-1 p-2'>
            <div className='flex items-center gap-2'>
              <Icon icon='mdi:check-circle' className='w-4 h-4 text-success' />
              <span className='font-medium'>上传图片帮助 AI 更好理解您的需求</span>
            </div>
            <div className='text-sm text-default-500 pl-6'>
              支持场景：
              <div>• 表单界面截图 </div>
              <div>• 单据或文档截图 </div>
              <div>• 需求说明文档 </div>
              <div>• 手绘草图或设计稿</div>
            </div>
            <div className='text-xs text-default-400 pl-6'>支持 JPG、PNG格式，最大 5MB</div>
          </div>
        }
      >
        <Button
          variant='bordered'
          size='sm'
          onClick={handleUploadClick}
          disabled={isLoading}
          className={`flex items-center gap-2 relative`}
        >
          <Icon icon='mdi:image-plus' className='w-4 h-4' />
          {isLoading ? "上传中..." : "上传图片"}
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
