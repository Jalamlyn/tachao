import React from "react"
import { Card, CardBody, CardFooter, Button, useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react"
import { motion } from "framer-motion"
import { Icon } from "@iconify/react"
import { useNavigate } from "react-router-dom"

interface Template {
  id: string
  title: string
  status: string
  updatedAt: string
}

interface TemplateGalleryProps {
  templates: Template[]
  onTemplateSelect: (templateId: string) => void
  className?: string
}

const TemplateGallery: React.FC<TemplateGalleryProps> = ({ templates, onTemplateSelect, className }) => {
  const navigate = useNavigate()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedTemplate, setSelectedTemplate] = React.useState<Template | null>(null)

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
  const handleDeleteConfirm = () => {
    // 这里添加删除逻辑
    onClose()
  }

  // 打开删除确认框
  const handleDeleteClick = (template: Template, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedTemplate(template)
    onOpen()
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
                  <span className='text-sm text-default-500 flex items-center gap-1'>
                    <Icon icon={template.status === "active" ? "mdi:check-circle" : "mdi:clock-outline"} className='w-4 h-4' />
                    {template.status === "active" ? "已启用" : "未启用"}
                  </span>
                  <div className='flex gap-1'>
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
                      <Icon icon='mdi:eye' className='w-4 h-4' />
                    </Button>
                    <Button
                      isIconOnly
                      size='sm'
                      variant='light'
                      className='text-default-400 hover:text-primary'
                      onClick={(e) => {
                        e.stopPropagation()
                        // 编辑逻辑
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
          <ModalHeader className="flex flex-col gap-1">确认删除</ModalHeader>
          <ModalBody>
            <p>
              确定要删除模板 "{selectedTemplate?.title}" 吗？此操作不可撤销。
            </p>
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="light" onPress={onClose}>
              取消
            </Button>
            <Button color="danger" onPress={handleDeleteConfirm}>
              删除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default TemplateGallery