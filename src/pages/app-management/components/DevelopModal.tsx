import React, { useState, useEffect } from "react"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Checkbox,
  Spinner,
  ScrollShadow,
  Card,
  CardBody,
  Image,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useMetadata } from "@/hooks/useMetadata"
import { AppIndex } from "../store/useAppStore"
import message from "@/components/Message"
import wecomqr from "../../../../public/wechat.jpg"

interface DevelopModalProps {
  isOpen: boolean
  onClose: () => void
  app: AppIndex | null
  onSubmit: (templateIds: string[], reportIds: string[], template: "default" | "dashboard") => Promise<void>
  isLoading?: boolean
}

export const DevelopModal: React.FC<DevelopModalProps> = ({ isOpen, onClose, app, onSubmit, isLoading = false }) => {
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([])
  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<"default" | "dashboard">("default")
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false)
  const { items: templates = [], load: loadTemplates } = useMetadata("template")
  const { items: reports = [], load: loadReports } = useMetadata("report")
  const [isLoadingData, setIsLoadingData] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      setIsLoadingData(true)
      try {
        await Promise.all([loadTemplates(), loadReports()])
      } finally {
        setIsLoadingData(false)
      }
    }

    if (isOpen) {
      loadData()
      // 设置初始选中状态
      setSelectedTemplateIds(app?.indexFields?.templateIds || [])
      setSelectedReportIds(app?.indexFields?.reportIds || [])
      setSelectedTemplate(app?.template || "default")
    }
  }, [isOpen, app])

  const handleSubmit = async () => {
    if (!app?.id) {
      message.error("应用ID不能为空")
      return
    }

    try {
      await onSubmit(selectedTemplateIds, selectedReportIds, selectedTemplate)
    } catch (error) {
      console.error("Error submitting app config:", error)
      message.error(error instanceof Error ? error.message : "更新应用配置失败")
    }
  }

  const templateConfigs = [
    {
      type: "default",
      icon: "mdi:view-grid-outline",
      title: "默认模板",
      description: "适用于表单和报表的常规展示",
      color: "primary",
    },
    {
      type: "dashboard",
      icon: "mdi:view-dashboard-outline",
      title: "仪表盘模板",
      description: "适用于数据分析和可视化展示",
      color: "secondary",
    },
  ]

  if (!app) return null

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size='3xl'
        scrollBehavior='inside'
        classNames={{
          header: "border-b",
          body: "py-6",
          footer: "border-t",
        }}
      >
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>配置应用 - {app.title}</ModalHeader>
          <ModalBody>
            {isLoadingData ? (
              <div className='flex items-center justify-center py-8'>
                <Spinner label='加载中...' />
              </div>
            ) : (
              <ScrollShadow>
                <div className='space-y-6'>
                  <div className='space-y-2'>
                    <h3 className='text-lg font-medium'>选择模板类型</h3>
                    <div className='grid grid-cols-3 gap-4 p-2'>
                      {templateConfigs.map((config) => (
                        <Card
                          key={config.type}
                          isPressable
                          isSelected={selectedTemplate === config.type}
                          onPress={() => setSelectedTemplate(config.type as "default" | "dashboard")}
                          className={`border-2 ${
                            selectedTemplate === config.type ? `border-${config.color}` : "border-transparent"
                          }`}
                        >
                          <CardBody className='text-center p-4'>
                            <Icon icon={config.icon} className={`w-12 h-12 mx-auto text-${config.color}`} />
                            <div className='mt-2 font-medium'>{config.title}</div>
                            <div className='text-small text-default-500'>{config.description}</div>
                          </CardBody>
                        </Card>
                      ))}

                      {/* 定制模板卡片 */}
                      <Card
                        isPressable
                        className='border-2 border-dashed border-primary/50 hover:border-primary transition-colors duration-300'
                        onPress={() => setIsCustomModalOpen(true)}
                      >
                        <CardBody className='text-center p-4'>
                          <Icon icon='mdi:palette-outline' className='w-12 h-12 mx-auto text-primary' />
                          <div className='mt-2 font-medium'>定制模板</div>
                          <div className='text-small text-default-500'>根据您的需求定制专属模板</div>
                        </CardBody>
                      </Card>
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <h3 className='text-lg font-medium'>表单模板</h3>
                    <div className='space-y-2'>
                      {templates.map((template) => (
                        <Checkbox
                          key={template.id}
                          isSelected={selectedTemplateIds.includes(template.id)}
                          className='mr-2'
                          onValueChange={(isSelected) => {
                            setSelectedTemplateIds((prev) =>
                              isSelected ? [...prev, template.id] : prev.filter((id) => id !== template.id)
                            )
                          }}
                        >
                          {template.title}
                        </Checkbox>
                      ))}
                      {templates.length === 0 && <p className='text-default-500'>暂无可用的表单模板</p>}
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <h3 className='text-lg font-medium'>数据报表</h3>
                    <div className='space-y-2'>
                      {reports.map((report) => (
                        <Checkbox
                          key={report.id}
                          isSelected={selectedReportIds.includes(report.id)}
                          className='mr-2'
                          onValueChange={(isSelected) => {
                            setSelectedReportIds((prev) =>
                              isSelected ? [...prev, report.id] : prev.filter((id) => id !== report.id)
                            )
                          }}
                        >
                          {report.title}
                        </Checkbox>
                      ))}
                      {reports.length === 0 && <p className='text-default-500'>暂无可用的数据报表</p>}
                    </div>
                  </div>
                </div>
              </ScrollShadow>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant='light' onPress={onClose}>
              取消
            </Button>
            <Button color='primary' onPress={handleSubmit} isLoading={isLoading} isDisabled={isLoadingData}>
              保存配置
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 定制模板服务二维码弹窗 */}
      <Modal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        size='sm'
        classNames={{
          base: "max-w-md",
        }}
      >
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1 text-center'>定制模板服务</ModalHeader>
          <ModalBody>
            <div className='text-center space-y-4'>
              <p className='text-default-600'>扫描下方二维码，联系我们的技术支持团队</p>
              <div className='flex justify-center'>
                <Image src={wecomqr} alt='客服二维码' className='w-48 h-48 object-contain' />
              </div>
              <p className='text-small text-default-500'>我们将为您提供专业的应用模板定制服务,彰显企业品牌</p>
            </div>
          </ModalBody>
          <ModalFooter className='justify-center'>
            <Button color='primary' variant='light' onPress={() => setIsCustomModalOpen(false)}>
              关闭
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
