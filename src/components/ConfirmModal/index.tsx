import React from "react"
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { ConfirmModalProps } from "./types"

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  type = "delete",
  isOpen,
  onClose,
  onConfirm,
  title,
  content,
  confirmText,
  cancelText = "取消",
  isLoading = false,
}) => {
  const getTypeConfig = () => {
    switch (type) {
      case "delete":
        return {
          icon: "mdi:alert-circle",
          color: "danger",
          defaultTitle: "确认删除",
          defaultConfirmText: "删除",
        }
      case "cancel":
        return {
          icon: "mdi:close-circle",
          color: "warning",
          defaultTitle: "确认取消",
          defaultConfirmText: "确认",
        }
      case "warning":
        return {
          icon: "mdi:warning",
          color: "warning",
          defaultTitle: "警告",
          defaultConfirmText: "确认",
        }
      default:
        return {
          icon: "mdi:help-circle",
          color: "primary",
          defaultTitle: "确认",
          defaultConfirmText: "确认",
        }
    }
  }

  const config = getTypeConfig()

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
        <ModalHeader className='flex flex-col gap-1'>
          <div className={`flex items-center gap-2 text-${config.color}`}>
            <Icon icon={config.icon} className='w-6 h-6' />
            <span>{title || config.defaultTitle}</span>
          </div>
        </ModalHeader>
        <ModalBody>
          <p className='text-default-600'>{content}</p>
        </ModalBody>
        <ModalFooter>
          <Button color='default' variant='light' onPress={onClose}>
            {cancelText}
          </Button>
          <Button
            color={config.color as any}
            onPress={onConfirm}
            isLoading={isLoading}
            startContent={!isLoading && <Icon icon={config.icon} className='w-4 h-4' />}
          >
            {confirmText || config.defaultConfirmText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ConfirmModal