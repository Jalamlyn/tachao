import { useState, useCallback } from "react"
import { readExcel } from "@/utils/ExcelReader"
import { logger } from "@/utils/logger"
import message from "@/components/Message"

interface FileUploadOptions {
  onProgress?: (progress: number) => void
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
}

interface FileValidationResult {
  isValid: boolean
  error?: string
}

export function useFileUpload(options: FileUploadOptions = {}) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // 验证文件
  const validateFile = (file: File): FileValidationResult => {
    // 检查文件类型
    const validTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
    ]
    if (!validTypes.includes(file.type)) {
      return {
        isValid: false,
        error: "只支持 Excel 和 CSV 文件格式",
      }
    }

    // 检查文件大小 (默认最大 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: "文件大小不能超过 10MB",
      }
    }

    return { isValid: true }
  }

  // 处理文件上传
  const handleUpload = useCallback(
    async (file: File) => {
      setUploading(true)
      setProgress(0)
      setError(null)

      try {
        // 验证文件
        const validation = validateFile(file)
        if (!validation.isValid) {
          throw new Error(validation.error)
        }

        // 模拟上传进度
        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            const next = prev + 10
            if (next >= 90) {
              clearInterval(progressInterval)
              return 90
            }
            return next
          })
          options.onProgress?.(progress)
        }, 200)

        // 读取文件内容
        const data = await readExcel(file)
        
        // 清理进度定时器
        clearInterval(progressInterval)
        setProgress(100)
        options.onProgress?.(100)

        // 处理成功
        logger.debug("[useFileUpload] File uploaded successfully", {
          fileName: file.name,
          size: file.size,
        })
        options.onSuccess?.(data)
        message.success("文件上传成功")
        return data
      } catch (err) {
        const error = err as Error
        setError(error.message)
        logger.error("[useFileUpload] File upload failed", error)
        options.onError?.(error)
        message.error(error.message || "文件上传失败")
        throw error
      } finally {
        setUploading(false)
      }
    },
    [options, progress]
  )

  // 重置状态
  const reset = useCallback(() => {
    setUploading(false)
    setProgress(0)
    setError(null)
  }, [])

  return {
    uploading,
    progress,
    error,
    handleUpload,
    reset,
  }
}

// 导出文件验证工具
export const fileUtils = {
  getFileSize: (size: number): string => {
    if (size < 1024) {
      return size + " B"
    } else if (size < 1024 * 1024) {
      return (size / 1024).toFixed(2) + " KB"
    } else {
      return (size / (1024 * 1024)).toFixed(2) + " MB"
    }
  },

  getFileType: (file: File): string => {
    const extension = file.name.split(".").pop()?.toLowerCase()
    switch (extension) {
      case "xlsx":
      case "xls":
        return "Excel"
      case "csv":
        return "CSV"
      default:
        return "Unknown"
    }
  },
}