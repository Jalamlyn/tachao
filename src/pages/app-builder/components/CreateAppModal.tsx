import React, { useState } from "react"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
  Card,
  CardBody,
} from "@nextui-org/react"
import { useNavigate } from "react-router-dom"
import { CreateAppInput } from "../store/useAppStore"
import { Icon } from "@iconify/react"
import confetti from "canvas-confetti"

interface CreateAppModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateAppInput) => Promise<string>
  isLoading?: boolean
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
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Icon icon="mdi:check-circle" className="w-6 h-6 text-success" />
            <span>应用创建成功！</span>
          </div>
        </ModalHeader>
        <ModalBody>
          <Card className="bg-success-50">
            <CardBody className="py-3">
              <p className="text-success text-sm">
                您的应用已经创建成功，是否立即开始开发？
              </p>
            </CardBody>
          </Card>
          <p className="text-sm text-default-500 mt-2">
            {timeLeft}秒后将自动跳转到应用开发页面...
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            稍后查看
          </Button>
          <Button color="primary" onPress={onConfirm} autoFocus>
            立即前往 ({timeLeft})
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export const CreateAppModal: React.FC<CreateAppModalProps> = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [title, setTitle] = useState("")
  const [template, setTemplate] = useState<"default" | "dashboard" | "enterprise">("enterprise")
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
    document.body.classList.add("page-transition")
    navigate(`/we-chat-app/admin/apps/${newAppId}/builder`, {
      state: { isHome: true },
    })
  }

  const handleSubmit = async () => {
    if (!title.trim()) return
    try {
      const appId = await onSubmit({ title: title.trim(), template })
      setNewAppId(appId)
      setTitle("")
      setTemplate("enterprise")
      onClose()
      
      // 触发成功动画
      triggerConfetti()
      
      // 显示成功对话框
      setShowSuccess(true)
    } catch (error) {
      console.error("Error creating app:", error)
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
          <ModalHeader className="flex flex-col gap-1">创建应用</ModalHeader>
          <ModalBody>
            <Input
              label="应用名称"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="请输入应用名称"
              variant="bordered"
              isRequired
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              取消
            </Button>
            <Button color="primary" onPress={handleSubmit} isLoading={isLoading} isDisabled={!title.trim()}>
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

      <style jsx global>{`
        .page-transition {
          opacity: 0;
          transition: opacity 0.3s ease-in-out;
        }
      `}</style>
    </>
  )
}