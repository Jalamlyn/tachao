import React, { useState, useRef, useEffect } from "react"
import {
  Card,
  CardBody,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Chip,
  Avatar,
  AvatarGroup,
  Tooltip,
  Select,
  SelectItem,
  Image as NextImage,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useNavigate } from "react-router-dom"
import { AppIndex, useAppStore } from "../store/useAppStore"
import { PermissionModal } from "@/app/admin/src/permissions/components/PermissionModal"
import message from "@/components/Message"
import { useCurrentUser } from "@/app/admin/src/permissions/hooks/useCurrentUser"
import { queryRamAccount } from "@/service/apis/user"
import html2canvas from 'html2canvas'
import { getMetadata, setMetadata } from "@/service/apis/metadata"

const txApp = app

interface AppCardProps {
  app: AppIndex
  index: number
  onDevelopClick: (app: AppIndex) => void
}

export const AppCard: React.FC<AppCardProps> = ({ app, index, onDevelopClick }) => {
  // ... 保持其他代码不变 ...

  // 修改预览图上传处理函数
  const handlePreviewUpload = async (file: File) => {
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
      setIsUploadingPreview(true)

      // 使用 html2canvas 将图片转换为 webp 格式
      const img = new Image()
      img.src = URL.createObjectURL(file)
      await new Promise((resolve) => {
        img.onload = resolve
      })

      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)

      // 转换为 webp 格式的 blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/webp', 0.8)
      })

      // 创建 File 对象
      const previewFile = new File([blob], `preview-${Date.now()}.webp`, {
        type: 'image/webp'
      })

      // 生成云存储路径
      const cloudPath = `app-previews/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.webp`

      // 认证
      const auth = txApp.auth()
      await auth.signInAnonymously()

      // 上传文件
      const uploadResult = await txApp.uploadFile({
        cloudPath,
        filePath: previewFile,
      })

      // 获取临时URL
      const urlResult = await txApp.getTempFileURL({
        fileList: [uploadResult.fileID],
      })

      const tempFileURL = urlResult.fileList[0]?.tempFileURL
      if (!tempFileURL) {
        throw new Error("Failed to get preview image URL")
      }

      // 获取当前的 app_index
      const appIndexResult = await getMetadata(["app_index"])
      const apps = appIndexResult.data?.[0]?.value ? JSON.parse(appIndexResult.data[0].value) : []

      // 更新当前应用的预览图信息
      const updatedApps = apps.map(appItem => {
        if (appItem.id === app.id) {
          return {
            ...appItem,
            previewImage: {
              url: tempFileURL,
              fileID: uploadResult.fileID,
              updatedAt: new Date().toISOString(),
            }
          }
        }
        return appItem
      })

      // 更新 app_index
      await setMetadata("app_index", JSON.stringify(updatedApps))

      message.success("预览图更新成功")
    } catch (error) {
      console.error("Error uploading preview:", error)
      message.error("预览图上传失败")
    } finally {
      setIsUploadingPreview(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // ... 保持其他代码不变 ...

  return (
    // ... 保持其他代码不变 ...
  )
}