import React from "react"
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react"

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isLoading: boolean
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ isOpen, onClose, onConfirm, isLoading }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size='sm'
      classNames={{
        base: "bg-white rounded-2xl shadow-2xl mx-3",
        header: "border-b border-gray-200",
        body: "py-4 sm:py-6",
        footer: "border-t border-gray-200",
      }}
    >
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1'>
          <h3 className='text-lg sm:text-xl font-semibold text-gray-800'>确认删除</h3>
        </ModalHeader>
        <ModalBody>
          <p className='text-sm sm:text-base text-gray-600'>您确定要删除这个表单吗？此操作无法撤销。</p>
        </ModalBody>
        <ModalFooter>
          <Button
            size='sm'
            color='default'
            variant='light'
            onClick={onClose}
            className='min-w-[60px] sm:min-w-[80px] text-xs sm:text-sm'
          >
            取消
          </Button>
          <Button
            size='sm'
            color='danger'
            onClick={onConfirm}
            isLoading={isLoading}
            className='min-w-[60px] sm:min-w-[80px] text-xs sm:text-sm'
          >
            确认删除
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default DeleteConfirmModal