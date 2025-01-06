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
  const [selectedTab, setSelectedTab] = useState("official")
  const [platformTemplates, setPlatformTemplates] = useState([])
  const navigate = useNavigate()
  const { useApps } = useAppStore()
  const { refetch } = useApps()

  useEffect(() => {
    if (selectedTab === "platform") {
      loadPlatformTemplates()
    }
  }, [selectedTab])

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

      // 触发刷新
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

  const getTemplateIcon = (template?: string) => {
    switch (template) {
      case "enterprise":
        return "mdi:building"
      case "dashboard":
        return "mdi:view-dashboard-outline"
      default:
        return "mdi:view-grid-outline"
    }
  }

  const getTemplateColor = (template?: string) => {
    switch (template) {
      case "enterprise":
        return "text-blue-500"
      case "dashboard":
        return "text-secondary"
      default:
        return "text-primary"
    }
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

            <div className='space-y-3'>
              <Tabs
                selectedKey={selectedTab}
                onSelectionChange={(key) => setSelectedTab(key.toString())}
                color='primary'
                variant='underlined'
                classNames={{
                  tabList: "gap-6",
                  cursor: "w-full",
                }}
              >
                <Tab
                  key='official'
                  title={
                    <div className='flex items-center gap-2'>
                      <Icon icon='solar:star-bold' className='w-4 h-4' />
                      <span>官方模板</span>
                    </div>
                  }
                >
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {/* 空白模板卡片 */}
                    <Card
                      isPressable
                      isHoverable
                      className={`border-2 transition-all duration-200 ${selectedTemplate === "" ? "border-primary" : "border-transparent"}`}
                      onPress={() => setSelectedTemplate("")}
                    >
                      <CardBody className='p-4'>
                        <div className='flex items-center gap-4'>
                          <div className='p-3 rounded-lg bg-primary/10'>
                            <Icon icon='mdi:view-grid-outline' className='w-6 h-6 text-primary' />
                          </div>
                          <div>
                            <h4 className='text-base font-semibold'>空白模板</h4>
                            <p className='text-sm text-default-500'>从零开始构建您的应用</p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>

                    {/* 其他模板卡片 */}
                    {Object.entries(templates).map(([id, template]) => (
                      <Card
                        key={id}
                        isPressable
                        isHoverable
                        className={`border-2 transition-all duration-200 ${selectedTemplate === id ? "border-primary" : "border-transparent"}`}
                        onPress={() => setSelectedTemplate(id)}
                      >
                        <CardBody className='p-4'>
                          <div className='flex items-center gap-4'>
                            <div
                              className={`p-3 rounded-lg ${selectedTemplate === id ? "bg-primary/10" : "bg-default-100"}`}
                            >
                              <Icon icon={getTemplateIcon(id)} className={`w-6 h-6 ${getTemplateColor(id)}`} />
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
                </Tab>
                <Tab
                  key='platform'
                  title={
                    <div className='flex items-center gap-2'>
                      <Icon icon='solar:cloud-bold' className='w-4 h-4' />
                      <span>平台模板</span>
                    </div>
                  }
                >
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {platformTemplates.map((template) => (
                      <Card
                        key={template.id}
                        isPressable
                        isHoverable
                        className={`border-2 transition-all duration-200 ${selectedTemplate === template.id ? "border-primary" : "border-transparent"}`}
                        onPress={() => setSelectedTemplate(template.id)}
                      >
                        <CardBody className='p-4'>
                          <div className='flex items-center gap-4'>
                            <div
                              className={`p-3 rounded-lg ${selectedTemplate === template.id ? "bg-primary/10" : "bg-default-100"}`}
                            >
                              <Icon icon='mdi:cloud-outline' className='w-6 h-6 text-primary' />
                            </div>
                            <div>
                              <h4 className='text-base font-semibold'>{template.name}</h4>
                              <p className='text-sm text-default-500'>
                                更新于: {new Date(template.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                </Tab>
              </Tabs>
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
