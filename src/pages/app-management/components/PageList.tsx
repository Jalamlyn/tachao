import React, { useState } from "react"
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useNavigate } from "react-router-dom"
import { AppIndex, useAppStore } from "../store/useAppStore"
import { useMetadata } from "@/hooks/useMetadata"
import message from "@/components/Message"

interface PageListProps {
  app: AppIndex
  isOpen?: boolean
  onClose?: () => void
}

export const PageList: React.FC<PageListProps> = ({ app, isOpen, onClose }) => {
  const navigate = useNavigate()
  const { update: updateApp } = useMetadata("app")
  const { remove: removePage } = useMetadata("page")
  const [isDeleting, setIsDeleting] = useState(false)
  const [pageToDelete, setPageToDelete] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  if (!app) return null

  const handleCreatePage = () => {
    navigate(`/apps/${app.id}/pages/create`)
    onClose?.()
  }

  const handleCreateHome = () => {
    navigate(`/we-chat-app/admin/apps/${app.id}/pages/create`, {
      state: { isHome: true },
    })
    onClose?.()
  }

  const handleEditPage = (pageId: string) => {
    window.open(`/we-chat-app/admin/apps/${app.id}/pages/${pageId}/edit`, "_blank")
  }

  const handleSetHome = async (pageId: string) => {
    try {
      await updateApp(app.id, {
        homePageId: pageId,
        pages: app.pages?.map((p) => ({
          ...p,
          isHome: p.id === pageId,
        })),
      })
      message.success("设置首页成功")
    } catch (error) {
      console.error("Error setting home page:", error)
      message.error("设置首页失败")
    }
  }

  const handleDeletePage = async () => {
    if (!pageToDelete) return

    try {
      setIsDeleting(true)

      // 1. 删除页面详情
      await removePage(pageToDelete)

      // 2. 更新应用中的页面索引
      const updatedPages = app.pages?.filter((p) => p.id !== pageToDelete) || []
      const updates: any = { pages: updatedPages }

      // 如果删除的是首页，清除首页ID
      if (pageToDelete === app.homePageId) {
        updates.homePageId = null
      }

      await updateApp(app.id, updates)
      message.success("删除页面成功")
    } catch (error) {
      console.error("Error deleting page:", error)
      message.error("删除页面失败")
    } finally {
      setIsDeleting(false)
      setIsDeleteModalOpen(false)
      setPageToDelete(null)
    }
  }

  const renderEmptyState = () => {
    if (!app.pages || app.pages.length === 0) {
      return (
        <div className='flex flex-col items-center justify-center py-16 bg-default-50 rounded-lg'>
          <div className='p-6 rounded-full bg-primary/10'>
            <Icon icon='mdi:home-plus' className='w-20 h-20 text-primary' />
          </div>
          <h3 className='mt-6 text-2xl font-semibold text-default-900'>开始创建应用首页</h3>
          <p className='mt-3 text-center text-default-600 max-w-md px-4'>
            首页是应用的入口点，您需要先创建一个首页来开始构建您的应用。创建首页后，您可以继续添加更多页面来丰富您的应用。
          </p>
          <div className='mt-8 flex flex-col gap-3'>
            <Button
              color='primary'
              size='lg'
              className='px-8'
              startContent={<Icon icon='mdi:home-plus' className='w-5 h-5' />}
              onPress={handleCreateHome}
            >
              创建首页
            </Button>
            <p className='text-small text-default-500'>创建首页后可以继续添加其他页面</p>
          </div>
        </div>
      )
    }
    return null
  }

  const content = (
    <div className='space-y-4'>
      <div className='flex justify-between items-center'>
        <h2 className='text-xl font-semibold'>页面管理</h2>
        {app.pages && app.pages.length > 0 && (
          <Button
            color='primary'
            startContent={<Icon icon='mdi:plus' className='w-4 h-4' />}
            onPress={handleCreatePage}
          >
            创建页面
          </Button>
        )}
      </div>

      {renderEmptyState()}

      {app.pages && app.pages.length > 0 && (
        <Table aria-label='页面列表' isStriped>
          <TableHeader>
            <TableColumn>页面名称</TableColumn>
            <TableColumn>类型</TableColumn>
            <TableColumn>更新时间</TableColumn>
            <TableColumn align='center'>操作</TableColumn>
          </TableHeader>
          <TableBody>
            {app.pages.map((page) => (
              <TableRow key={page.id}>
                <TableCell>
                  <div className='flex items-center gap-2'>
                    <span>{page.title || "未命名页面"}</span>
                    {page.id === app.homePageId && (
                      <Chip size='sm' color='primary'>
                        首页
                      </Chip>
                    )}
                  </div>
                </TableCell>
                <TableCell>{page.isHome ? "首页" : "普通页面"}</TableCell>
                <TableCell>{new Date(page.updatedAt || app.updatedAt).toLocaleString()}</TableCell>
                <TableCell>
                  <div className='flex justify-center gap-2'>
                    <Button
                      size='sm'
                      variant='flat'
                      color='primary'
                      startContent={<Icon icon='mdi:eye' className='w-4 h-4' />}
                      onPress={() => window.open(`/apps/${app.id}/pages/${page.id}`, "_blank")}
                    >
                      预览
                    </Button>
                    <Button
                      size='sm'
                      variant='flat'
                      color='secondary'
                      startContent={<Icon icon='mdi:code' className='w-4 h-4' />}
                      onPress={() => handleEditPage(page.id)}
                    >
                      编辑
                    </Button>
                    {!page.isHome && page.id !== app.homePageId && (
                      <Button
                        size='sm'
                        variant='flat'
                        startContent={<Icon icon='mdi:home' className='w-4 h-4' />}
                        onPress={() => handleSetHome(page.id)}
                      >
                        设为首页
                      </Button>
                    )}
                    <Button
                      size='sm'
                      variant='flat'
                      color='danger'
                      isDisabled={page.id === app.homePageId}
                      startContent={<Icon icon='mdi:delete' className='w-4 h-4' />}
                      onPress={() => {
                        setPageToDelete(page.id)
                        setIsDeleteModalOpen(true)
                      }}
                    >
                      删除
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setPageToDelete(null)
        }}
      >
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>确认删除</ModalHeader>
          <ModalBody>
            <p>确定要删除这个页面吗？此操作不可恢复。</p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant='light'
              onPress={() => {
                setIsDeleteModalOpen(false)
                setPageToDelete(null)
              }}
            >
              取消
            </Button>
            <Button color='danger' onPress={handleDeletePage} isLoading={isDeleting}>
              确认删除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )

  if (!isOpen) {
    return content
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='3xl' scrollBehavior='inside'>
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1'>开发应用 - {app.title}</ModalHeader>
        <ModalBody>{content}</ModalBody>
      </ModalContent>
    </Modal>
  )
}
