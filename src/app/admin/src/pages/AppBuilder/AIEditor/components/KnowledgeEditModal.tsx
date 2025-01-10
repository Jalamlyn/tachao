import React, { useEffect, useState } from "react"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Textarea,
  Input,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import message from "@/components/Message"
import { knowledgeStore } from "./KnowledgeStore"

interface KnowledgeEditModalProps {
  isOpen: boolean
  onClose: () => void
  editingItem?: {
    id: string
    title: string
    content: string
  } | null
}

export const KnowledgeEditModal: React.FC<KnowledgeEditModalProps> = ({ isOpen, onClose, editingItem }) => {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")

  useEffect(() => {
    if (editingItem) {
      setTitle(editingItem.title)
      setContent(editingItem.content)
    } else {
      setTitle("")
      setContent("")
    }
  }, [editingItem])

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      message.error("标题和内容不能为空")
      return
    }

    try {
      if (editingItem) {
        knowledgeStore.updateKnowledge(editingItem.id, { title, content })
        message.success("知识更新成功")
      } else {
        knowledgeStore.addKnowledge(null, title, content)
        message.success("知识添加成功")
      }
      handleClose()
    } catch (error) {
      message.error("操作失败：" + (error instanceof Error ? error.message : "未知错误"))
    }
  }

  const handleClose = () => {
    setTitle("")
    setContent("")
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="2xl">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Icon
              icon={editingItem ? "solar:pen-2-linear" : "solar:add-circle-linear"}
              className="w-6 h-6 text-primary"
            />
            <span>{editingItem ? "编辑知识" : "添加知识"}</span>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="标题"
              placeholder="输入标题..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Textarea
              label="知识内容"
              placeholder="输入知识内容..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              minRows={5}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={handleClose}>
            取消
          </Button>
          <Button color="primary" onPress={handleSave}>
            {editingItem ? "保存修改" : "添加知识"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default KnowledgeEditModal