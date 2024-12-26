import React, { useState, useRef } from "react"
import { Button, Tooltip, Modal, Progress } from "@nextui-org/react"
import { Button as SButton } from "@/components/ui/button"
import { Icon } from "@iconify/react"
import message from "@/components/Message"
import { imageStore } from "./ImageStore"
import { AI_LEVELS, AIEditorProps } from "../type"

interface ImageUploaderProps {
  agent: AIEditorProps["agent"]
  aiLevel?: keyof typeof AI_LEVELS
}

interface AnalysisStatus {
  result: string
  inProgress: boolean
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ agent, aiLevel = "ADVANCED" }) => {
  const [preview, setPreview] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [showAnalysisResult, setShowAnalysisResult] = useState(false)
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>({ result: "", inProgress: false })
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<NodeJS.Timeout>()

  const isExpertMode = aiLevel === "EXPERT"

  useEffect(() => {
    if (preview) {
      const checkAnalysis = async () => {
        const status = await agent.getImageAnalysis(preview)
        setAnalysisStatus(status)
        
        if (status.inProgress) {
          timerRef.current = setTimeout(checkAnalysis, 1000)
        } else if (status.result) {
          setShowAnalysisResult(true)
        }
      }
      
      checkAnalysis()
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = undefined
      }
    }
  }, [preview, agent])

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
      reader.onloadend = async () => {
        const base64 = reader.result as string
        
        // 清除之前的图片分析结果
        if (preview) {
          agent.clearImageAnalysis(preview)
        }
        
        setPreview(base64)
        imageStore.images.push(base64)
        
        // 确保分析缓存与当前图片同步
        agent.syncImageAnalysisCache()
        
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
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = undefined
    }

    // 清除特定图片的分析结果
    if (preview) {
      agent.clearImageAnalysis(preview)
      // 从imageStore中移除图片
      imageStore.images = imageStore.images.filter(img => img !== preview)
    }

    setPreview("")
    setAnalysisStatus({ result: "", inProgress: false })
    setShowAnalysisResult(false)
    if (inputRef.current) {
      inputRef.current.value = ""
    }

    // 同步分析缓存
    agent.syncImageAnalysisCache()
  }

  const handleUploadClick = () => {
    inputRef.current?.click()
  }

  const renderAnalysisResult = () => {
    if (!analysisStatus.result) return null

    return (
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">图片分析结果</h3>
        <div className="space-y-2">
          <div className="whitespace-pre-wrap text-sm">
            {analysisStatus.result}
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button 
            size="sm" 
            color="danger" 
            variant="light"
            onClick={handleClear}
          >
            重新上传
          </Button>
          <Button 
            size="sm" 
            color="primary"
            onClick={() => setShowAnalysisResult(false)}
          >
            确认使用
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
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
            disabled={isLoading || analysisStatus.inProgress}
            className={`flex items-center gap-2 relative`}
          >
            <Icon icon='mdi:image-plus' className='w-4 h-4' />
            {isLoading ? "上传中..." : analysisStatus.inProgress ? "分析中..." : "上传图片"}
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
        {(isLoading || analysisStatus.inProgress) && (
          <Progress 
            size="sm" 
            value={isLoading ? 100 : 50} 
            color="primary"
            isIndeterminate={true}
            className="w-24"
          />
        )}
      </div>

      <Modal 
        isOpen={showAnalysisResult} 
        onClose={() => setShowAnalysisResult(false)}
        size="2xl"
      >
        {renderAnalysisResult()}
      </Modal>
    </>
  )
}