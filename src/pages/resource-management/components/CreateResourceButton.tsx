import React, { useState, useRef, useEffect } from "react"
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  useDisclosure,
  Radio,
  RadioGroup,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { setMetadata, getMetadata } from "@/service/apis/api"
import { readExcel } from "@/utils/ExcelReader"

interface CreateResourceButtonProps {
  appId: string | null
  isDisabled: boolean
}

const CreateResourceButton: React.FC<CreateResourceButtonProps> = ({ appId, isDisabled }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [resourceName, setResourceName] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [headerType, setHeaderType] = useState<"single" | "multiple">("single")
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setErrorMessage("")
    }
  }, [isOpen])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0]
      setFile(selectedFile)
      const fileName = selectedFile.name.split(".").slice(0, -1).join(".")
      setResourceName(fileName)
    }
  }

  const handleUpload = async () => {
    if (!file || !appId || !resourceName) {
      setErrorMessage("请填写所有必要信息并选择文件。")
      return
    }

    setUploading(true)
    setErrorMessage("")

    try {
      const result = await getMetadata(["resources"], appId)
      let resourceIndexes = []
      if (result.data && result.data.length > 0 && result.data[0].value) {
        resourceIndexes = JSON.parse(result.data[0].value)
      }

      const isNameExists = resourceIndexes.some((resource: any) => resource.name === resourceName)
      if (isNameExists) {
        setErrorMessage("资源名称已存在，请使用其他名称。")
        setUploading(false)
        return
      }

      const data = await readExcel(file, headerType === "multiple")
      await uploadData(data)
      await updateResourceIndex(resourceName)
      onClose()
    } catch (error) {
      console.error("Error uploading file:", error)
      setErrorMessage("上传文件时发生错误，请重试。")
    } finally {
      setUploading(false)
      setFile(null)
      setResourceName("")
      setPreviewData([])
    }
  }

  const uploadData = async (data: any[]) => {
    if (!appId) return
    const resourceData = JSON.stringify(data)
    await setMetadata(resourceName, resourceData, appId)
  }

  const updateResourceIndex = async (newResourceName: string) => {
    if (!appId) return
    try {
      const result = await getMetadata(["resources"], appId)
      let resourceIndexes = []
      if (result.data && result.data.length > 0 && result.data[0].value) {
        resourceIndexes = JSON.parse(result.data[0].value)
      }
      resourceIndexes.push({
        id: Date.now().toString(),
        name: newResourceName,
      })
      await setMetadata("resources", JSON.stringify(resourceIndexes), appId)
    } catch (error) {
      console.error("Error updating resource index:", error)
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
    <>
      <Button
        className='w-full sm:flex-1 min-w-0 sm:min-w-[200px] bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300'
        onClick={onOpen}
        color='primary'
        size='sm'
        startContent={<Icon icon='mdi:upload' width='20' height='20' />}
        isDisabled={isDisabled}
      >
        创建资料
      </Button>
      <Modal placement='top-center' isOpen={isOpen} onClose={onClose} size='2xl'>
        <ModalContent>
          <ModalHeader>创建资料</ModalHeader>
          <ModalBody>
            <Input
              label='资料名称'
              placeholder='请输入资料名称'
              value={resourceName}
              onChange={(e) => setResourceName(e.target.value)}
              required
            />
            <div className='mt-4'>
              <RadioGroup
                label='表头类型'
                value={headerType}
                onValueChange={(value) => setHeaderType(value as "single" | "multiple")}
              >
                <Radio value='single'>
                  简单表头（单行）
                  <span className='text-sm text-gray-500 ml-2'>适用于普通Excel表格</span>
                </Radio>
                <Radio value='multiple'>
                  复杂表头（多行合并）
                  <span className='text-sm text-gray-500 ml-2'>适用于带有合并单元格的表格</span>
                </Radio>
              </RadioGroup>
            </div>
            <div className='mt-4'>
              <div
                onClick={handleDivClick}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className='flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-indigo-400 focus:outline-none'
              >
                {file ? (
                  <span className='flex items-center space-x-2'>
                    <Icon icon='mdi:file-excel' width='24' height='24' className='text-green-500' />
                    <span className='font-medium text-gray-600'>{file.name}</span>
                  </span>
                ) : (
                  <span className='flex items-center space-x-2'>
                    <Icon icon='mdi:upload' width='24' height='24' className='text-gray-600' />
                    <span className='font-medium text-gray-600'>点击选择或拖拽文件到这里</span>
                  </span>
                )}
              </div>
              <input
                ref={fileInputRef}
                id='file-upload'
                name='file-upload'
                type='file'
                accept='.xlsx,.xls,.csv'
                className='sr-only'
                onChange={handleFileChange}
              />
            </div>
            {errorMessage && <div className='mt-4 text-red-500'>{errorMessage}</div>}
          </ModalBody>
          <ModalFooter>
            <Button
              className='bg-gray-400 hover:bg-gray-500 text-white transition-colors'
              variant='light'
              onClick={onClose}
            >
              取消
            </Button>
            <Button
              className='bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-indigo-500/50 transition-all duration-200'
              onClick={handleUpload}
              isLoading={uploading}
              isDisabled={!file || !resourceName}
            >
              保存
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default CreateResourceButton
