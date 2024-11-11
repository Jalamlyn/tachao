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

// 保留原有的 mockData 和其他代码...

const ResourceTable: React.FC = () => {
  // 保留原有的 state 和函数...
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { 
    isOpen: isEditOpen, 
    onOpen: onEditOpen, 
    onClose: onEditClose 
  } = useDisclosure()

  const handleEdit = (resource: Resource) => {
    setSelectedResource(resource)
    onEditOpen()
  }

  const handleSave = async (updatedResource: Resource) => {
    try {
      // TODO: 实现实际的保存逻辑
      console.log("Saving resource:", updatedResource)
      message.success("保存成功")
      // 这里应该更新列表数据
    } catch (error) {
      console.error("Error saving resource:", error)
      message.error("保存失败")
      throw error
    }
  }

  const renderCell = (item: Resource, columnKey: React.Key) => {
    // 保留原有的 case 语句...
    switch (columnKey) {
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
      // 保留其他 case...
    }
  }

  return (
    <div className="space-y-4">
      {/* 保留原有的表格代码... */}
      
      {/* 添加编辑对话框 */}
      <EditModal
        isOpen={isEditOpen}
        onClose={onEditClose}
        resource={selectedResource}
        onSave={handleSave}
      />

      {/* 保留原有的删除确认对话框... */}
    </div>
  )
}

export default ResourceTable