import React, { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Upload, X, Loader2 } from "lucide-react"
import { apiService } from "@/service/apis/api"
import message from "@/components/Message"
import { cn } from "@/theme/cn"

export interface UploadFieldConfig {
  accept?: string
  uploadType: "file" | "image" | "video" | "audio"
  multiple?: boolean
  maxSize?: number
  maxCount?: number
  thumbnail?: boolean
  cropOptions?: {
    aspect?: number
    quality?: number
    width?: number
    height?: number
  }
  uploadConfig?: {
    action?: string
    headers?: Record<string, string>
    withCredentials?: boolean
    customRequest?: (options: any) => Promise<any>
  }
}

interface UploadFieldProps {
  value?: string | string[]
  onChange?: (value: string | string[]) => void
  config: UploadFieldConfig
  disabled?: boolean
  className?: string
}

interface UploadFile {
  uid: string
  name: string
  status: 'uploading' | 'done' | 'error'
  url?: string
  response?: any
  error?: string
}

const UploadField: React.FC<UploadFieldProps> = ({
  value,
  onChange,
  config,
  disabled,
  className
}) => {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getSignedUrl = async (fileName: string) => {
    try {
      const res = await apiService.get(`/file/form/upload:singed?fileName=${fileName}`)
      return res.data
    } catch (error) {
      message.error("获取签名URL失败，请重试！")
      throw error
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0]
      
      // 检查文件大小
      if (config.maxSize && selectedFile.size > config.maxSize) {
        message.error(`文件大小不能超过 ${config.maxSize / 1024 / 1024}MB`)
        return
      }

      // 检查文件数量
      if (config.maxCount && files.length >= config.maxCount) {
        message.error(`最多只能上传 ${config.maxCount} 个文件`)
        return
      }

      const newFile: UploadFile = {
        uid: Date.now().toString(),
        name: selectedFile.name,
        status: 'uploading'
      }

      setFiles(prev => [...prev, newFile])
      await handleUpload(selectedFile, newFile.uid)
    }
  }

  const handleUpload = async (selectedFile: File, fileUid: string) => {
    if (!selectedFile) {
      message.warning("请先选择文件")
      return
    }

    setUploading(true)
    setProgress(0)

    try {
      const { formUploadHost, fileKey, policy, accessKeyId, signature } = await getSignedUrl(selectedFile.name)
      const formData = new FormData()
      formData.append("name", selectedFile.name)
      formData.append("policy", policy)
      formData.append("OSSAccessKeyId", accessKeyId)
      formData.append("success_action_status", "200")
      formData.append("signature", signature)
      formData.append("key", fileKey)
      formData.append("file", selectedFile)

      const response = await apiService.post(formUploadHost, formData, {
        headers: {
          "Content-Type": selectedFile.type,
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total ?? 1))
          setProgress(percentCompleted)
        },
      })

      setFiles(prev => prev.map(file => 
        file.uid === fileUid 
          ? { ...file, status: 'done', url: response.data.downloadUrl, response: response.data }
          : file
      ))

      if (onChange) {
        if (config.multiple) {
          const newValue = [...(Array.isArray(value) ? value : []), response.data.downloadUrl]
          onChange(newValue)
        } else {
          onChange(response.data.downloadUrl)
        }
      }

      message.success("文件上传成功")
    } catch (error) {
      message.error("文件上传失败，请重试！")
      setFiles(prev => prev.map(file => 
        file.uid === fileUid 
          ? { ...file, status: 'error', error: '上传失败' }
          : file
      ))
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveFile = (fileUid: string) => {
    const file = files.find(f => f.uid === fileUid)
    if (!file) return

    setFiles(prev => prev.filter(f => f.uid !== fileUid))

    if (onChange) {
      if (config.multiple) {
        const newValue = (Array.isArray(value) ? value : []).filter(url => url !== file.url)
        onChange(newValue)
      } else {
        onChange('')
      }
    }
  }

  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    fileInputRef.current?.click()
  }

  const renderPreview = (file: UploadFile) => {
    if (config.uploadType === 'image' && file.url) {
      return (
        <div className="relative">
          <img 
            src={file.url} 
            alt={file.name}
            className="max-w-[200px] h-auto rounded-lg"
          />
          <button
            onClick={() => handleRemoveFile(file.uid)}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )
    }

    return (
      <div className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
        <span className="text-sm truncate">{file.name}</span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => handleRemoveFile(file.uid)}
          type="button"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      <input
        type="file"
        onChange={handleFileChange}
        disabled={disabled || uploading}
        className="hidden"
        ref={fileInputRef}
        accept={config.accept}
        multiple={config.multiple}
      />
      
      <Button 
        onClick={handleButtonClick} 
        disabled={disabled || uploading} 
        type="button" 
        variant="outline"
      >
        {uploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            上传中
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            上传{config.uploadType === 'image' ? '图片' : '文件'}
          </>
        )}
      </Button>

      {uploading && (
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-gray-500">上传进度: {progress}%</p>
        </div>
      )}

      <div className="space-y-2">
        {files.map(file => (
          <div key={file.uid}>
            {renderPreview(file)}
          </div>
        ))}
      </div>
    </div>
  )
}

export default UploadField