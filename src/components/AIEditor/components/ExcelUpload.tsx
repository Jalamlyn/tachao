import React, { useState, useRef } from "react"
import { Button, Tooltip } from "@nextui-org/react"
import { Button as SButton } from "@/components/ui/button"
import { Icon } from "@iconify/react"
import message from "@/components/Message"
import { AIEditorProps } from ".."
import { AI_LEVELS } from "../type"
import { readExcel } from "@/utils/ExcelReader"
import { localDB } from "@/utils/localDB"

interface ExcelUploaderProps {
  agent: AIEditorProps["agent"]
  aiLevel?: keyof typeof AI_LEVELS
}

export const ExcelUploader: React.FC<ExcelUploaderProps> = ({ agent, aiLevel = "ADVANCED" }) => {
  const [preview, setPreview] = useState<{ headers: string[]; firstRow: any } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      message.error("Excel文件大小不能超过10MB")
      return
    }

    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ]
    if (!allowedTypes.includes(file.type)) {
      message.error("只支持 Excel 格式文件")
      return
    }

    setIsLoading(true)
    try {
      const { data, firstRowData } = await readExcel(file)
      if (data.length === 0) {
        throw new Error("Excel文件为空")
      }

      const headers = Object.keys(firstRowData || {}).filter(key => key !== 'dataid')
      setPreview({ headers, firstRow: firstRowData })

      // 将Excel数据存储到localDB
      localDB.setItem("cachedExcel", JSON.stringify({
        headers,
        firstRow: firstRowData,
        fileName: file.name
      }))

      message.success("Excel解析成功")
    } catch (error) {
      console.error("Error uploading excel:", error)
      message.error("Excel解析失败")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setPreview(null)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
    localDB.removeItem("cachedExcel")
  }

  const handleUploadClick = () => {
    inputRef.current?.click()
  }

  return (
    <div className='flex items-center gap-2 mb-2'>
      <input
        type='file'
        ref={inputRef}
        className='hidden'
        accept='.xlsx,.xls'
        onChange={handleUpload}
      />
      <Tooltip
        content={
          <div className='flex flex-col gap-1 p-2'>
            <div className='flex items-center gap-2'>
              <Icon icon='mdi:check-circle' className='w-4 h-4 text-success' />
              <span className='font-medium'>上传Excel帮助AI理解数据结构</span>
            </div>
            <div className='text-sm text-default-500 pl-6'>
              支持场景：
              <div>• 数据表格结构 </div>
              <div>• 业务数据模板 </div>
              <div>• 配置清单 </div>
              <div>• 数据采集表</div>
            </div>
            <div className='text-xs text-default-400 pl-6'>支持.xlsx、.xls格式，最大10MB</div>
          </div>
        }
      >
        <Button
          variant='flat'
          size='sm'
          onClick={handleUploadClick}
          disabled={isLoading}
          className='flex items-center gap-2 relative'
        >
          <Icon icon='mdi:file-excel' className='w-4 h-4' />
          {isLoading ? "解析中..." : "上传Excel"}
        </Button>
      </Tooltip>
      {preview && (
        <div className='relative'>
          <div className='px-3 py-2 bg-default-100 rounded border border-default-200'>
            <div className='text-xs text-default-600'>已解析 {preview.headers.length} 个字段</div>
          </div>
          <SButton
            size='sm'
            variant='ghost'
            className='absolute -top-2 -right-2 p-0 min-w-unit-6 w-unit-6 h-unit-6 rounded-full'
            onClick={handleClear}
          >
            <Icon icon='mdi:close' className='w-3 h-3' />
          </SButton>
        </div>
      )}
    </div>
  )
}