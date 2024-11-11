import React, { useState } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Tabs,
  Tab,
  Card,
  CardBody,
  Chip,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { motion } from "framer-motion"
import message from "@/components/Message"
import QRCode from 'qrcode.react'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  templateId: string
  templateTitle: string
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  templateId,
  templateTitle
}) => {
  const [activeTab, setActiveTab] = useState("link")
  
  const shareLink = `${window.location.origin}/template/${templateId}`
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      message.success("链接已复制到剪贴板")
    } catch (error) {
      message.error("复制失败，请手动复制")
    }
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="lg"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold">分享模板</h3>
          <p className="text-sm text-gray-500">
            分享 "{templateTitle}" 模板
          </p>
        </ModalHeader>
        <ModalBody>
          <Tabs 
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as string)}
          >
            <Tab
              key="link"
              title={
                <div className="flex items-center gap-2">
                  <Icon icon="mdi:link" />
                  <span>链接分享</span>
                </div>
              }
            >
              <Card>
                <CardBody className="gap-4">
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={shareLink}
                      label="分享链接"
                      labelPlacement="outside"
                    />
                    <Button
                      color="primary"
                      onClick={handleCopyLink}
                      startContent={<Icon icon="mdi:content-copy" />}
                    >
                      复制
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Chip size="sm" variant="flat">
                      <Icon icon="mdi:clock-outline" className="mr-1" />
                      永久有效
                    </Chip>
                    <Chip size="sm" variant="flat">
                      <Icon icon="mdi:eye-outline" className="mr-1" />
                      公开访问
                    </Chip>
                  </div>
                </CardBody>
              </Card>
            </Tab>
            <Tab
              key="qr"
              title={
                <div className="flex items-center gap-2">
                  <Icon icon="mdi:qrcode" />
                  <span>二维码</span>
                </div>
              }
            >
              <Card>
                <CardBody className="items-center py-8">
                  <QRCode 
                    value={shareLink}
                    size={200}
                    level="H"
                    includeMargin
                  />
                  <p className="mt-4 text-sm text-gray-500">
                    扫描二维码访问模板
                  </p>
                </CardBody>
              </Card>
            </Tab>
          </Tabs>
        </ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            variant="light"
            onPress={onClose}
          >
            完成
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ShareModal