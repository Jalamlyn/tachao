import React, { useState } from "react"
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
  RadioGroup,
  Radio,
} from "@nextui-org/react"
import { useNavigate } from "react-router-dom"
import { Icon } from "@iconify/react"
import confetti from "canvas-confetti"
import { message } from "antd"
import { appCodeStore } from "@/app/admin/src/pages/AppBuilder/store/appCodeStore"
import { templates } from "@/app/admin/src/pages/AppBuilder/prompts/templates"

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
  const navigate = useNavigate()

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
      const appId = await appCodeStore.createApp(title.trim(), selectedTemplate)
      setNewAppId(appId)
      setTitle("")
      setSelectedTemplate("")
      onClose()

      triggerConfetti()
      setShowSuccess(true)
    } catch (error) {
      console.error("Error creating app:", error)
      message.error("创建应用失败")
    }
  }

  return (
    <>
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
          <ModalHeader className='flex flex-col gap-1'>创建应用</ModalHeader>
          <ModalBody className="gap-4">
            <Input
              label='应用名称'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='请输入应用名称'
              variant='bordered'
              isRequired
            />
            
            <RadioGroup
              label="选择模板"
              value={selectedTemplate}
              onChange={(value) => setSelectedTemplate(value)}
            >
              <Radio value="">空白模板</Radio>
              {Object.entries(templates).map(([id, template]) => (
                <Radio key={id} value={id}>
                  <div className="flex items-center gap-2">
                    <Icon icon={template.icon} />
                    <div>
                      <div>{template.name}</div>
                      <div className="text-small text-default-500">
                        {template.description}
                      </div>
                    </div>
                  </div>
                </Radio>
              ))}
            </RadioGroup>
          </ModalBody>
          <ModalFooter>
            <Button variant='light' onPress={onClose}>
              取消
            </Button>
            <Button color='primary' onPress={handleSubmit} isLoading={isLoading} isDisabled={!title.trim()}>
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