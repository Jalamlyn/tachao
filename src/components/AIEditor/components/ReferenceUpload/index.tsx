import React, { useState, useRef } from "react"
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import message from "@/components/Message"
import { FilePreview } from "./FilePreview"
import { UploadProgress } from "./UploadProgress"
import { readExcel } from "@/utils/ExcelReader"
import { localDB } from "@/utils/localDB"
import { AIEditorProps } from "../.."
import { AI_LEVELS } from "../../type"
import { cn } from "@/theme/cn"

interface ReferenceUploadProps {
  agent: AIEditorProps["agent"]
  aiLevel?: keyof typeof AI_LEVELS
}

export const ReferenceUpload: React.FC<ReferenceUploadProps> = ({ agent, aiLevel = "ADVANCED" }) => {
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [excelPreview, setExcelPreview] = useState<{
    headers: string[]
    firstRow: any
    fileName: string
  } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const handleFileSelect = async (file: File, type: "image" | "excel") => {
    if (!file) return

    setIsUploading(true)
    setUploadStatus("正在处理文件...")
    setUploadProgress(0)

    try {
      if (type === "image") {
        if (file.size > 5 * 1024 * 1024) {
          throw new Error("图片大小不能超过5MB")
        }

        const reader = new FileReader()
        reader.onprogress = (e) => {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100
            setUploadProgress(progress)
          }
        }

        reader.onload = (e) => {
          const base64 = e.target?.result as string
          setImagePreview(base64)
          localDB.setItem("cachedImage", base64)
          setUploadProgress(100)
          setUploadStatus("上传完成")
          message.success("图片上传成功")
        }

        reader.readAsDataURL(file)
      } else {
        if (file.size > 10 * 1024 * 1024) {
          throw new Error("Excel文件大小不能超过10MB")
        }

        setUploadProgress(30)
        const { data, firstRowData } = await readExcel(file)
        setUploadProgress(60)

        if (data.length === 0) {
          throw new Error("Excel文件为空")
        }

        const headers = Object.keys(firstRowData || {}).filter((key) => key !== "dataid")
        const excelData = {
          headers,
          firstRow: firstRowData,
          fileName: file.name,
        }

        setExcelPreview(excelData)
        localDB.setItem("cachedExcel", JSON.stringify(excelData))

        setUploadProgress(100)
        setUploadStatus("上传完成")
        message.success("Excel解析成功")
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      message.error(error instanceof Error ? error.message : "文件处理失败")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleUploadClick = (type: "image" | "excel") => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = type === "image" ? "image/jpeg,image/png,image/gif" : ".xlsx,.xls"
      fileInputRef.current.click()
    }
  }

  const handleClearFile = (type: "image" | "excel") => {
    if (type === "image") {
      setImagePreview(null)
      localDB.removeItem("cachedImage")
    } else {
      setExcelPreview(null)
      localDB.removeItem("cachedExcel")
    }
  }

  return (
    <div className='space-y-3'>
      <div className='flex items-center gap-4 h-20'>
        {/* 上传按钮 */}
        <Dropdown>
          <DropdownTrigger>
            <Button
              size='sm'
              variant='bordered'
              startContent={<Icon icon='hugeicons:file-attachment' className='w-4 h-4' />}
            >
              上传
            </Button>
          </DropdownTrigger>
          <DropdownMenu>
            <DropdownItem
              key='image'
              startContent={<Icon icon='mdi:image' className='w-4 h-4' />}
              description='上传单据图片,小票图片,需求截图...'
              onClick={() => handleUploadClick("image")}
            >
              上传图片
            </DropdownItem>
            <DropdownItem
              key='excel'
              startContent={<Icon icon='mdi:file-excel' className='w-4 h-4' />}
              description='上传数据表,配置表...'
              onClick={() => handleUploadClick("excel")}
            >
              上传Excel
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>

        {/* 文件预览区域 - 水平滚动 */}
        <div
          ref={scrollContainerRef}
          className={cn(
            "flex gap-3 overflow-x-auto pb-2",
            "scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent",
            "hover:scrollbar-thumb-gray-300 transition-all duration-200"
          )}
        >
          {imagePreview && (
            <FilePreview
              type='image'
              fileName='图片预览'
              fileSize='--'
              onDelete={() => handleClearFile("image")}
              onView={() => {}}
              previewData={{ image: imagePreview }}
            />
          )}

          {excelPreview && (
            <FilePreview
              type='excel'
              fileName={excelPreview.fileName}
              fileSize='--'
              onDelete={() => handleClearFile("excel")}
              onView={() => {}}
              previewData={{
                excel: {
                  headers: excelPreview.headers,
                  firstRow: excelPreview.firstRow,
                },
              }}
            />
          )}
        </div>

        <input
          type='file'
          ref={fileInputRef}
          className='hidden'
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              const type = file.type.startsWith("image/") ? "image" : "excel"
              handleFileSelect(file, type)
            }
          }}
        />
      </div>

      {/* 上传进度 */}
      {isUploading && (
        <UploadProgress progress={uploadProgress} status={uploadStatus} onCancel={() => setIsUploading(false)} />
      )}
    </div>
  )
}
