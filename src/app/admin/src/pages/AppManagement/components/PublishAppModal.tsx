import React, { useState } from "react"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  Image,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { AppIndex } from "../store/types"
import { getMetadata, setMetadata } from "@/service/apis/metadata"
import message from "@/components/Message"

interface PublishAppModalProps {
  app: AppIndex
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export const PublishAppModal: React.FC<PublishAppModalProps> = ({ app, isOpen, onClose, onSuccess, onError }) => {
  const [screenshots, setScreenshots] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleScreenshotUpload = async (file: File) => {
    if (screenshots.length >= 5) {
      message.error("最多只能上传5张截图")
      return
    }

    if (file.size > 4 * 1024 * 1024) {
      message.error("图片大小不能超过4MB")
      return
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      message.error("只支持 JPG、PNG、GIF 格式图片")
      return
    }

    try {
      setIsUploading(true)

      const img = new Image()
      img.src = URL.createObjectURL(file)
      await new Promise((resolve) => {
        img.onload = resolve
      })

      const canvas = document.createElement("canvas")
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext("2d")
      ctx.drawImage(img, 0, 0)

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob), "image/webp", 0.8)
      })

      const screenshotFile = new File([blob], `screenshot-${Date.now()}.webp`, {
        type: "image/webp",
      })

      const cloudPath = `app-screenshots/${app.id}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.webp`

      const auth = window.app.auth()
      await auth.signInAnonymously()

      const uploadResult = await window.app.uploadFile({
        cloudPath,
        filePath: screenshotFile,
      })

      const urlResult = await window.app.getTempFileURL({
        fileList: [uploadResult.fileID],
      })

      const tempFileURL = urlResult.fileList[0]?.tempFileURL
      if (!tempFileURL) {
        throw new Error("Failed to get screenshot URL")
      }

      setScreenshots((prev) => [...prev, tempFileURL])
      message.success("截图上传成功")
    } catch (error) {
      console.error("Error uploading screenshot:", error)
      message.error("截图上传失败")
      onError?.(error)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleScreenshotUpload(file)
    }
  }

  const handleRemoveScreenshot = (index: number) => {
    setScreenshots((prev) => prev.filter((_, i) => i !== index))
  }

  const handlePublish = async () => {
    if (screenshots.length < 5) {
      message.error("请上传5张应用截图")
      return
    }

    try {
      setIsPublishing(true)
      const [indexData, appIndexData] = await Promise.all([
        getMetadata(["market_apps_index"]),
        getMetadata(["app_index"]),
      ])

      const marketIndex = indexData.data?.[0]?.value
        ? JSON.parse(indexData.data[0].value)
        : { totalApps: 0, totalPages: 0 }
      const appIndex = appIndexData.data?.[0]?.value ? JSON.parse(appIndexData.data[0].value) : []

      const marketApp = {
        id: app.id,
        title: app.title,
        description: app.description || "",
        accessUrl: `/app-run/${app.id}`,
        creator: app.creator,
        screenshots: screenshots,
        publishedAt: new Date().toISOString(),
      }

      const currentPage = Math.ceil((marketIndex.totalApps + 1) / 20)
      const pageKey = `market_apps_page_${currentPage}`
      const pageDataResult = await getMetadata([pageKey])
      const pageData = pageDataResult.data?.[0]?.value ? JSON.parse(pageDataResult.data[0].value) : []
      await setMetadata(pageKey, JSON.stringify([...pageData, marketApp]))

      const updatedAppIndex = appIndex.map((appItem) =>
        appItem.id === app.id ? { ...appItem, isPublished: true, publishedAt: marketApp.publishedAt } : appItem
      )
      await setMetadata("app_index", JSON.stringify(updatedAppIndex))

      await setMetadata(
        "market_apps_index",
        JSON.stringify({
          totalPages: currentPage,
          totalApps: marketIndex.totalApps + 1,
          lastUpdated: marketApp.publishedAt,
        })
      )

      onSuccess?.()
      onClose()
    } catch (error) {
      console.error("Failed to publish to market:", error)
      message.error("上架失败，请重试")
      onError?.(error)
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        <ModalHeader>上架应用到应用市场</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <p>确定要将应用 "{app.title}" 上架到应用市场吗？上架后所有用户都能看到并使用该应用。</p>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-medium">应用截图（必须上传5张）</h4>
                <span className="text-sm text-default-500">
                  {screenshots.length}/5 张
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {screenshots.map((screenshot, index) => (
                  <Card key={index} className="relative group">
                    <CardBody className="p-0">
                      <Image
                        src={screenshot}
                        alt={`Screenshot ${index + 1}`}
                        className="w-full h-32 object-cover"
                      />
                      <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        isIconOnly
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveScreenshot(index)}
                      >
                        <Icon icon="mdi:close" className="w-4 h-4" />
                      </Button>
                    </CardBody>
                  </Card>
                ))}
                
                {screenshots.length < 5 && (
                  <Card
                    isPressable
                    className="border-2 border-dashed border-default-200 hover:border-primary cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <CardBody className="h-32 flex flex-col items-center justify-center">
                      <Icon icon="mdi:image-plus" className="w-8 h-8 text-default-400" />
                      <span className="text-sm text-default-500 mt-2">上传截图</span>
                    </CardBody>
                  </Card>
                )}
              </div>
              
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/jpeg,image/png,image/gif"
                onChange={handleFileSelect}
              />
              
              <p className="text-xs text-default-500">
                支持 JPG、PNG、GIF 格式，单张图片大小不超过 4MB
              </p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            取消
          </Button>
          <Button
            color="primary"
            onPress={handlePublish}
            isLoading={isPublishing || isUploading}
            isDisabled={screenshots.length < 5}
          >
            确认上架
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}