import React, { useState, useEffect, useCallback, useRef } from "react"
import { ScrollShadow, Tabs, Tab, Spinner } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useNavigate, useParams } from "react-router-dom"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { useMetadata } from "@/hooks/useMetadata"
import message from "@/components/Message"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import PageLayout from "@/components/PageLayout"
import MessageCard from "@/components/MessageCard"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import AIReportAgent from "@/service/agents/AIReportAgent"
import AnalysisResult from "./components/AnalysisResult"
import AICommandInput from "@/components/AICommandInput"

import mo2 from "/assets/mo-2.png"
import user from "/assets/user.png"

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

// 生成列配置
const generateColumns = (data: any[]) => {
  if (!data || data.length === 0) return []

  const firstItem = data[0]
  const columns: any[] = []

  const processObject = (obj: any, prefix = "") => {
    Object.entries(obj).forEach(([key, value]) => {
      // 跳过空值和数组
      if (value === null || value === undefined || Array.isArray(value)) return

      // 处理嵌套对象
      if (typeof value === "object") {
        processObject(value, prefix ? `${prefix}.${key}` : key)
        return
      }

      const accessorKey = prefix ? `${prefix}.${key}` : key

      columns.push({
        header: accessorKey, // 直接使用key
        accessorKey,
        cell: (value: any) => {
          if (value === null || value === undefined) return "-"
          if (typeof value === "boolean") return value ? "true" : "false"
          if (typeof value === "number") return value.toString()
          return value
        },
      })
    })
  }

  processObject(firstItem)
  console.log("[generateColumns] Generated columns:", columns)
  return columns
}

// 扁平化数据
const flattenData = (data: any[]) => {
  return data.map((item) => {
    const flatItem: any = {}

    const flatten = (obj: any, prefix = "") => {
      Object.entries(obj).forEach(([key, value]) => {
        if (value === null || value === undefined || Array.isArray(value)) return

        if (typeof value === "object") {
          flatten(value, prefix ? `${prefix}.${key}` : key)
          return
        }

        const accessorKey = prefix ? `${prefix}.${key}` : key
        flatItem[accessorKey] = value
      })
    }

    flatten(item)
    return flatItem
  })
}

const extractShataAICode = (content: string) => {
  console.log("[extractShataAICode] Checking content for code")
  const regex = /<shata-ai-code>([\s\S]*?)<\/shata-ai-code>/
  const match = content.match(regex)
  if (match) {
    console.log("[extractShataAICode] Code found")
    return match[1].trim()
  }
  console.log("[extractShataAICode] No code found")
  return null
}

const AIReportEditor: React.FC = () => {
  const navigate = useNavigate()
  const { reportId, templateId } = useParams<{ reportId: string; templateId: string }>()
  const { updateBreadcrumbs } = useBreadcrumb()
  const [messages, setMessages] = useState<Message[]>([])
  const [resourceData, setResourceData] = useState<any[]>([])
  const [columns, setColumns] = useState<any[]>([])
  const [previewContent, setPreviewContent] = useState<string>("")
  const [previewComponent, setPreviewComponent] = useState<React.ReactNode>(null)
  const [selectedTab, setSelectedTab] = useState("data")
  const [flattenedData, setFlattenedData] = useState<any[]>([])

  const accumulatedTextRef = useRef("")
  const { getDetail: getResourceDetail, loadFilteredDetails } = useMetadata("resource")
  const { loadFilteredDetails: loadFormFilteredDetails } = useMetadata("form")

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("[loadData] Starting data load")

        if (templateId) {
          console.log("[loadData] Loading forms for template:", templateId)
          // 使用新的 loadFilteredDetails 方法加载数据
          const formDetails = await loadFormFilteredDetails((index) => index.indexFields?.templateId === templateId)

          if (formDetails.length > 0) {
            const formData = formDetails.map((detail) => ({
              id: detail.id,
              ...detail.data,
            }))

            console.log("[loadData] Loaded form details:", formData.length)
            setResourceData(formData)

            const cols = generateColumns(formData)
            const flattened = flattenData(formData)
            setColumns(cols)
            setFlattenedData(flattened)
            console.log("[loadData] Data processed:", {
              columnsCount: cols.length,
              rowsCount: flattened.length,
            })
          }
        } else if (reportId) {
          console.log("[loadData] Loading resource:", reportId)
          const resource = await getResourceDetail(reportId)
          if (resource && resource.data) {
            setResourceData(resource.data.data)
            if (Array.isArray(resource.data.data) && resource.data.data.length > 0) {
              const cols = generateColumns(resource.data.data)
              const flattened = flattenData(resource.data.data)
              setColumns(cols)
              setFlattenedData(flattened)
              console.log("[loadData] Resource data processed:", {
                columnsCount: cols.length,
                rowsCount: flattened.length,
              })
            }
          } else {
            message.error("资料加载失败")
            navigate("/we-chat-app/admin/resources")
          }
        }
      } catch (error) {
        console.error("[loadData] Error loading data:", error)
        message.error("数据加载失败")
        navigate("/we-chat-app/admin/resources")
      }
    }

    loadData()

    updateBreadcrumbs([
      { label: "首页", href: "/we-chat-app/admin" },
      { label: "报表管理", href: "/we-chat-app/admin/reports" },
      { label: "AI 报表助手", href: `/we-chat-app/admin/reports/ai/${reportId || templateId}` },
    ])
  }, [reportId, templateId])

  const handleChunk = useCallback((chunk: string) => {
    console.log("[handleChunk] Processing chunk:", chunk.slice(0, 50) + "...")

    accumulatedTextRef.current += chunk

    if (accumulatedTextRef.current.includes("<shata-ai-code>") && !previewContent) {
      console.log("[handleChunk] Code generation started")

      setMessages((prev) => {
        const lastMessage = prev[prev.length - 1]
        return [
          ...prev.slice(0, -1),
          {
            ...lastMessage,
            content: (
              <div className='flex items-center gap-3 text-primary'>
                <Icon icon='eos-icons:three-dots-loading' className='w-10 h-10' />
                <div className='flex flex-col'>
                  <span className='font-medium text-sm'>AI 正在生成分析代码</span>
                </div>
              </div>
            ),
          },
        ]
      })

      setSelectedTab("code")
    }

    if (previewContent || accumulatedTextRef.current.includes("<shata-ai-code>")) {
      const newContent = accumulatedTextRef.current
      console.log("[handleChunk] Updating preview content")
      setPreviewContent(newContent)

      if (accumulatedTextRef.current.includes("</shata-ai-code>")) {
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

  const reportAgent = {
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

        const result = await AIReportAgent.processCommand({
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

  const handleCommandResult = useCallback((result) => {
    console.log("[handleCommandResult] Processing result:", result)
    if (result.success) {
      if (result.analysis) {
        console.log("[handleCommandResult] Analysis result received")

        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1]
          if (lastMessage.role === "assistant") {
            const regex = /<shata-ai-code>([\s\S]*?)<\/shata-ai-code>/
            const match = lastMessage.content.toString().match(regex)
            const originalCode = match ? match[1].trim() : null

            const messageWithCode = {
              ...lastMessage,
              content: (
                <div className='flex items-center gap-2 text-success'>
                  <Icon icon='line-md:check-all' className='w-5 h-5' />
                  <span>分析完成</span>
                </div>
              ),
              status: "success",
              code: {
                preview: <AnalysisResult analysis={result.analysis} />,
                content: originalCode,
              },
            }

            setSelectedTab("analysis")
            setPreviewComponent(<AnalysisResult analysis={result.analysis} />)
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
  }, [])

  const renderDataTable = () => {
    if (!columns.length || !flattenedData.length) {
      return (
        <div className='text-center py-12 text-gray-500 h-full flex flex-col justify-center items-center'>
          <Spinner label='加载中...' />
        </div>
      )
    }

    return (
      <div className='bg-white rounded-lg shadow'>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead className='min-w-24 bg-slate-50' key={column.accessorKey}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {flattenedData.map((row: any, rowIndex: number) => (
              <TableRow key={rowIndex}>
                {columns.map((column) => (
                  <TableCell key={`${rowIndex}-${column.accessorKey}`}>
                    {column.cell(row[column.accessorKey])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  const renderAnalysisResult = () =>
    previewComponent ? (
      <div className='h-full flex flex-col'>
        <div className='flex-1 bg-white rounded-lg'>{previewComponent}</div>
      </div>
    ) : (
      <div className='flex items-center justify-center h-full text-gray-500'>
        <p>请先生成分析报表</p>
      </div>
    )

  const renderCodeView = () => {
    if (previewContent) {
      return (
        <pre>
          <code>{previewContent}</code>
        </pre>
      )
    }

    return (
      <div className='flex items-center justify-center h-full text-gray-500'>
        <p>请先生成分析报表</p>
      </div>
    )
  }

  return (
    <PageLayout title='AI 报表助手' titleIcon='hugeicons:ai-chat-02' className='p-0'>
      <div className='h-[calc(100vh-140px)] overflow-hidden'>
        <ResizablePanelGroup direction='horizontal' className='h-full p-2'>
          <ResizablePanel defaultSize={30} className='resizable-panel'>
            <div className='h-full flex flex-col'>
              <ScrollShadow className='flex-1 overflow-y-auto'>
                <div className='space-y-4'>
                  {messages.map((message) => (
                    <div key={message.id}>
                      <MessageCard
                        avatar={message.role === "assistant" ? mo2 : user}
                        message={message.content}
                        role={message.role}
                        status={message.status || "success"}
                        className='message-card'
                      />
                    </div>
                  ))}
                </div>
              </ScrollShadow>

              <AICommandInput agent={reportAgent} onResult={handleCommandResult} />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={70} className='resizable-panel bg-slate-50'>
            <div className='h-full flex flex-col'>
              <Tabs size='sm' selectedKey={selectedTab} onSelectionChange={(key) => setSelectedTab(key.toString())}>
                <Tab key='data' title='数据表格'>
                  <div className='h-[calc(100vh-260px)] overflow-auto p-2'>{renderDataTable()}</div>
                </Tab>
                <Tab key='analysis' title='分析报表'>
                  <div className='h-[calc(100vh-260px)] overflow-auto p-2'>{renderAnalysisResult()}</div>
                </Tab>
                <Tab key='code' title='代码视图'>
                  <div className='h-[calc(100vh-260px)] overflow-auto p-2'>{renderCodeView()}</div>
                </Tab>
              </Tabs>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </PageLayout>
  )
}

export default AIReportEditor
