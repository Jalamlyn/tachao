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
import { readExcel } from "@/utils/ExcelReader"
import { useMetadata } from "@/hooks/useMetadata"
import message from "@/components/Message"
import { generateDetailTemplate, generateSummaryTemplate } from "./excelGenerator"

interface CreateResourceButtonProps {
  appId: string | null
  isDisabled: boolean
  onSuccess?: () => void // 添加onSuccess回调
}

const CreateResourceButton: React.FC<CreateResourceButtonProps> = ({ appId, isDisabled, onSuccess }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [resourceName, setResourceName] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [headerType, setHeaderType] = useState<"single" | "multiple">("single")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 使用 useMetadata hook
  const { create: createResource, getDetail: getResourceDetail } = useMetadata("resource")

  useEffect(() => {
    if (isOpen) {
      setErrorMessage("")
    }
  }, [isOpen])

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0]
      setFile(selectedFile)
      const fileName = selectedFile.name.split(".").slice(0, -1).join(".")
      setResourceName(fileName)

      // 添加测试代码
      try {
        console.log("开始测试文件转换...")
        console.log("原始文件大小:", (selectedFile.size / 1024 / 1024).toFixed(2), "MB")

        const result = await readExcel(selectedFile, headerType === "multiple")

        // 确保 result 和 result.data 存在
        if (result && result.data) {
          // 输出 JSON 格式大小
          const jsonSize = new Blob([JSON.stringify(result.data)]).size
          console.log("JSON 格式大小:", (jsonSize / 1024 / 1024).toFixed(2), "MB")

          // 将数据转换为 CSV 格式
          const csvData = result.data.map((row: any) => Object.values(row).join(",")).join("\n")
          const csvSize = new Blob([csvData]).size
          console.log("CSV 格式大小:", (csvSize / 1024 / 1024).toFixed(2), "MB")

          // 输出压缩比
          const compressionRatio = (((jsonSize - csvSize) / jsonSize) * 100).toFixed(2)
          console.log("CSV 相比 JSON 节省了:", compressionRatio, "%")

          // 输出一些数据统计
          console.log("数据行数:", result.data.length)
          console.log("数据列数:", Object.keys(result.data[0] || {}).length)
        } else {
          throw new Error("文件解析结果无效")
        }
      } catch (error) {
        console.error("测试文件转换失败:", error)
        message.error("文件解析失败")
      }
    }
  }

  const handleUpload = async () => {
    if (!file || !resourceName) {
      setErrorMessage("请填写所有必要信息并选择文件。")
      return
    }

    setUploading(true)
    setErrorMessage("")

    try {
      // 检查资源名称是否已存在
      const existingResource = await getResourceDetail(`resource_${resourceName}`)
      if (existingResource) {
        setErrorMessage("资源名称已存在，请使用其他名称。")
        setUploading(false)
        return
      }

      const excelResult = await readExcel(file, headerType === "multiple")

      // 修改：添加firstRowData到indexFields
      const result = await createResource({
        title: resourceName,
        data: excelResult.data,
        status: "active",
        indexFields: {
          appId: appId,
          type: "excel",
          size: file.size,
          fileName: file.name,
          rowData: excelResult.firstRowData, // 添加示例行数据
        },
      })

      if (excelResult) {
        onClose()
        message.success("上传成功")
        // 调用onSuccess回调
        onSuccess?.()
      } else {
        throw new Error("创建失败")
      }
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
        onClick={onOpen}
        color='success'
        className='text-white'
        startContent={<Icon icon='mdi:file-excel' width='20' height='20' />}
        isDisabled={isDisabled}
      >
        上传Excel表格
      </Button>
      <Modal placement='top-center' isOpen={isOpen} onClose={onClose} size='2xl'>
        <ModalContent>
          <ModalHeader>上传 Excel</ModalHeader>
          <ModalBody>
            <Input
              label='Excel 名称'
              placeholder='请输入Excel 名称'
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
              <div className='text-sm text-gray-500 mt-2'>
                <div className='flex items-center gap-2 mb-1'>
                  <Icon icon='mdi:information-outline' className='text-primary' />
                  <span>支持的Excel格式：普通明细表和汇总表</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Icon icon='mdi:lightbulb-outline' className='text-warning' />
                  <span>提示：请确保Excel内容符合标准格式要求</span>
                </div>
              </div>
              <div className='flex gap-2 mt-4'>
                <Button
                  size='sm'
                  color='primary'
                  variant='flat'
                  startContent={<Icon icon='mdi:file-download-outline' />}
                  onPress={generateDetailTemplate}
                >
                  下载明细表模板
                </Button>
                <Button
                  size='sm'
                  color='primary'
                  variant='flat'
                  startContent={<Icon icon='mdi:file-download-outline' />}
                  onPress={generateSummaryTemplate}
                >
                  下载汇总表模板
                </Button>
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
            <Button variant='light' onClick={onClose}>
              取消
            </Button>
            <Button onClick={handleUpload} isLoading={uploading} isDisabled={!file || !resourceName}>
              保存
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default CreateResourceButton
