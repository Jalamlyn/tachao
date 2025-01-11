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
  Divider,
  useDisclosure,
  RadioGroup,
  Radio,
  Progress,
} from "@nextui-org/react"
import { useNavigate } from "react-router-dom"
import { Icon } from "@iconify/react"
import confetti from "canvas-confetti"
import { appCodeStore } from "@/app/admin/src/pages/AppBuilder/store/appCodeStore"
import { useAppStore } from "../store/useAppStore"
import { getCurrentAccountInfo } from "@/service/apis/user"
import message from "@/components/Message"
import { TemplateSection } from "./components/TemplateSection"
import { SuccessDialog, DeleteConfirmDialog } from "./CreateAppModalDialogs"
import { multiPageTemplate, singlePageTemplate } from "@/app/admin/src/pages/AppBuilder/prompts/nextui/initTemplate"

interface CreateAppModalProps {
  isOpen: boolean
  onClose: () => void
  isLoading?: boolean
  onSuccess?: () => void
}

export const CreateAppModal: React.FC<CreateAppModalProps> = ({ isOpen, onClose, isLoading, onSuccess }) => {
  const [title, setTitle] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [newAppId, setNewAppId] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [createMode, setCreateMode] = useState<"scratch" | "template">("scratch")
  const [initTemplateType, setInitTemplateType] = useState<"multi" | "single">("multi")
  const [isAdmin, setIsAdmin] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState(null)
  const [currentStep, setCurrentStep] = useState(1)
  const { isOpen: isDeleteConfirmOpen, onOpen: onDeleteConfirmOpen, onClose: onDeleteConfirmClose } = useDisclosure()
  const navigate = useNavigate()
  const { useApps } = useAppStore()
  const { refetch } = useApps()

  useEffect(() => {
    checkAdminStatus()
  }, [])

  const checkAdminStatus = async () => {
    try {
      const userInfo = await getCurrentAccountInfo()
      setIsAdmin(userInfo.organizationId === "1" && userInfo.account === "admin")
    } catch (error) {
      console.error("Error checking admin status:", error)
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
      const templateCode = createMode === "scratch" 
        ? (initTemplateType === "multi" ? multiPageTemplate : singlePageTemplate)
        : selectedTemplate
      
      const appId = await appCodeStore.createApp(title.trim(), templateCode)
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
      <Card
        isPressable
        isHoverable
        className={`
          border-2 transition-all duration-300 
          hover:shadow-lg hover:-translate-y-1
          ${createMode === "scratch" ? "border-primary bg-primary/5" : "border-transparent"}
        `}
        onPress={() => {
          setCreateMode("scratch")
          setSelectedTemplate("")
        }}
      >
        <CardBody className="p-6">
          <div className="flex items-center gap-4">
            <div className={`
              p-4 rounded-xl transition-all duration-300
              ${createMode === "scratch" 
                ? "bg-primary/10 text-primary" 
                : "bg-default-100 text-default-600"}
            `}>
              <Icon icon="mdi:file-outline" className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-semibold">从零开始</p>
              <p className="text-sm text-default-500">从零开始构建您的应用</p>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card
        isPressable
        isHoverable
        className={`
          border-2 transition-all duration-300
          hover:shadow-lg hover:-translate-y-1
          ${createMode === "template" ? "border-primary bg-primary/5" : "border-transparent"}
        `}
        onPress={() => setCreateMode("template")}
      >
        <CardBody className="p-6">
          <div className="flex items-center gap-4">
            <div className={`
              p-4 rounded-xl transition-all duration-300
              ${createMode === "template" 
                ? "bg-primary/10 text-primary" 
                : "bg-default-100 text-default-600"}
            `}>
              <Icon icon="hugeicons:task-add-02" className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-semibold">从模板开始</p>
              <p className="text-sm text-default-500">使用预设模板快速创建应用</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )

  const renderInitTemplateOptions = () => (
    <div className="mt-6 space-y-6 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">选择初始化模板类型</h3>
        <Progress 
          size="sm" 
          value={50} 
          className="max-w-md"
          color="primary"
        />
      </div>
      
      <RadioGroup
        value={initTemplateType}
        onValueChange={(value) => setInitTemplateType(value as "multi" | "single")}
        className="gap-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Radio
            value="multi"
            className="max-w-full"
          >
            <Card 
              className={`w-full p-4 transition-all duration-300 hover:shadow-md
                ${initTemplateType === "multi" ? "border-primary bg-primary/5" : ""}
              `}
            >
              <CardBody>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Icon icon="mdi:page-layout-header" className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold mb-2">多页应用</p>
                    <p className="text-sm text-default-500">
                      包含路由配置，适合构建完整应用，可集成单页模块
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Radio>
          
          <Radio
            value="single"
            className="max-w-full"
          >
            <Card 
              className={`w-full p-4 transition-all duration-300 hover:shadow-md
                ${initTemplateType === "single" ? "border-primary bg-primary/5" : ""}
              `}
            >
              <CardBody>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Icon icon="mdi:page-layout-body" className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold mb-2">单页模块</p>
                    <p className="text-sm text-default-500">
                      无路由配置，适合单一功能模块，可被多页应用集成
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Radio>
        </div>
      </RadioGroup>
      
      <Card className="bg-default-50">
        <CardBody className="p-4">
          <div className="flex items-start gap-2">
            <Icon icon="mdi:information" className="w-5 h-5 text-primary mt-0.5" />
            <p className="text-sm text-default-600">
              {initTemplateType === "multi" 
                ? "多页应用包含完整的路由配置，适合构建需要多个页面的完整应用。您可以在此基础上集成单页模块，扩展应用功能。"
                : "单页模块专注于单一功能，不包含路由配置。它可以独立运行，也可以被集成到多页应用中，实现功能复用。"
              }
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  )

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size='5xl'
        classNames={{
          base: "bg-background/80 backdrop-blur-sm",
          header: "border-b",
          body: "py-6",
          footer: "border-t",
        }}
        scrollBehavior='inside'
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
            <h2 className="text-xl font-bold">创建应用</h2>
            <p className="text-sm text-default-500">选择合适的方式开始创建您的应用</p>
          </ModalHeader>
          <ModalBody className="gap-6">
            <Input
              label="应用名称"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="请输入应用名称"
              variant="bordered"
              isRequired
              classNames={{
                label: "text-default-700",
                input: "text-default-900",
              }}
              startContent={
                <Icon icon="mdi:application" className="w-5 h-5 text-default-400" />
              }
            />

            <div className="space-y-6">
              {renderCreateOptions()}
              {createMode === "scratch" && renderInitTemplateOptions()}
              {createMode === "template" && (
                <div className="mt-6">
                  <Divider className="my-6" />
                  <TemplateSection
                    selectedTemplate={selectedTemplate}
                    setSelectedTemplate={setSelectedTemplate}
                    isAdmin={isAdmin}
                    onDeleteTemplate={(template) => {
                      setTemplateToDelete(template)
                      onDeleteConfirmOpen()
                    }}
                  />
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button 
              variant="light" 
              onPress={onClose}
              className="hover:bg-default-100"
            >
              取消
            </Button>
            <Button 
              color="primary"
              variant="shadow"
              onPress={handleSubmit}
              isLoading={loading}
              isDisabled={!title.trim()}
              className="font-medium"
            >
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

      <DeleteConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={onDeleteConfirmClose}
        onConfirm={async () => {
          if (templateToDelete) {
            try {
              const currentTemplates = await getPlatMetaData(["plat_template_index"])
              const templates = currentTemplates.data?.[0]?.values[0]?.value
                ? JSON.parse(currentTemplates.data[0].values[0].value)
                : []

              const updatedTemplates = templates.filter((t) => t.id !== templateToDelete.id)

              await setPlatMetaData([
                {
                  key: "plat_template_index",
                  values: [
                    {
                      value: JSON.stringify(updatedTemplates),
                    },
                  ],
                },
              ])

              message.success("模板删除成功")
              onDeleteConfirmClose()
            } catch (error) {
              console.error("Error deleting template:", error)
              message.error("删除模板失败")
            }
          }
        }}
        templateName={templateToDelete?.name}
      />
    </>
  )
}