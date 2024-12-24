import React, { useState, useEffect, useCallback, useRef } from "react"
import { Icon } from "@iconify/react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { Button, Spinner } from "@nextui-org/react"
import FormPreview from "./components/FormPreview"
import { useFormState } from "./hooks/useFormState"
import AIFormAgent from "@/service/agents/AIFormAgent"
import { useMetadata } from "@/hooks/useMetadata"
import message from "@/components/Message"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import PageLayout from "@/components/PageLayout"
import ErrorBoundary from "@/components/ErrorBoundary"
import { useVersionControl } from "@/hooks/useVersionControl"
import AIEditor from "@/components/AIEditor"
import VersionSelectModal from "@/components/VersionSelectModal"
import { renderSaveModal } from "./renderSaveModal"
import { renderTitleModal } from "./renderTitleModal"
import { useAIFormStore } from "./store/useAIFormStore"
import MessageCard from "@/components/MessageCard"
import mo2 from "/assets/mo-2.png"
import user from "/assets/user.png"
import { useWatch } from "./hooks/useWatch"
import { getFormAgent } from "./getFormAgent"
import { useSave } from "./hooks/useSave"
import { codeStore } from "./components/codeStore"
import templates from "../templates"

const AIFormEditor: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { templateId } = useParams<{ templateId: string }>()
  const { templateTitle, templateDescription, promptTemplate } = location.state || {}
  const isEditMode = !location.pathname.includes("/create")
  const { updateBreadcrumbs } = useBreadcrumb()
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false)

  const {
    messages,
    selectedTab,
    isTitleModalOpen,
    isVersionSelectModalOpen,
    isSuccessModalOpen,
    newTitle,
    savedTemplateId,
    setMessages,
    addMessage,
    updateLastMessage,
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
    clearMessages,
  } = useAIFormStore()

  const { state: formState, setFormConfig, setRawConfig, handleError } = useFormState()
  const { create: createTemplate, getDetail: getTemplateDetail, update: updateTemplate } = useMetadata("template")
  const versionControl = useVersionControl<{
    formConfig: any
    rawConfig: string
  }>()

  const accumulatedTextRef = useRef("")
  const lastResponseRef = useRef("")
  const currentMessageIdRef = useRef<string | null>(null)

  useWatch(
    lastResponseRef,
    setFormConfig,
    setRawConfig,
    setPreviewContent,
    setSelectedTab,
    versionControl,
    updateLastMessage
  )

  useEffect(() => {
    const loadTemplatePrompt = async () => {
      if (promptTemplate && !isEditMode) {
        try {
          const templateModule = templates[promptTemplate]
          addMessage({
            role: "assistant",
            content: `我将帮您创建一个${templateTitle}。${templateModule}`,
            id: Date.now().toString(),
            timestamp: new Date().toLocaleTimeString(),
          })
        } catch (error) {
          console.error("Error loading template prompt:", error)
          addMessage({
            role: "assistant",
            content: `请告诉我您的具体需求，我会为您量身定制。`,
            id: Date.now().toString(),
            timestamp: new Date().toLocaleTimeString(),
          })
        }
      } else if (templateId && templateTitle && !isEditMode) {
        addMessage({
          role: "assistant",
          content: `请告诉我您的具体需求，我会为您量身定制。`,
          id: Date.now().toString(),
          timestamp: new Date().toLocaleTimeString(),
        })
      }
    }

    setMessages([])
    setSuccessModalOpen(false)
    loadTemplatePrompt()
  }, [templateId, templateTitle, templateDescription, isEditMode, promptTemplate])

  useEffect(() => {
    const loadTemplateData = async () => {
      if (isEditMode && templateId) {
        try {
          setIsLoadingTemplate(true)
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
        } finally {
          setIsLoadingTemplate(false)
        }
      }
    }

    loadTemplateData()

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

      // 直接更新最后一条消息，不需要判断 currentMessageIdRef
      if (accumulatedTextRef.current !== "") {
        updateLastMessage({
          content: accumulatedTextRef.current,
          status: "streaming",
        })
      }
    },
    [updateLastMessage]
  )

  const formAgent = getFormAgent(
    addMessage,
    setPreviewContent,
    accumulatedTextRef,
    currentMessageIdRef,
    messages,
    handleChunk,
    formState,
    updateLastMessage
  )

  const { isLoading: isSaving, handleClick: handleSaveTemplate } = useSave(
    formState,
    versionControl,
    createTemplate,
    updateTemplate,
    templateId,
    isEditMode,
    templateTitle,
    setPendingVersionSave,
    setNewTitle,
    setTitleModalOpen,
    setPendingSave,
    setSavedTemplateId,
    setSuccessModalOpen,
    setVersionSelectModalOpen,
    handleError
  )

  const handleCreateDocument = () => {
    if (savedTemplateId) {
      window.open(`/form-create/${savedTemplateId}?mode=create`, "_blank")
    }
  }
  const handleConfigApp = () => {
    navigate("/we-chat-app/admin/apps")
  }

  const handleGoToTemplates = () => {
    navigate("/we-chat-app/admin/documents")
  }

  const handleCommandResult = (result: any) => {
    if (result.success) {
      setFormConfig(result.config)
      setRawConfig(result.rawConfig)
      setPreviewContent(result.rawConfig)
      codeStore.code = result.rawConfig
    }
  }

  const pageActions = (
    <Button
      color='primary'
      onClick={handleSaveTemplate}
      isDisabled={isSaving}
      isLoading={isSaving}
      startContent={<Icon icon='mdi:content-save' className='w-4 h-4 mr-2' />}
    >
      {isEditMode ? "更新表单模板" : "保存表单模板"}
    </Button>
  )

  const renderMessage = (message) => (
    <MessageCard
      key={message.id}
      avatar={message.role === "assistant" ? mo2 : user}
      message={message.content}
      status={message.status}
      role={message.role}
    />
  )

  if (isLoadingTemplate) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <Spinner label='加载模板中...' />
      </div>
    )
  }

  return (
    <PageLayout title='AI 表单开发' titleIcon='mdi:form-select' actions={pageActions}>
      <AIEditor
        parseConfig={AIFormAgent.parseConfig}
        messages={messages}
        onClearMessages={clearMessages}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        agent={formAgent}
        versionControl={versionControl}
        onCommandResult={handleCommandResult}
        renderMessage={renderMessage}
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
            <FormPreview previewMode code={formState.rawConfig} />
          </ErrorBoundary>
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
        setSuccessModalOpen,
        isEditMode,
        handleCreateDocument,
        handleGoToTemplates,
        handleConfigApp
      )}
    </PageLayout>
  )
}

export default AIFormEditor
