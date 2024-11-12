import React, { useState, useEffect, useRef } from "react"
import { ScrollShadow } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useNavigate, useParams } from "react-router-dom"
import { Button, Textarea, Tabs, Tab } from "@nextui-org/react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { useMetadata } from "@/hooks/useMetadata"
import message from "@/components/Message"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import PageLayout from "@/components/PageLayout"
import { useAsyncButton } from "@/hooks/useAsyncButton"
import MessageCard from "@/components/MessageCard"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import AIResourceAgent from "@/service/agents/AIResourceAgent"
import AnalysisResult from "./components/AnalysisResult"

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
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [resourceData, setResourceData] = useState<any[]>([])
  const [columns, setColumns] = useState<any[]>([])
  const [selectedMode, setSelectedMode] = useState("modify")

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

  const getPlaceholder = () => {
    switch (selectedMode) {
      case "modify":
        return "请输入修改指令，例如：将第一行的姓名改为张三..."
      case "analyze":
        return "请输入分析需求，例如：统计所有销售金额的总和..."
      default:
        return "输入您的问题，AI 将帮您分析数据..."
    }
  }

  const { isLoading, handleClick: handleSendMessage } = useAsyncButton(
    async () => {
      if (!input.trim()) return

      const userMessage: Message = {
        role: "user",
        content: input,
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
      }
      setMessages((prev) => [...prev, userMessage])
      setInput("")

      try {
        const assistantMessage: Message = {
          role: "assistant",
          content: "正在分析您的数据...",
          id: (Date.now() + 1).toString(),
          timestamp: new Date().toLocaleTimeString(),
        }
        setMessages((prev) => [...prev, assistantMessage])

        // 添加调试日志
        console.log('Current mode:', selectedMode)
        console.log('Current resource data:', resourceData)

        const result = await AIResourceAgent.processCommand({
          data: resourceData,
          command: input,
          onChunk: (chunk: string) => {
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
          mode: selectedMode,
        })

        // 添加调试日志
        console.log('Process result:', result)

        if (result.success) {
          if (selectedMode === 'modify' && result.data) {
            // 添加调试日志
            console.log('Updating resource data:', result.data)
            
            // 修改模式: 更新资源数据
            setResourceData(result.data)
            
            // 添加调试日志
            console.log('Resource data updated')
            
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
          } else if (selectedMode === 'analyze' && result.analysis) {
            // 分析模式: 使用 AnalysisResult 组件展示结果
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
      } catch (error) {
        console.error("Error in chat:", error)
        message.error("分析过程中发生错误")
      }
    },
    {
      errorMessage: "分析过程中发生错误",
    }
  )

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

              <div className='flex flex-col gap-2 p-4 bg-white'>
                <Tabs
                  selectedKey={selectedMode}
                  onSelectionChange={(key) => setSelectedMode(key as string)}
                  size='sm'
                  color='primary'
                  variant='light'
                  classNames={{
                    tabList: "gap-4",
                    cursor: "w-full",
                    tab: "max-w-fit px-4",
                  }}
                >
                  <Tab
                    key='modify'
                    title={
                      <div className='flex items-center gap-2'>
                        <Icon icon='mdi:pencil' />
                        <span>资料修改</span>
                      </div>
                    }
                  />
                  <Tab
                    key='analyze'
                    title={
                      <div className='flex items-center gap-2'>
                        <Icon icon='mdi:chart-bar' />
                        <span>资料分析</span>
                      </div>
                    }
                  />
                </Tabs>

                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={getPlaceholder()}
                  className='flex-grow'
                  classNames={{
                    input: "py-2 text-medium",
                    inputWrapper: "bg-default-100",
                  }}
                  minRows={1}
                  maxRows={4}
                  endContent={
                    <div className='flex items-center gap-2 pr-2'>
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
                    </div>
                  }
                />
              </div>
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