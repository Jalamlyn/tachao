import { FileInfo } from "@/components/common/DynamicForm/types"
import message from "@/components/Message"
import { apiService } from "@/service/apis/api"

export const functions = (setPreviewFile, setPreviewVisible, setIsProcessing, setProgress, field) => {
  // 获取签名URL
  const getSignedUrl = async (fileName: string) => {
    try {
      const res = await apiService.get(`/api/file/form/upload:singed?fileName=${fileName}`)
      return res.data
    } catch (error) {
      message.error("获取签名URL失败，请重试！")
      throw error
    }
  }

  // 创建活动数据
  const createActivity = async (fileInfo: { fileName: string; fileKey: string }) => {
    try {
      const response = await apiService.post("/public/data/file/activitiess", {
        activityName: "测试",
        activityType: "test",
        files: [fileInfo],
      })
      return response.data
    } catch (error) {
      console.error("Create activity error:", error)
      throw error
    }
  }

  // 查询活动数据
  const queryActivity = async () => {
    try {
      const response = await apiService.post(
        "/public/data/file/activitiess/find",
        {},
        {
          params: { display: "paginate" },
        }
      )
      return response.data
    } catch (error) {
      console.error("Query activity error:", error)
      throw error
    }
  }

  // 处理文件预览
  const handlePreview = async (file: FileInfo) => {
    if (!file.type?.startsWith("image/")) {
      return
    }
    setPreviewFile(file)
    setPreviewVisible(true)

    if (field.uploadConfig?.onPreview) {
      field.uploadConfig.onPreview(file)
    }
  }

  // 处理文件下载
  const handleDownload = async (file: FileInfo) => {
    try {
      if (!file.downloadUrl) {
        message.error("下载链接不可用")
        return
      }

      if (field.uploadConfig?.onDownload) {
        field.uploadConfig.onDownload(file)
        return
      }

      const config = field.uploadConfig?.downloadConfig || {}
      const response = await fetch(file.downloadUrl, {
        method: config.method || "GET",
        headers: config.headers || {},
        credentials: config.withCredentials ? "include" : "omit",
      })

      if (!response.ok) {
        throw new Error("下载失败")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = file.fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Download error:", error)
      message.error("下载失败，请重试")
    }
  }

  // 处理新的upload类型
  const handleUploadType = async (file: File) => {
    if (field.uploadConfig) {
      // 检查文件大小
      if (field.uploadConfig.maxSize && file.size > field.uploadConfig.maxSize) {
        message.error(`文件大小不能超过 ${field.uploadConfig.maxSize / 1024 / 1024}MB`)
        return null
      }

      // 如果是图片且需要处理
      if (field.uploadConfig.uploadType === "image" && field.uploadConfig.cropOptions) {
        const { quality = 0.8 } = field.uploadConfig.cropOptions
        // 处理图片...
      }

      // 使用自定义上传
      if (field.uploadConfig.uploadConfig?.customRequest) {
        try {
          const result = await field.uploadConfig.uploadConfig.customRequest({
            file,
            onProgress: (percent: number) => {
              setProgress(percent)
              field.uploadConfig?.onProgress?.(percent)
            },
          })
          return result
        } catch (error) {
          console.error("Custom upload error:", error)
          field.uploadConfig?.onError?.(error as Error)
          throw error
        }
      }

      // 新的表单上传逻辑
      try {
        const signedData = await getSignedUrl(file.name)
        const formData = new FormData()
        formData.append("key", signedData.fileKey)
        formData.append("OSSAccessKeyId", signedData.accessKeyId)
        formData.append("policy", signedData.policy)
        formData.append("Signature", signedData.signature)
        formData.append("file", file)

        const xhr = new XMLHttpRequest()
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded * 100) / event.total)
            setProgress(percent)
            field.uploadConfig?.onProgress?.(percent)
          }
        }

        const uploadPromise = new Promise((resolve, reject) => {
          xhr.onload = async () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                setIsProcessing(true)
                // 创建活动数据
                await createActivity({
                  fileName: file.name,
                  fileKey: signedData.fileKey,
                })

                // 查询获取完整信息
                const queryResult = await queryActivity()

                // 修改这里的数据处理逻辑
                if (!queryResult?.data || !Array.isArray(queryResult.data) || queryResult.data.length === 0) {
                  throw new Error("未找到上传的文件信息")
                }

                // 获取最新的活动记录（按创建时间排序，取最新的）
                const latestActivity = queryResult.data.sort((a, b) => Number(b.createdAt) - Number(a.createdAt))[0]

                if (
                  !latestActivity.files ||
                  !Array.isArray(latestActivity.files) ||
                  latestActivity.files.length === 0
                ) {
                  throw new Error("文件信息不完整")
                }

                const fileInfo = latestActivity.files[0]
                if (!fileInfo || !fileInfo.downloadUrl) {
                  throw new Error("文件下载链接不可用")
                }

                field.uploadConfig?.onSuccess?.(fileInfo)
                resolve(fileInfo)
              } catch (error) {
                console.error("Process file error:", error)
                field.uploadConfig?.onError?.(error as Error)
                reject(error)
              } finally {
                setIsProcessing(false)
              }
            } else {
              const error = new Error(`Upload failed with status ${xhr.status}`)
              field.uploadConfig?.onError?.(error)
              reject(error)
            }
          }

          xhr.onerror = () => {
            const error = new Error("Upload failed")
            field.uploadConfig?.onError?.(error)
            reject(error)
          }
        })

        xhr.open("POST", signedData.formUploadHost, true)
        xhr.send(formData)

        return await uploadPromise
      } catch (error) {
        console.error("Upload error:", error)
        field.uploadConfig?.onError?.(error as Error)
        throw error
      }
    }

    return file
  }
  return {
    handlePreview,
    handleDownload,
    handleUploadType,
  }
}
