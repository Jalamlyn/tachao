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
  const { isOpen: isPublishConfirmOpen, onOpen: onPublishConfirmOpen, onClose: onPublishConfirmClose } = useDisclosure()
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

  const hasEditPermission = (app: AppIndex, currentUser: any) => {
    if (!currentUser) return false
    if (currentUser.account === "admin") return true
    if (app.creator?.id === currentUser.id) return true
    return app.collaborators?.some((c) => c.id === currentUser.id) || false
  }

  const hasPublishPermission = (app: AppIndex, currentUser: any) => {
    if (!currentUser) return false
    if (currentUser.account === "admin") return true
    return app.creator?.id === currentUser.id
  }

  const handleDelete = () => {
    setAppToDelete(app)
    setDeleteModalOpen(true)
  }

  const handleRename = async () => {
    try {
      await renameApp({ id: app.id, title: newTitle })
      onRenameModalClose()
    } catch (error) {
      console.error("Failed to rename app:", error)
    }
  }

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(app.id)
      message.success("应用ID已复制到剪贴板")
    } catch (error) {
      console.error("Failed to copy app ID:", error)
      message.error("复制失败")
    }
  }

  const loadAccounts = async () => {
    try {
      setIsLoadingAccounts(true)
      const response = await queryRamAccount()
      setAccounts(response.data || [])
    } catch (error) {
      console.error("Error loading accounts:", error)
      message.error("加载账号列表失败")
    } finally {
      setIsLoadingAccounts(false)
    }
  }

  const handleAddCollaborator = async () => {
    if (!selectedAccount) {
      message.error("请选择要添加的协作者")
      return
    }

    try {
      const selectedUser = accounts.find((acc) => acc.id === selectedAccount)
      if (!selectedUser) {
        throw new Error("未找到选择的用户")
      }

      const updatedCollaborators = [
        ...(app.collaborators || []),
        {
          id: selectedUser.id,
          name: selectedUser.name,
          addedAt: new Date().toISOString(),
        },
      ]

      await updateAppConfig({
        appId: app.id,
        input: {
          ...app,
          collaborators: updatedCollaborators,
        },
      })

      message.success("添加协作者成功")
      onCollaboratorModalClose()
      setSelectedAccount("")
    } catch (error) {
      console.error("Failed to add collaborator:", error)
      message.error("添加协作者失败")
    }
  }

  const handleRemoveCollaborator = async (collaboratorId: string) => {
    try {
      const updatedCollaborators = app.collaborators?.filter((c) => c.id !== collaboratorId) || []

      await updateAppConfig({
        appId: app.id,
        input: {
          ...app,
          collaborators: updatedCollaborators,
        },
      })

      message.success("移除协作者成功")
    } catch (error) {
      console.error("Failed to remove collaborator:", error)
      message.error("移除协作者失败")
    }
  }

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

      const previewFile = new File([blob], `preview-${Date.now()}.webp`, {
        type: "image/webp",
      })

      const cloudPath = `app-previews/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.webp`

      const auth = window.app.auth()
      await auth.signInAnonymously()

      const uploadResult = await window.app.uploadFile({
        cloudPath,
        filePath: previewFile,
      })

      const urlResult = await window.app.getTempFileURL({
        fileList: [uploadResult.fileID],
      })

      const tempFileURL = urlResult.fileList[0]?.tempFileURL
      if (!tempFileURL) {
        throw new Error("Failed to get preview image URL")
      }

      const appIndexResult = await getMetadata(["app_index"])
      const apps = appIndexResult.data?.[0]?.value ? JSON.parse(appIndexResult.data[0].value) : []

      const updatedApps = apps.map((appItem) => {
        if (appItem.id === app.id) {
          return {
            ...appItem,
            previewImage: {
              url: tempFileURL,
              fileID: uploadResult.fileID,
              updatedAt: new Date().toISOString(),
            },
          }
        }
        return appItem
      })

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handlePreviewUpload(file)
    }
  }

  const handlePublishToMarket = async () => {
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
        screenshots: app.previewImage ? [app.previewImage.url] : [],
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

  const getAccessControlLabel = () => {
    return {
      color: "success",
      label: "所有用户可访问",
    }
  }

  const getAvailableAccounts = () => {
    if (!accounts) return []

    const existingCollaboratorIds = app.collaborators?.map((c) => c.id) || []
    const creatorId = app.creator?.id

    return accounts.filter((account) => {
      if (existingCollaboratorIds.includes(account.id)) return false
      if (account.account === "admin") return false
      if (creatorId && account.id === creatorId) return false
      return true
    })
  }

  const getDefaultPreviewStyle = () => {
    const gradientColors = [
      ["#4F46E5", "#7C3AED"],
      ["#2563EB", "#3B82F6"],
      ["#059669", "#10B981"],
      ["#DC2626", "#EF4444"],
      ["#D97706", "#F59E0B"],
    ]

    const colorIndex = app.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % gradientColors.length
    const [color1, color2] = gradientColors[colorIndex]

    return {
      background: `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`,
      position: "relative" as const,
      overflow: "hidden",
    }
  }

  const getPatternStyle = () => {
    return {
      position: "absolute" as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.1,
      backgroundImage: `
        radial-gradient(circle at 10% 20%, rgba(255,255,255,0.3) 0%, transparent 20%),
        radial-gradient(circle at 90% 80%, rgba(255,255,255,0.3) 0%, transparent 20%),
        linear-gradient(60deg, transparent 0%, rgba(255,255,255,0.1) 100%)
      `,
      transition: "opacity 0.3s ease-in-out",
    }
  }

  const getDefaultContentStyle = () => {
    return {
      position: "absolute" as const,
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      textAlign: "center" as const,
      color: "white",
      zIndex: 1,
    }
  }

  return (
    <>
      <Card ref={cardRef}>
        <CardBody>
          <div className='space-y-4'>
            <div
              className='relative w-full aspect-video rounded-lg overflow-hidden cursor-pointer'
              style={!app?.previewImage?.url ? getDefaultPreviewStyle() : {}}
              onClick={() => window.open(`/app-run/${app.id}`, "_blank")}
            >
              {app?.previewImage?.url ? (
                <NextImage
                  src={app.previewImage.url}
                  alt={`Preview of ${app.title}`}
                  className='w-full h-full object-cover transition-transform duration-200 hover:scale-105'
                />
              ) : (
                <>
                  <div style={getPatternStyle()} className='hover:opacity-0.2 transition-opacity duration-300' />
                  <div style={getDefaultContentStyle()}>
                    <Icon icon='hugeicons:ai-chat-02' className='w-12 h-12 mb-2 opacity-90' />
                    <h3 className='text-lg font-bold tracking-tight'>{app.title}</h3>
                  </div>
                </>
              )}
            </div>

            <div className='grid grid-cols-12 gap-6 items-center'>
              <div className='col-span-12 space-y-4'>
                <div className='flex justify-between items-start'>
                  <div className='space-y-1'>
                    <Tooltip content={app.title}>
                      <h3 className='text-xl font-bold tracking-tight truncate'>{app.title}</h3>
                    </Tooltip>

                    <div className='flex items-center gap-2'>
                      <Chip size='sm' variant='flat' color={getAccessControlLabel().color}>
                        {getAccessControlLabel().label}
                      </Chip>
                      {app.isPublished && (
                        <Chip size='sm' variant='flat' color='success'>
                          已上架到应用市场
                        </Chip>
                      )}
                    </div>
                  </div>

                  <div className='flex flex-col gap-2'>
                    {app.creator && (
                      <div className='flex items-center gap-2'>
                        <Avatar
                          size='sm'
                          showFallback
                          name={app.creator.name}
                          src={app.creator.avatar || "https://i.pravatar.cc/150?u=a04258114e29026708c"}
                          isBordered
                          radius='full'
                          fallback={<Icon icon='mdi:account' className='w-4 h-4' />}
                          className='w-6 h-6'
                        />
                        <span className='tracking-tight truncate font-bold text-xs text-default-500'>
                          创建者:{app.creator.name === "管理员" ? "管理员" : app.creator.name.split("_")[1]}
                        </span>
                      </div>
                    )}
                    {app.collaborators && app.collaborators.length > 0 && (
                      <Tooltip
                        content={
                          <div className='p-2'>
                            <p className='text-small font-bold mb-1'>协作者:</p>
                            {app.collaborators.map((c) => (
                              <div key={c.id} className='flex items-center gap-2 text-tiny'>
                                <Avatar
                                  size='sm'
                                  showFallback
                                  name={c.name}
                                  src={c.avatar}
                                  fallback={<Icon icon='mdi:account' className='w-4 h-4' />}
                                  className='w-5 h-5'
                                />
                                {c.name}
                              </div>
                            ))}
                          </div>
                        }
                      >
                        <div className='flex items-center gap-2'>
                          <AvatarGroup isBordered max={3} size='sm' total={app.collaborators.length}>
                            {app.collaborators.map((c) => (
                              <Avatar
                                key={c.id}
                                size='sm'
                                showFallback
                                name={c.name}
                                src={c.avatar}
                                fallback={<Icon icon='mdi:account' className='w-4 h-4' />}
                              />
                            ))}
                          </AvatarGroup>
                          <span className='tracking-tight truncate font-bold text-xs text-default-500'>
                            {app.collaborators.length} 位协作者
                          </span>
                        </div>
                      </Tooltip>
                    )}
                  </div>
                </div>

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
                              startContent={<Icon icon='mdi:store' className='w-4 h-4' />}
                              onPress={app.isPublished ? onUnpublishConfirmOpen : onPublishConfirmOpen}
                              className={app.isPublished ? "text-danger" : ""}
                            >
                              {app.isPublished ? "从应用市场下架" : "上架到应用市场"}
                            </DropdownItem>
                          )}
                          <DropdownItem
                            key='collaborators'
                            startContent={<Icon icon='mdi:account-multiple' className='w-4 h-4' />}
                            onPress={() => {
                              loadAccounts()
                              onCollaboratorModalOpen()
                            }}
                          >
                            管理协作者
                          </DropdownItem>
                          <DropdownItem
                            key='upload-preview'
                            startContent={<Icon icon='mdi:image-plus' className='w-4 h-4' />}
                            onPress={() => fileInputRef.current?.click()}
                            isDisabled={isUploadingPreview}
                          >
                            {isUploadingPreview ? "上传中..." : "上传预览图"}
                          </DropdownItem>
                          <DropdownItem
                            key='delete'
                            className='text-danger'
                            color='danger'
                            startContent={<Icon icon='mdi:delete' className='w-4 h-4' />}
                            onPress={handleDelete}
                          >
                            删除应用
                          </DropdownItem>
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

      <input
        type='file'
        ref={fileInputRef}
        className='hidden'
        accept='image/jpeg,image/png,image/gif'
        onChange={handleFileSelect}
      />

      <PermissionModal
        isOpen={isPermissionModalOpen}
        onClose={onPermissionModalClose}
        resourceType='app'
        resourceId={app.id}
        resourceTitle={app.title}
      />

      <Modal isOpen={isRenameModalOpen} onClose={onRenameModalClose}>
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>重命名应用</ModalHeader>
          <ModalBody>
            <Input
              label='应用名称'
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              variant='bordered'
              isRequired
            />
          </ModalBody>
          <ModalFooter>
            <Button variant='light' onPress={onRenameModalClose}>
              取消
            </Button>
            <Button
              color='primary'
              onPress={handleRename}
              isLoading={isRenaming}
              isDisabled={!newTitle.trim() || newTitle.trim() === app.title}
            >
              确认
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isCollaboratorModalOpen} onClose={onCollaboratorModalClose} size='lg'>
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>管理协作者</ModalHeader>
          <ModalBody>
            <div className='space-y-6'>
              <div className='space-y-2'>
                <h4 className='text-base font-medium'>添加新协作者</h4>
                <div className='flex gap-2'>
                  <Select
                    label='选择用户'
                    placeholder='请选择要添加的协作者'
                    selectedKeys={selectedAccount ? [selectedAccount] : []}
                    onSelectionChange={(keys) => setSelectedAccount(Array.from(keys)[0] as string)}
                    className='flex-1'
                    isLoading={isLoadingAccounts}
                  >
                    {getAvailableAccounts().map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name || account.id}
                      </SelectItem>
                    ))}
                  </Select>
                  <Button color='primary' onPress={handleAddCollaborator} isDisabled={!selectedAccount}>
                    添加
                  </Button>
                </div>
              </div>

              <div className='space-y-2'>
                <h4 className='text-base font-medium'>当前协作者</h4>
                {app.collaborators && app.collaborators.length > 0 ? (
                  <div className='space-y-2'>
                    {app.collaborators.map((collaborator) => (
                      <div
                        key={collaborator.id}
                        className='flex items-center justify-between p-2 rounded-lg border border-default-200'
                      >
                        <div className='flex items-center gap-2'>
                          <Avatar
                            showFallback
                            name={collaborator.name}
                            className='w-8 h-8'
                            fallback={<Icon icon='mdi:account' className='w-4 h-4' />}
                          />
                          <div>
                            <p className='text-sm font-medium'>{collaborator.name}</p>
                            <p className='text-xs text-default-500'>
                              添加于 {new Date(collaborator.addedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button
                          size='sm'
                          color='danger'
                          variant='light'
                          isIconOnly
                          onPress={() => handleRemoveCollaborator(collaborator.id)}
                        >
                          <Icon icon='mdi:delete' className='w-4 h-4' />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='text-center text-default-500 py-4'>暂无协作者</div>
                )}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant='light' onPress={onCollaboratorModalClose}>
              关闭
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

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
