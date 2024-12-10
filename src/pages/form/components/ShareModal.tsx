import React from "react"
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { QRCode } from "react-qrcode-logo"
import { motion } from "framer-motion"
import message from "@/components/Message"

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  formId: string
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, formId }) => {
  const generateShareLink = () => {
    return `${window.location.origin}/form/${formId}`
  }

  const handleCopyLink = async () => {
    const link = generateShareLink()
    try {
      await navigator.clipboard.writeText(link)
      message.success("链接已复制")
    } catch (err) {
      message.error("复制失败，请手动复制")
      console.error("复制错误:", err)
    }
  }

  const handleDownloadQRCode = () => {
    const canvas = document.querySelector("canvas")
    if (canvas) {
      const url = canvas.toDataURL()
      const a = document.createElement("a")
      a.download = `form-qrcode.png`
      a.href = url
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      message.success("二维码已下载")
    } else {
      message.error("二维码生成失败")
    }
  }

  const link = generateShareLink()

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      classNames={{
        base: "max-w-md",
        header: "border-b",
        body: "py-6",
        footer: "border-t",
        backdrop: "backdrop-blur-sm",
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
        <ModalHeader className='flex flex-col gap-1'>分享二维码</ModalHeader>
        <ModalBody>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className='space-y-4 p-4'
          >
            <div className='flex items-center gap-2 bg-default-50 p-3 rounded-lg'>
              <Input
                type='text'
                value={link}
                readOnly
                className='flex-1'
                classNames={{
                  input: "text-sm",
                  inputWrapper: "bg-transparent",
                }}
              />
              <Button
                color='primary'
                variant='flat'
                onClick={handleCopyLink}
                startContent={<Icon icon='mdi:content-copy' className='w-4 h-4' />}
              >
                复制
              </Button>
            </div>

            <motion.div
              className='flex flex-col items-center gap-4'
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className='relative'>
                <QRCode
                  value={link}
                  size={200}
                  qrStyle='dots'
                  eyeRadius={8}
                  quietZone={10}
                  bgColor='#ffffff'
                  fgColor='#000000'
                />
              </div>
              <Button
                color='primary'
                variant='flat'
                onClick={handleDownloadQRCode}
                startContent={<Icon icon='mdi:download' className='w-4 h-4' />}
              >
                下载二维码
              </Button>
            </motion.div>
          </motion.div>
        </ModalBody>
        <ModalFooter>
          <Button color='danger' variant='light' onPress={onClose}>
            关闭
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ShareModal