import React, { useCallback } from "react"
import { Icon } from "@iconify/react"
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Divider,
  Card,
  Tooltip,
  Input,
  Chip,
} from "@nextui-org/react"
import { QRCodeSVG } from "qrcode.react"
import message from "@/components/Message"

// 错误提示组件
export const ErrorPrompt = ({ error, onFix }) => {
  // 解析错误信息
  const parseError = (error) => {
    if (error.moduleErrors) {
      return {
        missingModules: error.moduleErrors.missingModules,
        dependentModules: error.moduleErrors.dependentModules,
      }
    }
    return null
  }

  const errorInfo = parseError(error)
  if (!errorInfo) return null

  return (
    <div className='p-4 bg-danger-50 rounded-lg mb-4'>
      <div className='flex items-start gap-3'>
        <Icon icon='mdi:alert-circle' className='w-5 h-5 text-danger mt-0.5' />
        <div className='flex-1'>
          <h4 className='font-medium text-danger'>检测到缺失模块</h4>
          <div className='mt-2 space-y-1 text-sm text-danger-600'>
            <p>缺失模块:</p>
            <ul className='list-disc pl-4'>
              {errorInfo.missingModules.map((module, index) => (
                <li key={index}>
                  <code>{module}</code>
                </li>
              ))}
            </ul>
            <p>依赖这些模块的组件:</p>
            <ul className='list-disc pl-4'>
              {errorInfo.dependentModules.map((module, index) => (
                <li key={index}>
                  <code>{module}</code>
                </li>
              ))}
            </ul>
          </div>
          <Button
            color='primary'
            variant='flat'
            size='sm'
            className='mt-3'
            startContent={<Icon icon='mdi:wrench' className='w-4 h-4' />}
            onClick={() => onFix(errorInfo)}
          >
            修复此问题
          </Button>
        </div>
      </div>
    </div>
  )
}

// 发布模态框组件
export const PublishModal = ({ isOpen, onClose, appId }) => {
  const appUrl = `/app-run/${appId}`
  const fullAppUrl = `${window.location.origin}${appUrl}`

  const handleCopyQRCode = useCallback(async () => {
    try {
      // 获取 SVG 元素
      const svg = document.querySelector("#app-qrcode svg")
      if (!svg) {
        message.error("未找到二维码图片")
        return
      }

      // 创建 canvas
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      // 设置 canvas 尺寸
      const svgSize = 140 // 与 QRCodeSVG 组件的 size 属性保持一致
      canvas.width = svgSize
      canvas.height = svgSize

      // 将 SVG 转换为 blob URL
      const svgData = new XMLSerializer().serializeToString(svg)
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
      const svgUrl = URL.createObjectURL(svgBlob)

      // 创建图片并绘制到 canvas
      const img = new Image()

      // 使用 Promise 包装图片加载过程
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = svgUrl
      })

      // 绘制图片到 canvas
      ctx.drawImage(img, 0, 0, svgSize, svgSize)

      // 将 canvas 转换为 blob
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"))

      // 写入剪贴板
      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": blob,
        }),
      ])

      // 清理 URL
      URL.revokeObjectURL(svgUrl)

      message.success("二维码已复制到剪贴板")
    } catch (error) {
      console.error("复制二维码失败:", error)
      message.error("复制二维码失败，请重试")
    }
  }, [])

  const handleCopyUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(fullAppUrl)
      message.success("应用链接已复制到剪贴板")
    } catch (error) {
      message.error("复制链接失败，请重试")
    }
  }, [fullAppUrl])

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='3xl' className='pb-0'>
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1'>
          <div className='flex items-center gap-3 mb-2'>
            <div className='w-12 h-12 rounded-full bg-success/10 flex items-center justify-center'>
              <Icon icon='mdi:check-circle' className='w-7 h-7 text-success' />
            </div>
            <div>
              <h2 className='text-xl font-semibold'>发布成功</h2>
              <p className='text-default-500 text-sm mt-0.5'>您的应用已成功发布到生产环境</p>
            </div>
          </div>
        </ModalHeader>
        <ModalBody className='space-y-6'>
          {/* 访问应用部分 */}
          <div className='bg-default-50 p-6 rounded-xl space-y-3'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-medium flex items-center gap-2'>
                <Icon icon='mdi:link-variant' className='w-5 h-5 text-primary' />
                访问应用
              </h3>
              <Chip color='success' variant='flat' size='sm'>
                已上线
              </Chip>
            </div>
            <div className='flex items-center gap-2 mt-2'>
              <Input
                value={fullAppUrl}
                readOnly
                className='flex-1'
                size='sm'
                startContent={<Icon icon='mdi:web' className='w-4 h-4 text-default-400' />}
              />
              <Button
                color='primary'
                variant='flat'
                size='sm'
                onClick={handleCopyUrl}
                startContent={<Icon icon='mdi:content-copy' className='w-4 h-4' />}
              >
                复制链接
              </Button>
              <Button
                color='primary'
                variant='solid'
                size='sm'
                onClick={() => window.open(appUrl, "_blank")}
                startContent={<Icon icon='mdi:open-in-new' className='w-4 h-4' />}
              >
                访问应用
              </Button>
            </div>
          </div>

          {/* 分享应用部分 */}
          <div className='flex gap-6'>
            <div className='flex-1 bg-default-50 p-6 rounded-xl'>
              <h3 className='text-lg font-medium flex items-center gap-2 mb-4'>
                <Icon icon='mdi:share-variant' className='w-5 h-5 text-primary' />
                分享应用
              </h3>
              <div className='flex items-start gap-6'>
                <Tooltip content='点击复制二维码到剪贴板'>
                  <Card
                    isPressable
                    onPress={handleCopyQRCode}
                    className='p-3 cursor-pointer hover:opacity-90 transition-all duration-200 shadow-sm hover:shadow-md'
                  >
                    <div id='app-qrcode' className='bg-white p-2 rounded'>
                      <QRCodeSVG value={fullAppUrl} size={140} level='H' includeMargin />
                    </div>
                    <p className='text-center text-small text-default-500 mt-2'>点击复制二维码</p>
                  </Card>
                </Tooltip>
                <div className='flex-1 space-y-4'>
                  <div className='space-y-2'>
                    <h4 className='font-medium'>发布为模板</h4>
                    <p className='text-sm text-default-500'>
                      将您的应用发布为模板，其他用户可以基于您的模板快速创建新应用。
                    </p>
                  </div>
                  <Button
                    color='secondary'
                    variant='flat'
                    startContent={<Icon icon='fluent:book-template-20-filled' className='w-4 h-4' />}
                    onClick={() => {
                      onClose()
                      document.querySelector('[aria-label="发布模板"]')?.click()
                    }}
                  >
                    发布为模板
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter className='border-t border-default-200 bg-default-50'>
          <Button
            color='primary'
            variant='light'
            onPress={onClose}
            startContent={<Icon icon='mdi:check' className='w-4 h-4' />}
          >
            完成
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

// 发布模板模态框组件
export const PublishTemplateModal = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1'>发布模板成功</ModalHeader>
        <ModalBody>
          <p>模板已成功发布到平台！其他用户现在可以使用此模板创建新应用。</p>
        </ModalBody>
        <ModalFooter>
          <Button color='primary' onPress={onClose}>
            关闭
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

// 回滚确认模态框组件
export const RollbackModal = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1'>确认回滚</ModalHeader>
        <ModalBody>
          <p>确定要回滚到最近一次发布的版本吗？此操作将丢失当前未发布的更改。</p>
        </ModalBody>
        <ModalFooter>
          <Button color='default' variant='light' onPress={onClose}>
            取消
          </Button>
          <Button color='warning' onPress={onConfirm}>
            确认回滚
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
