import React from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input
} from '@nextui-org/react'
import { CreateAppInput } from '../store/useAppStore'

interface CreateAppModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateAppInput) => Promise<void>
  isLoading?: boolean
}

export const CreateAppModal: React.FC<CreateAppModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading
}) => {
  const [title, setTitle] = React.useState('')

  const handleSubmit = async () => {
    if (!title.trim()) return
    await onSubmit({ title: title.trim() })
    setTitle('')
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
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            取消
          </Button>
          <Button 
            color="primary" 
            onPress={handleSubmit} 
            isLoading={isLoading}
            isDisabled={!title.trim()}
          >
            创建
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}