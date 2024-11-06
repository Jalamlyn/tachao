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
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useNavigate } from "react-router-dom"
import { MetadataDetail, useMetadata } from "@/components/from-templates/hook/useMetadata"
import message from "@/components/Message"

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

  const handleDelete = async () => {
    if (formToDelete) {
      try {
        const success = await remove(formToDelete)
        if (success) {
          onDelete?.()
          message.success("删除成功")
        } else {
          message.error("删除失败")
        }
      } catch (error) {
        console.error("删除失败:", error)
        message.error("删除失败")
      }
      onClose()
      setFormToDelete(null)
    }
  }

  const openDeleteModal = (formId: string) => {
    setFormToDelete(formId)
    onOpen()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <>
      <Table aria-label='单据列表'>
        <TableHeader>
          <TableColumn>标题</TableColumn>
          <TableColumn>状态</TableColumn>
          <TableColumn>更新时间</TableColumn>
          <TableColumn>操作</TableColumn>
        </TableHeader>
        <TableBody>
          {forms.map((form) => (
            <TableRow key={form.id}>
              <TableCell>{form.title}</TableCell>
              <TableCell>{form.status}</TableCell>
              <TableCell>{formatDate(form.updatedAt)}</TableCell>
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
            <Button color='danger' onPress={handleDelete}>
              删除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default FormList
