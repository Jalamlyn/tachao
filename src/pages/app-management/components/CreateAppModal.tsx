import React, { useState } from "react"
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Select, SelectItem } from "@nextui-org/react"
import { useNavigate } from "react-router-dom"
import { CreateAppInput } from "../store/useAppStore"
import message from "@/components/Message"

interface CreateAppModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateAppInput) => Promise<string>
  isLoading?: boolean
}

export const CreateAppModal: React.FC<CreateAppModalProps> = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [title, setTitle] = useState("")
  const [template, setTemplate] = useState<"default" | "dashboard" | "enterprise" | "">("")
  const navigate = useNavigate()

  const handleSubmit = async () => {
    // 添加表单验证
    if (!title.trim()) {
      message.error("请输入应用名称")
      return
    }
    
    if (!template) {
      message.error("请选择应用模板")
      return
    }

    try {
      const newAppId = await onSubmit({ title: title.trim(), template })
      setTitle("")
      setTemplate("")
      onClose()
      
      // 根据模板类型决定跳转逻辑
      if (template === "enterprise") {
        navigate(`/apps/${newAppId}/pages/create`, {
          state: { isHome: true }
        })
      } else if (template === "dashboard") {
        navigate(`/apps/${newAppId}/dashboard`)
      } else {
        navigate(`/apps/${newAppId}`)
      }
    } catch (error) {
      console.error("Error creating app:", error)
      message.error("创建应用失败")
    }
  }

  const handleClose = () => {
    setTitle("")
    setTemplate("")
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
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
            errorMessage={title.trim() ? "" : "应用名称不能为空"}
          />
          <Select
            label="应用模板"
            value={template}
            onChange={(e) => setTemplate(e.target.value as "default" | "dashboard" | "enterprise")}
            variant="bordered"
            isRequired
            errorMessage={template ? "" : "请选择应用模板"}
          >
            <SelectItem key="enterprise" value="enterprise">企业级应用</SelectItem>
            <SelectItem key="default" value="default">默认模板</SelectItem>
            <SelectItem key="dashboard" value="dashboard">仪表盘模板</SelectItem>
          </Select>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={handleClose}>
            取消
          </Button>
          <Button 
            color="primary" 
            onPress={handleSubmit} 
            isLoading={isLoading} 
            isDisabled={!title.trim() || !template || isLoading}
          >
            创建
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}