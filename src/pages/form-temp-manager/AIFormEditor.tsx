import React, { useState, useEffect, useRef } from "react"
import { ScrollShadow } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useNavigate, useParams } from "react-router-dom"
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Textarea, Tooltip } from "@nextui-org/react"
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

// 导入头像
import mo2 from "/assets/mo-2.png"
import user from "/assets/user.png"

const AIFormEditor: React.FC = () => {
  const navigate = useNavigate()
  const { templateId } = useParams<{ templateId: string }>()
  const isEditMode = Boolean(templateId)
  const { updateBreadcrumbs } = useBreadcrumb()
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<any[]>([])

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

        // 只有在确认支持该指令后才添加assistant消息
        if (result.type === "support") {
          const assistantMessage = {
            role: "assistant",
            content: "",
            id: (Date.now() + 1).toString(),
            timestamp: new Date().toLocaleTimeString(),
          }
          setMessages((prev) => [...prev, assistantMessage])

          if (result.data?.config) {
            setFormConfig(result.data.config)
            setRawConfig(result.data.rawConfig)
          }
        }
      } catch (error) {
        console.error("Error in chat:", error)
        message.error((error as Error).message || "生成过程中发生错误")
      }
    },
    {
      errorMessage: "生成过程中发生错误",
    }
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
    <PageLayout
      title="AI 智能单据助手"
      titleIcon='mdi:form-select'
      actions={pageActions}
    >
      <div className='h-[calc(100vh-140px)] overflow-hidden'>
        <ResizablePanelGroup direction='horizontal' className='h-full'>
          <ResizablePanel defaultSize={30}>
            <div className='h-full flex flex-col'>
              <ScrollShadow className='flex-1 overflow-y-auto'>
                <div className='space-y-4'>
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

              <div className='flex items-end gap-2 p-4 bg-white'>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder='输入您的需求，例如 编辑 xxx 创建 xxx AI 会根据您的指令来创建和更改表单'
                  className='flex-grow'
                  classNames={{
                    input: "py-2 text-medium",
                    inputWrapper: "bg-default-100",
                  }}
                  minRows={1}
                  maxRows={4}
                  endContent={
                    <div className='flex items-center gap-2 pr-2'>
                      <Tooltip content='发送指令' placement='top'>
                        <Button
                          isIconOnly
                          className={!input || isLoading ? "" : "bg-primary"}
                          color={!input || isLoading ? "default" : "primary"}
                          isDisabled={!input || isLoading}
                          radius='full'
                          variant={!input || isLoading ? "flat" : "solid"}
                          onClick={handleSendMessage}
                          isLoading={isLoading}
                        >
                          {isLoading ? (
                            <Icon className='animate-spin' icon='eos-icons:loading' width={20} />
                          ) : (
                            <Icon
                              className={!input ? "text-default-500" : "text-white"}
                              icon='solar:arrow-up-linear'
                              width={20}
                            />
                          )}
                        </Button>
                      </Tooltip>
                    </div>
                  }
                />
              </div>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={70} className='bg-slate-100'>
            <div className='h-full overflow-auto'>
              <div>
                {formState.formConfig ? (
                  <FormPreview previewMode config={formState.formConfig} />
                ) : (
                  <div className='text-center py-12 text-gray-500 h-full flex flex-col justify-center items-center'>
                    <Icon icon='mdi:form' className='w-12 h-12 mx-auto mb-4' />
                    <p>请输入您的需求,AI将为您开发表单</p>
                  </div>
                )}
              </div>
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