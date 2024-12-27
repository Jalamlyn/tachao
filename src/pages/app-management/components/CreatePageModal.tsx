import React, { useState } from "react"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
} from "@nextui-org/react"
import { useNavigate } from "react-router-dom"
import { CreateAppInput } from "../store/useAppStore"

interface CreateAppModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateAppInput) => Promise<string> // 修改返回类型为 Promise<string>
  isLoading?: boolean
}

export const CreateAppModal: React.FC<CreateAppModalProps> = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [title, setTitle] = useState("")
  const [template, setTemplate] = useState<"default" | "dashboard" | "enterprise">("enterprise")
  const navigate = useNavigate()

  const handleSubmit = async () => {
    if (!title.trim()) return
    try {
      const newAppId = await onSubmit({ title: title.trim(), template })
      setTitle("")
      setTemplate("enterprise")
      onClose()
      // 根据模板类型决定跳转逻辑
      navigate(`/we-chat-app/admin/apps/${newAppId}/pages/create`, {
        state: { isHome: true },
      })
    } catch (error) {
      console.error("Error creating app:", error)
    }
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
        <ModalHeader className='flex flex-col gap-1'>创建应用</ModalHeader>
        <ModalBody>
          <Input
            label='应用名称'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='请输入应用名称'
            variant='bordered'
            isRequired
          />
        </ModalBody>
        <ModalFooter>
          <Button variant='light' onPress={onClose}>
            取消
          </Button>
          <Button color='primary' onPress={handleSubmit} isLoading={isLoading} isDisabled={!title.trim()}>
            创建
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
