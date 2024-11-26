import React, { useState, useEffect } from "react"
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from "@nextui-org/react"
import message from "@/components/Message"
import { RenameModalProps } from "./types"

const RenameModal: React.FC<RenameModalProps> = ({
  isOpen,
  onClose,
  initialName,
  onRename,
  validationRules = {
    required: true,
    minLength: 1,
    maxLength: 50,
  },
}) => {
  const [name, setName] = useState(initialName)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setName(initialName)
      setError(null)
    }
  }, [isOpen, initialName])

  const validateName = (value: string): boolean => {
    if (validationRules.required && !value.trim()) {
      setError("名称不能为空")
      return false
    }

    if (validationRules.minLength && value.length < validationRules.minLength) {
      setError(`名称长度不能小于 ${validationRules.minLength} 个字符`)
      return false
    }

    if (validationRules.maxLength && value.length > validationRules.maxLength) {
      setError(`名称长度不能超过 ${validationRules.maxLength} 个字符`)
      return false
    }

    if (validationRules.pattern && !validationRules.pattern.test(value)) {
      setError("名称格式不正确")
      return false
    }

    setError(null)
    return true
  }

  const handleRename = async () => {
    if (!validateName(name)) {
      return
    }

    setIsLoading(true)
    try {
      await onRename(name)
      onClose()
    } catch (error) {
      console.error("重命名失败:", error)
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
        <ModalHeader className='flex flex-col gap-1'>重命名</ModalHeader>
        <ModalBody>
          <Input
            label='名称'
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='请输入新的名称'
            variant='bordered'
            size='lg'
            isInvalid={!!error}
            errorMessage={error}
            onBlur={() => validateName(name)}
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