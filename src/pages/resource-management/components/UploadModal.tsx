import React, { useRef, useState } from "react"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { readExcel } from "@/utils/ExcelReader"

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (data: any) => void
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUpload }) => {
  const [file, setFile] = useState<File | null>(null)
  const [resourceName, setResourceName] = useState("")
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0]
      setFile(selectedFile)
      const fileName = selectedFile.name.split(".").slice(0, -1).join(".")
      setResourceName(fileName)
    }
  }

  const handleUpload = async () => {
    if (!file || !resourceName) return

    setUploading(true)
    try {
      const data = await readExcel(file)
      await onUpload(data)
      onClose()
    } catch (error) {
      console.error("Error uploading file:", error)
    } finally {
      setUploading(false)
      setFile(null)
      setResourceName("")
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      const droppedFile = event.dataTransfer.files[0]
      setFile(droppedFile)
      const fileName = droppedFile.name.split(".").slice(0, -1).join(".")
      setResourceName(fileName)
    }
  }

  const handleDivClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">上传 Excel</ModalHeader>
        <ModalBody>
          <Input
            label="Excel 名称"
            placeholder="请输入Excel 名称"
            value={resourceName}
            onChange={(e) => setResourceName(e.target.value)}
            required
          />
          <div className="mt-4">
            <div
              onClick={handleDivClick}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-dashed rounded-lg appearance-none cursor-pointer hover:border-primary focus:outline-none"
            >
              {file ? (
                <span className="flex items-center space-x-2">
                  <Icon icon="mdi:file-excel" width="24" height="24" className="text-success" />
                  <span className="font-medium text-gray-600">{file.name}</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <Icon icon="mdi:upload" width="24" height="24" className="text-gray-600" />
                  <span className="font-medium text-gray-600">点击选择或拖拽文件到这里</span>
                </span>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="sr-only"
              onChange={handleFileChange}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            取消
          </Button>
          <Button
            color="primary"
            onPress={handleUpload}
            isLoading={uploading}
            isDisabled={!file || !resourceName}
          >
            上传
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default UploadModal