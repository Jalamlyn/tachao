import React, { useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { FormField } from "../../../types"
import FormFieldWrapper from "../FormFieldWrapper"
import { Input } from "@/components/ui/input"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { Progress } from "@/components/ui/progress"
import message from "@/components/Message"
import { cn } from "@/theme/cn"
import { apiService } from "@/service/apis/api"

export const renderUpload = (
  field: FormField,
  form: UseFormReturn<any>,
  isEditable: boolean,
  onChange?: (fieldName: string, value: any) => void
) => {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

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
        // 这里可以添加图片处理逻辑
        const { quality = 0.8 } = field.uploadConfig.cropOptions
        // 处理图片...
      }

      // 使用自定义上传
      if (field.uploadConfig.uploadConfig?.customRequest) {
        try {
          const result = await field.uploadConfig.uploadConfig.customRequest({
            file,
            onProgress: (percent: number) => setProgress(percent),
          })
          return result
        } catch (error) {
          console.error("Custom upload error:", error)
          throw error
        }
      }

      // 默认上传逻辑
      try {
        const { uploadUrl, fileKey } = await getSignedUrl(file.name)
        const formData = new FormData()
        formData.append("name", file.name)
        formData.append("success_action_status", "200")
        formData.append("key", fileKey)
        formData.append("file", file)

        const response = await apiService.put(uploadUrl, {
          headers: {
            "Content-Type": file.type,
          },
          data: formData,
          onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total ?? 1))
            setProgress(percent)
          },
        })

        return response.data
      } catch (error) {
        console.error("Upload error:", error)
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

  const getSignedUrl = async (fileName: string) => {
    try {
      const res = await apiService.get(`/api/file/upload:singed?fileName=${fileName}`)
      return res.data
    } catch (error) {
      message.error("获取签名URL失败，请重试！")
      throw error
    }
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
              isDisabled={!isEditable || field.disabled || uploading}
              startContent={
                uploading ? (
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
              {uploading ? "上传中..." : field.placeholder || "选择文件"}
            </Button>
            {formField.value && !uploading && (
              <>
                <span className='text-sm text-gray-500 truncate flex-1'>
                  {Array.isArray(formField.value)
                    ? `已选择 ${formField.value.length} 个文件`
                    : formField.value instanceof File
                      ? formField.value.name
                      : formField.value}
                </span>
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
              {(Array.isArray(formField.value) ? formField.value : [formField.value]).map((file, index) => (
                <div key={index} className='relative aspect-square rounded-lg overflow-hidden'>
                  <img
                    src={typeof file === "string" ? file : URL.createObjectURL(file)}
                    alt={`预览图 ${index + 1}`}
                    className='w-full h-full object-cover'
                  />
                  <Button
                    isIconOnly
                    variant='light'
                    size='sm'
                    color='danger'
                    className='absolute top-1 right-1'
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
              ))}
            </div>
          )}
        </div>
      )}
    </FormFieldWrapper>
  )
}
