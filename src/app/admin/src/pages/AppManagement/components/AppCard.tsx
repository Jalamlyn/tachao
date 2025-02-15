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
  const {
    isOpen: isPublishConfirmOpen,
    onOpen: onPublishConfirmOpen,
    onClose: onPublishConfirmClose,
  } = useDisclosure()
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
  const [isPublishing, setIsPublishing] = useState(false)
  const [isUnpublishing, setIsUnpublishing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cardRef = useRef(null)

  // 基础编辑权限判断
  const hasEditPermission = (app: AppIndex, currentUser: any) => {
    if (!currentUser) return false
    if (currentUser.account === "admin") return true
    if (app.creator?.id === currentUser.id) return true
    return app.collaborators?.some((c) => c.id === currentUser.id) || false
  }

  // 发布权限判断
  const hasPublishPermission = (app: AppIndex, currentUser: any) => {
    if (!currentUser) return false
    if (currentUser.account === "admin") return true
    return app.creator?.id === currentUser.id
  }

  const handlePublishToMarket = async () => {
    try {
      setIsPublishing(true)
      // 1. 获取当前市场数据
      const [indexData, appIndexData] = await Promise.all([
        getMetadata(["market_apps_index"]),
        getMetadata(["app_index"]),
      ])

      const marketIndex = indexData.data?.[0]?.value ? JSON.parse(indexData.data[0].value) : { totalApps: 0, totalPages: 0 }
      const appIndex = appIndexData.data?.[0]?.value ? JSON.parse(appIndexData.data[0].value) : []

      // 2. 准备市场应用数据
      const marketApp = {
        id: app.id,
        title: app.title,
        description: app.description || "",
        accessUrl: `/app-run/${app.id}`,
        creator: app.creator,
        screenshots: app.previewImage ? [app.previewImage.url] : [],
        publishedAt: new Date().toISOString(),
      }

      // 3. 计算存储位置
      const currentPage = Math.ceil((marketIndex.totalApps + 1) / 20)
      
      // 4. 更新市场数据
      const pageKey = `market_apps_page_${currentPage}`
      const pageDataResult = await getMetadata([pageKey])
      const pageData = pageDataResult.data?.[0]?.value ? JSON.parse(pageDataResult.data[0].value) : []
      await setMetadata(pageKey, JSON.stringify([...pageData, marketApp]))

      // 5. 更新应用索引
      const updatedAppIndex = appIndex.map((appItem) =>
        appItem.id === app.id
          ? { ...appItem, isPublished: true, publishedAt: marketApp.publishedAt }
          : appItem
      )
      await setMetadata("app_index", JSON.stringify(updatedAppIndex))

      // 6. 更新市场索引
      await setMetadata(
        "market_apps_index",
        JSON.stringify({
          totalPages: currentPage,
          totalApps: marketIndex.totalApps + 1,
          lastUpdated: marketApp.publishedAt,
        })
      )

      message.success("应用已成功上架到应用市场")
      onPublishConfirmClose()
    } catch (error) {
      console.error("Failed to publish to market:", error)
      message.error("上架失败，请重试")
    } finally {
      setIsPublishing(false)
    }
  }

  const handleUnpublishFromMarket = async () => {
    try {
      setIsUnpublishing(true)
      // 1. 获取当前市场数据
      const [indexData, appIndexData] = await Promise.all([
        getMetadata(["market_apps_index"]),
        getMetadata(["app_index"]),
      ])

      const marketIndex = indexData.data?.[0]?.value ? JSON.parse(indexData.data[0].value) : { totalApps: 0, totalPages: 0 }
      const appIndex = appIndexData.data?.[0]?.value ? JSON.parse(appIndexData.data[0].value) : []

      // 2. 查找并删除市场应用数据
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

      // 3. 更新应用索引
      const updatedAppIndex = appIndex.map((appItem) =>
        appItem.id === app.id
          ? { ...appItem, isPublished: false, publishedAt: null }
          : appItem
      )
      await setMetadata("app_index", JSON.stringify(updatedAppIndex))

      // 4. 更新市场索引
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

  // 其他现有方法保持不变...

  return (
    <>
      <Card ref={cardRef}>
        <CardBody>
          <div className='space-y-4'>
            {/* 现有的卡片内容保持不变... */}
            
            {/* 在操作按钮区域添加上架/下架按钮 */}
            <div className='flex gap-2'>
              <Button
                size='sm'
                variant='flat'
                startContent={<Icon icon='mdi:eye' className='w-5 h-5' />}
                onPress={() => window.open(`/app-run/${app.id}`, "_blank")}
              ></Button>

              {hasEditPermission(app, user) && (
                <>
                  <Button
                    size='sm'
                    color='primary'
                    startContent={<Icon icon='hugeicons:ai-chat-02' className='w-5 h-5' />}
                    onPress={() => navigate(`/admin/apps/${app.id}/builder`)}
                  ></Button>

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
                      <DropdownItem
                        key='copy-id'
                        startContent={
                          <Icon
                            icon='mdi:content-copy'
                            className='w-4 h-4 transform group-hover:scale-110 transition-transform duration-200'
                            aria-hidden='true'
                          />
                        }
                        onPress={handleCopyId}
                      >
                        复制ID
                      </DropdownItem>
                      <DropdownItem
                        key='rename'
                        startContent={<Icon icon='mdi:pencil' className='w-4 h-4' />}
                        onPress={onRenameModalOpen}
                      >
                        重命名
                      </DropdownItem>
                      {hasPublishPermission(app, user) && (
                        <DropdownItem
                          key='publish'
                          startContent={<Icon icon='mdi:store-upload' className='w-4 h-4' />}
                          onPress={app.isPublished ? onUnpublishConfirmOpen : onPublishConfirmOpen}
                          className={app.isPublished ? 'text-danger' : ''}
                        >
                          {app.isPublished ? "从应用市场下架" : "上架到应用市场"}
                        </DropdownItem>
                      )}
                      {/* 其他现有的下拉菜单项保持不变... */}
                    </DropdownMenu>
                  </Dropdown>
                </>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 现有的模态框保持不变... */}

      {/* 添加上架确认模态框 */}
      <Modal isOpen={isPublishConfirmOpen} onClose={onPublishConfirmClose}>
        <ModalContent>
          <ModalHeader>确认上架</ModalHeader>
          <ModalBody>
            <p>确定要将应用 "{app.title}" 上架到应用市场吗？上架后所有用户都能看到并使用该应用。</p>
          </ModalBody>
          <ModalFooter>
            <Button variant='light' onPress={onPublishConfirmClose}>
              取消
            </Button>
            <Button color='primary' onPress={handlePublishToMarket} isLoading={isPublishing}>
              确认上架
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 添加下架确认模态框 */}
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