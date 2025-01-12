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
  const getTypeColor = (type: "image" | "excel") => {
    return type === "image" ? "bg-blue-50 text-blue-500" : "bg-green-50 text-green-500"
  }

  const getTypeIcon = (type: "image" | "excel") => {
    return type === "image" ? "mdi:image" : "mdi:file-excel"
  }

  return (
    <div
      className={cn(
        "relative group w-32 h-20 rounded-lg t-all duration-200",
        "border hover:border-primary/50 hover:shadow-md",
        getTypeColor(type)
      )}
    >
      <button
        onClick={onDelete}
        className={cn(
          "absolute top-1 right-1 z-10 p-1 rounded-full",
          "bg-white/80 backdrop-blur-sm shadow-sm border",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
          "hover:bg-red-50 hover:border-red-200"
        )}
      >
        <Icon icon='mdi:close' className='w-3 h-3 text-gray-500 hover:text-red-500' />
      </button>

      <div className='h-full p-3 cursor-pointer' onClick={onView}>
        <div className='flex items-center gap-2 mb-2'>
          <Icon icon={getTypeIcon(type)} className='w-4 h-4' />
          <span className='text-xs font-medium truncate flex-1'>{fileName}</span>
        </div>

        {type === "image" && previewData.image ? (
          <div className='w-full h-8 overflow-hidden rounded'>
            <img src={previewData.image} alt={fileName} className='w-full h-full object-cover' />
          </div>
        ) : type === "excel" && previewData.excel ? (
          <div className='text-xs'>
            <p className='truncate text-gray-600'>{previewData.excel.headers.length} 个字段</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
