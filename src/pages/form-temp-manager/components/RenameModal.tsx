import React, { useState } from "react"
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from "@nextui-org/react"
import message from "@/components/Message"

interface RenameModalProps {
  isOpen: boolean
  onClose: () => void
  onRename: (newTitle: string) => Promise<void>
  initialTitle: string
}

const RenameModal: React.FC<RenameModalProps> = ({ isOpen, onClose, onRename, initialTitle }) => {
  const [title, setTitle] = useState(initialTitle)
  const [isLoading, setIsLoading] = useState(false)

  const handleRename = async () => {
    if (!title.trim()) {
      message.error("请输入模板名称")
      return
    }

    setIsLoading(true)
    try {
      await onRename(title)
      onClose()
      message.success("重命名成功")
    } catch (error) {
      console.error(error)
      message.error("重命名失败")
    } finally {
      setIsLoading(false)
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
        <ModalHeader className='flex flex-col gap-1'>重命名模板</ModalHeader>
        <ModalBody>
          <Input
            label='模板名称'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='请输入新的模板名称'
            variant='bordered'
            size='lg'
          />
        </ModalBody>
        <ModalFooter>
          <Button variant='light' onPress={onClose}>
            取消
          </Button>
          <Button color='primary' onPress={handleRename} isLoading={isLoading}>
            确认
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default RenameModal