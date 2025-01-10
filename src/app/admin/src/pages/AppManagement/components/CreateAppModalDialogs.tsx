import React, { useState } from "react"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { Card, CardBody } from "@nextui-org/react"

export interface SuccessDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  countdown: number
}

export interface DeleteConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  templateName: string
}

export const SuccessDialog: React.FC<SuccessDialogProps> = ({ isOpen, onClose, onConfirm, countdown }) => {
  const [timeLeft, setTimeLeft] = useState(countdown)

  React.useEffect(() => {
    if (!isOpen) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          onConfirm()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen, onConfirm])

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
      motionProps={{
        variants: {
          enter: {
            y: 0,
            opacity: 1,
            transition: {
              duration: 0.3,
              ease: "easeOut",
            },
          },
          exit: {
            y: -20,
            opacity: 0,
            transition: {
              duration: 0.2,
              ease: "easeIn",
            },
          },
        },
      }}
    >
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1'>
          <div className='flex items-center gap-2'>
            <Icon icon='mdi:check-circle' className='w-6 h-6 text-success' />
            <span>应用创建成功！</span>
          </div>
        </ModalHeader>
        <ModalBody>
          <Card className='bg-success-50'>
            <CardBody className='py-3'>
              <p className='text-success text-sm'>您的应用已经创建成功，是否立即开始开发？</p>
            </CardBody>
          </Card>
          <p className='text-sm text-default-500 mt-2'>{timeLeft}秒后将自动跳转到应用开发页面...</p>
        </ModalBody>
        <ModalFooter>
          <Button variant='light' onPress={onClose}>
            稍后查看
          </Button>
          <Button color='primary' onPress={onConfirm} autoFocus>
            立即前往 ({timeLeft})
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({ isOpen, onClose, onConfirm, templateName }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size='sm'>
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1'>确认删除模板</ModalHeader>
        <ModalBody>
          <p>确定要删除模板 "{templateName}" 吗？此操作不可恢复。</p>
        </ModalBody>
        <ModalFooter>
          <Button variant='light' onPress={onClose}>
            取消
          </Button>
          <Button color='danger' onPress={onConfirm}>
            确认删除
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}