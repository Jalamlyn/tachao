import React, { useState } from "react"
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Button,
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Pagination,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { MetadataDetail } from "@/hooks/useMetadata"
import message from "@/components/Message"

interface FormTypeTableProps {
  forms: MetadataDetail[]
  isLoading?: boolean
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onDelete?: (ids: string[]) => Promise<void>
}

export const FormTypeTable: React.FC<FormTypeTableProps> = ({ forms, page, pageSize, onPageChange, onDelete }) => {
  // 删除确认弹窗
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  // 要删除的表单ID
  const [formToDelete, setFormToDelete] = useState<string>("")
  // 删除loading状态
  const [isDeleting, setIsDeleting] = useState(false)

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "submitted":
        return "success"
      case "draft":
        return "warning"
      case "rejected":
        return "danger"
      default:
        return "default"
    }
  }

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case "submitted":
        return "已提交"
      case "draft":
        return "草稿"
      case "rejected":
        return "已拒绝"
      default:
        return status
    }
  }

  // 处理删除
  const handleDelete = (formId: string) => {
    setFormToDelete(formId)
    setDeleteModalOpen(true)
  }

  // 确认删除
  const confirmDelete = async () => {
    if (!onDelete) return

    try {
      setIsDeleting(true)
      await onDelete([formToDelete])
    } catch (error) {
      console.error("Delete error:", error)
      message.error("删除失败")
    } finally {
      setIsDeleting(false)
      setDeleteModalOpen(false)
      setFormToDelete("")
    }
  }

  return (
    <>
      <Table
        aria-label='表单列表'
      >
        <TableHeader>
          <TableColumn>标题</TableColumn>
          <TableColumn>订单号</TableColumn>
          <TableColumn>状态</TableColumn>
          <TableColumn>时间</TableColumn>
          <TableColumn align='center'>操作</TableColumn>
        </TableHeader>
        <TableBody items={forms}>
          {(form) => (
            <TableRow key={form.id}>
              <TableCell>
                <Tooltip content={`ID: ${form.id}`}>
                  <span>{form.title}</span>
                </Tooltip>
              </TableCell>
              <TableCell>{form.indexFields?.orderNumber}</TableCell>
              <TableCell>
                <Chip color={getStatusColor(form.status)} variant='flat' className='capitalize'>
                  {getStatusText(form.status)}
                </Chip>
              </TableCell>
              <TableCell>
                <div className='flex flex-col'>
                  <span className='text-tiny text-default-500'>创建: {formatDate(form.indexFields?.createdAt)}</span>
                  <span className='text-tiny text-default-400'>更新: {formatDate(form.updatedAt)}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className='flex justify-center gap-2'>
                  <Button
                    size='sm'
                    variant='flat'
                    color='primary'
                    startContent={<Icon icon='mdi:eye' className='w-4 h-4' />}
                    onPress={() => window.open(`/form/${form.id}`, "_blank")}
                  >
                    查看
                  </Button>
                  <Button
                    size='sm'
                    variant='light'
                    color='danger'
                    startContent={<Icon icon='mdi:delete' className='w-4 h-4' />}
                    onPress={() => handleDelete(form.id)}
                  >
                    删除
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {forms.length > 0 && (
        <div className='flex w-full justify-center mt-4'>
          <Pagination
            isCompact
            showControls
            showShadow
            color='primary'
            page={page}
            total={Math.ceil(forms.length / pageSize)}
            onChange={onPageChange}
          />
        </div>
      )}

      {/* 删除确认弹窗 */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setFormToDelete("")
        }}
      >
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>确认删除</ModalHeader>
          <ModalBody>
            <p>确定要删除这个表单吗？此操作不可恢复。</p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant='light'
              onPress={() => {
                setDeleteModalOpen(false)
                setFormToDelete("")
              }}
            >
              取消
            </Button>
            <Button color='danger' onPress={confirmDelete} isLoading={isDeleting}>
              确认删除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}