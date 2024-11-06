import React, { useEffect, useState } from "react"
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
} from "@nextui-org/react"
import { motion } from "framer-motion"
import { Icon } from "@iconify/react"
import { useNavigate } from "react-router-dom"
import { useMetadata } from "@/components/from-templates/hook/useMetadata"
import message from "@/components/Message"
import DynamicForm from "@/components/common/DynamicForm"
import type { DynamicFormConfig } from "@/components/common/DynamicForm/types"

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
  const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure()
  const [selectedTemplate, setSelectedTemplate] = React.useState<Template | null>(null)
  const [previewConfig, setPreviewConfig] = React.useState<DynamicFormConfig | null>(null)
  const { remove, load, getDetail } = useMetadata("template")
  const [internalTemplates, setInternalTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(false)

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
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

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

  // 处理预览点击
  const handlePreviewClick = async (template: Template, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const detail = await getDetail(template.id)
      if (detail && detail.data.config) {
        setPreviewConfig(detail.data.config)
        onPreviewOpen()
      }
    } catch (error) {
      console.error("加载模板详情失败:", error)
      message.error("加载模板详情失败")
    }
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
            <Card
              isPressable
              isHoverable
              className='w-48 h-[200px] bg-white border border-default-200 hover:border-primary transition-colors duration-150'
              onPress={() => onTemplateSelect(template.id)}
            >
              <CardBody className='p-0'>
                <div className='w-full h-[120px] flex items-center justify-center bg-default-50'>
                  <Icon icon='mdi:file-document-outline' className='w-12 h-12 text-default-400' />
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
                      onClick={(e) => handlePreviewClick(template, e)}
                    >
                      <Icon icon='mdi:eye' className='w-4 h-4' />
                    </Button>
                    <Button
                      isIconOnly
                      size='sm'
                      variant='light'
                      className='text-default-400 hover:text-primary'
                      onClick={(e) => {
                        e.stopPropagation()
                        onTemplateSelect(template.id)
                      }}
                    >
                      <Icon icon='mdi:pencil' className='w-4 h-4' />
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

      {/* 预览 Modal */}
      <Modal size="4xl" isOpen={isPreviewOpen} onClose={onPreviewClose}>
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>模板预览</ModalHeader>
          <ModalBody>
            {previewConfig ? (
              <div className="border rounded-lg p-6">
                <DynamicForm config={previewConfig} />
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Icon icon="mdi:form" className="w-12 h-12 mx-auto mb-4" />
                <p>加载模板内容中...</p>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color='primary' onPress={onPreviewClose}>
              关闭
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default TemplateGallery