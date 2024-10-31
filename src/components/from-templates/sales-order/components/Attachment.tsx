import React, { useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Icon } from "@iconify/react"
import { useDropzone } from "react-dropzone"
import { UseFormReturn } from "react-hook-form"
import { formatFileSize } from "../utils/formUtils"

interface AttachmentProps {
  form: UseFormReturn<any>
  isEditable: boolean
}

const Attachment: React.FC<AttachmentProps> = ({ form, isEditable }) => {
  const [uploadProgress, setUploadProgress] = useState(0)
  const attachment = form.watch("data.attachment")

  const onDrop = useCallback((acceptedFiles: File[]) => {
    handleFileChange(acceptedFiles[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled: !isEditable,
  })

  const handleFileChange = (file: File) => {
    if (file) {
      // Simulating file upload progress
      let progress = 0
      const interval = setInterval(() => {
        progress += 10
        setUploadProgress(progress)
        if (progress >= 100) {
          clearInterval(interval)
          form.setValue("data.attachment", {
            name: file.name,
            size: file.size,
            type: file.type,
          })
        }
      }, 200)
    }
  }

  return (
    <Card>
      <CardContent>
        <h2 className='text-lg font-semibold mb-4'>合同附件上传</h2>
        {isEditable ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-primary bg-primary/10" : "border-gray-300 hover:border-primary"
            }`}
          >
            <input {...getInputProps()} />
            <Icon icon='mdi:file-upload' className='text-4xl mb-2 mx-auto' />
            <p className='text-sm text-gray-600'>
              {isDragActive ? "拖放文件到这里" : "拖放文件到这里，或点击选择文件"}
            </p>
            <p className='text-xs text-gray-500 mt-1'>支持的文件类型: PDF, DOC, DOCX (最大 5MB)</p>
          </div>
        ) : (
          <p className='text-gray-500'>没有上传任何附件</p>
        )}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <Progress value={uploadProgress} className='mt-4' />
        )}
        {attachment && (
          <div className='mt-4 p-4 rounded-lg'>
            <h3 className='text-md font-semibold mb-2'>已上传的附件</h3>
            <div className='flex items-center space-x-2'>
              <Icon icon='mdi:file-document' className='text-2xl text-primary' />
              <div>
                <p className='font-medium'>{attachment.name}</p>
                <p className='text-sm text-gray-600'>{formatFileSize(attachment.size)}</p>
              </div>
            </div>
            <p className='text-sm text-gray-500 mt-1'>
              <Icon icon='mdi:file-type' className='inline mr-1' />
              类型：{attachment.type}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default Attachment