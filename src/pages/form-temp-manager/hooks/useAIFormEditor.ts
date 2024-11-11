import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useMetadata } from "@/components/from-templates/hook/useMetadata"
import { useFormState } from "../hook.useFormState"
import { useAsyncButton } from "@/hooks/useAsyncButton"
import AIFormAgent from "@/service/agents/AIFormAgent"
import message from "@/components/Message"

export const useAIFormEditor = () => {
  const navigate = useNavigate()
  const { templateId } = useParams<{ templateId: string }>()
  const isEditMode = Boolean(templateId)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<any[]>([])
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [savedTemplateId, setSavedTemplateId] = useState<string | null>(null)

  const { state: formState, setFormConfig, setRawConfig, handleError, appendGenerationProcess } = useFormState()
  const { create: createTemplate, getDetail: getTemplateDetail, update: updateTemplate } = useMetadata("template")

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
  }, [templateId, isEditMode])

  const { isLoading: isSaving, handleClick: handleSaveTemplate } = useAsyncButton(
    async () => {
      if (!formState.formConfig || !formState.rawConfig) {
        message.error("请先生成表单")
        return
      }

      try {
        const templateData = {
          title: formState.formConfig.metadata?.title || "新建模板",
          type: "custom",
          status: "active",
          data: {
            rawConfig: formState.rawConfig,
            type: "custom",
            name: formState.formConfig.metadata?.title || "新建模板",
          },
        }

        if (isEditMode && templateId) {
          const result = await updateTemplate(templateId, templateData)
          if (result) {
            setSavedTemplateId(templateId)
            setIsSuccessModalOpen(true)
          } else {
            throw new Error("更新模板失败")
          }
        } else {
          const result = await createTemplate(templateData)
          if (result) {
            setSavedTemplateId(result.id)
            setIsSuccessModalOpen(true)
          } else {
            throw new Error("保存模板失败")
          }
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

  const { isLoading, handleClick: handleSendMessage } = useAsyncButton(
    async () => {
      if (!input.trim()) return

      const userMessage = {
        role: "user",
        content: input,
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
      }
      setMessages((prev) => [...prev, userMessage])
      setInput("")

      try {
        const assistantMessage = {
          role: "assistant",
          content: "",
          id: (Date.now() + 1).toString(),
          timestamp: new Date().toLocaleTimeString(),
        }
        setMessages((prev) => [...prev, assistantMessage])

        const result = await AIFormAgent.processCommand(
          input,
          (chunk) => {
            setMessages((prev) => {
              const newMessages = [...prev]
              const lastMessage = newMessages[newMessages.length - 1]
              if (lastMessage.role === "assistant") {
                lastMessage.content += chunk
              }
              return [...newMessages]
            })
            appendGenerationProcess(chunk)
          },
          formState.rawConfig
        )

        if (result.type === "support") {
          if (result.data?.config) {
            setFormConfig(result.data.config)
            setRawConfig(result.data.rawConfig)
          }
        }
      } catch (error) {
        console.error("Error in chat:", error)
        message.error("生成过程中发生错误")
      }
    },
    {
      errorMessage: "生成过程中发生错误",
    }
  )

  const handleCreateDocument = () => {
    if (savedTemplateId) {
      navigate(`/form-preview/${savedTemplateId}`)
    }
  }

  const handleGoToTemplates = () => {
    navigate("/we-chat-app/admin/documents")
  }

  return {
    isEditMode,
    input,
    setInput,
    messages,
    formState,
    isSuccessModalOpen,
    setIsSuccessModalOpen,
    isSaving,
    isLoading,
    handleSaveTemplate,
    handleSendMessage,
    handleCreateDocument,
    handleGoToTemplates,
  }
}