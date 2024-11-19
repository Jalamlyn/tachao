import React, { useEffect, useState } from "react"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"

interface Resource {
  id: string
  name: string
  type: string
  size: string
  updatedAt: string
  status: "active" | "processing" | "error"
  description?: string
}

interface EditModalProps {
  isOpen: boolean
  onClose: () => void
  resource: Resource | null
  onSave: (resource: Resource) => Promise<void>
}

const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, resource, onSave }) => {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (resource) {
      setName(resource.name)
      setDescription(resource.description || "")
    }
  }, [resource])

  const handleSave = async () => {
    if (!resource) return

    setIsSaving(true)
    try {
      await onSave({
        ...resource,
        name,
        description,
      })
      onClose()
    } catch (error) {
      console.error("Error saving resource:", error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          编辑表格
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="表格名称"
              placeholder="请输入表格名称"
              value={name}
              onChange={(e) => setName(e.target.value)}
              variant="bordered"
              startContent={
                <Icon icon="mdi:file-document-outline" className="text-default-400 pointer-events-none flex-shrink-0" />
              }
            />
            <Textarea
              label="表格描述"
              placeholder="请输入表格描述"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              variant="bordered"
              minRows={3}
            />
            <div className="flex items-center gap-2 text-small text-default-400">
              <Icon icon="mdi:information" />
              <span>上次更新时间: {resource?.updatedAt}</span>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            取消
          </Button>
          <Button 
            color="primary" 
            onPress={handleSave}
            isLoading={isSaving}
            isDisabled={!name.trim()}
          >
            保存
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default EditModal