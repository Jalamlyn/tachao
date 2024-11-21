import { useState, useCallback, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useMetadata } from "@/hooks/useMetadata"
import message from "@/components/Message"
import { useVersionControl } from "@/hooks/useVersionControl"
import AIReportAgent from "@/service/agents/AIReportAgent"
import { Message } from "../types"
import { generateColumns, flattenData } from "../utils/generateColumns"

export interface UseAIReportReturn {
  messages: Message[]
  reportData: any[]
  columns: any[]
  previewContent: string
  previewComponent: React.ReactNode | null
  selectedTab: string
  flattenedData: any[]
  isSuccessModalOpen: boolean
  savedReportId: string | null
  currentTemplateId: string | null
  accumulatedTextRef: React.MutableRefObject<string>
  versionControl: ReturnType<typeof useVersionControl>
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void
  setReportData: (data: any[]) => void
  setColumns: (columns: any[]) => void
  setPreviewContent: (content: string) => void
  setPreviewComponent: (component: React.ReactNode) => void
  setSelectedTab: (tab: string) => void
  setFlattenedData: (data: any[]) => void
  setIsSuccessModalOpen: (isOpen: boolean) => void
  setSavedReportId: (id: string | null) => void
  setCurrentTemplateId: (id: string | null) => void
  handleChunk: (chunk: string) => void
  handleCommandResult: (result: any) => void
  loadData: (reportId?: string, templateId?: string) => Promise<void>
}

export function useAIReport(): UseAIReportReturn {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<Message[]>([])
  const [reportData, setReportData] = useState<any[]>([])
  const [columns, setColumns] = useState<any[]>([])
  const [previewContent, setPreviewContent] = useState<string>("")
  const [previewComponent, setPreviewComponent] = useState<React.ReactNode>(null)
  const [selectedTab, setSelectedTab] = useState("data")
  const [flattenedData, setFlattenedData] = useState<any[]>([])
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [savedReportId, setSavedReportId] = useState<string | null>(null)
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null)

  const accumulatedTextRef = useRef("")
  const { getDetail: getReportDetail, loadFilteredDetails } = useMetadata("report")
  const { loadFilteredDetails: loadFormFilteredDetails } = useMetadata("form")

  // 添加版本控制
  const versionControl = useVersionControl<{
    analysis: any
    code: string | null
  }>()

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
  }, [previewContent])

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

  const loadData = useCallback(async (reportId?: string, templateId?: string) => {
    try {
      if (reportId) {
        // 1. 先获取报表信息
        const report = await getReportDetail(reportId)

        // 2. 从报表中获取 templateId
        const reportTemplateId = report?.data?.templateId

        if (!reportTemplateId) {
          throw new Error("报表模板ID不存在")
        }

        setCurrentTemplateId(reportTemplateId)

        // 3. 使用 templateId 获取最新的表单数据
        const formDetails = await loadFormFilteredDetails(
          (index) => index.indexFields?.templateId === reportTemplateId
        )

        if (formDetails.length > 0) {
          const formData = formDetails.map((detail) => ({
            id: detail.id,
            ...detail.data,
          }))

          // 4. 设置最新数据
          setReportData(formData)
          const cols = generateColumns(formData)
          const flattened = flattenData(formData)
          setColumns(cols)
          setFlattenedData(flattened)
        }

        // 5. 加载已有的分析结果
        if (report?.data?.analysis) {
          versionControl.addVersion({
            analysis: report.data.analysis,
            code: report.data.rawConfig || null,
          })
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
              <AnalysisResult analysis={report.data.analysis} />
            </ErrorBoundary>
          )
          if (report.data.rawConfig) {
            setPreviewContent(report.data.rawConfig)
          }
        }
      } else if (templateId) {
        setCurrentTemplateId(templateId)
        const formDetails = await loadFormFilteredDetails((index) => index.indexFields?.templateId === templateId)

        if (formDetails.length > 0) {
          const formData = formDetails.map((detail) => ({
            id: detail.id,
            ...detail.data,
          }))

          setReportData(formData)
          const cols = generateColumns(formData)
          const flattened = flattenData(formData)
          setColumns(cols)
          setFlattenedData(flattened)
        }
      }
    } catch (error) {
      console.error("[loadData] Error loading data:", error)
      message.error("数据加载失败")
      navigate("/we-chat-app/admin/reports")
    }
  }, [getReportDetail, loadFormFilteredDetails, navigate, versionControl])

  return {
    messages,
    reportData,
    columns,
    previewContent,
    previewComponent,
    selectedTab,
    flattenedData,
    isSuccessModalOpen,
    savedReportId,
    currentTemplateId,
    accumulatedTextRef,
    versionControl,
    setMessages,
    setReportData,
    setColumns,
    setPreviewContent,
    setPreviewComponent,
    setSelectedTab,
    setFlattenedData,
    setIsSuccessModalOpen,
    setSavedReportId,
    setCurrentTemplateId,
    handleChunk,
    handleCommandResult,
    loadData,
  }
}