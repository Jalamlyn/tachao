import React, { useState } from "react"
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Progress } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useFileUpload, fileUtils } from "@/pages/resource-management/hooks/useFileUpload"
import { useResourceMetadata } from "@/pages/resource-management/hooks/useResourceMetadata"
import message from "@/components/Message"

interface UploadResourceButtonProps {
  appId: string | null
  isDisabled: boolean
}

const UploadResourceButton: React.FC<UploadResourceButtonProps> = ({ appId, isDisabled }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const { handleUpload, progress, error, reset } = useFileUpload({
    onProgress: (progress) => {
      console.log("Upload progress:", progress)
    },
    onSuccess: (data) => {
      message.success("文件解析成功")
      handleSaveResource(data)
    },
    onError: (error) => {
      message.error(error.message || "文件上传失败")
      setUploading(false)
    },
  })

  const { createResource } = useResourceMetadata(appId)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0])
    }
  }

  const handleSaveResource = async (data: any) => {
    if (!file || !appId) return

    try {
      const resource = {
        name: file.name.split(".").slice(0, -1).join("."),
        type: fileUtils.getFileType(file),
        size: fileUtils.getFileSize(file.size),
        status: "active" as const,
        description: `上传于 ${new Date().toLocaleString()}`,
        data: data,
      }

      await createResource(resource)
      onClose()
      reset()
      setFile(null)
    } catch (error) {
      console.error("Error saving resource:", error)
      message.error("保存资料失败")
    } finally {
      setUploading(false)
    }
  }

  const handleUploadClick = async () => {
    if (!file) return

    setUploading(true)
    try {
      await handleUpload(file)
    } catch (error) {
      console.error("Error uploading file:", error)
    }
  }

  const handleClose = () => {
    onClose()
    reset()
    setFile(null)
  }

  return (
    <>
      <Button
        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-indigo-500/50 transition-all duration-200"
        onClick={onOpen}
        startContent={<Icon icon="mdi:upload" width="20" height="20" />}
        isDisabled={isDisabled}
      >
        上传资料
      </Button>
      <Modal isOpen={isOpen} onClose={handleClose} size="2xl">
        <ModalContent>
          <ModalHeader>上传资料</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <input 
                type="file" 
                accept=".xlsx,.xls,.csv" 
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-indigo-50 file:text-indigo-600
                  hover:file:bg-indigo-100
                  cursor-pointer
                "
              />
              {file && (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Icon icon="mdi:file-excel" className="w-5 h-5 text-green-500" />
                  <span>{file.name}</span>
                  <span>({fileUtils.getFileSize(file.size)})</span>
                </div>
              )}
              {uploading && (
                <Progress
                  size="sm"
                  value={progress}
                  color="primary"
                  className="max-w-md"
                  label="上传中..."
                  showValueLabel={true}
                />
              )}
              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button 
              className="bg-gray-400 hover:bg-gray-500 text-white transition-colors"
              variant="light" 
              onClick={handleClose}
            >
              取消
            </Button>
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-indigo-500/50 transition-all duration-200"
              onClick={handleUploadClick} 
              isLoading={uploading} 
              isDisabled={!file}
            >
              上传
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default UploadResourceButton