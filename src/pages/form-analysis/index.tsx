import React, { useState, useEffect } from "react"
import { Card, CardBody, Button, Modal, ModalContent, ModalHeader, ModalBody } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useFormMetadata } from "@/hooks/useFormMetadata"
import message from "@/components/Message"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import PageLayout from "@/components/PageLayout"
import { useAsyncButton } from "@/hooks/useAsyncButton"
import { useMetadata } from "@/hooks/useMetadata"
import chatChunk from "@/service/chat/chat-chunk-openai-office"
import Sidebar from "./components/chat/Sidebar"
import ChatArea from "./components/chat/ChatArea"
import { useChatStore } from "./store/useChatStore"

const welcomeMessage = {
  role: "assistant" as const,
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
  const {
    currentSession,
    setCurrentSession,
    isTemplateModalOpen,
    setTemplateModalOpen,
    isSidebarOpen,
    setSidebarOpen,
    useSessions,
    useCreateSession,
    useUpdateSession,
  } = useChatStore()

  const { sessions, isLoading: isLoadingSessions } = useSessions()
  const { createSession, isCreating } = useCreateSession()
  const { updateSession, isUpdating } = useUpdateSession()

  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([])
  const [templates, setTemplates] = useState<any[]>([])
  const [recentTemplates, setRecentTemplates] = useState<string[]>([])

  const { fetchForms } = useFormMetadata()
  const { load: loadTemplates } = useMetadata("template")
  const formsRef = React.useRef(null)
  const { updateBreadcrumbs } = useBreadcrumb()

  useEffect(() => {
    async function fetchData() {
      try {
        const templatesResult = await loadTemplates()
        const forms = await fetchForms()

        if (templatesResult) {
          const templatesWithCount = templatesResult.map((template) => ({
            ...template,
            formCount: forms.filter((form) => form.template?.id === template.id).length,
          }))
          setTemplates(templatesWithCount)
        }
        
        formsRef.current = forms

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

  const handleTemplateSelection = (templateId: string) => {
    setSelectedTemplates((prev) => {
      const newSelection = prev.includes(templateId) ? prev.filter((id) => id !== templateId) : [...prev, templateId]
      return newSelection
    })
  }

  const handleNewChat = () => {
    setTemplateModalOpen(true)
  }

  const handleCreateSession = async () => {
    if (selectedTemplates.length === 0) {
      message.warning("请先选择数据源")
      return
    }

    try {
      await createSession({
        title: `新会话 ${sessions.length + 1}`,
        selectedTemplates,
      })
    } catch (error) {
      console.error("Error creating session:", error)
      message.error("创建会话失败")
    }
  }

  const { isLoading: isSending, handleClick: handleSendMessage } = useAsyncButton(
    async (content: string) => {
      if (!currentSession) return

      const selectedForms = formsRef.current.filter((form) => 
        currentSession.selectedTemplates.includes(form.template?.id)
      )

      const userMessage = {
        role: "user" as const,
        content,
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
      }

      await updateSession(currentSession.id, userMessage)

      try {
        const assistantMessage = {
          role: "assistant" as const,
          content: "",
          id: (Date.now() + 1).toString(),
          timestamp: new Date().toLocaleTimeString(),
        }

        await updateSession(currentSession.id, assistantMessage)

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
- 如果用户询问的内容超出数据范围，要礼貌拒绝并说明原因

当前的时间是: ${new Date().toLocaleTimeString()}\n

这是你要分析的数据:\n${JSON.stringify(selectedForms)}\n\n`,
            },
            ...currentSession.messages,
            userMessage,
          ],
          async (chunk) => {
            await updateSession(currentSession.id, {
              ...assistantMessage,
              content: (assistantMessage.content || "") + chunk,
            })
          },
          () => {},
          true,
          0.3
        )
      } catch (error) {
        console.error("Error in chat:", error)
        message.error("分析过程中发生错误")
      }
    }
  )

  return (
    <PageLayout title="AI 智能助手" titleIcon="hugeicons:ai-chat-02">
      <div className="flex h-[calc(100vh-200px)]">
        <Sidebar
          isOpen={isSidebarOpen}
          sessions={sessions}
          currentSession={currentSession}
          onSessionSelect={setCurrentSession}
          onNewChat={handleNewChat}
        />

        <div className="flex-1">
          <ChatArea
            session={currentSession}
            onSendMessage={handleSendMessage}
            isLoading={isSending}
          />
        </div>
      </div>

      {/* 模板选择模态框 */}
      <Modal isOpen={isTemplateModalOpen} onClose={() => setTemplateModalOpen(false)} size="2xl" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">选择数据源</ModalHeader>
          <ModalBody className="py-4">
            {recentTemplates.length > 0 && (
              <div className="mb-4">
                <h4 className="text-medium font-medium mb-2">最近使用</h4>
                <div className="grid grid-cols-1 gap-2">
                  {recentTemplates.map((templateId) => {
                    const template = templates.find((t) => t.id === templateId)
                    if (!template) return null
                    return (
                      <Card
                        key={template.id}
                        isPressable
                        isSelected={selectedTemplates.includes(template.id)}
                        onPress={() => handleTemplateSelection(template.id)}
                        className="border-1 border-default-200"
                      >
                        <CardBody className="p-3">
                          <div className="flex items-center gap-2">
                            <Icon
                              icon="mdi:file-document-outline"
                              className={selectedTemplates.includes(template.id) ? "text-primary" : "text-default-500"}
                              width={24}
                            />
                            <div className="flex-1">
                              <div className="font-medium">{template.title}</div>
                              <div className="text-small text-default-500">{template.formCount || 0} 条数据</div>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}

            <h4 className="text-medium font-medium mb-2">所有模板</h4>
            <div className="grid grid-cols-2 gap-2">
              {templates.map((template) => (
                <Card
                  key={template.id}
                  isPressable
                  isSelected={selectedTemplates.includes(template.id)}
                  onPress={() => handleTemplateSelection(template.id)}
                  className="border-1 border-default-200"
                >
                  <CardBody className="p-3">
                    <div className="flex items-center gap-2">
                      <Icon
                        icon="mdi:file-document-outline"
                        className={selectedTemplates.includes(template.id) ? "text-primary" : "text-default-500"}
                        width={24}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{template.title}</div>
                        {template.description && (
                          <div className="text-small text-default-500">{template.description}</div>
                        )}
                        <div className="text-small text-default-500">{template.formCount || 0} 条数据</div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="light" onPress={() => setTemplateModalOpen(false)}>
                取消
              </Button>
              <Button color="primary" onPress={handleCreateSession} isLoading={isCreating}>
                创建会话
              </Button>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </PageLayout>
  )
}

export default FormAnalysis