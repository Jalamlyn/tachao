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
  Chip,
} from "@nextui-org/react"
import { useNavigate } from "react-router-dom"
import { Icon } from "@iconify/react"
import confetti from "canvas-confetti"
import { appCodeStore } from "@/app/admin/src/pages/AppBuilder/store/appCodeStore"
import { useAppStore } from "../store/useAppStore"
import { getCurrentAccountInfo } from "@/service/apis/user"
import { TemplateSection } from "./components/TemplateSection"
import { SuccessDialog, DeleteConfirmDialog } from "./CreateAppModalDialogs"
import { multiPageTemplate, singlePageTemplate } from "@/app/admin/src/pages/AppBuilder/prompts/nextui/initTemplate"
import { getPlatMetaData, setPlatMetaData } from "@/service/apis/metadata"

interface CreateAppModalProps {
  isOpen: boolean
  onClose: () => void
  isLoading?: boolean
  onSuccess?: () => void
}

export const CreateAppModal: React.FC<CreateAppModalProps> = ({ isOpen, onClose, isLoading, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [title, setTitle] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [newAppId, setNewAppId] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [createMode, setCreateMode] = useState<"scratch" | "template">("scratch")
  const [initTemplateType, setInitTemplateType] = useState<"multi" | "single">("single")
  const [isAdmin, setIsAdmin] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState(null)
  const { isOpen: isDeleteConfirmOpen, onOpen: onDeleteConfirmOpen, onClose: onDeleteConfirmClose } = useDisclosure()
  const navigate = useNavigate()
  const { useApps } = useAppStore()
  const { refetch } = useApps()

  useEffect(() => {
    checkAdminStatus()
  }, [])

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1)
      setTitle("")
      setSelectedTemplate("")
      setCreateMode("scratch")
    }
  }, [isOpen])

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
      const templateCode =
        createMode === "scratch"
          ? initTemplateType === "multi"
            ? multiPageTemplate
            : singlePageTemplate
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

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {[1, 2, 3].map((step) => (
        <div
          key={step}
          className={`flex items-center ${step !== 3 ? "flex-1" : ""}`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === currentStep
                ? "bg-primary text-white"
                : step < currentStep
                ? "bg-success/20 text-success"
                : "bg-default-100 text-default-500"
            }`}
          >
            {step < currentStep ? (
              <Icon icon="mdi:check" className="w-5 h-5" />
            ) : (
              step
            )}
          </div>
          {step !== 3 && (
            <div
              className={`h-0.5 flex-1 mx-2 ${
                step < currentStep ? "bg-success/20" : "bg-default-100"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold">为您的应用起个名字</h3>
              <p className="text-sm text-default-500">
                给您的应用一个简洁明了的名称
              </p>
            </div>
            <Input
              label="应用名称"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="请输入应用名称"
              variant="bordered"
              size="lg"
              isRequired
              startContent={
                <Icon
                  icon="mdi:application-edit-outline"
                  className="w-5 h-5 text-default-400"
                />
              }
            />
          </div>
        )
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold">选择创建方式</h3>
              <p className="text-sm text-default-500">
                您可以从零开始创建，或使用现有模板
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card
                isPressable
                isHoverable
                className={`border-2 duration-200 ${
                  createMode === "scratch" ? "border-primary" : "border-transparent"
                }`}
                onPress={() => {
                  setCreateMode("scratch")
                  setSelectedTemplate("")
                }}
              >
                <CardBody className="p-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-lg ${
                        createMode === "scratch"
                          ? "bg-primary/10"
                          : "bg-default-100"
                      }`}
                    >
                      <Icon
                        icon="mdi:file-outline"
                        className="w-6 h-6 text-primary"
                      />
                    </div>
                    <div>
                      <h4 className="text-base font-semibold">从零开始</h4>
                      <p className="text-sm text-default-500">
                        从零开始构建您的应用
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card
                isPressable
                isHoverable
                className={`border-2 duration-200 ${
                  createMode === "template"
                    ? "border-primary"
                    : "border-transparent"
                }`}
                onPress={() => setCreateMode("template")}
              >
                <CardBody className="p-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-lg ${
                        createMode === "template"
                          ? "bg-primary/10"
                          : "bg-default-100"
                      }`}
                    >
                      <Icon
                        icon="hugeicons:task-add-02"
                        className="w-6 h-6 text-primary"
                      />
                    </div>
                    <div>
                      <h4 className="text-base font-semibold">从模板开始</h4>
                      <p className="text-sm text-default-500">
                        使用预设模板快速创建应用
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        )
      case 3:
        return createMode === "scratch" ? (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold">选择应用类型</h3>
              <p className="text-sm text-default-500">
                选择最适合您需求的应用类型
              </p>
            </div>
            <RadioGroup
              value={initTemplateType}
              onValueChange={(value) => setInitTemplateType(value as "multi" | "single")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Radio
                  value="multi"
                  description="包含路由配置，适合构建完整应用，可集成单页模块"
                  className="max-w-full"
                >
                  多页应用
                </Radio>
                <Radio
                  value="single"
                  description="无路由配置，适合单一功能模块，可被多页应用集成"
                  className="max-w-full"
                >
                  单页模块
                </Radio>
              </div>
            </RadioGroup>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold">选择模板</h3>
              <p className="text-sm text-default-500">
                从预设模板中选择一个开始
              </p>
            </div>
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
        )
      default:
        return null
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return title.trim().length > 0
      case 2:
        return true
      case 3:
        return createMode === "scratch" || (createMode === "template" && selectedTemplate)
      default:
        return false
    }
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size={currentStep === 3 ? "5xl" : "2xl"}
        classNames={{
          header: "border-b",
          body: "py-6",
          footer: "border-t",
        }}
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">创建应用</ModalHeader>
          <ModalBody className="gap-6">
            {renderStepIndicator()}
            {renderStepContent()}
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={() => {
                if (currentStep === 1) {
                  onClose()
                } else {
                  setCurrentStep((prev) => prev - 1)
                }
              }}
            >
              {currentStep === 1 ? "取消" : "上一步"}
            </Button>
            <Button
              color="primary"
              onPress={() => {
                if (currentStep === 3) {
                  handleSubmit()
                } else {
                  setCurrentStep((prev) => prev + 1)
                }
              }}
              isLoading={loading}
              isDisabled={!canProceed()}
            >
              {currentStep === 3 ? "创建" : "下一步"}
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

              await setPlatMetaData({
                name: "plat_template_index",
                value: JSON.stringify(updatedTemplates),
              })

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