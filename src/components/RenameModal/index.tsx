import React, { useState } from "react"
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from "@nextui-org/react"
import message from "@/components/Message"

export interface RenameModalProps {
  /**
   * 控制模态框是否打开
   */
  isOpen: boolean
  /**
   * 关闭模态框的回调
   */
  onClose: () => void
  /**
   * 重命名操作的回调
   */
  onRename: (newName: string) => Promise<void>
  /**
   * 初始名称
   */
  initialName: string
  /**
   * 模态框标题
   */
  title?: string
  /**
   * 模态框描述文本
   */
  description?: string
  /**
   * 输入框标签文本
   */
  inputLabel?: string
  /**
   * 输入框占位符
   */
  inputPlaceholder?: string
  /**
   * 自定义验证规则
   */
  validate?: (value: string) => string | undefined
}

const RenameModal: React.FC<RenameModalProps> = ({
  isOpen,
  onClose,
  onRename,
  initialName,
  title = "重命名",
  description,
  inputLabel = "名称",
  inputPlaceholder = "请输入新的名称",
  validate,
}) => {
  const [name, setName] = useState(initialName)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>()

  const handleRename = async () => {
    if (!name.trim()) {
      setError("请输入名称")
      return
    }

    if (validate) {
      const validationError = validate(name)
      if (validationError) {
        setError(validationError)
        return
      }
    }

    setIsLoading(true)
    try {
      await onRename(name)
      onClose()
    } catch (error) {
      console.error(error)
      message.error("重命名失败")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setName(initialName)
    setError(undefined)
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
        <ModalHeader className='flex flex-col gap-1'>
          {title}
          {description && <p className='text-sm text-default-500'>{description}</p>}
        </ModalHeader>
        <ModalBody>
          <Input
            label={inputLabel}
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setError(undefined)
            }}
            placeholder={inputPlaceholder}
            variant='underlined'
            errorMessage={error}
            isInvalid={!!error}
          />
        </ModalBody>
        <ModalFooter>
          <Button variant='light' onPress={handleClose}>
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