import React, { useState, useEffect, useCallback } from "react"
import { ScrollShadow } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useNavigate, useParams } from "react-router-dom"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { useMetadata } from "@/hooks/useMetadata"
import message from "@/components/Message"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import PageLayout from "@/components/PageLayout"
import MessageCard from "@/components/MessageCard"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import AIResourceAgent from "@/service/agents/AIResourceAgent"
import AnalysisResult from "./components/AnalysisResult"
import AICommandInput from "@/components/AICommandInput"

// 导入头像
import mo2 from "/assets/mo-2.png"
import user from "/assets/user.png"

interface Message {
  role: "user" | "assistant"
  content: React.ReactNode
  id: string
  timestamp: string
  status?: "success" | "error"
}

const AIResourceEditor: React.FC = () => {
  const navigate = useNavigate()
  const { resourceId } = useParams<{ resourceId: string }>()
  const { updateBreadcrumbs } = useBreadcrumb()
  const [messages, setMessages] = useState<Message[]>([])
  const [resourceData, setResourceData] = useState<any[]>([])
  const [columns, setColumns] = useState<any[]>([])

  const { getDetail: getResourceDetail } = useMetadata("resource")

  useEffect(() => {
    const loadResourceData = async () => {
      if (resourceId) {
        try {
          const resource = await getResourceDetail(resourceId)
          if (resource && resource.data) {
            setResourceData(resource.data)
            if (Array.isArray(resource.data) && resource.data.length > 0) {
              const firstRow = resource.data[0]
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

  // 构造 AI 代理对象
  const resourceAgent = {
    processCommand: async (command: string, onChunk?: (chunk: string) => void) => {
      try {
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
          onChunk: (chunk: string) => {
            onChunk?.(chunk)
            setMessages((prev) => {
              const lastMessage = prev[prev.length - 1]
              if (lastMessage.role === "assistant") {
                return [
                  ...prev.slice(0, -1),
                  {
                    ...lastMessage,
                    content: lastMessage.content + chunk,
                  },
                ]
              }
              return prev
            })
          },
        })

        return result
      } catch (error) {
        console.error("Error in chat:", error)
        message.error("分析过程中发生错误")
        throw error
      }
    }
  }

  // 处理命令结果
  const handleCommandResult = useCallback((result) => {
    if (result.success) {
      if (result.data) {
        setResourceData([...result.data])
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1]
          if (lastMessage.role === "assistant") {
            return [
              ...prev.slice(0, -1),
              {
                ...lastMessage,
                content: "✅ 数据已更新",
                status: "success",
              },
            ]
          }
          return prev
        })
      } else if (result.analysis) {
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1]
          if (lastMessage.role === "assistant") {
            return [
              ...prev.slice(0, -1),
              {
                ...lastMessage,
                content: <AnalysisResult analysis={result.analysis} />,
                status: "success",
              },
            ]
          }
          return prev
        })
      }
    } else {
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
  }, [setResourceData])

  return (
    <PageLayout title='AI 资料助手' titleIcon='hugeicons:ai-chat-02' className='p-0'>
      <div className='h-[calc(100vh-140px)] overflow-hidden'>
        <ResizablePanelGroup direction='horizontal' className='h-full'>
          <ResizablePanel defaultSize={30}>
            <div className='h-full flex flex-col'>
              <ScrollShadow className='flex-1 overflow-y-auto'>
                <div className='space-y-4 p-4'>
                  {messages.map((message) => (
                    <div key={message.id}>
                      <MessageCard
                        avatar={message.role === "assistant" ? mo2 : user}
                        message={message.content}
                        role={message.role}
                        status={message.status || "success"}
                        className='mb-4'
                      />
                    </div>
                  ))}
                </div>
              </ScrollShadow>

              <AICommandInput agent={resourceAgent} onResult={handleCommandResult} />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={70} className='bg-slate-100'>
            <div className='h-full overflow-auto p-4'>
              {resourceData ? (
                <div className='bg-white rounded-lg shadow'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {columns.map((column) => (
                          <TableHead key={column.accessorKey}>{column.header}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {resourceData.map((row: any, rowIndex: number) => (
                        <TableRow key={rowIndex}>
                          {columns.map((column) => (
                            <TableCell key={`${rowIndex}-${column.accessorKey}`}>{row[column.accessorKey]}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className='text-center py-12 text-gray-500 h-full flex flex-col justify-center items-center'>
                  <Icon icon='mdi:loading' className='w-12 h-12 mx-auto mb-4 animate-spin' />
                  <p>正在加载数据...</p>
                </div>
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </PageLayout>
  )
}

export default AIResourceEditor