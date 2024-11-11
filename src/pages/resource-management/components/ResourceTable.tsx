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
  Chip,
  Tooltip,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { motion, AnimatePresence } from "framer-motion"
import EditModal from "./EditModal"
import message from "@/components/Message"

interface Resource {
  id: string
  name: string
  type: string
  size: string
  updatedAt: string
  status: "active" | "processing" | "error"
  description?: string
}

const mockData: Resource[] = [
  {
    id: "1",
    name: "销售数据.xlsx",
    type: "Excel",
    size: "2.5MB",
    updatedAt: "2024-01-20 10:30",
    status: "active",
    description: "2023年第四季度销售数据",
  },
  {
    id: "2",
    name: "客户信息.xlsx",
    type: "Excel",
    size: "1.8MB",
    updatedAt: "2024-01-19 15:45",
    status: "active",
    description: "客户基础信息表",
  },
  {
    id: "3",
    name: "库存统计.xlsx",
    type: "Excel",
    size: "3.2MB",
    updatedAt: "2024-01-18 09:20",
    status: "processing",
    description: "实时库存统计数据",
  },
]

const ResourceTable: React.FC = () => {
  const [filterValue, setFilterValue] = useState("")
  const [page, setPage] = useState(1)
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure()
  const rowsPerPage = 10

  const filteredItems = mockData.filter((item) =>
    item.name.toLowerCase().includes(filterValue.toLowerCase())
  )

  const pages = Math.ceil(filteredItems.length / rowsPerPage)
  const items = filteredItems.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  const handleDelete = (resource: Resource) => {
    setSelectedResource(resource)
    onDeleteOpen()
  }

  const handleEdit = (resource: Resource) => {
    setSelectedResource(resource)
    onEditOpen()
  }

  const confirmDelete = async () => {
    try {
      // TODO: 实现实际的删除逻辑
      console.log("Deleting resource:", selectedResource)
      message.success("删除成功")
      onDeleteClose()
      setSelectedResource(null)
    } catch (error) {
      console.error("Error deleting resource:", error)
      message.error("删除失败")
    }
  }

  const handleSave = async (updatedResource: Resource) => {
    try {
      // TODO: 实现实际的保存逻辑
      console.log("Saving resource:", updatedResource)
      message.success("保存成功")
      onEditClose()
      // 这里应该更新列表数据
    } catch (error) {
      console.error("Error saving resource:", error)
      message.error("保存失败")
      throw error
    }
  }

  const getStatusColor = (status: Resource["status"]) => {
    switch (status) {
      case "active":
        return "success"
      case "processing":
        return "primary"
      case "error":
        return "danger"
      default:
        return "default"
    }
  }

  const getStatusText = (status: Resource["status"]) => {
    switch (status) {
      case "active":
        return "已上传"
      case "processing":
        return "处理中"
      case "error":
        return "失败"
      default:
        return status
    }
  }

  const renderCell = (item: Resource, columnKey: React.Key) => {
    switch (columnKey) {
      case "name":
        return (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2"
          >
            <Icon 
              icon="mdi:file-excel" 
              className="w-5 h-5 text-success"
              style={{ opacity: 0.8 }}
            />
            <div>
              <p className="font-medium text-small">{item.name}</p>
              {item.description && (
                <p className="text-tiny text-default-400">{item.description}</p>
              )}
            </div>
          </motion.div>
        )
      case "status":
        return (
          <Chip
            color={getStatusColor(item.status)}
            size="sm"
            variant="flat"
            className="capitalize"
          >
            {getStatusText(item.status)}
          </Chip>
        )
      case "actions":
        return (
          <div className="flex gap-2 items-center">
            <Tooltip content="预览">
              <Button 
                isIconOnly 
                size="sm" 
                variant="light"
                className="text-default-600 hover:text-primary transition-colors"
              >
                <Icon icon="mdi:eye" className="w-4 h-4" />
              </Button>
            </Tooltip>
            <Tooltip content="编辑">
              <Button 
                isIconOnly 
                size="sm" 
                variant="light"
                className="text-default-600 hover:text-primary transition-colors"
                onClick={() => handleEdit(item)}
              >
                <Icon icon="mdi:pencil" className="w-4 h-4" />
              </Button>
            </Tooltip>
            <Tooltip content="删除" color="danger">
              <Button 
                isIconOnly 
                size="sm" 
                variant="light" 
                className="text-danger-500 hover:text-danger-600 transition-colors"
                onClick={() => handleDelete(item)}
              >
                <Icon icon="mdi:delete" className="w-4 h-4" />
              </Button>
            </Tooltip>
          </div>
        )
      case "type":
      case "size":
      case "updatedAt":
        return (
          <span className="text-default-600 text-small">
            {item[columnKey as keyof Resource]}
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          isClearable
          className="w-full max-w-xs"
          placeholder="搜索资料..."
          startContent={
            <Icon 
              icon="mdi:search" 
              className="text-default-400 pointer-events-none flex-shrink-0"
            />
          }
          value={filterValue}
          onClear={() => setFilterValue("")}
          onValueChange={setFilterValue}
          variant="bordered"
        />
      </div>

      <div className="border rounded-lg shadow-sm">
        <Table
          aria-label="资料列表"
          bottomContent={
            pages > 0 ? (
              <div className="flex w-full justify-center">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-2 text-default-400 text-small">
                    <span>
                      第 {page} 页，共 {pages} 页
                    </span>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      isDisabled={page === 1}
                      onClick={() => setPage(page - 1)}
                    >
                      <Icon icon="mdi:chevron-left" />
                    </Button>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      isDisabled={page === pages}
                      onClick={() => setPage(page + 1)}
                    >
                      <Icon icon="mdi:chevron-right" />
                    </Button>
                  </div>
                </motion.div>
              </div>
            ) : null
          }
          classNames={{
            wrapper: "min-h-[222px]",
          }}
        >
          <TableHeader>
            <TableColumn key="name" className="text-sm">资料名称</TableColumn>
            <TableColumn key="type" className="text-sm">类型</TableColumn>
            <TableColumn key="size" className="text-sm">大小</TableColumn>
            <TableColumn key="updatedAt" className="text-sm">更新时间</TableColumn>
            <TableColumn key="status" className="text-sm">状态</TableColumn>
            <TableColumn key="actions" className="text-sm text-center">操作</TableColumn>
          </TableHeader>
          <TableBody 
            items={items}
            emptyContent={
              <div className="text-center text-default-400 py-6">
                <Icon icon="mdi:file-search" className="w-8 h-8 mx-auto mb-2" />
                <p>暂无数据</p>
              </div>
            }
          >
            {(item) => (
              <TableRow 
                key={item.id}
                className="hover:bg-default-100 transition-colors cursor-pointer"
              >
                {(columnKey) => (
                  <TableCell>{renderCell(item, columnKey)}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <EditModal
        isOpen={isEditOpen}
        onClose={onEditClose}
        resource={selectedResource}
        onSave={handleSave}
      />

      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">确认删除</ModalHeader>
          <ModalBody>
            <p>
              确定要删除资料 "{selectedResource?.name}" 吗？此操作不可恢复。
            </p>
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="light" onPress={onDeleteClose}>
              取消
            </Button>
            <Button color="danger" onPress={confirmDelete}>
              删除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}

export default ResourceTable