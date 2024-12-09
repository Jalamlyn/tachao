import React, { useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { FormField, FileInfo } from "../../../types"
import FormFieldWrapper from "../FormFieldWrapper"
import { Input } from "@/components/ui/input"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { Progress } from "@/components/ui/progress"
import message from "@/components/Message"
import { cn } from "@/theme/cn"
import { apiService } from "@/service/apis/api"
import { Modal } from "@nextui-org/react"

export const renderUpload = (
  field: FormField,
  form: UseFormReturn<any>,
  isEditable: boolean,
  onChange?: (fieldName: string, value: any) => void
) => {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewFile, setPreviewFile] = useState<FileInfo | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // 获取签名URL
  const getSignedUrl = async (fileName: string) => {
    try {
      const res = await apiService.get(`/api/file/form/upload:singed?fileName=${fileName}`)
      return res.data
    } catch (error) {
      message.error("获取签名URL失败，请重试！")
      throw error
    }
  }

  // 创建活动数据
  const createActivity = async (fileInfo: { fileName: string; fileKey: string }) => {
    try {
      const response = await apiService.post('/public/data/crm/activities', {
        activityName: "测试",
        activityType: "test",
        files: [fileInfo]
      })
      return response.data
    } catch (error) {
      console.error("Create activity error:", error)
      throw error
    }
  }

  // 查询活动数据
  const queryActivity = async () => {
    try {
      const response = await apiService.post('/public/data/crm/activities/find', {}, {
        params: { display: 'paginate' }
      })
      return response.data
    } catch (error) {
      console.error("Query activity error:", error)
      throw error
    }
  }

  // 处理文件预览
  const handlePreview = async (file: FileInfo) => {
    if (!file.type?.startsWith('image/')) {
      return
    }
    setPreviewFile(file)
    setPreviewVisible(true)

    if (field.uploadConfig?.onPreview) {
      field.uploadConfig.onPreview(file)
    }
  }

  // 处理文件下载
  const handleDownload = async (file: FileInfo) => {
    try {
      if (!file.downloadUrl) {
        message.error("下载链接不可用")
        return
      }

      if (field.uploadConfig?.onDownload) {
        field.uploadConfig.onDownload(file)
        return
      }

      const config = field.uploadConfig?.downloadConfig || {}
      const response = await fetch(file.downloadUrl, {
        method: config.method || "GET",
        headers: config.headers || {},
        credentials: config.withCredentials ? "include" : "omit",
      })

      if (!response.ok) {
        throw new Error("下载失败")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = file.fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Download error:", error)
      message.error("下载失败，请重试")
    }
  }

  // 处理新的upload类型
  const handleUploadType = async (file: File) => {
    if (field.uploadConfig) {
      // 检查文件大小
      if (field.uploadConfig.maxSize && file.size > field.uploadConfig.maxSize) {
        message.error(`文件大小不能超过 ${field.uploadConfig.maxSize / 1024 / 1024}MB`)
        return null
      }

      // 如果是图片且需要处理
      if (field.uploadConfig.uploadType === "image" && field.uploadConfig.cropOptions) {
        const { quality = 0.8 } = field.uploadConfig.cropOptions
        // 处理图片...
      }

      // 使用自定义上传
      if (field.uploadConfig.uploadConfig?.customRequest) {
        try {
          const result = await field.uploadConfig.uploadConfig.customRequest({
            file,
            onProgress: (percent: number) => {
              setProgress(percent)
              field.uploadConfig?.onProgress?.(percent)
            },
          })
          return result
        } catch (error) {
          console.error("Custom upload error:", error)
          field.uploadConfig?.onError?.(error as Error)
          throw error
        }
      }

      // 新的表单上传逻辑
      try {
        const signedData = await getSignedUrl(file.name)
        const formData = new FormData()
        formData.append("key", signedData.fileKey)
        formData.append("OSSAccessKeyId", signedData.accessKeyId)
        formData.append("policy", signedData.policy)
        formData.append("Signature", signedData.signature)
        formData.append("file", file)

        const xhr = new XMLHttpRequest()
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded * 100) / event.total)
            setProgress(percent)
            field.uploadConfig?.onProgress?.(percent)
          }
        }

        const uploadPromise = new Promise((resolve, reject) => {
          xhr.onload = async () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                setIsProcessing(true)
                // 创建活动数据
                await createActivity({
                  fileName: file.name,
                  fileKey: signedData.fileKey
                })

                // 查询获取完整信息
                const queryResult = await queryActivity()
                const latestActivity = queryResult.data[0]
                const fileInfo = latestActivity.files[0]

                field.uploadConfig?.onSuccess?.(fileInfo)
                resolve(fileInfo)
              } catch (error) {
                console.error("Process file error:", error)
                field.uploadConfig?.onError?.(error as Error)
                reject(error)
              } finally {
                setIsProcessing(false)
              }
            } else {
              const error = new Error(`Upload failed with status ${xhr.status}`)
              field.uploadConfig?.onError?.(error)
              reject(error)
            }
          }

          xhr.onerror = () => {
            const error = new Error("Upload failed")
            field.uploadConfig?.onError?.(error)
            reject(error)
          }
        })

        xhr.open("POST", signedData.formUploadHost, true)
        xhr.send(formData)

        return await uploadPromise
      } catch (error) {
        console.error("Upload error:", error)
        field.uploadConfig?.onError?.(error as Error)
        throw error
      }
    }

    // 兼容原有逻辑
    if (field.onUpload) {
      await field.onUpload(file)
      return file
    }

    return file
  }

  // 渲染预览内容
  const renderPreviewContent = (file: FileInfo) => {
    if (!file) return null

    if (file.type?.startsWith("image/")) {
      return (
        <img
          src={file.downloadUrl}
          alt={file.fileName}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
          }}
        />
      )
    }

    return (
      <div className='flex flex-col items-center justify-center p-4'>
        <Icon icon='mdi:file-document-outline' className='w-16 h-16 text-gray-400' />
        <p className='mt-2 text-gray-600'>{file.fileName}</p>
        <Button
          color='primary'
          variant='flat'
          size='sm'
          className='mt-4'
          onClick={() => handleDownload(file)}
          startContent={<Icon icon='mdi:download' className='w-4 h-4' />}
        >
          下载查看
        </Button>
      </div>
    )
  }

  return (
    <FormFieldWrapper
      name={field.name}
      label={field.label}
      form={form}
      isEditable={isEditable}
      disabled={field.disabled}
      tooltip={field.tooltip}
      required={field.required}
    >
      {(formField) => (
        <div className='space-y-4'>
          <div className='flex items-center gap-2'>
            <Input
              type='file'
              accept={field.accept}
              multiple={field.uploadConfig?.multiple}
              onChange={async (e) => {
                const files = e.target.files
                if (!files?.length) return

                // 检查文件数量
                if (field.uploadConfig?.maxCount && files.length > field.uploadConfig.maxCount) {
                  message.error(`最多只能上传 ${field.uploadConfig.maxCount} 个文件`)
                  return
                }

                setUploading(true)
                setProgress(0)

                try {
                  const uploadedFiles = []
                  for (let i = 0; i < files.length; i++) {
                    const result = await handleUploadType(files[i])
                    if (result) {
                      uploadedFiles.push(result)
                    }
                  }

                  const finalValue = field.uploadConfig?.multiple ? uploadedFiles : uploadedFiles[0]
                  formField.onChange(finalValue)
                  onChange?.(field.name, finalValue)
                  message.success("上传成功")
                } catch (error) {
                  console.error("Upload error:", error)
                  message.error("上传失败")
                } finally {
                  setUploading(false)
                  setProgress(0)
                }
              }}
              disabled={!isEditable || field.disabled}
              className='hidden'
              id={field.name}
            />
            <Button
              as='label'
              htmlFor={field.name}
              variant='bordered'
              size='sm'
              isDisabled={!isEditable || field.disabled || uploading || isProcessing}
              startContent={
                (uploading || isProcessing) ? (
                  <Icon icon='mdi:loading' className='w-4 h-4 animate-spin' />
                ) : (
                  <Icon icon='mdi:upload' className='w-4 h-4' />
                )
              }
              className={cn(
                "font-medium",
                "hover:bg-blue-50 hover:text-blue-600",
                "transition-colors duration-200",
                field.className
              )}
            >
              {uploading ? "上传中..." : isProcessing ? "处理中..." : field.placeholder || "选择文件"}
            </Button>
            {formField.value && !uploading && !isProcessing && (
              <>
                <span className='text-sm text-gray-500 truncate flex-1'>
                  {Array.isArray(formField.value)
                    ? `已选择 ${formField.value.length} 个文件`
                    : formField.value instanceof File
                    ? formField.value.name
                    : formField.value.fileName}
                </span>
                {formField.value.type?.startsWith('image/') && (
                  <Button
                    isIconOnly
                    variant='light'
                    size='sm'
                    color='primary'
                    onClick={() => handlePreview(formField.value)}
                    isDisabled={!formField.value.downloadUrl}
                  >
                    <Icon icon='mdi:eye' className='w-4 h-4' />
                  </Button>
                )}
                <Button
                  isIconOnly
                  variant='light'
                  size='sm'
                  color='primary'
                  onClick={() => handleDownload(formField.value)}
                  isDisabled={!formField.value.downloadUrl}
                >
                  <Icon icon='mdi:download' className='w-4 h-4' />
                </Button>
                <Button
                  isIconOnly
                  variant='light'
                  size='sm'
                  color='danger'
                  onClick={() => {
                    formField.onChange(field.uploadConfig?.multiple ? [] : null)
                    onChange?.(field.name, field.uploadConfig?.multiple ? [] : null)
                  }}
                  isDisabled={!isEditable || field.disabled}
                >
                  <Icon icon='mdi:close' className='w-4 h-4' />
                </Button>
              </>
            )}
          </div>

          {uploading && (
            <div className='space-y-2'>
              <Progress value={progress} className='w-full' />
              <p className='text-sm text-gray-500'>上传进度: {progress}%</p>
            </div>
          )}

          {/* 图片预览 */}
          {field.uploadConfig?.uploadType === "image" && field.uploadConfig.thumbnail && formField.value && (
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              {(Array.isArray(formField.value) ? formField.value : [formField.value]).map((file: FileInfo, index) => (
                <div key={index} className='relative aspect-square rounded-lg overflow-hidden'>
                  <img
                    src={file.downloadUrl}
                    alt={`预览图 ${index + 1}`}
                    className='w-full h-full object-cover'
                  />
                  <div className='absolute top-1 right-1 flex gap-1'>
                    <Button
                      isIconOnly
                      variant='light'
                      size='sm'
                      color='primary'
                      className='bg-white/80'
                      onClick={() => handlePreview(file)}
                    >
                      <Icon icon='mdi:eye' className='w-4 h-4' />
                    </Button>
                    <Button
                      isIconOnly
                      variant='light'
                      size='sm'
                      color='primary'
                      className='bg-white/80'
                      onClick={() => handleDownload(file)}
                    >
                      <Icon icon='mdi:download' className='w-4 h-4' />
                    </Button>
                    <Button
                      isIconOnly
                      variant='light'
                      size='sm'
                      color='danger'
                      className='bg-white/80'
                      onClick={() => {
                        if (Array.isArray(formField.value)) {
                          const newValue = formField.value.filter((_, i) => i !== index)
                          formField.onChange(newValue)
                          onChange?.(field.name, newValue)
                        } else {
                          formField.onChange(null)
                          onChange?.(field.name, null)
                        }
                      }}
                    >
                      <Icon icon='mdi:close' className='w-4 h-4' />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 预览模态框 */}
          <Modal
            isOpen={previewVisible}
            onClose={() => setPreviewVisible(false)}
            size={field.uploadConfig?.previewConfig?.modalWidth ? "full" : "2xl"}
            className='max-h-[90vh]'
          >
            <Modal.Header>
              <h3 className='text-lg font-semibold'>
                {field.uploadConfig?.previewConfig?.modalTitle || previewFile?.fileName || "文件预览"}
              </h3>
            </Modal.Header>
            <Modal.Body>{previewFile && renderPreviewContent(previewFile)}</Modal.Body>
            <Modal.Footer>
              <Button
                color='primary'
                variant='light'
                onPress={() => setPreviewVisible(false)}
                startContent={<Icon icon='mdi:close' className='w-4 h-4' />}
              >
                关闭
              </Button>
              {previewFile && (
                <Button
                  color='primary'
                  variant='flat'
                  onPress={() => handleDownload(previewFile)}
                  startContent={<Icon icon='mdi:download' className='w-4 h-4' />}
                >
                  下载
                </Button>
              )}
            </Modal.Footer>
          </Modal>
        </div>
      )}
    </FormFieldWrapper>
  )
}