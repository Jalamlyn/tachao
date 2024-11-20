import React, { useState, useEffect, useCallback, useRef } from "react"
import { Spinner } from "@nextui-org/react"
import { useNavigate, useParams } from "react-router-dom"
import { useQueryMetadata } from "@/hooks/metadata/react-query"
import message from "@/components/Message"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import PageLayout from "@/components/PageLayout"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import AIReportAgent from "@/service/agents/AIReportAgent"
import AnalysisResult from "@/pages/report-management/components/AnalysisResult"
import ErrorBoundary from "@/components/ErrorBoundary"
import { useVersionControl } from "@/hooks/useVersionControl"
import AIEditor from "@/components/AIEditor"

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
      if (value === null || value === undefined || Array.isArray(value)) return

      if (typeof value === "object") {
        processObject(value, prefix ? `${prefix}.${key}` : key)
        return
      }

      const accessorKey = prefix ? `${prefix}.${key}` : key

      columns.push({
        header: accessorKey,
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
  const regex = /<shata-ai-code>([\s\S]*?)<\/shata-ai-code>/
  const match = content.match(regex)
  if (match) {
    return match[1].trim()
  }
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

  // 使用 React Query hooks
  const { items: formItems, error: formError, detail: formDetail } = useQueryMetadata("form")
  const { items: reportItems, error: reportError, detail: reportDetail } = useQueryMetadata("report")

  // 添加版本控制
  const versionControl = useVersionControl<{
    analysis: any
    code: string | null
  }>()

  useEffect(() => {
    const loadData = async () => {
      try {
        if (templateId && formItems) {
          const formData = formItems
            .filter((item) => item.indexFields?.templateId === templateId)
            .map((detail) => ({
              id: detail.id,
              ...detail.data,
            }))

          if (formData.length > 0) {
            setResourceData(formData)
            const cols = generateColumns(formData)
            const flattened = flattenData(formData)
            setColumns(cols)
            setFlattenedData(flattened)
          }
        } else if (reportId && reportDetail) {
          if (reportDetail.data) {
            setResourceData(reportDetail.data.data)
            if (Array.isArray(reportDetail.data.data) && reportDetail.data.data.length > 0) {
              const cols = generateColumns(reportDetail.data.data)
              const flattened = flattenData(reportDetail.data.data)
              setColumns(cols)
              setFlattenedData(flattened)
            }
          } else {
            message.error("表格加载失败")
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
  }, [reportId, templateId, formItems, reportDetail])

  const handleChunk = useCallback((chunk: string) => {
    accumulatedTextRef.current += chunk

    if (accumulatedTextRef.current.includes("<shata-ai-code>") && !previewContent) {
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
      setPreviewContent(newContent)

      if (accumulatedTextRef.current.includes("</shata-ai-code>")) {
        const code = extractShataAICode(accumulatedTextRef.current)
        if (code) {
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

  const handleCommandResult = useCallback(
    (result) => {
      if (result.success) {
        if (result.analysis) {
          // 保存新版本
          versionControl.addVersion({
            analysis: result.analysis,
            code: previewContent,
          })

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
                  preview: (
                    <ErrorBoundary
                      onReset={() => {
                        const prevVersion = versionControl.rollback()
                        if (prevVersion) {
                          setPreviewContent(prevVersion.code || "")
                          setPreviewComponent(<AnalysisResult analysis={prevVersion.analysis} />)
                        }
                      }}
                    >
                      <AnalysisResult analysis={result.analysis} />
                    </ErrorBoundary>
                  ),
                  content: originalCode,
                },
              }

              setSelectedTab("preview")
              setPreviewComponent(
                <ErrorBoundary
                  onReset={() => {
                    const prevVersion = versionControl.rollback()
                    if (prevVersion) {
                      setPreviewContent(prevVersion.code || "")
                      setPreviewComponent(<AnalysisResult analysis={prevVersion.analysis} />)
                    }
                  }}
                >
                  <AnalysisResult analysis={result.analysis} />
                </ErrorBoundary>
              )

              return [...prev.slice(0, -1), messageWithCode]
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
    },
    [previewContent, versionControl]
  )

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

  return (
    <PageLayout title='AI 报表助手' titleIcon='hugeicons:ai-chat-02' className='p-0'>
      <AIEditor
        messages={messages}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        onCommandResult={handleCommandResult}
        agent={reportAgent}
        versionControl={versionControl}
        renderPreview={(version) => (
          <ErrorBoundary
            onReset={() => {
              const prevVersion = versionControl.rollback()
              if (prevVersion) {
                setPreviewContent(prevVersion.code || "")
                setPreviewComponent(<AnalysisResult analysis={prevVersion.analysis} />)
              }
            }}
          >
            <AnalysisResult analysis={version?.analysis} />
          </ErrorBoundary>
        )}
        renderDataView={renderDataTable}
        renderCodeView={(version) => (
          <pre>
            <code>{previewContent || version?.code || ""}</code>
          </pre>
        )}
        showDataTab
        showCodeTab
        previewTabName='分析报表'
      />
    </PageLayout>
  )
}

export default AIReportEditor