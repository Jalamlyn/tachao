import React, { useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { FormField } from "../../../../types"
import FormFieldWrapper from "../../FormFieldWrapper"
import { Input } from "@/components/ui/input"
import { Button, Modal, ModalContent, ModalBody } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { Progress } from "@/components/ui/progress"
import message from "@/components/Message"
import { cn } from "@/theme/cn"
import { apiService } from "@/service/apis/api"
import { ImageUploadProps, ImageValue } from "./types"
import { motion, AnimatePresence } from "framer-motion"

// 添加微信环境检测函数
const isWeixinBrowser = () => {
  return /MicroMessenger/i.test(navigator.userAgent)
}

export const renderImageUpload = (
  field: FormField,
  form: UseFormReturn<any>,
  isEditable: boolean,
  onChange?: (fieldName: string, value: any) => void
) => {
  return (
    <ImageUpload {...field} form={form} isEditable={isEditable} onChange={onChange} />
  )
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  name,
  label,
  form,
  isEditable = true,
  disabled,
  tooltip,
  required,
  uploadConfig,
  onChange,
  maxCount = 9,
}) => {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewImage, setPreviewImage] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentFileIndex, setCurrentFileIndex] = useState(0)
  const [totalFiles, setTotalFiles] = useState(0)

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
      const response = await apiService.post("/public/data/file/activitiess", {
        activityName: "测试",
        activityType: "test",
        files: [fileInfo],
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
      const response = await apiService.post(
        "/public/data/file/activitiess/find",
        {},
        {
          params: { display: "paginate" },
        }
      )
      return response.data
    } catch (error) {
      console.error("Query activity error:", error)
      throw error
    }
  }

  // 处理图片预览
  const handlePreview = (imageUrl: string) => {
    setPreviewImage(imageUrl)
    setPreviewVisible(true)
  }

  // 处理单个文件上传
  const handleSingleFileUpload = async (file: File): Promise<ImageValue | null> => {
    setProgress(0)
    
    try {
      const result = await handleUpload(file)
      if (result) {
        return {
          url: result.downloadUrl,
          thumbnailUrl: result.downloadUrl,
          name: result.fileName,
          size: result.size,
          type: result.type,
        }
      }
      return null
    } catch (error) {
      console.error("Single file upload error:", error)
      throw error
    }
  }

  // 处理图片上传
  const handleUpload = async (file: File) => {
    // 检查是否是微信环境
    if (isWeixinBrowser()) {
      message.info('微信环境暂不支持上传功能，我们正在努力开发中，请稍后再试或使用其他浏览器~')
      return null
    }

    if (uploadConfig) {
      // 检查文件大小
      if (uploadConfig.maxSize && file.size > uploadConfig.maxSize) {
        message.error(`文件大小不能超过 ${uploadConfig.maxSize / 1024 / 1024}MB`)
        return null
      }

      // 使用自定义上传
      if (uploadConfig.customRequest) {
        try {
          const result = await uploadConfig.customRequest({
            file,
            onProgress: (percent: number) => {
              setProgress(percent)
              uploadConfig.onProgress?.(percent)
            },
          })
          return result
        } catch (error) {
          console.error("Custom upload error:", error)
          uploadConfig.onError?.(error as Error)
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
            uploadConfig.onProgress?.(percent)
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
                  fileKey: signedData.fileKey,
                })

                // 查询获取完整信息
                const queryResult = await queryActivity()

                if (!queryResult?.data || !Array.isArray(queryResult.data) || queryResult.data.length === 0) {
                  throw new Error("未找到上传的文件信息")
                }

                const latestActivity = queryResult.data.sort((a, b) => Number(b.createdAt) - Number(a.createdAt))[0]

                if (
                  !latestActivity.files ||
                  !Array.isArray(latestActivity.files) ||
                  latestActivity.files.length === 0
                ) {
                  throw new Error("文件信息不完整")
                }

                const fileInfo = latestActivity.files[0]
                if (!fileInfo || !fileInfo.downloadUrl) {
                  throw new Error("文件下载链接不可用")
                }

                uploadConfig.onSuccess?.(fileInfo)
                resolve(fileInfo)
              } catch (error) {
                console.error("Process file error:", error)
                uploadConfig.onError?.(error as Error)
                reject(error)
              } finally {
                setIsProcessing(false)
              }
            } else {
              const error = new Error(`Upload failed with status ${xhr.status}`)
              uploadConfig.onError?.(error)
              reject(error)
            }
          }

          xhr.onerror = () => {
            const error = new Error("Upload failed")
            uploadConfig.onError?.(error)
            reject(error)
          }
        })

        xhr.open("POST", signedData.formUploadHost.replace("http:", ""), true)
        xhr.send(formData)

        return await uploadPromise
      } catch (error) {
        console.error("Upload error:", error)
        uploadConfig.onError?.(error as Error)
        throw error
      }
    }

    return file
  }

  return (
    <FormFieldWrapper
      name={name}
      label={label}
      form={form}
      isEditable={isEditable}
      disabled={disabled}
      tooltip={tooltip}
      required={required}
    >
      {(formField) => {
        const images: ImageValue[] = formField.value || []
        
        return (
          <div className='space-y-4'>
            {/* 上传按钮 */}
            {isEditable && images.length < maxCount && (
              <div className='flex items-center gap-2'>
                <Input
                  type='file'
                  accept='image/*'
                  multiple={true}
                  onChange={async (e) => {
                    const files = e.target.files
                    if (!files?.length) return

                    // 检查文件数量
                    const remainingSlots = maxCount - images.length
                    if (files.length > remainingSlots) {
                      message.error(`最多只能再上传 ${remainingSlots} 张图片`)
                      return
                    }

                    setUploading(true)
                    setTotalFiles(files.length)
                    const uploadedFiles = []

                    try {
                      for (let i = 0; i < files.length; i++) {
                        setCurrentFileIndex(i + 1)
                        const result = await handleSingleFileUpload(files[i])
                        if (result) {
                          uploadedFiles.push(result)
                        }
                      }

                      if (uploadedFiles.length > 0) {
                        const newImages = [...images, ...uploadedFiles]
                        formField.onChange(newImages)
                        onChange?.(name, newImages)
                        message.success("上传成功")
                      }
                    } catch (error) {
                      console.error("Upload error:", error)
                      message.error("上传失败")
                    } finally {
                      setUploading(false)
                      setProgress(0)
                      setCurrentFileIndex(0)
                      setTotalFiles(0)
                    }
                  }}
                  disabled={!isEditable || disabled}
                  className='hidden'
                  id={name}
                />
                <Button
                  as='label'
                  htmlFor={name}
                  variant='bordered'
                  size='sm'
                  isDisabled={!isEditable || disabled || uploading || isProcessing || isWeixinBrowser()}
                  startContent={
                    uploading || isProcessing ? (
                      <Icon icon='mdi:loading' className='w-4 h-4 animate-spin' />
                    ) : (
                      <Icon icon='mdi:image-plus' className='w-4 h-4' />
                    )
                  }
                  className={cn(
                    "font-medium",
                    "hover:bg-blue-50 hover:text-blue-600",
                    "transition-colors duration-200"
                  )}
                >
                  {uploading ? `上传中 (${currentFileIndex}/${totalFiles})` : 
                   isProcessing ? "处理中..." : 
                   isWeixinBrowser() ? 
                   "微信暂不支持" : 
                   `上传图片 (${images.length}/${maxCount})`}
                </Button>
              </div>
            )}

            {/* 上传进度 */}
            {uploading && (
              <div className='space-y-2'>
                <Progress value={progress} className='w-full' />
                <p className='text-sm text-gray-500'>
                  正在上传第 {currentFileIndex} 张，共 {totalFiles} 张 ({progress}%)
                </p>
              </div>
            )}

            {/* 图片网格 */}
            {images.length > 0 && (
              <div className='grid grid-cols-3 gap-4'>
                <AnimatePresence>
                  {images.map((image, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className='relative aspect-square rounded-lg overflow-hidden group'
                    >
                      <img
                        src={image.thumbnailUrl || image.url}
                        alt={`图片 ${index + 1}`}
                        className='w-full h-full object-cover cursor-pointer transition-transform duration-200 group-hover:scale-105'
                        onClick={() => handlePreview(image.url)}
                      />
                      {isEditable && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className='absolute top-2 right-2'
                        >
                          <Button
                            isIconOnly
                            variant='light'
                            size='sm'
                            color='danger'
                            className='bg-white/80'
                            onClick={() => {
                              const newImages = images.filter((_, i) => i !== index)
                              formField.onChange(newImages)
                              onChange?.(name, newImages)
                            }}
                          >
                            <Icon icon='mdi:close' className='w-4 h-4' />
                          </Button>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* 预览模态框 */}
            <Modal
              isOpen={previewVisible}
              onClose={() => setPreviewVisible(false)}
              size='4xl'
              classNames={{
                wrapper: "items-center",
              }}
            >
              <ModalContent>
                <ModalBody className='p-0'>
                  <img
                    src={previewImage}
                    alt='预览图片'
                    className='w-full h-full object-contain'
                    style={{ maxHeight: "80vh" }}
                  />
                </ModalBody>
              </ModalContent>
            </Modal>
          </div>
        )
      }}
    </FormFieldWrapper>
  )
}

export default ImageUpload