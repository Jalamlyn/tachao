import React, { useState } from "react"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Progress,
  Card,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { createModel, createModelProperty } from "@/service/apis/model"
import { createProject } from "@/service/apis/project"
import { createApp } from "@/service/apis/app"
import message from "@/components/Message"
import { localDB } from "@/utils/localDB"

interface EnterpriseInitializerProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const EnterpriseInitializer: React.FC<EnterpriseInitializerProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isInitializing, setIsInitializing] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState("")

  const steps = [
    "创建企业项目",
    "创建管理应用",
    "初始化企业网盘",
    "完成设置"
  ]

  const updateProgress = (step: number, message: string) => {
    setCurrentStep(step)
    setStatus(message)
    setProgress((step / steps.length) * 100)
  }

  const handleInitialize = async () => {
    try {
      setIsInitializing(true)
      
      // 1. 创建默认项目
      updateProgress(0, "正在创建企业项目...")
      const projectResponse = await createProject({
        name: "默认企业项目",
        description: "企业管理平台默认项目",
      })
      
      // 2. 创建默认应用
      updateProgress(1, "正在创建管理应用...")
      const appResponse = await createApp({
        name: "企业管理平台",
        description: "企业管理平台默认应用",
        projectId: projectResponse.id,
      })

      // 保存 appId
      localDB.setAppId(appResponse.id)
      
      // 3. 初始化企业网盘
      updateProgress(2, "正在初始化企业网盘...")
      // 创建模型
      const modelResponse = await createModel({
        namespace: "file",
        name: "activities",
        description: "企业网盘文件管理",
      })

      // 创建files属性
      await createModelProperty({
        modelId: modelResponse.id,
        name: "files",
        type: "file",
        description: "文件列表",
        isRequired: true,
        allowMultipleFiles: true,
      })

      // 4. 完成初始化
      updateProgress(3, "初始化完成!")
      message.success("企业初始化成功")
      
      setTimeout(() => {
        onSuccess()
      }, 1500)
    } catch (error) {
      console.error("Initialize error:", error)
      message.error("初始化失败，请重试")
      setIsInitializing(false)
    }
  }

  return (
    <Modal 
      size="2xl" 
      isOpen={isOpen} 
      onClose={onClose}
      isDismissable={false}
      hideCloseButton
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="text-2xl">企业初始化</h2>
              <p className="text-sm text-default-500">
                首次使用需要进行企业初始化设置
              </p>
            </ModalHeader>
            <ModalBody>
              {!isInitializing ? (
                <Card className="p-6">
                  <div className="flex flex-col items-center text-center gap-4">
                    <Icon 
                      icon="solar:buildings-3-bold-duotone" 
                      className="w-24 h-24 text-primary"
                    />
                    <div>
                      <h3 className="text-xl font-bold mb-2">
                        开始企业初始化
                      </h3>
                      <p className="text-default-500">
                        这将自动完成企业项目创建、应用配置等必要设置，
                        整个过程约需要1分钟时间。
                      </p>
                    </div>
                  </div>
                </Card>
              ) : (
                <div className="py-8 px-4">
                  <Progress
                    size="md"
                    radius="sm"
                    classNames={{
                      base: "max-w-md mx-auto",
                      track: "drop-shadow-md border border-default",
                      indicator: "bg-gradient-to-r from-pink-500 to-yellow-500",
                      label: "tracking-wider font-medium text-default-600",
                      value: "text-foreground/60",
                    }}
                    value={progress}
                    showValueLabel={true}
                  />
                  <div className="text-center mt-4">
                    <h4 className="text-lg font-medium mb-2">
                      {steps[currentStep]}
                    </h4>
                    <p className="text-default-500">{status}</p>
                  </div>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              {!isInitializing ? (
                <Button
                  color="primary"
                  size="lg"
                  className="w-full"
                  onPress={handleInitialize}
                  startContent={
                    <Icon icon="solar:play-circle-bold-duotone" />
                  }
                >
                  开始初始化
                </Button>
              ) : (
                <Button
                  isLoading
                  size="lg"
                  className="w-full"
                  color="primary"
                  spinner={
                    <Icon icon="line-md:loading-twotone-loop" className="w-6 h-6" />
                  }
                >
                  正在初始化...
                </Button>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export default EnterpriseInitializer