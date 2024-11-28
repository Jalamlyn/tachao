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

  // 使用zustand store
  const {
    messages,
    selectedTab,
    previewContent,
    setMessages,
    addMessage,
    setSelectedTab,
    setPreviewContent,
    updateLastMessage,
  } = useAIFormStore()

  const [isTitleModalOpen, setIsTitleModalOpen] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [pendingSave, setPendingSave] = useState<{
    resolve: (value: void | PromiseLike<void>) => void
    reject: (reason?: any) => void
    save: (title: string) => Promise<void>
  } | null>(null)

  const [isVersionSelectModalOpen, setIsVersionSelectModalOpen] = useState(false)
  const [pendingVersionSave, setPendingVersionSave] = useState<{
    resolve: (value: void | PromiseLike<void>) => void
    reject: (reason?: any) => void
    save: (useCurrentVersion: boolean) => Promise<void>
  } | null>(null)

  const { state: formState, setFormConfig, setRawConfig, handleError } = useFormState()

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [savedTemplateId, setSavedTemplateId] = useState<string | null>(null)

  const { create: createTemplate, getDetail: getTemplateDetail, update: updateTemplate } = useMetadata("template")

  const versionControl = useVersionControl<{
    formConfig: any
    rawConfig: string
  }>()

  const accumulatedTextRef = useRef("")

  useEffect(() => {
    setMessages([])
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
                  setIsTitleModalOpen(true)
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
                          setIsSuccessModalOpen(true)
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
                    setIsSuccessModalOpen(true)
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
          setIsVersionSelectModalOpen(true)
        })
      }

      if (!isEditMode) {
        const initialTitle = title || formState.formConfig.metadata?.title || ""
        setNewTitle(initialTitle)
        setIsTitleModalOpen(true)

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
                  setIsSuccessModalOpen(true)
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

  const handleTitleConfirm = async () => {
    const trimmedTitle = newTitle.trim()
    if (!trimmedTitle) {
      return
    }

    if (pendingSave) {
      try {
        await pendingSave.save(trimmedTitle)
        pendingSave.resolve()
      } catch (error) {
        pendingSave.reject(error)
        throw error
      } finally {
        setPendingSave(null)
        setIsTitleModalOpen(false)
      }
    }
  }

  const handleTitleCancel = () => {
    if (pendingSave) {
      pendingSave.reject(new Error("用户取消保存"))
      setPendingSave(null)
    }
    setIsTitleModalOpen(false)
  }

  const handleVersionSelectConfirm = async (useCurrentVersion: boolean) => {
    if (pendingVersionSave) {
      try {
        await pendingVersionSave.save(useCurrentVersion)
        pendingVersionSave.resolve()
        setIsVersionSelectModalOpen(false)
      } catch (error) {
        pendingVersionSave.reject(error)
      } finally {
        setPendingVersionSave(null)
      }
    }
  }

  const handleVersionSelectCancel = () => {
    if (pendingVersionSave) {
      pendingVersionSave.reject(new Error("用户取消选择版本"))
      setPendingVersionSave(null)
    }
    setIsVersionSelectModalOpen(false)
  }

  const handleChunk = useCallback(
    (chunk: string) => {
      accumulatedTextRef.current += chunk

      if (accumulatedTextRef.current.includes("<shata-ai-error>")) {
        const errorMatch = accumulatedTextRef.current.match(/<shata-ai-error>([\s\S]*?)<\/shata-ai-error>/)
        if (errorMatch) {
          const errorMessage = errorMatch[1].trim()
          updateLastMessage({
            content: (
              <div className='flex items-center gap-2 text-danger'>
                <Icon icon='mdi:alert-circle' className='w-5 h-5' />
                <span>{errorMessage}</span>
              </div>
            ),
            status: "error",
          })
          accumulatedTextRef.current = ""
          return
        }
      }

      if (accumulatedTextRef.current.includes("<shata-ai-form>")) {
        updateLastMessage({
          content: (
            <div className='flex items-center gap-3 text-primary'>
              <Icon icon='eos-icons:three-dots-loading' className='w-10 h-10' />
              <div className='flex flex-col'>
                <span className='font-medium text-sm'>AI 正在生成表单配置</span>
              </div>
            </div>
          ),
        })
        setSelectedTab("code")
      }

      if (previewContent || accumulatedTextRef.current.includes("<shata-ai-form>")) {
        const newContent = accumulatedTextRef.current
        setPreviewContent(newContent)
      }
    },
    [previewContent, updateLastMessage, setSelectedTab, setPreviewContent]
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
        content: "",
        id: (Date.now() + 1).toString(),
        timestamp: new Date().toLocaleTimeString(),
      }
      addMessage(assistantMessage)

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

          updateLastMessage({
            content: (
              <div className='flex items-center gap-2 text-success'>
                <Icon icon='line-md:check-all' className='w-5 h-5' />
                <span>表单生成完成</span>
              </div>
            ),
            status: "success",
          })

          setSelectedTab("preview")
        }
      }
    },
    [setFormConfig, setRawConfig, versionControl, updateLastMessage, setSelectedTab]
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

      {renderTitleModal(isTitleModalOpen, handleTitleCancel, newTitle, handleTitleConfirm, setNewTitle)}

      <VersionSelectModal
        isOpen={isVersionSelectModalOpen}
        onClose={handleVersionSelectCancel}
        onConfirm={handleVersionSelectConfirm}
        currentVersionIndex={versionControl.currentIndex}
        latestVersionIndex={versionControl.versions.length - 1}
      />

      {renderSaveModal(
        isSuccessModalOpen,
        setIsSuccessModalOpen,
        isEditMode,
        handleCreateDocument,
        handleGoToTemplates
      )}
    </PageLayout>
  )
}

export default AIFormEditor
