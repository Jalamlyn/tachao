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
import { getMetadata, setMetadata } from "@/service/apis/metadata"
import { PublishAppModal } from "./PublishAppModal"

interface AppCardProps {
  app: AppIndex
  index: number
  onDevelopClick: (app: AppIndex) => void
}

export const AppCard: React.FC<AppCardProps> = ({ app, index, onDevelopClick }) => {
  const navigate = useNavigate()
  const [newTitle, setNewTitle] = useState(app.title)
  const { setDeleteModalOpen, setAppToDelete, useRenameApp, useUpdateAppConfig } = useAppStore()
  const {
    isOpen: isPermissionModalOpen,
    onOpen: onPermissionModalOpen,
    onClose: onPermissionModalClose,
  } = useDisclosure()
  const { isOpen: isRenameModalOpen, onOpen: onRenameModalOpen, onClose: onRenameModalClose } = useDisclosure()
  const {
    isOpen: isCollaboratorModalOpen,
    onOpen: onCollaboratorModalOpen,
    onClose: onCollaboratorModalClose,
  } = useDisclosure()
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false)
  const {
    isOpen: isUnpublishConfirmOpen,
    onOpen: onUnpublishConfirmOpen,
    onClose: onUnpublishConfirmClose,
  } = useDisclosure()

  const { renameApp, isRenaming } = useRenameApp()
  const { updateAppConfig, isUpdating } = useUpdateAppConfig()
  const { user } = useCurrentUser()
  const [accounts, setAccounts] = useState<any[]>([])
  const [selectedAccount, setSelectedAccount] = useState("")
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false)
  const [isUploadingPreview, setIsUploadingPreview] = useState(false)
  const [isUnpublishing, setIsUnpublishing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cardRef = useRef(null)

  // 保留原有的所有方法...

  const handleUnpublishFromMarket = async () => {
    try {
      setIsUnpublishing(true)
      const [indexData, appIndexData] = await Promise.all([
        getMetadata(["market_apps_index"]),
        getMetadata(["app_index"]),
      ])

      const marketIndex = indexData.data?.[0]?.value
        ? JSON.parse(indexData.data[0].value)
        : { totalApps: 0, totalPages: 0 }
      const appIndex = appIndexData.data?.[0]?.value ? JSON.parse(appIndexData.data[0].value) : []

      for (let page = 1; page <= marketIndex.totalPages; page++) {
        const pageKey = `market_apps_page_${page}`
        const pageDataResult = await getMetadata([pageKey])
        const pageData = pageDataResult.data?.[0]?.value ? JSON.parse(pageDataResult.data[0].value) : []
        const updatedPageData = pageData.filter((item) => item.id !== app.id)

        if (pageData.length !== updatedPageData.length) {
          await setMetadata(pageKey, JSON.stringify(updatedPageData))
          break
        }
      }

      const updatedAppIndex = appIndex.map((appItem) =>
        appItem.id === app.id ? { ...appItem, isPublished: false, publishedAt: null } : appItem
      )
      await setMetadata("app_index", JSON.stringify(updatedAppIndex))

      await setMetadata(
        "market_apps_index",
        JSON.stringify({
          ...marketIndex,
          totalApps: marketIndex.totalApps - 1,
          lastUpdated: new Date().toISOString(),
        })
      )

      message.success("应用已从应用市场下架")
      onUnpublishConfirmClose()
    } catch (error) {
      console.error("Failed to unpublish from market:", error)
      message.error("下架失败，请重试")
    } finally {
      setIsUnpublishing(false)
    }
  }

  // 保留原有的其他方法...

  return (
    <>
      <Card ref={cardRef}>
        {/* 保留原有的Card内容... */}
        <CardBody>
          <div className='space-y-4'>
            {/* 保留原有的其他UI元素... */}
            <div className='grid grid-cols-12 gap-6 items-center'>
              <div className='col-span-12 space-y-4'>
                {/* 保留原有的其他UI元素... */}
                <div className='flex gap-2'>
                  {/* 保留原有的其他按钮... */}
                  {hasEditPermission(app, user) && (
                    <>
                      <Dropdown>
                        <DropdownTrigger>
                          <Button
                            size='sm'
                            variant='light'
                            isIconOnly
                            className='bg-default-100/50 hover:bg-default-200/50'
                          >
                            <Icon icon='mdi:dots-vertical' className='w-5 h-5' />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label='应用操作'>
                          {/* 保留原有的其他菜单项... */}
                          {hasPublishPermission(app, user) && (
                            <DropdownItem
                              key='publish'
                              startContent={<Icon icon='mdi:store' className='w-4 h-4' />}
                              onPress={app.isPublished ? onUnpublishConfirmOpen : () => setIsPublishModalOpen(true)}
                              className={app.isPublished ? "text-danger" : ""}
                            >
                              {app.isPublished ? "从应用市场下架" : "上架到应用市场"}
                            </DropdownItem>
                          )}
                        </DropdownMenu>
                      </Dropdown>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 保留原有的其他模态框... */}

      <PublishAppModal
        app={app}
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onSuccess={() => {
          message.success("应用已成功上架到应用市场")
          setIsPublishModalOpen(false)
        }}
        onError={(error) => {
          message.error("上架失败：" + error.message)
        }}
      />

      <Modal isOpen={isUnpublishConfirmOpen} onClose={onUnpublishConfirmClose}>
        <ModalContent>
          <ModalHeader>确认下架</ModalHeader>
          <ModalBody>
            <p>确定要将应用 "{app.title}" 从应用市场下架吗？下架后其他用户将无法在应用市场中看到该应用。</p>
          </ModalBody>
          <ModalFooter>
            <Button variant='light' onPress={onUnpublishConfirmClose}>
              取消
            </Button>
            <Button color='danger' onPress={handleUnpublishFromMarket} isLoading={isUnpublishing}>
              确认下架
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}