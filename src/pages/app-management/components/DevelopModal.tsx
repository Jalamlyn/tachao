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
} from "@nextui-org/react"
import { useMetadata } from "@/hooks/useMetadata"
import { AppIndex } from "../store/useAppStore"
import message from "@/components/Message"

interface DevelopModalProps {
  isOpen: boolean
  onClose: () => void
  app: AppIndex | null
  onSubmit: (templateIds: string[], reportIds: string[]) => Promise<void>
  isLoading?: boolean
}

export const DevelopModal: React.FC<DevelopModalProps> = ({ isOpen, onClose, app, onSubmit, isLoading = false }) => {
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([])
  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([])
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
    }
  }, [isOpen, app])

  const handleSubmit = async () => {
    if (!app?.id) {
      message.error("应用ID不能为空")
      return
    }

    try {
      await onSubmit(selectedTemplateIds, selectedReportIds)
    } catch (error) {
      console.error("Error submitting app config:", error)
      message.error(error instanceof Error ? error.message : "更新应用配置失败")
    }
  }

  if (!app) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size='2xl'
      scrollBehavior='inside'
      classNames={{
        base: "max-w-2xl",
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
  )
}
