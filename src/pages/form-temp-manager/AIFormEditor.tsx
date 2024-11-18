import React, { useState, useEffect, useCallback } from "react"
import { ScrollShadow, Tabs, Tab } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useNavigate, useParams } from "react-router-dom"
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import FormPreview from "./components/FormPreview"
import { useFormState } from "./hooks/useFormState"
import AIFormAgent from "@/service/agents/AIFormAgent"
import { useMetadata } from "@/hooks/useMetadata"
import message from "@/components/Message"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import PageLayout from "@/components/PageLayout"
import { useAsyncButton } from "@/hooks/useAsyncButton"
import MessageCard from "@/components/MessageCard"
import AICommandInput from "@/components/AICommandInput"

// 导入头像
import mo2 from "/assets/mo-2.png"
import user from "/assets/user.png"

const AIFormEditor: React.FC = () => {
  const navigate = useNavigate()
  const { templateId } = useParams<{ templateId: string }>()
  const isEditMode = Boolean(templateId)
  const { updateBreadcrumbs } = useBreadcrumb()
  const [messages, setMessages] = useState<any[]>([])
  const [selectedTab, setSelectedTab] = useState("preview")

  const { state: formState, setFormConfig, setRawConfig, handleError, appendGenerationProcess } = useFormState()

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [savedTemplateId, setSavedTemplateId] = useState<string | null>(null)

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

    updateBreadcrumbs([
      { label: "首页", href: "/we-chat-app/admin" },
      { label: "单据模板管理", href: "/we-chat-app/admin/documents" },
      {
        label: isEditMode ? "编辑单据模板" : "创建单据模板",
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

  const handleCreateDocument = () => {
    if (savedTemplateId) {
      navigate(`/form-preview/${savedTemplateId}`)
    }
  }

  const handleGoToTemplates = () => {
    navigate("/we-chat-app/admin/documents")
  }

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

      try {
        const result = await AIFormAgent.processCommand(
          command,
          (chunk) => {
            onChunk?.(chunk)
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
      if (result?.type === "support") {
        if (result.data?.config) {
          setFormConfig(result.data.config)
          setRawConfig(result.data.rawConfig)
        }
      }
    },
    [setFormConfig, setRawConfig]
  )

  const pageActions = (
    <Button
      color='primary'
      onClick={handleSaveTemplate}
      isDisabled={!formState.formConfig || isSaving}
      isLoading={isSaving}
      startContent={<Icon icon='mdi:content-save' className='w-4 h-4 mr-2' />}
    >
      {isEditMode ? "更新单据模板" : "保存单据模板"}
    </Button>
  )

  return (
    <PageLayout title='AI 智能单据助手' titleIcon='mdi:form-select' actions={pageActions}>
      <div className='h-[calc(100vh-140px)] overflow-hidden'>
        <ResizablePanelGroup direction='horizontal' className='h-full'>
          <ResizablePanel defaultSize={30}>
            <div className='h-full flex flex-col'>
              <ScrollShadow className='flex-1 overflow-y-auto'>
                <div className='space-y-4 pr-3'>
                  {messages.map((message) => (
                    <div key={message.id}>
                      <MessageCard
                        avatar={message.role === "assistant" ? mo2 : user}
                        message={message.content}
                        role={message.role}
                        status='success'
                        className='mb-4'
                      />
                    </div>
                  ))}
                </div>
              </ScrollShadow>

              <AICommandInput agent={formAgent} onResult={handleCommandResult} />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={70} className='resizable-panel'>
            <div className='h-full flex flex-col'>
              <Tabs 
                size='sm' 
                selectedKey={selectedTab} 
                onSelectionChange={(key) => setSelectedTab(key.toString())}
              >
                <Tab key='preview' title='表单预览'>
                  <div className='h-[calc(100vh-260px)] overflow-auto p-2'>
                    {formState.formConfig ? (
                      <FormPreview previewMode config={formState.formConfig} />
                    ) : (
                      <div className='text-center pt-[30%] text-gray-500'>
                        <Icon icon='mdi:form' className='w-12 h-12 mx-auto mb-4' />
                        <p>请输入您的需求,AI将为您开发表单</p>
                      </div>
                    )}
                  </div>
                </Tab>
                <Tab key='code' title='代码视图'>
                  <div className='h-[calc(100vh-260px)] overflow-auto p-2'>
                    {formState.rawConfig ? (
                      <pre className='bg-gray-50 p-4 rounded-lg'>
                        <code>{formState.rawConfig}</code>
                      </pre>
                    ) : (
                      <div className='text-center pt-[30%] text-gray-500'>
                        <Icon icon='mdi:code-braces' className='w-12 h-12 mx-auto mb-4' />
                        <p>等待生成代码...</p>
                      </div>
                    )}
                  </div>
                </Tab>
              </Tabs>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

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
              <p className='text-gray-600'>恭喜！您的单据模板已经{isEditMode ? "更新" : "保存"}成功。现在您可以：</p>
              <div className='flex flex-col gap-2'>
                <div className='p-4 border rounded-lg bg-gray-50'>
                  <h3 className='font-medium mb-2'>创建新单据</h3>
                  <p className='text-sm text-gray-500 mb-4'>使用这个模板立即创建一个新的单据，开始记录您的业务数据。</p>
                  <Button
                    color='primary'
                    onClick={handleCreateDocument}
                    startContent={<Icon icon='mdi:file-document-plus' className='w-4 h-4' />}
                  >
                    创建单据
                  </Button>
                </div>
                <div className='p-4 border rounded-lg'>
                  <h3 className='font-medium mb-2'>返回模板管理</h3>
                  <p className='text-sm text-gray-500 mb-4'>返回模板列表查看或管理您的所有单据模板。</p>
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