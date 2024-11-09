import React, { useState } from "react"
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Chip,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useNavigate } from "react-router-dom"
import { MetadataDetail, useMetadata } from "@/components/from-templates/hook/useMetadata"
import message from "@/components/Message"
import { useAsyncButton } from "@/hooks/useAsyncButton"

interface FormListProps {
  forms: MetadataDetail[]
  onDelete?: () => void
}

const FormList: React.FC<FormListProps> = ({ forms, onDelete }) => {
  const navigate = useNavigate()
  const { remove, load } = useMetadata("form")
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [formToDelete, setFormToDelete] = useState<string | null>(null)

  const handleView = (formId: string) => {
    navigate(`/form/${formId}`)
  }

  const { isLoading: isDeleting, handleClick: handleDelete } = useAsyncButton(
    async () => {
      if (formToDelete) {
        const success = await remove(formToDelete)
        if (success) {
          onDelete?.()
          message.success("删除成功")
        } else {
          message.error("删除失败")
        }
        onClose()
        setFormToDelete(null)
      }
    },
    {
      errorMessage: "删除失败",
    }
  )

  const openDeleteModal = (formId: string) => {
    setFormToDelete(formId)
    onOpen()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'submitted':
        return 'success'
      case 'draft':
        return 'warning'
      case 'rejected':
        return 'danger'
      default:
        return 'default'
    }
  }

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'submitted':
        return '已提交'
      case 'draft':
        return '草稿'
      case 'rejected':
        return '已拒绝'
      default:
        return status
    }
  }

  return (
    <>
      <Table aria-label='单据列表' className="min-w-full">
        <TableHeader>
          <TableColumn>标题</TableColumn>
          <TableColumn>订单号</TableColumn>
          <TableColumn>模板</TableColumn>
          <TableColumn>状态</TableColumn>
          <TableColumn>创建时间</TableColumn>
          <TableColumn>更新时间</TableColumn>
          <TableColumn>操作</TableColumn>
        </TableHeader>
        <TableBody>
          {forms.map((form) => (
            <TableRow key={form.id}>
              <TableCell>
                <Tooltip content={`ID: ${form.id}`}>
                  <span>{form.title}</span>
                </Tooltip>
              </TableCell>
              <TableCell>{form.indexFields?.orderNumber}</TableCell>
              <TableCell>
                <Tooltip 
                  content={`模板ID: ${form.template?.id}`}
                  className="capitalize"
                >
                  <div className="flex items-center gap-2">
                    <span>{form.template?.title}</span>
                    <Chip
                      size="sm"
                      variant="flat"
                      className="capitalize"
                    >
                      {form.template?.type}
                    </Chip>
                  </div>
                </Tooltip>
              </TableCell>
              <TableCell>
                <Chip
                  color={getStatusColor(form.status)}
                  variant="flat"
                  className="capitalize"
                >
                  {getStatusText(form.status)}
                </Chip>
              </TableCell>
              <TableCell>
                <Tooltip content={form.indexFields?.createdAt}>
                  <span>{formatDate(form.indexFields?.createdAt)}</span>
                </Tooltip>
              </TableCell>
              <TableCell>
                <Tooltip content={form.updatedAt}>
                  <span>{formatDate(form.updatedAt)}</span>
                </Tooltip>
              </TableCell>
              <TableCell>
                <div className='flex gap-2'>
                  <Tooltip content='查看'>
                    <Button isIconOnly size='sm' variant='light' onClick={() => handleView(form.id)}>
                      <Icon icon='mdi:eye' className='w-4 h-4' />
                    </Button>
                  </Tooltip>
                  <Tooltip content='删除' color='danger'>
                    <Button
                      isIconOnly
                      size='sm'
                      variant='light'
                      color='danger'
                      onClick={() => openDeleteModal(form.id)}
                    >
                      <Icon icon='mdi:delete' className='w-4 h-4' />
                    </Button>
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>确认删除</ModalHeader>
          <ModalBody>确定要删除这个单据吗？此操作不可恢复。</ModalBody>
          <ModalFooter>
            <Button variant='light' onPress={onClose}>
              取消
            </Button>
            <Button color='danger' onPress={handleDelete} isLoading={isDeleting}>
              删除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default FormList