import React, { useState } from "react"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Tabs,
  Tab,
  Input,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { QRCode } from "react-qrcode-logo"
import message from "@/components/Message"

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  formId: string
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, formId }) => {
  const [selectedTab, setSelectedTab] = useState("customer")

  const generateShareLink = (type: "customer" | "colleague") => {
    const baseUrl = `${window.location.origin}/form/${formId}`
    return `${baseUrl}?type=${type}`
  }

  const handleCopyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link)
      message.success("链接已复制")
    } catch (err) {
      message.error("复制失败，请手动复制")
    }
  }

  const handleDownloadQRCode = () => {
    const canvas = document.querySelector("canvas")
    if (canvas) {
      const url = canvas.toDataURL()
      const a = document.createElement("a")
      a.download = `form-qrcode-${selectedTab}.png`
      a.href = url
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  const renderShareTab = (type: "customer" | "colleague") => {
    const link = generateShareLink(type)
    return (
      <div className="space-y-4 p-4">
        <div className="flex items-center gap-2 bg-default-50 p-3 rounded-lg">
          <Input
            type="text"
            value={link}
            readOnly
            className="flex-1"
            classNames={{
              input: "text-sm",
              inputWrapper: "bg-transparent",
            }}
          />
          <Button
            color="primary"
            variant="flat"
            onClick={() => handleCopyLink(link)}
            startContent={<Icon icon="mdi:content-copy" className="w-4 h-4" />}
          >
            复制
          </Button>
        </div>
        <div className="flex flex-col items-center gap-4">
          <QRCode
            value={link}
            size={200}
            qrStyle="dots"
            eyeRadius={8}
            quietZone={10}
            bgColor="#ffffff"
            fgColor="#000000"
          />
          <Button
            color="primary"
            variant="flat"
            onClick={handleDownloadQRCode}
            startContent={<Icon icon="mdi:download" className="w-4 h-4" />}
          >
            下载二维码
          </Button>
        </div>
      </div>
    )
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
        <ModalHeader className="flex flex-col gap-1">分享表单</ModalHeader>
        <ModalBody>
          <Tabs
            selectedKey={selectedTab}
            onSelectionChange={(key) => setSelectedTab(key.toString())}
            aria-label="分享选项"
            classNames={{
              tabList: "gap-4",
              cursor: "w-full",
              tab: "max-w-fit px-4 h-10",
              tabContent: "group-data-[selected=true]:text-primary",
            }}
          >
            <Tab
              key="customer"
              title={
                <div className="flex items-center gap-2">
                  <Icon icon="mdi:account-group" className="w-4 h-4" />
                  <span>分享给客户</span>
                </div>
              }
            >
              {renderShareTab("customer")}
            </Tab>
            <Tab
              key="colleague"
              title={
                <div className="flex items-center gap-2">
                  <Icon icon="mdi:account-tie" className="w-4 h-4" />
                  <span>分享给同事</span>
                </div>
              }
            >
              {renderShareTab("colleague")}
            </Tab>
          </Tabs>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            关闭
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ShareModal