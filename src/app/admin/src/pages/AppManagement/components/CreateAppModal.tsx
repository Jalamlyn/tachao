import React, { useState, useEffect } from "react"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Card,
  CardBody,
  Tabs,
  Tab,
  Divider,
} from "@nextui-org/react"
import { useNavigate } from "react-router-dom"
import { Icon } from "@iconify/react"
import confetti from "canvas-confetti"
import { message } from "antd"
import { appCodeStore } from "@/app/admin/src/pages/AppBuilder/store/appCodeStore"
import { templates } from "@/app/admin/src/pages/AppBuilder/prompts/templates"
import { useAppStore } from "../store/useAppStore"
import { getPlatMetaData } from "@/service/apis/metadata"

interface CreateAppModalProps {
  isOpen: boolean
  onClose: () => void
  isLoading?: boolean
  onSuccess?: () => void
}

interface SuccessDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  countdown: number
}

const SuccessDialog: React.FC<SuccessDialogProps> = ({ isOpen, onClose, onConfirm, countdown }) => {
  const [timeLeft, setTimeLeft] = useState(countdown)

  React.useEffect(() => {
    if (!isOpen) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          onConfirm()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen, onConfirm])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      classNames={{
        base: "max-w-md",
        header: "border-b",
        body: "py-6",
        footer: "border-t",
      }}
      motionProps={{
        variants: {
          enter: {
            y: 0,
            opacity: 1,
            transition: {
              duration: 0.3,
              ease: "easeOut",
            },
          },
          exit: {
            y: -20,
            opacity: 0,
            transition: {
              duration: 0.2,
              ease: "easeIn",
            },
          },
        },
      }}
    >
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1'>
          <div className='flex items-center gap-2'>
            <Icon icon='mdi:check-circle' className='w-6 h-6 text-success' />
            <span>应用创建成功！</span>
          </div>
        </ModalHeader>
        <ModalBody>
          <Card className='bg-success-50'>
            <CardBody className='py-3'>
              <p className='text-success text-sm'>您的应用已经创建成功，是否立即开始开发？</p>
            </CardBody>
          </Card>
          <p className='text-sm text-default-500 mt-2'>{timeLeft}秒后将自动跳转到应用开发页面...</p>
        </ModalBody>
        <ModalFooter>
          <Button variant='light' onPress={onClose}>
            稍后查看
          </Button>
          <Button color='primary' onPress={onConfirm} autoFocus>
            立即前往 ({timeLeft})
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export const CreateAppModal: React.FC<CreateAppModalProps> = ({ isOpen, onClose, isLoading, onSuccess }) => {
  const [title, setTitle] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [newAppId, setNewAppId] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [createMode, setCreateMode] = useState<"scratch" | "template">("scratch")
  const [platformTemplates, setPlatformTemplates] = useState([])
  const navigate = useNavigate()
  const { useApps } = useAppStore()
  const { refetch } = useApps()

  useEffect(() => {
    loadPlatformTemplates()
  }, [])

  const loadPlatformTemplates = async () => {
    try {
      const result = await getPlatMetaData(["plat_template_index"])
      const templates = result.data?.[0]?.values[0]?.value ? JSON.parse(result.data?.[0]?.values[0]?.value) : []
      setPlatformTemplates(templates)
    } catch (error) {
      console.error("Error loading platform templates:", error)
      message.error("加载平台模板失败")
    }
  }

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    })
  }

  const handleNavigate = () => {
    if (onSuccess) {
      onSuccess()
    } else {
      navigate(`/admin/apps/${newAppId}/builder`)
    }
  }

  const handleSubmit = async () => {
    if (!title.trim()) return
    try {
      setLoading(true)
      const appId = await appCodeStore.createApp(title.trim(), selectedTemplate)
      setNewAppId(appId)
      setTitle("")
      setSelectedTemplate("")
      onClose()

      await refetch()

      triggerConfetti()
      setShowSuccess(true)
      setLoading(false)
    } catch (error) {
      console.error("Error creating app:", error)
      message.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const renderCreateOptions = () => (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
      <Card
        isPressable
        isHoverable
        className={`border-2 transition-all duration-200 ${
          createMode === "scratch" ? "border-primary" : "border-transparent"
        }`}
        onPress={() => {
          setCreateMode("scratch")
          setSelectedTemplate("")
        }}
      >
        <CardBody className='p-4'>
          <div className='flex items-center gap-4'>
            <div className={`p-3 rounded-lg ${createMode === "scratch" ? "bg-primary/10" : "bg-default-100"}`}>
              <Icon icon='mdi:file-outline' className='w-6 h-6 text-primary' />
            </div>
            <div>
              <h4 className='text-base font-semibold'>从零开始</h4>
              <p className='text-sm text-default-500'>从零开始构建您的应用</p>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card
        isPressable
        isHoverable
        className={`border-2 transition-all duration-200 ${
          createMode === "template" ? "border-primary" : "border-transparent"
        }`}
        onPress={() => setCreateMode("template")}
      >
        <CardBody className='p-4'>
          <div className='flex items-center gap-4'>
            <div className={`p-3 rounded-lg ${createMode === "template" ? "bg-primary/10" : "bg-default-100"}`}>
              <Icon icon='hugeicons:task-add-02' className='w-6 h-6 text-primary' />
            </div>
            <div>
              <h4 className='text-base font-semibold'>从模板开始</h4>
              <p className='text-sm text-default-500'>使用预设模板快速创建应用</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )

  const renderTemplateSection = (title: string, icon: string, templates: any[], type?: string) => (
    <div className='space-y-4'>
      <div className='flex items-center gap-2'>
        <Icon icon={icon} className='w-5 h-5 text-default-500' />
        <h3 className='text-lg font-semibold'>{title}</h3>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {templates.map((template) => (
          <Card
            key={template.id}
            isPressable
            isHoverable
            className={`border-2 transition-all duration-200 ${
              selectedTemplate === template.id ? "border-primary" : "border-transparent"
            }`}
            onPress={() => setSelectedTemplate(template.id)}
          >
            <CardBody className='p-4'>
              <div className='flex items-center gap-4'>
                <div
                  className={`p-3 rounded-lg ${selectedTemplate === template.id ? "bg-primary/10" : "bg-default-100"}`}
                >
                  <Icon icon={template.icon} className='w-6 h-6 text-primary' />
                </div>
                <div>
                  <h4 className='text-base font-semibold'>{template.name}</h4>
                  <p className='text-sm text-default-500'>{template.description}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderTemplateLibrary = () => {
    const formTemplates = Object.values(templates).filter((template) => template.type === "form")
    const aiTemplates = Object.values(templates).filter((template) => template.type === "ai")

    return (
      <div className='space-y-6'>
        {renderTemplateSection("企业应用", "solar:document-bold-duotone", formTemplates)}
        <Divider />
        {renderTemplateSection("智能应用", "hugeicons:ai-chat-02", aiTemplates)}
        <Divider />
        {renderTemplateSection("平台模板", "solar:cloud-storage-bold-duotone", platformTemplates)}
      </div>
    )
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size='3xl'
        classNames={{
          base: "max-w-3xl",
          header: "border-b",
          body: "py-6",
          footer: "border-t",
        }}
        scrollBehavior='inside'
      >
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>创建应用</ModalHeader>
          <ModalBody className='gap-6'>
            <Input
              label='应用名称'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='请输入应用名称'
              variant='bordered'
              isRequired
            />

            <div className='space-y-6'>
              {renderCreateOptions()}
              {createMode === "template" && (
                <div className='mt-6'>
                  <Divider className='my-6' />
                  {renderTemplateLibrary()}
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant='light' onPress={onClose}>
              取消
            </Button>
            <Button color='primary' onPress={handleSubmit} isLoading={loading} isDisabled={!title.trim()}>
              创建
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <SuccessDialog
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        onConfirm={handleNavigate}
        countdown={5}
      />
    </>
  )
}
