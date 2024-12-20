import React from "react"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"

interface FilePreviewProps {
  type: "image" | "excel"
  fileName: string
  fileSize: string
  onDelete: () => void
  onView: () => void
  previewData: {
    image?: string
    excel?: {
      headers: string[]
      firstRow: any
    }
  }
}

export const FilePreview: React.FC<FilePreviewProps> = ({
  type,
  fileName,
  fileSize,
  onDelete,
  onView,
  previewData,
}) => {
  return (
    <div className="relative p-4 border rounded-lg bg-default-50 hover:bg-default-100 transition-all duration-200">
      <div className="flex items-start gap-3">
        {/* 文件图标或图片预览 */}
        {type === "image" && previewData.image ? (
          <img
            src={previewData.image}
            alt={fileName}
            className="w-16 h-16 object-cover rounded-lg border"
          />
        ) : (
          <div className="w-16 h-16 flex items-center justify-center bg-default-100 rounded-lg">
            <Icon
              icon={type === "image" ? "mdi:image" : "mdi:file-excel"}
              className="w-8 h-8 text-default-500"
            />
          </div>
        )}

        {/* 文件信息 */}
        <div className="flex-1">
          <h4 className="font-medium text-sm">{fileName}</h4>
          <p className="text-xs text-default-500">{fileSize}</p>
          
          {/* Excel预览 */}
          {type === "excel" && previewData.excel && (
            <div className="mt-2 text-xs">
              <p className="text-default-700">已解析 {previewData.excel.headers.length} 个字段</p>
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="light"
            onClick={onView}
            isIconOnly
          >
            <Icon icon="mdi:eye" className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="light"
            color="danger"
            onClick={onDelete}
            isIconOnly
          >
            <Icon icon="mdi:delete" className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}