import React, { useState, useEffect, useCallback, useRef } from "react"
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom"
import { useMetadata } from "@/hooks/useMetadata"
import message from "@/components/Message"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import PageLayout from "@/app/admin/src/components/PageLayout"
import AIReportAgent from "@/service/agents/AIReportAgent"
import ErrorBoundary from "@/components/ErrorBoundary"
import { useVersionControl } from "@/hooks/useVersionControl"
import AIEditor from "@/components/AIEditor"
import { Icon } from "@iconify/react"
import { Button } from "@nextui-org/react"
import { processReportData } from "@/utils/processReportData"
import { Message } from "@/pages/report-management/types"
import SuccessModal from "@/pages/report-management/components/SuccessModal"
import VersionSelectModal from "@/components/VersionSelectModal"
import { EmptyAnalysisState } from "./components/EmptyState"
import { getRenderDataView } from "./renderDataView"
import { useSave } from "./hooks/useSave"
import { useLoadData } from "./hooks/useLoadData"
import DynamicReportRenderer from "@/components/DynamicReportRenderer"

interface TemplateInfoMap {
  [key: string]: string
}

const AIReportEditor: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { title } = location.state || {}
  const { reportId, templateId } = useParams<{ reportId: string; templateId: string }>()
  const { updateBreadcrumbs } = useBreadcrumb()
  const [messages, setMessages] = useState<Message[]>([])
  const [reportData, setReportData] = useState<any[]>([])
  const [processedData, setProcessedData] = useState<ReturnType<typeof processReportData>>({
    columns: [],
    flattenedData: [],
    originalData: [],
  })
  const processedDataRef = useRef(null)
  const [previewContent, setPreviewContent] = useState<string>("")
  const [previewComponent, setPreviewComponent] = useState<React.ReactNode>(null)
  const [selectedTab, setSelectedTab] = useState("data")
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [savedReportId, setSavedReportId] = useState<string | null>(null)
  const [currentTemplateIds, setCurrentTemplateIds] = useState<string[]>([])
  const [activeDataTab, setActiveDataTab] = useState<string>("all")
  const [templateInfoMap, setTemplateInfoMap] = useState<TemplateInfoMap>({})
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false)
  const templateInfoMapRef = useRef<TemplateInfoMap>({})
  const lastResponseRef = useRef("")
  const { getDetail: getReportDetail } = useMetadata("report")
  const { loadFilteredDetails: loadFormFilteredDetails } = useMetadata("form")
  const { loadFilteredDetails: loadTemplateFilteredDetails } = useMetadata("template")
  const { create: createReport, update: updateReport } = useMetadata("report")

  // 新增：版本选择Modal的状态
  const [isVersionSelectModalOpen, setIsVersionSelectModalOpen] = useState(false)
  const [pendingVersionSave, setPendingVersionSave] = useState<{
    resolve: (value: void | PromiseLike<void>) => void
    reject: (reason?: any) => void
    save: (useCurrentVersion: boolean) => Promise<void>
  } | null>(null)

  // 添加版本控制
  const versionControl = useVersionControl<{
    rawConfig: string | null
  }>()

  const handleChunk = useCallback(
    (chunk: string) => {
      lastResponseRef.current += chunk
      setMessages((prev) => {
        const lastMessage = prev[prev.length - 1]
        return [
          ...prev.slice(0, -1),
          {
            ...lastMessage,
            content: lastMessage.content + chunk,
            status: chunk ? "streaming" : lastMessage.status,
          },
        ]
      })
    },
    [setMessages]
  )

  const reportAgent = {
    processCommand: async (command: string) => {
      try {
        lastResponseRef.current = ""
        const userMessage: Message = {
          role: "user",
          content: command,
          id: Date.now().toString(),
          timestamp: new Date().toLocaleTimeString(),
        }
        setMessages((prev) => [...prev, userMessage])

        const assistantMessage: Message = {
          role: "assistant",
          content: "",
          id: (Date.now() + 1).toString(),
          timestamp: new Date().toLocaleTimeString(),
          status: "thinking",
        }
        setMessages((prev) => [...prev, assistantMessage])

        // 获取当前版本的配置
        const currentVersion = versionControl.getCurrentVersion()

        const result = await AIReportAgent.processCommand({
          data: processedData,
          command: command,
          onChunk: handleChunk,
          // 如果是更新模式(有 reportId)且有现有配置,则传入 rawConfig
          ...(reportId && currentVersion?.rawConfig ? { rawConfig: currentVersion.rawConfig } : {}),
        })

        return result
      } catch (error) {
        console.error("Error in chat:", error)
        message.error("分析过程中发生错误")
        throw error
      }
    },
  }

  useLoadData(
    reportId,
    getReportDetail,
    setCurrentTemplateIds,
    loadFormFilteredDetails,
    setReportData,
    processReportData,
    templateInfoMapRef,
    setProcessedData,
    processedDataRef,
    versionControl,
    setPreviewComponent,
    setPreviewContent,
    searchParams,
    templateId,
    templateInfoMap,
    setIsLoadingTemplates,
    loadTemplateFilteredDetails,
    setTemplateInfoMap
  )

  useEffect(() => {
    updateBreadcrumbs([
      { label: "首页", href: "/admin" },
      { label: "报表管理", href: "/admin/reports" },
      { label: "AI 报表开发", href: `/admin/reports/ai/${reportId || templateId}` },
    ])
  }, [])

  const handleCommandResult = useCallback(
    async (result) => {
      if (result.success) {
        if (result.rawConfig) {
          // 保存新版本
          versionControl.addVersion({
            rawConfig: result.rawConfig,
          })

          // 设置预览组件
          setPreviewComponent(
            <ErrorBoundary
              onReset={() => {
                const prevVersion = versionControl.rollback()
                if (prevVersion) {
                  setPreviewContent(prevVersion.rawConfig || "")
                }
              }}
            >
              <DynamicReportRenderer
                title='AI 报表预览'
                code={result.rawConfig}
                rawData={{
                  formData: reportData,
                  templateInfoMap: templateInfoMap,
                }}
              />
            </ErrorBoundary>
          )
          // 更新消息状态
          setMessages((prev) => {
            const lastMessage = prev[prev.length - 1]
            if (lastMessage?.role === "assistant") {
              return [
                ...prev.slice(0, -1),
                {
                  ...lastMessage,
                  content: lastResponseRef.current,
                  status: "success",
                },
              ]
            }
            return prev
          })

          // 切换到预览标签
          setSelectedTab("preview")
        }
      }
    },
    [reportData, templateInfoMap, versionControl]
  )

  const { isLoading: isSaving, handleClick: handleSaveReport } = useSave(
    reportData,
    versionControl,
    currentTemplateIds,
    title,
    reportId,
    setSavedReportId,
    setIsSuccessModalOpen,
    setPendingVersionSave,
    setIsVersionSelectModalOpen, // 修复：传入 setIsVersionSelectModalOpen
    updateReport,
    createReport
  )

  const handleViewReport = () => {
    if (savedReportId) {
      window.open(`/report/${savedReportId}`, "_blank")
    }
  }

  const handleGoToReports = () => {
    navigate("/admin/reports")
  }

  // 新增：处理版本选择确认
  const handleVersionSelectConfirm = async (useCurrentVersion: boolean) => {
    if (pendingVersionSave) {
      try {
        await pendingVersionSave.save(useCurrentVersion)
        pendingVersionSave.resolve()
        setIsVersionSelectModalOpen(false) // 只在成功时关闭Modal
      } catch (error) {
        pendingVersionSave.reject(error)
        // 出错时不关闭Modal,让用户可以看到错误并重试
      } finally {
        setPendingVersionSave(null)
      }
    }
  }

  // 新增：处理版本选择取消
  const handleVersionSelectCancel = () => {
    if (pendingVersionSave) {
      pendingVersionSave.reject(new Error("用户取消选择版本"))
      setPendingVersionSave(null)
    }
    setIsVersionSelectModalOpen(false)
  }

  const pageActions = (
    <Button
      color='primary'
      onClick={handleSaveReport}
      isDisabled={!versionControl.getCurrentVersion()?.rawConfig || isSaving}
      isLoading={isSaving}
      startContent={<Icon icon='mdi:content-save' className='w-4 h-4 mr-2' />}
    >
      {reportId ? "更新报表" : "保存报表"}
    </Button>
  )
  return (
    <PageLayout title='AI 报表开发' titleIcon='mdi:form-select' className='p-0' actions={pageActions}>
      <AIEditor
        parseConfig={async (code) => ({ code })}
        imageUpload={false}
        messages={messages}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        onCommandResult={handleCommandResult}
        agent={reportAgent}
        versionControl={versionControl}
        renderPreview={(version) => {
          if (!version?.rawConfig) {
            return <EmptyAnalysisState />
          }
          return (
            <ErrorBoundary
              onReset={() => {
                const prevVersion = versionControl.rollback()
                if (prevVersion) {
                  setPreviewContent(prevVersion.rawConfig || "")
                }
              }}
            >
              <DynamicReportRenderer
                code={version.rawConfig}
                rawData={{
                  formData: reportData,
                  templateInfoMap: templateInfoMap,
                }}
              />
            </ErrorBoundary>
          )
        }}
        renderDataView={getRenderDataView(
          templateInfoMapRef,
          templateInfoMap,
          currentTemplateIds,
          processedData,
          reportData,
          activeDataTab,
          setActiveDataTab
        )}
        showDataTab
        showCodeTab
        previewTabName='分析报表'
      />

      {/* 版本选择Modal */}
      <VersionSelectModal
        isOpen={isVersionSelectModalOpen}
        onClose={handleVersionSelectCancel}
        onConfirm={handleVersionSelectConfirm}
        currentVersionIndex={versionControl.currentIndex}
        latestVersionIndex={versionControl.versions.length - 1}
      />

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        onViewReport={handleViewReport}
        onGoToReports={handleGoToReports}
      />
    </PageLayout>
  )
}

export default AIReportEditor
