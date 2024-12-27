import React from "react"
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Chip, Modal, ModalContent, ModalHeader, ModalBody } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useNavigate } from "react-router-dom"
import { AppIndex } from "../store/useAppStore"

interface PageListProps {
  app: AppIndex
  isOpen?: boolean
  onClose?: () => void
}

export const PageList: React.FC<PageListProps> = ({ app, isOpen, onClose }) => {
  const navigate = useNavigate()

  const handleCreatePage = () => {
    navigate(`/apps/${app.id}/pages/create`)
    onClose?.()
  }

  const handleEditPage = (pageId: string) => {
    window.open(`/apps/${app.id}/pages/${pageId}/edit`, "_blank")
  }

  const content = (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">页面管理</h2>
        <Button 
          color="primary"
          startContent={<Icon icon="mdi:plus" className="w-4 h-4" />}
          onPress={handleCreatePage}
        >
          创建页面
        </Button>
      </div>

      <Table aria-label="页面列表">
        <TableHeader>
          <TableColumn>页面名称</TableColumn>
          <TableColumn>类型</TableColumn>
          <TableColumn>更新时间</TableColumn>
          <TableColumn align="center">操作</TableColumn>
        </TableHeader>
        <TableBody>
          {app.pages?.map((page) => (
            <TableRow key={page.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span>{page.title || "未命名页面"}</span>
                  {page.id === app.homePageId && (
                    <Chip size="sm" color="primary">首页</Chip>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {page.isHome ? "首页" : "普通页面"}
              </TableCell>
              <TableCell>
                {new Date(page.updatedAt || app.updatedAt).toLocaleString()}
              </TableCell>
              <TableCell>
                <div className="flex justify-center gap-2">
                  <Button
                    size="sm"
                    variant="flat"
                    color="primary"
                    startContent={<Icon icon="mdi:eye" className="w-4 h-4" />}
                    onPress={() => window.open(`/apps/${app.id}/pages/${page.id}`, "_blank")}
                  >
                    预览
                  </Button>
                  <Button
                    size="sm"
                    variant="flat"
                    color="secondary"
                    startContent={<Icon icon="mdi:code" className="w-4 h-4" />}
                    onPress={() => handleEditPage(page.id)}
                  >
                    编辑
                  </Button>
                  {!page.isHome && (
                    <Button
                      size="sm"
                      variant="flat"
                      startContent={<Icon icon="mdi:home" className="w-4 h-4" />}
                      onPress={() => {
                        // TODO: 实现设置首页功能
                      }}
                    >
                      设为首页
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {(!app.pages || app.pages.length === 0) && (
        <div className="flex flex-col items-center justify-center py-8 bg-default-50 rounded-lg">
          <Icon icon="mdi:file-document-plus" className="w-12 h-12 text-default-400" />
          <p className="mt-2 text-default-500">还没有创建任何页面</p>
          <Button 
            color="primary" 
            variant="flat" 
            size="sm"
            className="mt-4"
            startContent={<Icon icon="mdi:plus" className="w-4 h-4" />}
            onPress={handleCreatePage}
          >
            创建页面
          </Button>
        </div>
      )}
    </div>
  )

  if (!isOpen) {
    return content
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          开发应用 - {app.title}
        </ModalHeader>
        <ModalBody>
          {content}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}