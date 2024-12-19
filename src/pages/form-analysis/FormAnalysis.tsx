import React, { useState, useEffect, useRef } from "react"
import {
  Card,
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
  ButtonGroup,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useFormMetadata } from "@/components/from-templates/hook/useFormMetadata"
import message from "@/components/Message"
import MessageCard from "@/components/MessageCard"
// import chatChunk from "@/service/chat/chat-chunk-openai-office"
import chatChunk from "@/service/chat/chat-chunk-gemini-office"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import PageLayout from "@/components/PageLayout"
import { useAsyncButton } from "@/hooks/useAsyncButton"
import { useMetadata } from "@/hooks/useMetadata"
import generateSystemPrompt from "@/service/agents/prompts/form-analysis-prompt"

// 导入头像
import mo2 from "/assets/mo-2.png"
import user from "/assets/user.png"
import mermaid from "mermaid"
import { localDB } from "@/utils/localDB"
import { AI_LEVELS } from "@/components/AIEditor/type" // 引入AI级别配置

interface Template {
  id: string
  title: string
  description?: string
  formCount?: number
}

const welcomeMessage = {
  role: "assistant",
  content: `欢迎使用 AI 智能助手！

我可以帮您：
✅ 分析表单数据和统计信息
✅ 查询特定表单的详细信息
✅ 生成数据报表和趋势分析
✅ 对比不同时期的数据变化
✅ 识别异常数据和潜在问题

使用限制：
❌ 只能分析已选择的表单数据
❌ 不能修改或删除表单数据
❌ 不能预测未来数据走势
❌ 不能处理系统范围之外的查询

使用示例：
1. "统计所有表单的状态分布"
2. "分析最近一周的表单提交趋势"
3. "查找状态为待审批的表单"
4. "统计各类型表单的数量"

开始使用前，请先在上方选择需要分析的数据源。`,
  id: "welcome",
  timestamp: new Date().toLocaleTimeString(),
}

const FormAnalysis: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState("")
  const [chatCount, setChatCount] = useState(0)
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [recentTemplates, setRecentTemplates] = useState<string[]>([])
  const [selectedAILevel, setSelectedAILevel] = useState<keyof typeof AI_LEVELS>("ADVANCED") // 添加AI级别状态
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
      { label: "AI 数据分析", href: "/we-chat-app/admin/ai-assistant" },
    ])
  }, [])

  // 添加欢迎消息
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([welcomeMessage])
    }
  }, [])
  useEffect(() => {
    // 监听 chat-chunk-over 标志
    const unwatch = localDB.watchKey("chat-chunk-over", ({ value }) => {
      if (value === "YES") {
        // 消息流确实结束了，可以安全地渲染 mermaid
        setTimeout(() => {
          mermaid.initialize({
            startOnLoad: true,
            theme: "default",
            securityLevel: "loose",
          })
          mermaid
            .run({
              querySelector: ".markdown-body .mermaid",
            })
            .catch((error) => {
              console.error("Mermaid rendering error:", error)
            })
        }, 100)
      }
    })

    // 清理监听
    return () => {
      unwatch()
    }
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
              content: generateSystemPrompt(selectedForms),
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
          0.3,
          "YES",
          selectedAILevel // 将AI级别传递给chatChunk
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

  const handleAILevelChange = (level: keyof typeof AI_LEVELS) => {
    setSelectedAILevel(level)
  }

  const pageActions = (
    <div className='flex items-center gap-2'>
      <ButtonGroup variant='flat' className='gap-2 p-1 bg-default-100 rounded-lg'>
        {Object.entries(AI_LEVELS).map(([key, level]) => (
          <Tooltip content={level.description} key={key}>
            <Button
              className={`min-w-[140px] h-12 px-4 transition-all duration-200 ${
                selectedAILevel === key ? "bg-primary text-white shadow-lg scale-105" : "bg-white hover:bg-primary/10"
              }`}
              onClick={() => handleAILevelChange(key as keyof typeof AI_LEVELS)}
            >
              <div className='flex items-center gap-2'>
                <div className={`p-1.5 rounded-full ${selectedAILevel === key ? "bg-white/20" : "bg-primary/10"}`}>
                  <Icon
                    icon={level.icon}
                    className={`w-4 h-4 ${selectedAILevel === key ? "text-white" : "text-primary"}`}
                  />
                </div>
                <div className='flex flex-col items-start'>
                  <span className='font-medium'>{level.label}数据分析师</span>
                </div>
              </div>
            </Button>
          </Tooltip>
        ))}
      </ButtonGroup>
    </div>
  )

  return (
    <PageLayout title='AI 数据分析' titleIcon='hugeicons:ai-chat-02' actions={pageActions}>
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
            <div className='flex flex-wrap gap-2 min-h-8 p-2 bg-default-100 rounded-lg  items-center'>
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
              <Button size='sm' variant='light' startContent={<Icon icon='mdi:plus' />} onPress={onTemplateModalOpen}>
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
      <Modal
        isOpen={isTemplateModalOpen}
        onClose={onTemplateModalClose}
        size='4xl'
        scrollBehavior='inside'
        className='max-h-[70vh]'
      >
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
