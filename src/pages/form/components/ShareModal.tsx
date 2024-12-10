import React, { useState, useEffect } from "react"
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

// 环境检测函数
const checkEnvironment = () => {
  const ua = navigator.userAgent.toLowerCase()
  if (ua.match(/MicroMessenger/i)) {
    return 'wechat'
  }
  return 'browser'
}

// 检查是否支持原生分享
const checkWebShareSupport = () => {
  return navigator.share !== undefined
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, formId }) => {
  const [selectedTab, setSelectedTab] = useState("customer")
  const [environment, setEnvironment] = useState<'wechat' | 'browser'>('browser')
  const [webShareSupported, setWebShareSupported] = useState(false)

  useEffect(() => {
    setEnvironment(checkEnvironment())
    setWebShareSupported(checkWebShareSupport())
  }, [])

  const generateShareLink = (type: "customer" | "colleague") => {
    const baseUrl = `${window.location.origin}/form/${formId}`
    return `${baseUrl}?type=${type}`
  }

  const getShareContent = (type: "customer" | "colleague") => {
    const link = generateShareLink(type)
    return {
      title: `表单分享 - ${type === 'customer' ? '客户版本' : '同事版本'}`,
      text: `请查看这个表单`,
      url: link
    }
  }

  const handleShare = async (type: "customer" | "colleague") => {
    const content = getShareContent(type)
    
    if (environment === 'wechat') {
      try {
        // 检查是否已加载微信JS-SDK
        if (typeof wx !== 'undefined') {
          wx.ready(() => {
            // 分享给朋友
            wx.updateAppMessageShareData({
              title: content.title,
              desc: content.text,
              link: content.url,
              success: () => {
                message.success('已准备好分享')
              },
              fail: (res: any) => {
                message.error('微信分享设置失败')
                console.error('微信分享设置失败:', res)
              }
            })
            
            // 分享到朋友圈
            wx.updateTimelineShareData({
              title: content.title,
              link: content.url,
              success: () => {
                message.success('已准备好分享')
              },
              fail: (res: any) => {
                message.error('微信分享设置失败')
                console.error('微信分享设置失败:', res)
              }
            })
          })
        }
      } catch (error) {
        console.error('微信分享错误:', error)
        message.error('微信分享失败')
      }
    } else if (webShareSupported) {
      try {
        await navigator.share(content)
        message.success('分享成功')
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          message.error('分享失败')
          console.error('分享错误:', error)
        }
      }
    }
  }

  const handleCopyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link)
      message.success("链接已复制")
    } catch (err) {
      message.error("复制失败，请手动复制")
      console.error('复制错误:', err)
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
      message.success('二维码已下载')
    } else {
      message.error('二维码生成失败')
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
        
        {/* 分享按钮 */}
        {(webShareSupported || environment === 'wechat') && (
          <Button
            color="primary"
            variant="solid"
            fullWidth
            className="mb-4"
            onClick={() => handleShare(type)}
            startContent={<Icon icon="mdi:share" className="w-4 h-4" />}
          >
            {environment === 'wechat' ? '分享给微信好友' : '分享'}
          </Button>
        )}

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