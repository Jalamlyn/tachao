import React, { useEffect, useState } from "react"
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { UserInfo } from "./UserInfo"
import ShareModal from "./ShareModal"
import message from "@/components/Message"
import { useLoginInfo } from "@/hooks/useLoginInfo"
import { checkEnvironment } from "@/utils/environment"

interface FormHeaderProps {
  title?: string
  formId: string
}

export const FormHeader: React.FC<FormHeaderProps> = ({ title = "表单详情", formId }) => {
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false)
  const [webShareSupported, setWebShareSupported] = React.useState(false)
  const [shareContent, setShareContent] = useState({ title, description: "请查看这个表单" })
  const { loginInfo } = useLoginInfo()
  const isWechat = checkEnvironment() === 'wechat'

  useEffect(() => {
    setWebShareSupported(navigator.share !== undefined)
  }, [])

  useEffect(() => {
    // 更新 meta 标签
    const metaTitle = document.querySelector('meta[property="og:title"]')
    if (metaTitle) {
      metaTitle.setAttribute('content', shareContent.title)
    }
  }, [shareContent.title])

  const generateShareLink = () => {
    return `${window.location.origin}/form/${formId}`
  }

  const getShareContent = () => {
    return {
      title: shareContent.title,
      text: shareContent.description,
      url: generateShareLink(),
    }
  }

  const handleNativeShare = async () => {
    const content = getShareContent()
    try {
      await navigator.share(content)
      message.success("分享成功")
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        message.error("分享失败")
        console.error("分享错误:", error)
      }
    }
  }

  const handleQuickCopy = async () => {
    const link = generateShareLink()
    try {
      await navigator.clipboard.writeText(link)
      message.success("已复制链接")
    } catch (err) {
      message.error("复制失败，请手动复制")
      console.error('复制错误:', err)
    }
  }

  const handleWechatShare = () => {
    if (typeof wx !== 'undefined') {
      const link = generateShareLink()
      wx.ready(() => {
        wx.updateAppMessageShareData({
          title: shareContent.title,
          desc: shareContent.description,
          link,
          success: () => {
            message.success('已准备好分享')
          },
          fail: (res: any) => {
            message.error('微信分享设置失败')
            console.error('微信分享设置失败:', res)
          }
        })
      })
    } else {
      message.error('微信环境未就绪')
    }
  }

  const handleShareContentChange = (content: { title: string; description: string }) => {
    setShareContent(content)
  }

  return (
    <>
      <header className='fixed top-0 left-0 right-0 h-12 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50'>
        <div className='max-w-[1200px] mx-auto px-4 h-full flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <h1 className='text-sm font-medium truncate max-w-[200px] md:max-w-[400px]'>
              {title}
            </h1>
          </div>

          <div className='flex items-center gap-2'>
            {loginInfo.type !== "none" && <UserInfo userInfo={loginInfo.userInfo!} type={loginInfo.type} />}
            <Dropdown>
              <DropdownTrigger>
                <Button
                  isIconOnly
                  variant='light'
                  size='sm'
                  className='w-8 h-8 min-w-0 hover:bg-gray-100 transition-colors'
                  aria-label='分享表单'
                >
                  <Icon icon='mdi:share' className='w-4 h-4' />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="分享选项">
                {webShareSupported && (
                  <DropdownItem
                    key="share"
                    startContent={<Icon icon="mdi:share" className="w-4 h-4" />}
                    description="使用系统分享"
                    onClick={handleNativeShare}
                  >
                    分享表单
                  </DropdownItem>
                )}
                <DropdownItem 
                  key="copy"
                  startContent={<Icon icon="mdi:content-copy" className="w-4 h-4" />}
                  description="复制表单链接"
                  onClick={handleQuickCopy}
                >
                  复制链接
                </DropdownItem>
                {isWechat && (
                  <DropdownItem
                    key="wechat-share"
                    startContent={<Icon icon="mdi:wechat" className="w-4 h-4" />}
                    onClick={handleWechatShare}
                  >
                    分享给微信好友
                  </DropdownItem>
                )}
                <DropdownItem
                  key="more-options"
                  startContent={<Icon icon="mdi:qrcode" className="w-4 h-4" />}
                  onClick={() => setIsShareModalOpen(true)}
                >
                  生成二维码
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </header>

      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        formId={formId}
        title={title}
        onShareContentChange={handleShareContentChange}
      />
    </>
  )
}