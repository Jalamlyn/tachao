import React, { useState, useEffect, useCallback, useRef } from "react"
import { Tabs, Tab } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useNavigate, useParams } from "react-router-dom"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { useMetadata } from "@/hooks/useMetadata"
import message from "@/components/Message"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import PageLayout from "@/components/PageLayout"
import AIResourceAgent from "@/service/agents/AIResourceAgent"
import AICommandInput from "@/components/AICommandInput"
import MessageList from "./components/MessageList"
import DataTable from "./components/DataTable"
import CodeView from "./components/CodeView"
import AnalysisView from "./components/AnalysisView"

interface Message {
  role: "user" | "assistant"
  content: React.ReactNode
  id: string
  timestamp: string
  status?: "success" | "error"
  code?: {
    preview?: React.ReactNode
    content?: string
  }
}

const extractShataAICode = (content: string) => {
  console.log("[extractShataAICode] Checking content for code")
  const regex = /<shata-ai-resource>([\s\S]*?)<\/shata-ai-resource>/
  const match = content.match(regex)
  if (match) {
    console.log("[extractShataAICode] Code found")
    return match[1].trim()
  }
  console.log("[extractShataAICode] No code found")
  return null
}

const AIResourceEditor: React.FC = () => {
  const navigate = useNavigate()
  const { resourceId } = useParams<{ resourceId: string }>()
  const { updateBreadcrumbs } = useBreadcrumb()
  const [messages, setMessages] = useState<Message[]>([])
  const [resourceData, setResourceData] = useState<any[]>([])
  const [columns, setColumns] = useState<any[]>([])
  const [previewContent, setPreviewContent] = useState<string>("")
  const [previewComponent, setPreviewComponent] = useState<React.ReactNode>(null)
  const [selectedTab, setSelectedTab] = useState("data")

  const accumulatedTextRef = useRef("")
  const { getDetail: getResourceDetail } = useMetadata("resource")

  useEffect(() => {
    const loadResourceData = async () => {
      if (resourceId) {
        try {
          const resource = await getResourceDetail(resourceId)
          if (resource && resource.data) {
            setResourceData(resource.data.data)
            if (Array.isArray(resource.data.data) && resource.data.data.length > 0) {
              const firstRow = resource.data.data[0]
              const cols = Object.keys(firstRow).map((key) => ({
                header: key,
                accessorKey: key,
              }))
              setColumns(cols)
            }
          } else {
            message.error("资料加载失败")
            navigate("/we-chat-app/admin/resources")
          }
        } catch (error) {
          console.error("Error loading resource:", error)
          message.error("资料加载失败")
          navigate("/we-chat-app/admin/resources")
        }
      }
    }

    loadResourceData()

    updateBreadcrumbs([
      { label: "首页", href: "/we-chat-app/admin" },
      { label: "资料管理", href: "/we-chat-app/admin/resources" },
      { label: "AI 资料助手", href: `/we-chat-app/admin/resources/ai/${resourceId}` },
    ])
  }, [resourceId])

  const handleChunk = useCallback((chunk: string) => {
    console.log("[handleChunk] Processing chunk:", chunk.slice(0, 50) + "...")

    accumulatedTextRef.current += chunk

    if (accumulatedTextRef.current.includes("<shata-ai-resource>") && !previewContent) {
      console.log("[handleChunk] Code generation started")

      setMessages((prev) => {
        const lastMessage = prev[prev.length - 1]
        return [
          ...prev.slice(0, -1),
          {
            ...lastMessage,
            content: (
              <div className='flex items-center gap-3 text-primary'>
                <Icon icon='mdi:code-braces' className='animate-pulse w-5 h-5' />
                <div className='flex flex-col'>
                  <span className='font-medium'>AI 正在生成分析代码</span>
                  <span className='text-xs text-default-500'>请稍候...</span>
                </div>
              </div>
            ),
          },
        ]
      })

      setSelectedTab("code")
    }

    if (previewContent || accumulatedTextRef.current.includes("<shata-ai-resource>")) {
      const newContent = accumulatedTextRef.current
      console.log("[handleChunk] Updating preview content")
      setPreviewContent(newContent)

      if (accumulatedTextRef.current.includes("</shata-ai-resource>")) {
        console.log("[handleChunk] Code generation completed")
        const code = extractShataAICode(accumulatedTextRef.current)
        if (code) {
          console.log("[handleChunk] Setting code preview", code)
          setPreviewContent(code)
        }
      }
    } else {
      setMessages((prev) => {
        const lastMessage = prev[prev.length - 1]
        return [
          ...prev.slice(0, -1),
          {
            ...lastMessage,
            content: lastMessage.content + chunk,
          },
        ]
      })
    }
  }, [])

  const resourceAgent = {
    processCommand: async (command: string) => {
      console.log("[processCommand] Starting command processing")
      try {
        accumulatedTextRef.current = ""
        setPreviewContent("")

        const userMessage: Message = {
          role: "user",
          content: command,
          id: Date.now().toString(),
          timestamp: new Date().toLocaleTimeString(),
        }
        setMessages((prev) => [...prev, userMessage])

        const assistantMessage: Message = {
          role: "assistant",
          content: "正在分析您的数据...",
          id: (Date.now() + 1).toString(),
          timestamp: new Date().toLocaleTimeString(),
        }
        setMessages((prev) => [...prev, assistantMessage])

        const result = await AIResourceAgent.processCommand({
          data: resourceData,
          command: command,
          onChunk: handleChunk,
        })

        return result
      } catch (error) {
        console.error("Error in chat:", error)
        message.error("分析过程中发生错误")
        throw error
      }
    },
  }

  const handleCommandResult = useCallback(
    (result) => {
      console.log("[handleCommandResult] Processing result:", result)
      if (result.success) {
        if (result.analysis) {
          console.log("[handleCommandResult] Analysis result received")

          setMessages((prev) => {
            const lastMessage = prev[prev.length - 1]
            if (lastMessage.role === "assistant") {
              const regex = /<shata-ai-resource>([\s\S]*?)<\/shata-ai-resource>/
              const match = lastMessage.content.toString().match(regex)
              const originalCode = match ? match[1].trim() : null

              const messageWithCode = {
                ...lastMessage,
                content: (
                  <div className="flex items-center gap-2 text-success">
                    <Icon icon="line-md:check-all" className="w-5 h-5" />
                    <span>分析完成</span>
                  </div>
                ),
                status: "success",
                code: {
                  preview: <AnalysisView analysis={result.analysis} />,
                  content: originalCode,
                },
              }

              setSelectedTab("analysis")
              setPreviewComponent(<AnalysisView analysis={result.analysis} />)
              console.log("[handleCommandResult] Analysis completed")

              return [...prev.slice(0, -1), messageWithCode]
            }
            return prev
          })
        }
      } else {
        console.log("[handleCommandResult] Error result received")
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1]
          if (lastMessage.role === "assistant") {
            return [
              ...prev.slice(0, -1),
              {
                ...lastMessage,
                content: result.message,
                status: "error",
              },
            ]
          }
          return prev
        })
      }
    },
    []
  )

  return (
    <PageLayout title='AI 资料助手' titleIcon='hugeicons:ai-chat-02' className='p-0'>
      <div className='h-[calc(100vh-140px)] overflow-hidden'>
        <ResizablePanelGroup direction='horizontal' className='h-full p-2'>
          <ResizablePanel defaultSize={30} className='resizable-panel'>
            <div className='h-full flex flex-col'>
              <MessageList messages={messages} />
              <AICommandInput agent={resourceAgent} onResult={handleCommandResult} />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={70} className='resizable-panel bg-slate-50'>
            <div className='h-full flex flex-col'>
              <Tabs size='sm' selectedKey={selectedTab} onSelectionChange={(key) => setSelectedTab(key.toString())}>
                <Tab key='data' title='数据表格'>
                  <div className='h-[calc(100vh-260px)] overflow-auto p-2'>
                    {resourceData ? (
                      <DataTable data={resourceData} columns={columns} />
                    ) : (
                      <div className='text-center py-12 text-gray-500 h-full flex flex-col justify-center items-center'>
                        <Icon icon='mdi:loading' className='w-12 h-12 mx-auto mb-4' />
                        <p>正在加载数据...</p>
                      </div>
                    )}
                  </div>
                </Tab>
                <Tab key='analysis' title='分析报表'>
                  <div className='h-[calc(100vh-260px)] overflow-auto p-2'>
                    <AnalysisView analysis={previewComponent} />
                  </div>
                </Tab>
                <Tab key='code' title='代码视图'>
                  <div className='h-[calc(100vh-260px)] overflow-auto p-2'>
                    <CodeView content={previewContent} />
                  </div>
                </Tab>
              </Tabs>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </PageLayout>
  )
}

export default AIResourceEditor