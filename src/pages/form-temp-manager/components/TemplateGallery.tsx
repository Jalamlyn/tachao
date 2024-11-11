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
  Input,
} from "@nextui-org/react"
import { motion, AnimatePresence } from "framer-motion"
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
  templates?: Template[]
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

  const templates = internalTemplates.length > 0 ? internalTemplates : propTemplates || []

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

  useEffect(() => {
    loadTemplates()
  }, [])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
  }

  const handleDeleteConfirm = async () => {
    if (selectedTemplate) {
      try {
        await remove(selectedTemplate.id)
        message.success("模板删除成功")
        onClose()
        await loadTemplates()
      } catch (error) {
        console.error("删除模板失败:", error)
        message.error("删除模板失败")
      }
    }
  }

  const handleDeleteClick = (template: Template, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedTemplate(template)
    onOpen()
  }

  const handleShareClick = (template: Template, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedTemplate(template)
    onShareOpen()
  }

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
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6 ${className}`}
      >
        <AnimatePresence>
          {templates.map((template) => (
            <motion.div 
              key={template.id} 
              variants={item}
              layout
              className='h-full'
            >
              <Card 
                isPressable 
                isHoverable 
                className='w-full h-[240px] group'
                onPress={() => onTemplateSelect(template.id)}
              >
                <CardBody className='p-0 relative overflow-hidden'>
                  <div className='w-full h-[160px] flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-50 group-hover:scale-105 transition-transform duration-300'>
                    <Icon icon='fluent:form-28-filled' className='w-16 h-16 text-primary-400 group-hover:scale-110 transition-transform duration-300' />
                  </div>
                </CardBody>
                <CardFooter className='flex flex-col gap-3 px-4 py-3 bg-white'>
                  <div className='flex justify-between items-center w-full'>
                    <h4 
                      className='text-lg font-medium text-foreground truncate max-w-[200px] group-hover:text-primary transition-colors duration-300' 
                      title={template.title}
                    >
                      {template.title}
                    </h4>
                  </div>
                  <div className='flex justify-between items-center w-full'>
                    <div className='flex gap-2'>
                      <Button
                        isIconOnly
                        size='sm'
                        variant='light'
                        className='text-default-400 hover:text-primary hover:bg-primary-50 transition-colors duration-300'
                        onClick={(e) => handleShareClick(template, e)}
                      >
                        <Icon icon='mdi:share' className='w-4 h-4' />
                      </Button>
                      <Button
                        isIconOnly
                        size='sm'
                        variant='light'
                        className='text-default-400 hover:text-blue-500 hover:bg-blue-50 transition-colors duration-300'
                        onClick={(e) => handleAIEditClick(template, e)}
                      >
                        <Icon icon='hugeicons:ai-chat-02' className='w-4 h-4' />
                      </Button>
                      <Button
                        isIconOnly
                        size='sm'
                        variant='light'
                        className='text-default-400 hover:text-danger hover:bg-danger-50 transition-colors duration-300'
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
        </AnimatePresence>
      </motion.div>

      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        classNames={{
          base: "max-w-md",
          header: "border-b",
          body: "py-6",
          footer: "border-t"
        }}
      >
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>
            <div className="flex items-center gap-2 text-danger">
              <Icon icon="mdi:alert-circle" className="w-6 h-6" />
              <span>确认删除</span>
            </div>
          </ModalHeader>
          <ModalBody>
            <p className="text-default-600">确定要删除模板 "{selectedTemplate?.title}" 吗？此操作不可撤销。</p>
          </ModalBody>
          <ModalFooter>
            <Button color='default' variant='light' onPress={onClose}>
              取消
            </Button>
            <Button 
              color='danger' 
              onPress={handleDeleteConfirm}
              startContent={<Icon icon="mdi:delete" className="w-4 h-4" />}
            >
              删除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal 
        isOpen={isShareOpen} 
        onClose={onShareClose}
        classNames={{
          base: "max-w-md",
          header: "border-b",
          body: "py-6",
          footer: "border-t"
        }}
      >
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>分享模板</ModalHeader>
          <ModalBody>
            <div className='flex flex-col gap-4'>
              <p className="text-default-600">复制以下链接分享模板：</p>
              <Input
                readOnly
                value={`${window.location.origin}/form-preview/${selectedTemplate?.id || ""}`}
                classNames={{
                  input: "bg-default-50",
                  inputWrapper: "bg-default-50 hover:bg-default-100"
                }}
                endContent={
                  <Button 
                    size='sm' 
                    variant='light'
                    className="min-w-unit-16 h-unit-8"
                    onClick={handleCopyShareLink}
                  >
                    <Icon icon='mdi:content-copy' className='w-4 h-4' />
                  </Button>
                }
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button 
              color='primary' 
              onPress={onShareClose}
              startContent={<Icon icon="mdi:check" className="w-4 h-4" />}
            >
              完成
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default TemplateGallery