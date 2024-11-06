import React from "react"
import { Card, CardBody, CardFooter, Image, Button, useDisclosure } from "@nextui-org/react"
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

  // 生成随机背景色
  const getRandomGradient = () => {
    const gradients = [
      "linear-gradient(to right, #4facfe 0%, #00f2fe 100%)",
      "linear-gradient(to right, #43e97b 0%, #38f9d7 100%)",
      "linear-gradient(to right, #fa709a 0%, #fee140 100%)",
      "linear-gradient(to right, #6a11cb 0%, #2575fc 100%)",
      "linear-gradient(to right, #ff0844 0%, #ffb199 100%)",
    ]
    return gradients[Math.floor(Math.random() * gradients.length)]
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <motion.div
      variants={container}
      initial='hidden'
      animate='show'
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4 ${className}`}
    >
      {templates.map((template) => (
        <motion.div key={template.id} variants={item} className='h-full'>
          <Card
            isPressable
            isHoverable
            className='h-full'
            onPress={() => onTemplateSelect(template.id)}
          >
            <CardBody className='p-0'>
              <div
                className='w-full h-48 flex items-center justify-center'
                style={{
                  background: getRandomGradient(),
                }}
              >
                <Icon icon='mdi:file-document-outline' className='w-16 h-16 text-white' />
              </div>
            </CardBody>
            <CardFooter className='flex flex-col items-start gap-2 px-4 py-4'>
              <div className='flex justify-between items-center w-full'>
                <h4 className='text-lg font-semibold text-foreground'>{template.title}</h4>
                <span className='text-xs text-default-400'>{formatDate(template.updatedAt)}</span>
              </div>
              <div className='flex justify-between items-center w-full'>
                <span className='text-sm text-default-500'>
                  状态: {template.status === "active" ? "已启用" : "未启用"}
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
                    <Icon icon='mdi:eye' className='w-5 h-5' />
                  </Button>
                  <Button
                    isIconOnly
                    size='sm'
                    variant='light'
                    className='text-default-400 hover:text-primary'
                    onClick={(e) => {
                      e.stopPropagation()
                      // 复制模板
                    }}
                  >
                    <Icon icon='mdi:content-copy' className='w-5 h-5' />
                  </Button>
                </div>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  )
}

export default TemplateGallery