import React, { useEffect, useState, useCallback } from "react"
import {
  Card,
  CardBody,
  CardFooter,
  Button,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
} from "@nextui-org/react"
import { motion } from "framer-motion"
import { Icon } from "@iconify/react"
import { useNavigate } from "react-router-dom"
import { useMetadata } from "@/components/from-templates/hook/useMetadata"
import message from "@/components/Message"

interface Template {
  id: string
  title: string
  status: string
  updatedAt: string
}

interface TemplateGalleryProps {
  templates?: Template[] // 改为可选
  onTemplateSelect: (templateId: string) => void
  className?: string
}

const TemplateGallery: React.FC<TemplateGalleryProps> = ({ templates: propTemplates, onTemplateSelect, className }) => {
  const navigate = useNavigate()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isShareOpen, onOpen: onShareOpen, onClose: onShareClose } = useDisclosure()
  const [selectedTemplate, setSelectedTemplate] = React.useState<Template | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [internalTemplates, setInternalTemplates] = useState<Template[]>([])
  const { remove, load } = useMetadata("template")

  // 使用内部状态或 props 的模板列表
  const templates = internalTemplates.length > 0 ? internalTemplates : propTemplates || []

  // 加载模板列表
  const loadTemplates = async () => {
    try {
      setIsLoading(true)
      const result = await load()
      if (result) {
        setInternalTemplates(result)
      }
    } catch (error) {
      console.error("加载模板列表失败:", error)
      message.error("加载模板列表失败")
    } finally {
      setIsLoading(false)
    }
  }

  // 组件挂载时加载数据
  useEffect(() => {
    loadTemplates()
  }, [])

  // 动画配置
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  // 格式化日期

  // 处理删除确认
  const handleDeleteConfirm = async () => {
    if (selectedTemplate) {
      try {
        await remove(selectedTemplate.id)
        message.success("模板删除成功")
        onClose()
        // 重新加载列表
        await loadTemplates()
      } catch (error) {
        console.error("删除模板失败:", error)
        message.error("删除模板失败")
      }
    }
  }

  // 打开删除确认框
  const handleDeleteClick = (template: Template, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedTemplate(template)
    onOpen()
  }

  // 处理分享点击
  const handleShareClick = (template: Template, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedTemplate(template)
    onShareOpen()
  }

  // 处理复制分享链接
  const handleCopyShareLink = async () => {
    if (selectedTemplate) {
      const shareLink = `${window.location.origin}/form-preview/${selectedTemplate.id}`
      try {
        await navigator.clipboard.writeText(shareLink)
        message.success("链接已复制到剪贴板")
        onShareClose()
      } catch (error) {
        console.error("复制链接失败:", error)
        message.error("复制链接失败")
      }
    }
  }

  // 处理 AI 编辑点击 - 修改为导航到编辑页面
  const handleAIEditClick = async (template: Template, e: React.MouseEvent) => {
    e.stopPropagation()
    navigate(`/we-chat-app/admin/documents/edit/${template.id}`)
  }

  return (
    <>
      <motion.div
        variants={container}
        initial='hidden'
        animate='show'
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 ${className}`}
      >
        {templates.map((template) => (
          <motion.div key={template.id} variants={item} className='h-full'>
            <Card isPressable isHoverable className='w-48 h-[200px] ' onPress={() => onTemplateSelect(template.id)}>
              <CardBody className='p-0'>
                <div className='w-full h-[120px] flex items-center justify-center bg-black'>
                  <Icon icon='fluent:form-28-filled' className='w-12 h-12 text-default-400' />
                </div>
              </CardBody>
              <CardFooter className='flex flex-col gap-2 px-4 py-3 bg-white'>
                <div className='flex justify-between items-center w-full'>
                  <h4 className='text-base font-medium text-foreground truncate max-w-[200px]' title={template.title}>
                    {template.title}
                  </h4>
                </div>
                <div className='flex justify-between items-center w-full'>
                  <div className='flex gap-1'>
                    <Button
                      isIconOnly
                      size='sm'
                      variant='light'
                      className='text-default-400 hover:text-primary'
                      onClick={(e) => handleShareClick(template, e)}
                    >
                      <Icon icon='mdi:share' className='w-4 h-4' />
                    </Button>
                    <Button
                      isIconOnly
                      size='sm'
                      variant='light'
                      className='text-default-400 hover:text-primary'
                      onClick={(e) => handleAIEditClick(template, e)}
                    >
                      <Icon icon='hugeicons:ai-chat-02' className='w-4 h-4 text-blue-500' />
                    </Button>
                    <Button
                      isIconOnly
                      size='sm'
                      variant='light'
                      className='text-default-400 hover:text-danger'
                      onClick={(e) => handleDeleteClick(template, e)}
                    >
                      <Icon icon='mdi:delete' className='w-4 h-4' />
                    </Button>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* 删除确认 Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>确认删除</ModalHeader>
          <ModalBody>
            <p>确定要删除模板 "{selectedTemplate?.title}" 吗？此操作不可撤销。</p>
          </ModalBody>
          <ModalFooter>
            <Button color='default' variant='light' onPress={onClose}>
              取消
            </Button>
            <Button color='danger' onPress={handleDeleteConfirm}>
              删除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 分享 Modal */}
      <Modal isOpen={isShareOpen} onClose={onShareClose}>
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>分享模板</ModalHeader>
          <ModalBody>
            <div className='flex flex-col gap-2'>
              <p>复制以下链接分享模板：</p>
              <Input
                readOnly
                value={`${window.location.origin}/form-preview/${selectedTemplate?.id || ""}`}
                endContent={
                  <Button size='sm' variant='light' onClick={handleCopyShareLink}>
                    <Icon icon='mdi:content-copy' className='w-4 h-4' />
                  </Button>
                }
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color='primary' onPress={onShareClose}>
              关闭
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default TemplateGallery
