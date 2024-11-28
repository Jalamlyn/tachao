import React, { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Upload, X, Loader2 } from "lucide-react"
import { apiService } from "@/service/apis/api"

export const FileUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getSignedUrl = async (fileName: string) => {
    try {
      const res = await apiService.get(`/file/form/upload:singed?fileName=${fileName}`)
      return res.data
    } catch (error) {
      toast({
        title: "错误",
        description: "获取签名URL失败，请重试！",
        variant: "destructive",
      })
      throw error
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0]
      setFile(selectedFile)
      await handleUpload(selectedFile)
    }
  }

  const handleUpload = async (selectedFile: File) => {
    if (!selectedFile) {
      toast({
        title: "警告",
        description: "请先选择文件",
        variant: "warning",
      })
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

      await apiService.post("/public/data/crm/activities", {
        activityName: "测试",
        activityType: "test",
        files: [
          {
            fileName: selectedFile.name,
            fileKey,
          },
        ],
      })

      await apiService.post("/public/data/crm/activities/find?display=paginate", {})

      setImageUrl(response.data.downloadUrl || "")
      toast({
        title: "成功",
        description: "文件上传成功",
      })
    } catch (error) {
      toast({
        title: "错误",
        description: "文件上传或数据提交失败，请重试！",
        variant: "destructive",
      })
      setFile(null)
      setImageUrl(null)
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    setImageUrl(null)
  }

  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    fileInputRef.current?.click()
  }

  return (
    <div className='space-y-4'>
      <input type='file' onChange={handleFileChange} disabled={uploading} className='hidden' ref={fileInputRef} />
      <Button onClick={handleButtonClick} disabled={uploading} type='button' variant='outline'>
        {uploading ? (
          <>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            上传中
          </>
        ) : (
          <>
            <Upload className='mr-2 h-4 w-4' />
            上传
          </>
        )}
      </Button>
      {uploading && (
        <div className='space-y-2'>
          <Progress value={progress} className='w-full' />
          <p className='text-sm text-gray-500'>上传进度: {progress}%</p>
        </div>
      )}
      {file && !uploading && (
        <div className='flex items-center justify-between bg-gray-100 p-2 rounded-md'>
          <span className='text-sm truncate'>{file.name}</span>
          <Button variant='ghost' size='sm' onClick={handleRemoveFile} type='button'>
            <X className='h-4 w-4' />
          </Button>
        </div>
      )}
      {imageUrl && (
        <div className='relative'>
          <img src={imageUrl} alt='已上传的图片' className='max-w-full h-auto rounded-lg' />
          <button
            onClick={handleRemoveFile}
            className='absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors'
            type='button'
          >
            <X className='h-4 w-4' />
          </button>
        </div>
      )}
    </div>
  )
}
