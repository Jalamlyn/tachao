import React, { useState, useEffect, useCallback, useRef } from "react"
import { Spinner } from "@nextui-org/react"
import { useNavigate, useParams } from "react-router-dom"
import { useMetadata } from "@/hooks/useMetadata"
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
  
  // 使用新的 Query Hooks
  const { items: queryItems, error: queryError, detail: queryDetail } = useQueryMetadata("report")
  
  // 保留原有的 useMetadata 以保证兼容性
  const { getDetail: getResourceDetail, loadFilteredDetails } = useMetadata("resource")
  const { loadFilteredDetails: loadFormFilteredDetails } = useMetadata("form")

  // 添加版本控制
  const versionControl = useVersionControl<{
    analysis: any
    code: string | null
  }>()

  useEffect(() => {
    const loadData = async () => {
      try {
        if (templateId) {
          const formDetails = await loadFormFilteredDetails((index) => index.indexFields?.templateId === templateId)

          if (formDetails.length > 0) {
            const formData = formDetails.map((detail) => ({
              id: detail.id,
              ...detail.data,
            }))

            setResourceData(formData)

            const cols = generateColumns(formData)
            const flattened = flattenData(formData)
            setColumns(cols)
            setFlattenedData(flattened)
          }
        } else if (reportId) {
          // 优先使用新的 Query Hook
          if (queryDetail) {
            setResourceData(queryDetail.data.data)
            if (Array.isArray(queryDetail.data.data) && queryDetail.data.data.length > 0) {
              const cols = generateColumns(queryDetail.data.data)
              const flattened = flattenData(queryDetail.data.data)
              setColumns(cols)
              setFlattenedData(flattened)
            }
          } else {
            // 回退到原有逻辑
            const resource = await getResourceDetail(reportId)
            if (resource && resource.data) {
              setResourceData(resource.data.data)
              if (Array.isArray(resource.data.data) && resource.data.data.length > 0) {
                const cols = generateColumns(resource.data.data)
                const flattened = flattenData(resource.data.data)
                setColumns(cols)
                setFlattenedData(flattened)
              }
            } else {
              message.error("表格加载失败")
              navigate("/we-chat-app/admin/resources")
            }
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
  }, [reportId, templateId, queryDetail])

  // ... 其余代码保持不变

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
                setPreviewContent(prevVersion.code || '')
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
            <code>{previewContent || version?.code || ''}</code>
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