import React from "react"
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Select, SelectItem } from "@nextui-org/react"
import { CreateAppInput } from "../store/useAppStore"

interface CreateAppModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateAppInput) => Promise<void>
  isLoading?: boolean
}

export const CreateAppModal: React.FC<CreateAppModalProps> = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [title, setTitle] = React.useState("")
  const [template, setTemplate] = React.useState<"default" | "dashboard" | "enterprise">("enterprise")

  const handleSubmit = async () => {
    if (!title.trim()) return
    await onSubmit({ title: title.trim(), template })
    setTitle("")
    setTemplate("enterprise")
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      classNames={{
        base: "max-w-md",
        header: "border-b",
        body: "py-6",
        footer: "border-t",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">创建应用</ModalHeader>
        <ModalBody>
          <Input
            label="应用名称"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="请输入应用名称"
            variant="bordered"
            isRequired
          />
          <Select
            label="应用模板"
            value={template}
            onChange={(e) => setTemplate(e.target.value as "default" | "dashboard" | "enterprise")}
            variant="bordered"
            isRequired
          >
            <SelectItem key="enterprise" value="enterprise">企业级应用</SelectItem>
            <SelectItem key="default" value="default">默认模板</SelectItem>
            <SelectItem key="dashboard" value="dashboard">仪表盘模板</SelectItem>
          </Select>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            取消
          </Button>
          <Button color="primary" onPress={handleSubmit} isLoading={isLoading} isDisabled={!title.trim()}>
            创建
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}