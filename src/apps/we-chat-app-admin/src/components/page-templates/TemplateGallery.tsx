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
  Chip,
  Tooltip,
} from "@nextui-org/react"
import { motion } from "framer-motion"
import { Icon } from "@iconify/react"
import message from "@/components/Message"

interface Template {
  id: string
  title: string
  description: string
  thumbnail?: string
  tags: string[]
  updatedAt: string
}

interface TemplateGalleryProps {
  onTemplateSelect: (templateId: string) => void
  className?: string
}

const TemplateGallery: React.FC<TemplateGalleryProps> = ({ 
  onTemplateSelect, 
  className 
}) => {
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const { isOpen: isShareOpen, onOpen: onShareOpen, onClose: onShareClose } = useDisclosure()

  // TODO: 替换为实际的 API 调用
  useEffect(() => {
    // 模拟数据
    setTemplates([
      {
        id: "1",
        title: "数据分析仪表盘",
        description: "包含多个数据图表的仪表盘模板",
        tags: ["图表", "数据分析"],
        updatedAt: new Date().toISOString()
      },
      {
        id: "2",
        title: "客户管理页面",
        description: "客户信息管理页面模板",
        tags: ["表格", "表单"],
        updatedAt: new Date().toISOString()
      }
    ])
  }, [])

  const handleDelete = async () => {
    if (!selectedTemplate) return
    
    try {
      // TODO: 实现删除逻辑
      setTemplates(prev => prev.filter(t => t.id !== selectedTemplate.id))
      message.success("模板删除成功")
      onDeleteClose()
    } catch (error) {
      message.error("删除失败")
    }
  }

  const handleShare = async () => {
    if (!selectedTemplate) return
    
    try {
      // TODO: 实现分享逻辑
      message.success("分享链接已复制")
      onShareClose()
    } catch (error) {
      message.error("分享失败")
    }
  }

  return (
    <>
      <motion.div
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
        initial="hidden"
        animate="show"
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 ${className}`}
      >
        {templates.map((template) => (
          <motion.div
            key={template.id}
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 }
            }}
            className="h-full"
          >
            <Card 
              isPressable 
              isHoverable 
              className="w-full h-[300px]"
              onPress={() => onTemplateSelect(template.id)}
            >
              <CardBody className="p-0">
                <div className="w-full h-[160px] flex items-center justify-center bg-default-100">
                  <Icon 
                    icon="solar:layout-left-bold" 
                    className="w-12 h-12 text-default-400" 
                  />
                </div>
                <div className="p-4">
                  <h4 className="text-lg font-semibold mb-1">{template.title}</h4>
                  <p className="text-sm text-default-500 mb-2">
                    {template.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {template.tags.map((tag) => (
                      <Chip key={tag} size="sm" variant="flat">
                        {tag}
                      </Chip>
                    ))}
                  </div>
                </div>
              </CardBody>
              <CardFooter className="gap-2 justify-end">
                <Tooltip content="分享">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => {
                      setSelectedTemplate(template)
                      onShareOpen()
                    }}
                  >
                    <Icon icon="solar:share-bold" className="w-4 h-4" />
                  </Button>
                </Tooltip>
                <Tooltip content="删除" color="danger">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    color="danger"
                    onPress={() => {
                      setSelectedTemplate(template)
                      onDeleteOpen()
                    }}
                  >
                    <Icon icon="solar:trash-bin-trash-bold" className="w-4 h-4" />
                  </Button>
                </Tooltip>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* 删除确认弹窗 */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalContent>
          <ModalHeader>确认删除</ModalHeader>
          <ModalBody>
            确定要删除模板 "{selectedTemplate?.title}" 吗？此操作不可撤销。
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onDeleteClose}>
              取消
            </Button>
            <Button color="danger" onPress={handleDelete}>
              删除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 分享弹窗 */}
      <Modal isOpen={isShareOpen} onClose={onShareClose}>
        <ModalContent>
          <ModalHeader>分享模板</ModalHeader>
          <ModalBody>
            <Input
              readOnly
              value={`https://example.com/template/${selectedTemplate?.id}`}
              endContent={
                <Button size="sm" variant="light" onClick={handleShare}>
                  复制
                </Button>
              }
            />
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={onShareClose}>
              关闭
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default TemplateGallery