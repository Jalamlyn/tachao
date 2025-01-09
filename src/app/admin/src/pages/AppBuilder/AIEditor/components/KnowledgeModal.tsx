import React, { useState } from "react"
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
import { knowledgeStore } from "./KnowledgeStore"
import message from "@/components/Message"

interface KnowledgeModalProps {
  isOpen: boolean
  onClose: () => void
}

export const KnowledgeModal: React.FC<KnowledgeModalProps> = ({ isOpen, onClose }) => {
  const [knowledgeId, setKnowledgeId] = useState("")
  const [content, setContent] = useState("")

  const handleAddKnowledge = () => {
    if (!knowledgeId.trim() || !content.trim()) {
      message.error("知识ID和内容不能为空")
      return
    }

    knowledgeStore.addKnowledge(knowledgeId.trim(), content.trim())
    message.success("知识添加成功")
    setKnowledgeId("")
    setContent("")
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Icon icon="solar:book-linear" className="w-6 h-6 text-primary" />
            <span>知识管理</span>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="知识ID"
              placeholder="输入知识ID..."
              value={knowledgeId}
              onChange={(e) => setKnowledgeId(e.target.value)}
            />
            <Textarea
              label="知识内容"
              placeholder="输入知识内容..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              minRows={5}
            />
            <div className="space-y-2">
              <div className="font-medium">已添加的知识：</div>
              {Object.entries(knowledgeStore.knowledge).map(([id, content]) => (
                <div key={id} className="p-3 rounded-lg bg-default-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{id}</span>
                    <Button
                      size="sm"
                      color="danger"
                      variant="light"
                      isIconOnly
                      onClick={() => {
                        knowledgeStore.removeKnowledge(id)
                        message.success("知识已删除")
                      }}
                    >
                      <Icon icon="mdi:delete" className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="text-sm whitespace-pre-wrap">{content}</div>
                </div>
              ))}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            关闭
          </Button>
          <Button color="primary" onPress={handleAddKnowledge}>
            添加知识
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default KnowledgeModal