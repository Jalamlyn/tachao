import React, { useState } from "react"
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  Tooltip,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Chip,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import message from "@/components/Message"
import { useMetadata } from "@/hooks/useMetadata"
import { format } from "date-fns"
import { useNavigate } from "react-router-dom"
import SimpleDataTable from "@/components/common/simple-data-table/SimpleDataTable"

interface Resource {
  id: string
  type: string
  title: string
  status: string
  updatedAt: string
  indexFields: {
    appId: string
    type: string
    size: number
    fileName: string
  }
  data: any
  versionCode: number
  modifiedBy: string
  createdAt: string
}

interface ResourceTableProps {
  resources: Resource[]
  onRefresh: () => void
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

const formatDate = (dateString: string): string => {
  try {
    return format(new Date(dateString), "yyyy-MM-dd HH:mm:ss")
  } catch {
    return dateString
  }
}

const ResourceTable: React.FC<ResourceTableProps> = ({ resources, onRefresh }) => {
  const navigate = useNavigate()
  const [filterValue, setFilterValue] = useState("")
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure()

  const { remove: deleteResource } = useMetadata<Resource>("resource")

  const filteredItems = resources.filter(
    (item) =>
      item.title.toLowerCase().includes(filterValue.toLowerCase()) ||
      item.indexFields.fileName.toLowerCase().includes(filterValue.toLowerCase())
  )

  const handleDelete = (resource: Resource) => {
    setSelectedResource(resource)
    onDeleteOpen()
  }

  const handleAI = (resource: Resource) => {
    navigate(`/we-chat-app/admin/resources/ai/${resource.id}`)
  }

  const confirmDelete = async () => {
    if (!selectedResource) return

    try {
      await deleteResource(selectedResource.id)
      message.success("删除成功")
      onDeleteClose()
      setSelectedResource(null)
      onRefresh()
    } catch (error) {
      console.error("Error deleting resource:", error)
      message.error("删除失败")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "success"
      case "processing":
        return "warning"
      case "error":
        return "danger"
      default:
        return "default"
    }
  }

  const renderCell = (item: Resource, columnKey: React.Key) => {
    switch (columnKey) {
      case "title":
        return (
          <div className='flex items-center gap-2'>
            <Icon icon='mdi:file-excel' className='w-5 h-5 text-success' style={{ opacity: 0.8 }} />
            <div className='flex flex-col'>
              <span className='font-medium text-small'>{item.title}</span>
              <span className='text-tiny text-default-400'>{item.indexFields.fileName}</span>
            </div>
          </div>
        )
      case "status":
        return (
          <Chip size='sm' variant='flat' color={getStatusColor(item.status)}>
            {item.status}
          </Chip>
        )
      case "size":
        return <span>{formatFileSize(item.indexFields.size)}</span>
      case "date":
        return (
          <div className='flex flex-col'>
            <span className='text-tiny text-default-500'>创建: {formatDate(item.createdAt)}</span>
            <span className='text-tiny text-default-400'>更新: {formatDate(item.updatedAt)}</span>
          </div>
        )
      case "actions":
        return (
          <div className='flex gap-2 items-center justify-end'>
            <Tooltip content='AI 分析'>
              <Button
                isIconOnly
                size='sm'
                variant='light'
                className='text-default-600 hover:text-primary transition-colors'
                onClick={() => handleAI(item)}
              >
                <Icon icon='mdi:robot' className='w-4 h-4' />
              </Button>
            </Tooltip>
            <Tooltip content='删除' color='danger'>
              <Button
                isIconOnly
                size='sm'
                variant='light'
                className='text-danger-500 hover:text-danger-600 transition-colors'
                onClick={() => handleDelete(item)}
              >
                <Icon icon='mdi:delete' className='w-4 h-4' />
              </Button>
            </Tooltip>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center'>
        <Input
          isClearable
          className='w-full max-w-xs'
          placeholder='搜索资料...'
          startContent={<Icon icon='mdi:search' className='text-default-400 pointer-events-none flex-shrink-0' />}
          value={filterValue}
          onClear={() => setFilterValue("")}
          onValueChange={setFilterValue}
          variant='bordered'
        />
      </div>

      <Table
        aria-label='资料列表'
        classNames={{
          wrapper: "min-h-[222px]",
        }}
      >
        <TableHeader>
          <TableColumn key='title' className='text-sm'>
            资料名称
          </TableColumn>
          <TableColumn key='status' className='text-sm'>
            状态
          </TableColumn>
          <TableColumn key='size' className='text-sm'>
            大小
          </TableColumn>
          <TableColumn key='date' className='text-sm'>
            时间
          </TableColumn>
          <TableColumn key='actions' className='text-sm text-center'>
            操作
          </TableColumn>
        </TableHeader>
        <TableBody
          items={filteredItems}
          emptyContent={
            <div className='text-center text-default-400 py-6'>
              <Icon icon='mdi:file-search' className='w-8 h-8 mx-auto mb-2' />
              <p>暂无数据</p>
            </div>
          }
        >
          {(item) => (
            <TableRow key={item.id} className='hover:bg-default-100 transition-colors cursor-pointer'>
              {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* 删除确认对话框 */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>确认删除</ModalHeader>
          <ModalBody>
            <p>确定要删除资料 "{selectedResource?.title}" 吗？此操作不可恢复。</p>
          </ModalBody>
          <ModalFooter>
            <Button color='default' variant='light' onPress={onDeleteClose}>
              取消
            </Button>
            <Button color='danger' onPress={confirmDelete}>
              删除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}

export default ResourceTable