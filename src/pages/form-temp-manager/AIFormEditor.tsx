import React, { useState, useEffect, useCallback, useRef } from "react"
import { Icon } from "@iconify/react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from "@nextui-org/react"
import FormPreview from "./components/FormPreview"
import { useFormState } from "./hooks/useFormState"
import AIFormAgent from "@/service/agents/AIFormAgent"
import { useMetadata } from "@/hooks/useMetadata"
import message from "@/components/Message"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import PageLayout from "@/components/PageLayout"
import { useAsyncButton } from "@/hooks/useAsyncButton"
import ErrorBoundary from "@/components/ErrorBoundary"
import { useVersionControl } from "@/hooks/useVersionControl"
import AIEditor from "@/components/AIEditor"

const AIFormEditor: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { title } = location.state || {}
  const { templateId } = useParams<{ templateId: string }>()
  const isEditMode = Boolean(templateId)
  const { updateBreadcrumbs } = useBreadcrumb()
  const [messages, setMessages] = useState<any[]>([])
  const [selectedTab, setSelectedTab] = useState("preview")
  const [previewContent, setPreviewContent] = useState<string>("")
  const accumulatedTextRef = useRef("")

  // 新增：标题输入Modal的状态
  const [isTitleModalOpen, setIsTitleModalOpen] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [pendingSave, setPendingSave] = useState<((title: string) => Promise<void>) | null>(null)

  const { state: formState, setFormConfig, setRawConfig, handleError } = useFormState()

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [savedTemplateId, setSavedTemplateId] = useState<string | null>(null)

  const { create: createTemplate, getDetail: getTemplateDetail, update: updateTemplate } = useMetadata("template")

  const versionControl = useVersionControl<{
    formConfig: any
    rawConfig: string
  }>()

  useEffect(() => {
    const loadTemplateData = async () => {
      if (isEditMode && templateId) {
        try {
          const template = await getTemplateDetail(templateId)
          if (template && template.data.rawConfig) {
            const parsedConfig = await AIFormAgent.parseConfig(template.data.rawConfig)
            if (parsedConfig) {
              setFormConfig(parsedConfig.config)
              setRawConfig(template.data.rawConfig)
              setPreviewContent(template.data.rawConfig)

              versionControl.addVersion({
                formConfig: parsedConfig.config,
                rawConfig: template.data.rawConfig,
              })
            } else {
              message.error("模板解析失败")
              navigate("/we-chat-app/admin/documents")
            }
          } else {
            message.error("模板加载失败")
            navigate("/we-chat-app/admin/documents")
          }
        } catch (error) {
          handleError(error)
          navigate("/we-chat-app/admin/documents")
        }
      }
    }

    loadTemplateData()
    AIFormAgent.clearCachedImage()

    updateBreadcrumbs([
      { label: "首页", href: "/we-chat-app/admin" },
      { label: "表单模板管理", href: "/we-chat-app/admin/documents" },
      {
        label: isEditMode ? "编辑表单模板" : "创建表单模板",
        href: isEditMode ? `/we-chat-app/admin/documents/edit/${templateId}` : "/we-chat-app/admin/documents/create",
      },
    ])
  }, [templateId, isEditMode])

  const { isLoading: isSaving, handleClick: handleSaveTemplate } = useAsyncButton(
    async () => {
      if (!formState.formConfig || !formState.rawConfig) {
        message.error("请先生成表单")
        return
      }

      // 修改：保存前先获取标题
      if (!isEditMode) {
        const initialTitle = title || formState.formConfig.metadata?.title || ""
        setNewTitle(initialTitle)
        setIsTitleModalOpen(true)
        return new Promise<void>((resolve) => {
          setPendingSave(async (confirmedTitle: string) => {
            try {
              const templateData = {
                title: confirmedTitle,
                type: "custom",
                status: "active",
                data: {
                  rawConfig: formState.rawConfig,
                  type: "custom",
                  name: confirmedTitle,
                },
              }

              const result = await createTemplate(templateData)
              if (result) {
                setSavedTemplateId(result.id)
                setIsSuccessModalOpen(true)
              } else {
                throw new Error("保存模板失败")
              }
              resolve()
            } catch (error) {
              handleError(error)
              throw error
            }
          })
        })
      }

      // 编辑模式直接保存
      try {
        const templateData = {
          title: title || formState.formConfig.metadata?.title || "新建模板",
          type: "custom",
          status: "active",
          data: {
            rawConfig: formState.rawConfig,
            type: "custom",
            name: title || formState.formConfig.metadata?.title || "新建模板",
          },
        }

        const result = await updateTemplate(templateId, templateData)
        if (result) {
          setSavedTemplateId(templateId)
          setIsSuccessModalOpen(true)
        } else {
          throw new Error("更新模板失败")
        }
      } catch (error) {
        handleError(error)
        throw error
      }
    },
    {
      errorMessage: "保存模板失败",
    }
  )

  const handleCreateDocument = () => {
    if (savedTemplateId) {
      window.open(`/form-preview/${savedTemplateId}`, "_blank")
    }
  }

  const handleGoToTemplates = () => {
    navigate("/we-chat-app/admin/documents")
  }

  // 修改：处理标题确认
  const handleTitleConfirm = async () => {
    const trimmedTitle = newTitle.trim()
    if (!trimmedTitle) {
      return
    }

    if (pendingSave) {
      await pendingSave(trimmedTitle)
      setPendingSave(null)
    }
    setIsTitleModalOpen(false)
  }

  const handleChunk = useCallback(
    (chunk: string) => {
      accumulatedTextRef.current += chunk

      if (accumulatedTextRef.current.includes("<shata-ai-error>")) {
        const errorMatch = accumulatedTextRef.current.match(/<shata-ai-error>([\s\S]*?)<\/shata-ai-error>/)
        if (errorMatch) {
          const errorMessage = errorMatch[1].trim()
          setMessages((prev) => {
            const lastMessage = prev[prev.length - 1]
            return [
              ...prev.slice(0, -1),
              {
                ...lastMessage,
                content: (
                  <div className='flex items-center gap-2 text-danger'>
                    <Icon icon='mdi:alert-circle' className='w-5 h-5' />
                    <span>{errorMessage}</span>
                  </div>
                ),
                status: "error",
              },
            ]
          })
          accumulatedTextRef.current = ""
          return
        }
      }

      if (accumulatedTextRef.current.includes("<shata-ai-form>")) {
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1]
          return [
            ...prev.slice(0, -1),
            {
              ...lastMessage,
              content: (
                <div className='flex items-center gap-3 text-primary'>
                  <Icon icon='eos-icons:three-dots-loading' className='w-10 h-10' />
                  <div className='flex flex-col'>
                    <span className='font-medium text-sm'>AI 正在生成表单配置</span>
                  </div>
                </div>
              ),
            },
          ]
        })
        setSelectedTab("code")
      }

      if (previewContent || accumulatedTextRef.current.includes("<shata-ai-form>")) {
        const newContent = accumulatedTextRef.current
        setPreviewContent(newContent)
      }
    },
    [previewContent]
  )

  const formAgent = {
    processCommand: async (command: string, onChunk?: (chunk: string) => void) => {
      const userMessage = {
        role: "user",
        content: command,
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
      }
      setMessages((prev) => [...prev, userMessage])

      const assistantMessage = {
        role: "assistant",
        content: "",
        id: (Date.now() + 1).toString(),
        timestamp: new Date().toLocaleTimeString(),
      }
      setMessages((prev) => [...prev, assistantMessage])

      setPreviewContent("")

      try {
        const result = await AIFormAgent.processCommand(
          command,
          (chunk) => {
            onChunk?.(chunk)
            handleChunk(chunk)
          },
          formState.rawConfig
        )

        return result
      } catch (error) {
        console.error("Error in chat:", error)
        message.error("生成过程中发生错误")
        throw error
      }
    },
  }

  const handleCommandResult = useCallback(
    (result) => {
      accumulatedTextRef.current = ""
      if (result?.type === "support") {
        if (result.data?.config) {
          versionControl.addVersion({
            formConfig: result.data.config,
            rawConfig: result.data.rawConfig,
          })

          setFormConfig(result.data.config)
          setRawConfig(result.data.rawConfig)

          setMessages((prev) => {
            const lastMessage = prev[prev.length - 1]
            return [
              ...prev.slice(0, -1),
              {
                ...lastMessage,
                content: (
                  <div className='flex items-center gap-2 text-success'>
                    <Icon icon='line-md:check-all' className='w-5 h-5' />
                    <span>表单生成完成</span>
                  </div>
                ),
                status: "success",
              },
            ]
          })

          setSelectedTab("preview")
        }
      }
    },
    [setFormConfig, setRawConfig, versionControl]
  )

  const pageActions = (
    <Button
      color='primary'
      onClick={handleSaveTemplate}
      isDisabled={!formState.formConfig || isSaving}
      isLoading={isSaving}
      startContent={<Icon icon='mdi:content-save' className='w-4 h-4 mr-2' />}
    >
      {isEditMode ? "更新表单模板" : "保存表单模板"}
    </Button>
  )

  return (
    <PageLayout title='AI 表单助手' titleIcon='mdi:form-select' actions={pageActions}>
      <AIEditor
        messages={messages}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        onCommandResult={handleCommandResult}
        agent={formAgent}
        versionControl={versionControl}
        renderPreview={(version) => (
          <ErrorBoundary
            onReset={() => {
              const prevVersion = versionControl.rollback()
              if (prevVersion) {
                setFormConfig(prevVersion.formConfig)
                setRawConfig(prevVersion.rawConfig)
                setPreviewContent(prevVersion.rawConfig)
              }
            }}
          >
            <FormPreview previewMode config={version?.formConfig} />
          </ErrorBoundary>
        )}
        renderCodeView={(version) => (
          <pre>
            <code>{previewContent || version?.rawConfig || ""}</code>
          </pre>
        )}
        showCodeTab
        previewTabName='表单预览'
      />

      {/* 新增：标题输入Modal */}
      <Modal isOpen={isTitleModalOpen} onClose={() => setIsTitleModalOpen(false)} size='sm'>
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>输入表单模板标题</ModalHeader>
          <ModalBody>
            <Input
              autoFocus
              label="标题"
              placeholder="请输入表单模板标题"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleTitleConfirm()
                }
              }}
            />
          </ModalBody>
          <ModalFooter>
            <Button color='danger' variant='light' onPress={() => setIsTitleModalOpen(false)}>
              取消
            </Button>
            <Button color='primary' onPress={handleTitleConfirm} isDisabled={!newTitle.trim()}>
              确认
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isSuccessModalOpen} onClose={() => setIsSuccessModalOpen(false)} size='lg' placement='center'>
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>
            <div className='flex items-center gap-2'>
              <Icon icon='mdi:check-circle' className='w-6 h-6 text-success' />
              <span>模板{isEditMode ? "更新" : "保存"}成功</span>
            </div>
          </ModalHeader>
          <ModalBody>
            <div className='space-y-4'>
              <p className='text-gray-600'>恭喜！您的表单模板已经{isEditMode ? "更新" : "保存"}成功。现在您可以：</p>
              <div className='flex flex-col gap-2'>
                <div className='p-4 border rounded-lg bg-gray-50'>
                  <h3 className='font-medium mb-2'>创建新表单</h3>
                  <p className='text-sm text-gray-500 mb-4'>使用这个模板立即创建一个新的表单，开始记录您的业务数据。</p>
                  <Button
                    color='primary'
                    onClick={handleCreateDocument}
                    startContent={<Icon icon='mdi:file-document-plus' className='w-4 h-4' />}
                  >
                    创建表单
                  </Button>
                </div>
                <div className='p-4 border rounded-lg'>
                  <h3 className='font-medium mb-2'>返回模板管理</h3>
                  <p className='text-sm text-gray-500 mb-4'>返回模板列表查看或管理您的所有表单模板。</p>
                  <Button
                    variant='bordered'
                    onClick={handleGoToTemplates}
                    startContent={<Icon icon='mdi:format-list-bulleted' className='w-4 h-4' />}
                  >
                    查看所有模板
                  </Button>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant='light' onPress={() => setIsSuccessModalOpen(false)}>
              关闭
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </PageLayout>
  )
}

export default AIFormEditor