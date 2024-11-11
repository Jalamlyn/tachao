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

interface Resource {
  id: string
  name: string
  type: string
  size: string
  updatedAt: string
  status: "active" | "processing" | "error"
}

const mockData: Resource[] = [
  {
    id: "1",
    name: "销售数据.xlsx",
    type: "Excel",
    size: "2.5MB",
    updatedAt: "2024-01-20 10:30",
    status: "active",
  },
  // 添加更多模拟数据...
]

const ResourceTable: React.FC = () => {
  const [filterValue, setFilterValue] = useState("")
  const [page, setPage] = useState(1)
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const rowsPerPage = 10

  const filteredItems = mockData.filter((item) =>
    item.name.toLowerCase().includes(filterValue.toLowerCase())
  )

  const pages = Math.ceil(filteredItems.length / rowsPerPage)
  const items = filteredItems.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  const handleDelete = (resource: Resource) => {
    setSelectedResource(resource)
    onOpen()
  }

  const confirmDelete = async () => {
    // TODO: 实现删除逻辑
    onClose()
    setSelectedResource(null)
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
            <span className="font-medium">{item.name}</span>
          </motion.div>
        )
      case "status":
        return (
          <Chip
            color={item.status === "active" ? "success" : item.status === "processing" ? "primary" : "danger"}
            size="sm"
            variant="flat"
            className="capitalize"
          >
            {item.status === "active" ? "已上传" : item.status === "processing" ? "处理中" : "失败"}
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
      default:
        return (
          <span className="text-default-600">
            {item[columnKey as keyof Resource]}
          </span>
        )
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

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">确认删除</ModalHeader>
          <ModalBody>
            <p>
              确定要删除资料 "{selectedResource?.name}" 吗？此操作不可恢复。
            </p>
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="light" onPress={onClose}>
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