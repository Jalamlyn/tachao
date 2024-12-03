import React, { useState, useEffect, useCallback, useRef } from "react"
import { Icon } from "@iconify/react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { Button } from "@nextui-org/react"
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
import VersionSelectModal from "@/components/VersionSelectModal"
import { renderSaveModal } from "./renderSaveModal"
import { renderTitleModal } from "./renderTitleModal"
import { useAIFormStore } from "./store/useAIFormStore"

const AIFormEditor: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { title } = location.state || {}
  const { templateId } = useParams<{ templateId: string }>()
  const isEditMode = Boolean(templateId)
  const { updateBreadcrumbs } = useBreadcrumb()

  const {
    messages,
    selectedTab,
    previewContent,
    isTitleModalOpen,
    isVersionSelectModalOpen,
    isSuccessModalOpen,
    newTitle,
    savedTemplateId,
    setMessages,
    addMessage,
    setSelectedTab,
    setPreviewContent,
    setTitleModalOpen,
    setVersionSelectModalOpen,
    setSuccessModalOpen,
    setNewTitle,
    setSavedTemplateId,
    setPendingSave,
    setPendingVersionSave,
    handleTitleConfirm,
    handleTitleCancel,
    handleVersionSelectConfirm,
    handleVersionSelectCancel,
  } = useAIFormStore()

  const { state: formState, setFormConfig, setRawConfig, handleError } = useFormState()
  const { create: createTemplate, getDetail: getTemplateDetail, update: updateTemplate } = useMetadata("template")
  const versionControl = useVersionControl<{
    formConfig: any
    rawConfig: string
  }>()

  const accumulatedTextRef = useRef("")
  const lastResponseRef = useRef("")

  useEffect(() => {
    setMessages([])
    setSuccessModalOpen(false)
  }, [])

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

  const handleChunk = useCallback(
    (chunk: string) => {
      accumulatedTextRef.current += chunk
      lastResponseRef.current = accumulatedTextRef.current

      addMessage({
        role: "assistant",
        content: (
          <div className='flex items-center gap-3'>
            <Icon icon='eos-icons:three-dots-loading' className='w-10 h-10 text-primary' />
            <div className='flex flex-col'>
              <span className='font-medium text-sm'>正在生成...</span>
              <pre className='text-xs text-gray-500 mt-2'>{accumulatedTextRef.current}</pre>
            </div>
          </div>
        ),
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        status: "streaming",
      })
    },
    [addMessage]
  )

  const formAgent = {
    processCommand: async (command: string, onChunk?: (chunk: string) => void) => {
      const userMessage = {
        role: "user",
        content: command,
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
      }
      addMessage(userMessage)

      const assistantMessage = {
        role: "assistant",
        content: (
          <div className='flex items-center gap-2'>
            <Icon icon='eos-icons:three-dots-loading' className='w-5 h-5 animate-spin' />
            <span>正在思考...</span>
          </div>
        ),
        id: (Date.now() + 1).toString(),
        timestamp: new Date().toLocaleTimeString(),
        status: "thinking",
      }
      addMessage(assistantMessage)

      setPreviewContent("")
      accumulatedTextRef.current = ""

      try {
        const processMessages = messages.map(msg => ({
          role: msg.role,
          content: typeof msg.content === 'string' ? msg.content : 
                  React.isValidElement(msg.content) ? lastResponseRef.current || '正在处理...' : 
                  String(msg.content)
        }))

        const result = await AIFormAgent.processCommand(
          processMessages,
          command,
          (chunk) => {
            onChunk?.(chunk)
            handleChunk(chunk)
          },
          formState.rawConfig
        )

        if (result.success && result.config) {
          versionControl.addVersion({
            formConfig: result.config,
            rawConfig: result.rawConfig,
          })

          setFormConfig(result.config)
          setRawConfig(result.rawConfig)
          setSelectedTab("preview")

          addMessage({
            role: "assistant",
            content: (
              <div className='flex items-center gap-2 text-success'>
                <Icon icon='line-md:check-all' className='w-5 h-5' />
                <span>表单生成完成</span>
              </div>
            ),
            id: Date.now().toString(),
            timestamp: new Date().toLocaleTimeString(),
            status: "success",
          })
        }

        return result
      } catch (error) {
        console.error("Error in chat:", error)
        addMessage({
          role: "assistant",
          content: (
            <div className='flex items-center gap-2 text-danger'>
              <Icon icon='mdi:alert-circle' className='w-5 h-5' />
              <span>{error.message || "生成过程中发生错误"}</span>
            </div>
          ),
          id: Date.now().toString(),
          timestamp: new Date().toLocaleTimeString(),
          status: "error",
        })
        message.error("生成过程中发生错误")
        throw error
      }
    },
  }

  const { isLoading: isSaving, handleClick: handleSaveTemplate } = useAsyncButton(
    async () => {
      if (!formState.formConfig || !formState.rawConfig) {
        message.error("请先生成表单")
        return
      }

      if (versionControl.currentIndex < versionControl.versions.length - 1) {
        return new Promise<void>((resolve, reject) => {
          setPendingVersionSave({
            resolve,
            reject,
            save: async (useCurrentVersion: boolean) => {
              try {
                const versionToSave = useCurrentVersion
                  ? versionControl.getCurrentVersion()
                  : versionControl.versions[versionControl.versions.length - 1].data

                if (!versionToSave) {
                  throw new Error("无效的版本数据")
                }

                if (!isEditMode) {
                  setNewTitle(title || versionToSave.formConfig.metadata?.title || "")
                  setTitleModalOpen(true)
                  setPendingSave({
                    resolve,
                    reject,
                    save: async (confirmedTitle: string) => {
                      try {
                        const templateData = {
                          title: confirmedTitle,
                          type: "custom",
                          status: "active",
                          data: {
                            rawConfig: versionToSave.rawConfig,
                            type: "custom",
                            name: confirmedTitle,
                          },
                        }

                        const result = await createTemplate(templateData)
                        if (result) {
                          setSavedTemplateId(result.id)
                          setSuccessModalOpen(true)
                          resolve()
                        } else {
                          throw new Error("保存模板失败")
                        }
                      } catch (error) {
                        reject(error)
                      }
                    },
                  })
                } else {
                  const templateData = {
                    title: title || versionToSave.formConfig.metadata?.title || "新建模板",
                    type: "custom",
                    status: "active",
                    data: {
                      rawConfig: versionToSave.rawConfig,
                      type: "custom",
                      name: title || versionToSave.formConfig.metadata?.title || "新建模板",
                    },
                  }

                  const result = await updateTemplate(templateId, templateData)
                  if (result) {
                    setSavedTemplateId(templateId)
                    setSuccessModalOpen(true)
                    resolve()
                  } else {
                    throw new Error("更新模板失败")
                  }
                }
              } catch (error) {
                reject(error)
                throw error
              }
            },
          })
          setVersionSelectModalOpen(true)
        })
      }

      if (!isEditMode) {
        const initialTitle = title || formState.formConfig.metadata?.title || ""
        setNewTitle(initialTitle)
        setTitleModalOpen(true)

        return new Promise<void>((resolve, reject) => {
          setPendingSave({
            resolve,
            reject,
            save: async (confirmedTitle: string) => {
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
                  setSuccessModalOpen(true)
                  resolve()
                } else {
                  throw new Error("保存模板失败")
                }
              } catch (error) {
                reject(error)
              }
            },
          })
        })
      }

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
          setSuccessModalOpen(true)
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

      {renderTitleModal(isTitleModalOpen, handleTitleCancel, newTitle, handleTitleConfirm, setNewTitle)}

      <VersionSelectModal
        isOpen={isVersionSelectModalOpen}
        onClose={handleVersionSelectCancel}
        onConfirm={handleVersionSelectConfirm}
        currentVersionIndex={versionControl.currentIndex}
        latestVersionIndex={versionControl.versions.length - 1}
      />

      {renderSaveModal(isSuccessModalOpen, setSuccessModalOpen, isEditMode, handleCreateDocument, handleGoToTemplates)}
    </PageLayout>
  )
}

export default AIFormEditor