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
import ErrorBoundary from "@/components/ErrorBoundary"
import { useVersionControl } from "@/hooks/useVersionControl"
import AIEditor from "@/components/AIEditor"
import VersionSelectModal from "@/components/VersionSelectModal"
import { renderSaveModal } from "./renderSaveModal"
import { renderTitleModal } from "./renderTitleModal"
import { useAIFormStore } from "./store/useAIFormStore"
import MessageCard from "@/components/MessageCard"
import FormTemplateSelect from "./components/FormTemplateSelect"
import { FormTemplate } from "./components/FormTemplateSelect"
import mo2 from "/assets/mo-2.png"
import user from "/assets/user.png"
import { useWatch } from "./hooks/useWatch"
import { getFormAgent } from "./getFormAgent"
import { useSave } from "./hooks/useSave"

const AIFormEditor: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { title } = location.state || {}
  const { templateId } = useParams<{ templateId: string }>()
  const isEditMode = Boolean(templateId)
  const { updateBreadcrumbs } = useBreadcrumb()
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null)
  const [showTemplateSelect, setShowTemplateSelect] = useState(!isEditMode)

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

      if (!currentMessageIdRef.current) {
        const messageId = Date.now().toString()
        currentMessageIdRef.current = messageId
        addMessage({
          role: "assistant",
          content: accumulatedTextRef.current,
          id: messageId,
          timestamp: new Date().toLocaleTimeString(),
          status: "streaming",
        })
      } else {
        updateLastMessage({
          content: accumulatedTextRef.current,
          status: "streaming",
        })
      }
    },
    [addMessage, updateLastMessage]
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
    title,
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
      window.open(`/form-preview/${savedTemplateId}`, "_blank")
    }
  }

  const handleGoToTemplates = () => {
    navigate("/we-chat-app/admin/documents")
  }

  const handleTemplateSelect = (template: FormTemplate) => {
    setSelectedTemplate(template)
    if (template.id === 'custom-form') {
      // 处理定制表单咨询
      window.open('https://example.com/custom-form-consultation', '_blank')
      return
    }
    setShowTemplateSelect(false)
    // 这里可以根据选择的模板类型来初始化表单
    addMessage({
      role: "user",
      content: `请帮我创建一个${template.title}，用途是${template.description}`,
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
    })
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

  const renderMessage = (message) => (
    <MessageCard
      key={message.id}
      avatar={message.role === "assistant" ? mo2 : user}
      message={message.content}
      status={message.status}
      role={message.role}
    />
  )

  if (showTemplateSelect) {
    return (
      <PageLayout title='选择表单模板' titleIcon='mdi:form-select'>
        <FormTemplateSelect onSelect={handleTemplateSelect} className='transition-all duration-300' />
      </PageLayout>
    )
  }

  return (
    <PageLayout title='AI 表单助手' titleIcon='mdi:form-select' actions={pageActions}>
      <AIEditor
        messages={messages}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        agent={formAgent}
        versionControl={versionControl}
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