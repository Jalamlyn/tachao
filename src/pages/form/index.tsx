import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { motion } from "framer-motion"
import { useLoginInfo } from "@/hooks/useLoginInfo"
import { checkEnvironment } from "@/utils/environment"
import { aiLog } from "@/utils/AITraceLogger"
import { useFormState } from "./hooks/useFormState"
import { useAuthFlow } from "./hooks/useAuthFlow"
import { useFormData } from "./hooks/useFormData"
import { FormError } from "./components/FormError"
import { FormLoading } from "./components/FormLoading"
import { UserInfo } from "./components/UserInfo"
import { FormTabs } from "./components/FormTabs"
import ShareModal from "./components/ShareModal"
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import message from "@/components/Message"
import { useAuthCheck } from "@/hooks/useAuthCheck"

const NewForm: React.FC = () => {
  const { formId } = useParams<{ formId: string }>()
  const [formState, formActions] = useFormState()
  const { loadFormData } = useFormData()
  const { loginInfo } = useLoginInfo()
  const [selectedTab, setSelectedTab] = useState("form")
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const isWechat = checkEnvironment() === 'wechat'
  const [webShareSupported, setWebShareSupported] = useState(false)

  // 添加权限检查
  const { isChecking, isAuthorized } = useAuthCheck({
    formId: formId!,
    onSuccess: () => {
      // 授权成功后加载数据
      initializeForm()
    },
    onError: (error) => {
      formActions.setError(error.message)
    }
  })

  useEffect(() => {
    setWebShareSupported(navigator.share !== undefined)
  }, [])

  const initializeForm = async () => {
    if (!formId) {
      formActions.setError("表单ID不能为空")
      return
    }

    formActions.setLoading()

    try {
      const data = await loadFormData(formId)
      formActions.setSuccess(data)
    } catch (error) {
      formActions.setError(error instanceof Error ? error.message : "加载表单数据失败")
    }
  }

  // 显示权限检查loading
  if (isChecking) {
    return <FormLoading />
  }

  if (formState.status === "loading") {
    return <FormLoading />
  }

  if (formState.status === "error") {
    return <FormError error={formState.error!} />
  }

  if (formState.status === "success" && (!formState.formConfig || !formState.formData)) {
    return <FormError error='未找到表单配置或数据' />
  }

  // 其余代码保持不变...
  const generateShareLink = () => {
    return `${window.location.origin}/form/${formId}`
  }

  const getShareContent = () => {
    return {
      title: formState.formConfig?.metadata?.title || "表单",
      text: "请查看这个表单",
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
          title: formState.formConfig?.metadata?.title || "表单",
          desc: "请查看这个表单",
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

  return (
    <>
      {/* 固定顶部的 Header */}
      <header className='fixed top-0 left-0 right-0 h-12 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50'>
        <div className='max-w-[1200px] mx-auto px-4 h-full flex items-center justify-between'>
          {/* 左侧区域 - 表单标题 */}
          <div className='flex items-center gap-2'>
            <h1 className='text-sm font-medium truncate max-w-[200px] md:max-w-[400px]'>
              {formState.formConfig?.metadata?.title || "表单详情"}
            </h1>
          </div>

          {/* 右侧区域 - 操作按钮 */}
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

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className='container mx-auto py-8 px-4'
      >
        <div className='max-w-[1200px] mx-auto relative mt-6'>
          <FormTabs
            selectedTab={selectedTab}
            onTabChange={setSelectedTab}
            formConfig={formState.formConfig}
            formData={formState.formData}
            formId={formId!}
            templateId={formState.templateId}
          />

          <ShareModal 
            isOpen={isShareModalOpen} 
            onClose={() => setIsShareModalOpen(false)} 
            formId={formId!}
            title={formState.formConfig?.metadata?.title}
          />
        </div>
      </motion.div>
    </>
  )
}

export default NewForm