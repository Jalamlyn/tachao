import React, { Suspense } from "react"
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
  Tooltip,
} from "@nextui-org/react"
import { motion, AnimatePresence } from "framer-motion"
import { Icon } from "@iconify/react"
import { useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getMetadata, setMetadata, deleteMetadata } from "@/service/apis/api"
import message from "@/components/Message"
import { jsonParse, jsonStringify } from "@/utils"
import ErrorBoundary from "@/components/ErrorBoundary"

interface Template {
  id: string
  title: string
  status: string
  updatedAt: string
}

interface TemplateGalleryProps {
  onTemplateSelect: (templateId: string) => void
  className?: string
}

// 加载状态占位组件
const LoadingPlaceholder = () => (
  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6'>
    {[1, 2, 3, 4].map((key) => (
      <motion.div key={key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <Card className='w-full h-[240px] animate-pulse'>
          <CardBody className='p-0'>
            <div className='h-[160px] bg-default-200 rounded-lg' />
          </CardBody>
          <CardFooter className='flex flex-col gap-3 px-4 py-3'>
            <div className='h-4 w-3/4 bg-default-200 rounded' />
            <div className='h-3 w-1/2 bg-default-200 rounded' />
          </CardFooter>
        </Card>
      </motion.div>
    ))}
  </div>
)

// 空状态组件
const EmptyState = ({ onCreateTemplate }: { onCreateTemplate: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className='flex flex-col items-center justify-center min-h-[400px] p-8'
  >
    <div className='w-48 h-48 mb-8 relative'>
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          rotate: [0, -5, 5, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      >
        <Icon icon='fluent:document-add-48-regular' className='w-full h-full text-primary/30' />
      </motion.div>
    </div>
    <h3 className='text-xl font-medium text-foreground mb-2'>还没有表单模板</h3>
    <p className='text-default-500 mb-8 text-center max-w-md'>
      创建你的第一个表单模板，AI 助手会帮助你快速生成专业的表单
    </p>
    <Button
      color='primary'
      size='lg'
      onClick={onCreateTemplate}
      startContent={<Icon icon='mdi:plus' className='w-5 h-5' />}
    >
      生成表单模板
    </Button>
  </motion.div>
)

// 错误状态组件
const ErrorState = ({ error, onRetry }: { error: Error; onRetry: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className='flex flex-col items-center justify-center min-h-[400px] p-8'
  >
    <Icon icon='mdi:alert-circle' className='w-16 h-16 text-danger mb-4' />
    <h3 className='text-xl font-medium text-danger mb-2'>加载失败</h3>
    <p className='text-default-500 mb-8 text-center max-w-md'>{error.message || "请稍后重试"}</p>
    <Button
      color='primary'
      variant='flat'
      onClick={onRetry}
      startContent={<Icon icon='mdi:refresh' className='w-5 h-5' />}
    >
      重试
    </Button>
  </motion.div>
)

// 主要内容组件
const TemplateContent = ({ onTemplateSelect }: { onTemplateSelect: (templateId: string) => void }) => {
  const navigate = useNavigate()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isShareOpen, onOpen: onShareOpen, onClose: onShareClose } = useDisclosure()
  const [selectedTemplate, setSelectedTemplate] = React.useState<Template | null>(null)
  const queryClient = useQueryClient()

  // 使用 React Query 获取模板列表，启用 suspense 模式
  const { data: templates = [] } = useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      const result = await getMetadata(["template_index"])
      if (result.data?.[0]?.value) {
        return jsonParse(result.data[0].value) as Template[]
      }
      return []
    },
    suspense: true,
  })

  // 使用 React Query 的 mutation 来删除模板
  const deleteMutation = useMutation({
    mutationFn: async (templateId: string) => {
      await deleteMetadata({ name: templateId })
      const currentTemplates = templates.filter((t) => t.id !== templateId)
      await setMetadata("template_index", jsonStringify(currentTemplates))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] })
      onClose()
    },
    onError: (error) => {
      console.error("删除模板失败:", error)
      message.error("删除模板失败")
    },
  })

  const handleDeleteConfirm = async () => {
    if (selectedTemplate) {
      deleteMutation.mutate(selectedTemplate.id)
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

  const handleAIEditClick = async (template: Template, e: React.MouseEvent) => {
    e.stopPropagation()
    navigate(`/we-chat-app/admin/documents/edit/${template.id}`)
  }

  const handleCreateTemplate = () => {
    navigate("/we-chat-app/admin/documents/create")
  }

  const handleCopyShareLink = async () => {
    if (selectedTemplate) {
      const shareLink = `${window.location.origin}/form-preview/${selectedTemplate.id}`
      try {
        await navigator.clipboard.writeText(shareLink)
        onShareClose()
      } catch (error) {
        console.error("复制链接失败:", error)
        message.error("复制链接失败")
      }
    }
  }

  if (templates.length === 0) {
    return <EmptyState onCreateTemplate={handleCreateTemplate} />
  }

  return (
    <>
      <motion.div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6'>
        <AnimatePresence>
          {templates.map((template) => (
            <motion.div
              key={template.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
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
                    <Icon
                      icon='fluent:form-28-filled'
                      className='w-16 h-16 text-primary-400 group-hover:scale-110 transition-transform duration-300'
                    />
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
          footer: "border-t",
        }}
      >
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>
            <div className='flex items-center gap-2 text-danger'>
              <Icon icon='mdi:alert-circle' className='w-6 h-6' />
              <span>确认删除</span>
            </div>
          </ModalHeader>
          <ModalBody>
            <p className='text-default-600'>确定要删除模板 "{selectedTemplate?.title}" 吗？此操作不可撤销。</p>
          </ModalBody>
          <ModalFooter>
            <Button color='default' variant='light' onPress={onClose}>
              取消
            </Button>
            <Button
              color='danger'
              onPress={handleDeleteConfirm}
              isLoading={deleteMutation.isPending}
              startContent={<Icon icon='mdi:delete' className='w-4 h-4' />}
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
          footer: "border-t",
        }}
      >
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>分享模板</ModalHeader>
          <ModalBody>
            <div className='flex flex-col gap-4'>
              <p className='text-default-600'>复制以下链接分享模板：</p>
              <Input
                readOnly
                value={`${window.location.origin}/form-preview/${selectedTemplate?.id || ""}`}
                classNames={{
                  input: "bg-default-50",
                  inputWrapper: "bg-default-50 hover:bg-default-100",
                }}
                endContent={
                  <Button size='sm' variant='light' className='min-w-unit-16 h-unit-8' onClick={handleCopyShareLink}>
                    <Icon icon='mdi:content-copy' className='w-4 h-4' />
                  </Button>
                }
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color='primary' onPress={onShareClose} startContent={<Icon icon='mdi:check' className='w-4 h-4' />}>
              完成
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

const TemplateGallery: React.FC<TemplateGalleryProps> = ({ onTemplateSelect, className }) => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingPlaceholder />}>
        <TemplateContent onTemplateSelect={onTemplateSelect} />
      </Suspense>
    </ErrorBoundary>
  )
}

export default TemplateGallery
