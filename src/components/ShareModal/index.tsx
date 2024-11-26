import React from "react"
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import message from "@/components/Message"
import { ShareModalProps } from "./types"

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, title = "分享", description, shareUrl }) => {
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      message.success("链接已复制")
      onClose()
    } catch (error) {
      console.error("复制链接失败:", error)
      message.error("复制链接失败")
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
        <ModalHeader className='flex flex-col gap-1'>{title}</ModalHeader>
        <ModalBody>
          <div className='flex flex-col gap-4'>
            {description && <p className='text-default-600'>{description}</p>}
            <Input
              variant='underlined'
              readOnly
              value={shareUrl}
              endContent={
                <Button size='sm' variant='light' className='min-w-unit-16 h-unit-8' onClick={handleCopyLink}>
                  <Icon icon='mdi:content-copy' className='w-4 h-4' />
                </Button>
              }
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color='primary' onPress={onClose} startContent={<Icon icon='mdi:check' className='w-4 h-4' />}>
            完成
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ShareModal
