import React, { useState, useEffect, useRef } from "react"
import {
  Card,
  CardHeader,
  CardBody,
  ScrollShadow,
  Tooltip,
  Chip,
  Button,
  Textarea,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useFormMetadata } from "@/components/from-templates/hook/useFormMetadata"
import message from "@/components/Message"
import MessageCard from "@/components/MessageCard"
import chatChunk from "@/service/chat/chat-chunk-openai-office"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import PageLayout from "@/components/PageLayout"
import { useAsyncButton } from "@/hooks/useAsyncButton"
import { useMetadata } from "@/hooks/useMetadata"

// 导入头像
import mo2 from "/assets/mo-2.png"
import user from "/assets/user.png"

interface Template {
  id: string
  title: string
  description?: string
  formCount?: number
}

const FormAnalysis: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState("")
  const [chatCount, setChatCount] = useState(0)
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [recentTemplates, setRecentTemplates] = useState<string[]>([])
  const { isOpen: isTemplateModalOpen, onOpen: onTemplateModalOpen, onClose: onTemplateModalClose } = useDisclosure()

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { fetchForms } = useFormMetadata()
  const { load: loadTemplates } = useMetadata("template")
  const formsRef = useRef(null)
  const { updateBreadcrumbs } = useBreadcrumb()

  useEffect(() => {
    async function fetchData() {
      try {
        const templatesResult = await loadTemplates()
        const forms = await fetchForms()

        if (templatesResult) {
          // 计算每个模板的表单数量
          const templatesWithCount = templatesResult.map((template) => ({
            ...template,
            formCount: forms.filter((form) => form.template?.id === template.id).length,
          }))

          setTemplates(templatesWithCount)
        }
        
        formsRef.current = forms

        // 从本地存储加载最近使用的模板
        const recent = localStorage.getItem("recentTemplates")
        if (recent) {
          setRecentTemplates(JSON.parse(recent))
        }
      } catch (error) {
        console.error("Error loading data:", error)
        message.error("加载数据失败")
      }
    }
    fetchData()

    updateBreadcrumbs([
      { label: "首页", href: "/we-chat-app/admin" },
      { label: "AI 智能助手", href: "/we-chat-app/admin/ai-assistant" },
    ])
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleTemplateSelection = (templateId: string) => {
    setSelectedTemplates((prev) => {
      const newSelection = prev.includes(templateId) ? prev.filter((id) => id !== templateId) : [...prev, templateId]

      // 更新最近使用的模板
      const updatedRecent = [templateId, ...recentTemplates.filter((id) => id !== templateId)].slice(0, 5)
      setRecentTemplates(updatedRecent)
      localStorage.setItem("recentTemplates", JSON.stringify(updatedRecent))

      return newSelection
    })
  }

  const handleRemoveTemplate = (templateId: string) => {
    setSelectedTemplates((prev) => prev.filter((id) => id !== templateId))
  }

  const validateDataSource = () => {
    if (selectedTemplates.length === 0) {
      message.warning("请先选择要分析的表单模板")
      return false
    }
    return true
  }

  const getSelectedFormsData = () => {
    if (!formsRef.current) return []
    return formsRef.current.filter((form) => selectedTemplates.includes(form.template?.id))
  }

  const { isLoading, handleClick: handleSendMessage } = useAsyncButton(
    async () => {
      if (!validateDataSource()) return
      const selectedForms = getSelectedFormsData()
      if (selectedForms.length === 0) {
        return message.error("所选模板没有相关的表单数据")
      }

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

        await chatChunk(
          [
            {
              role: "system",
              content: `你是沙塔 AI 的智能数据分析助手，负责帮助用户分析和查询表单数据。
你需要理解用户的查询意图，从提供的数据中找出相关信息并给出准确的回答。
你只能回答与提供的数据相关的问题，对于超出数据范围的问题，你需要礼貌地拒绝回答。

分析原则：
1. 直接回答：直接给出用户想要的结果，不要过多解释
2. 数据准确：确保计算和统计的准确性
3. 简明扼要：使用简洁的语言表达结果
4. 灵活查询：支持多维度的数据查询和分析
5. 严格限制：只能回答数据集内的问题，拒绝回答超出范围的问题

注意事项：
- 所有表单都是系统自动生成的编号，不需要考虑编号的合理性
- 如果涉及金额，保留两位小数
- 如果涉及日期，使用标准格式
- 输出表单编号，订单号的时候，使用 <a target="_blank" href="/form/这里是表单编号">表单编号</a> 格式
- 如果数据不存在或查询条件不明确，要明确告知用户
- 如果用户询问的内容超出数据范围，要礼貱拒绝并说明原因

当前的时间是: ${new Date().toLocaleTimeString()}\n

这是你要分析的数据:\n${JSON.stringify(selectedForms)}\n\n`,
            },
            ...messages,
            userMessage,
          ],
          (chunk) => {
            setMessages((prev) => {
              const newMessages = [...prev]
              const lastMessage = newMessages[newMessages.length - 1]
              if (lastMessage.role === "assistant") {
                lastMessage.content += chunk
              }
              return [...newMessages]
            })
          },
          () => {},
          true,
          0.3
        )

        setChatCount((prev) => prev + 1)
      } catch (error) {
        console.error("Error in chat:", error)
        message.error("分析过程中发生错误")
      }
    },
    {
      errorMessage: "分析过程中发生错误",
    }
  )

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      handleSendMessage()
    }
  }

  const pageActions = (
    <div>
      <Tooltip content='对话次数' placement='left'>
        <Chip
          variant='shadow'
          size='lg'
          classNames={{
            base: "bg-gradient-to-br from-indigo-500 to-pink-500 border-small border-white/50 shadow-pink-500/30",
            content: "drop-shadow shadow-black text-white",
          }}
          startContent={<Icon icon='solar:chat-round-dots-bold' className='text-white' />}
        >
          {chatCount}
        </Chip>
      </Tooltip>
    </div>
  )

  return (
    <PageLayout title='AI 智能助手' titleIcon='hugeicons:ai-chat-02' actions={pageActions}>
      <Card className='w-full shadow-lg'>
        <CardBody className='p-4 flex flex-col gap-4'>
          <ScrollShadow className='flex-grow h-[calc(100vh-380px)] mb-4'>
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
            <div ref={messagesEndRef} />
          </ScrollShadow>

          <div className='flex flex-col gap-2'>
            {/* 数据源选择区域 */}
            <div className='flex flex-wrap gap-2 min-h-8 p-2 bg-default-100 rounded-lg'>
              {selectedTemplates.map((templateId) => {
                const template = templates.find((t) => t.id === templateId)
                return (
                  <Chip
                    key={templateId}
                    onClose={() => handleRemoveTemplate(templateId)}
                    variant='flat'
                    color='primary'
                    className='h-6'
                  >
                    {template?.title} ({template?.formCount || 0}条数据)
                  </Chip>
                )
              })}
              <Button size='sm' variant='flat' startContent={<Icon icon='mdi:plus' />} onPress={onTemplateModalOpen}>
                {selectedTemplates.length === 0 ? "选择数据源" : "添加数据源"}
              </Button>
            </div>

            {/* 输入区域 */}
            <div className='flex items-end gap-2'>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  selectedTemplates.length > 0 ? "输入分析指令，例如: '统计所有表单的状态分布'" : "请先选择数据源"
                }
                className='flex-grow'
                classNames={{
                  input: "py-2 text-medium",
                  inputWrapper: "bg-default-100",
                }}
                minRows={2}
                maxRows={4}
                isDisabled={selectedTemplates.length === 0}
                endContent={
                  <div className='flex items-center gap-2 pr-2'>
                    <Tooltip content='发送指令' placement='top'>
                      <Button
                        isIconOnly
                        className={!input || isLoading ? "" : "bg-primary"}
                        color={!input || isLoading ? "default" : "primary"}
                        isDisabled={!input || isLoading || selectedTemplates.length === 0}
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
        </CardBody>
      </Card>

      {/* 模板选择模态框 */}
      <Modal isOpen={isTemplateModalOpen} onClose={onTemplateModalClose} size='2xl' scrollBehavior='inside'>
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>选择数据源</ModalHeader>
          <ModalBody className='py-4'>
            {recentTemplates.length > 0 && (
              <div className='mb-4'>
                <h4 className='text-medium font-medium mb-2'>最近使用</h4>
                <div className='grid grid-cols-1 gap-2'>
                  {recentTemplates.map((templateId) => {
                    const template = templates.find((t) => t.id === templateId)
                    if (!template) return null
                    return (
                      <Card
                        key={template.id}
                        isPressable
                        isSelected={selectedTemplates.includes(template.id)}
                        onPress={() => handleTemplateSelection(template.id)}
                        className='border-1 border-default-200'
                      >
                        <CardBody className='p-3'>
                          <div className='flex items-center gap-2'>
                            <Icon
                              icon='mdi:file-document-outline'
                              className={selectedTemplates.includes(template.id) ? "text-primary" : "text-default-500"}
                              width={24}
                            />
                            <div className='flex-1'>
                              <div className='font-medium'>{template.title}</div>
                              <div className='text-small text-default-500'>{template.formCount || 0} 条数据</div>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}

            <h4 className='text-medium font-medium mb-2'>所有模板</h4>
            <div className='grid grid-cols-2 gap-2'>
              {templates.map((template) => (
                <Card
                  key={template.id}
                  isPressable
                  isSelected={selectedTemplates.includes(template.id)}
                  onPress={() => handleTemplateSelection(template.id)}
                  className='border-1 border-default-200'
                >
                  <CardBody className='p-3'>
                    <div className='flex items-center gap-2'>
                      <Icon
                        icon='mdi:file-document-outline'
                        className={selectedTemplates.includes(template.id) ? "text-primary" : "text-default-500"}
                        width={24}
                      />
                      <div className='flex-1'>
                        <div className='font-medium'>{template.title}</div>
                        {template.description && (
                          <div className='text-small text-default-500'>{template.description}</div>
                        )}
                        <div className='text-small text-default-500'>{template.formCount || 0} 条数据</div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </PageLayout>
  )
}

export default FormAnalysis