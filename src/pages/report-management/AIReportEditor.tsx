import React, { useState, useEffect, useCallback, useRef } from "react"
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom"
import { useMetadata } from "@/hooks/useMetadata"
import message from "@/components/Message"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import PageLayout from "@/components/PageLayout"
import AIReportAgent from "@/service/agents/AIReportAgent"
import AnalysisResult from "@/pages/report-management/components/AnalysisResult"
import ErrorBoundary from "@/components/ErrorBoundary"
import { useVersionControl } from "@/hooks/useVersionControl"
import AIEditor from "@/components/AIEditor"
import { Icon } from "@iconify/react"
import { Button } from "@nextui-org/react"
import { processReportData } from "@/utils/processReportData"
import { Message } from "@/pages/report-management/types"
import SuccessModal from "@/pages/report-management/components/SuccessModal"
import VersionSelectModal from "@/components/VersionSelectModal"
import { EmptyAnalysisState, EmptyCodeState } from "./components/EmptyState"
import { getRenderDataView } from "./renderDataView"
import { useSave } from "./hooks/useSave"
import { useCommandResult } from "./hooks/useCommandResult"
import { useLoadData } from "./hooks/useLoadData"
import { useAgent } from "./hooks/useAgent"

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
  const accumulatedTextRef = useRef("")
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

  const { reportAgent } = useAgent(
    accumulatedTextRef,
    setMessages,
    previewContent,
    setSelectedTab,
    setPreviewContent,
    versionControl,
    processedData,
    reportId
  )

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
      { label: "首页", href: "/we-chat-app/admin" },
      { label: "报表管理", href: "/we-chat-app/admin/reports" },
      { label: "AI 报表助手", href: `/we-chat-app/admin/reports/ai/${reportId || templateId}` },
    ])
  }, [])

  const handleCodeEditResult = async (result: any) => {
    if (result.success && result.rawConfig) {
      try {
        // 分析数据
        const analysis = await AIReportAgent.analyzeData(processedData, result.rawConfig)

        // 更新预览
        setPreviewComponent(
          <ErrorBoundary>
            <AnalysisResult analysis={analysis} />
          </ErrorBoundary>
        )

        // 更新内容
        setPreviewContent(result.rawConfig)

        // 切换到预览标签
        setSelectedTab("preview")
      } catch (error) {
        console.error("分析数据失败:", error)
        message.error("分析数据失败")
      }
    }
  }

  const handleCommandResult = useCommandResult(
    versionControl,
    processedDataRef,
    setPreviewComponent,
    setPreviewContent,
    AnalysisResult,
    setMessages,
    setSelectedTab,
    processedData
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
    setIsVersionSelectModalOpen,
    updateReport,
    createReport
  )

  const handleViewReport = () => {
    if (savedReportId) {
      window.open(`/report/${savedReportId}`, "_blank")
    }
  }

  const handleGoToReports = () => {
    navigate("/we-chat-app/admin/reports")
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
    <PageLayout title='AI 报表助手' titleIcon='hugeicons:ai-chat-02' className='p-0' actions={pageActions}>
      <AIEditor
        parseConfig={async (code) => {
          // 使用报表的解析方法
          return await AIReportAgent.analyzeData(processedData, code)
        }}
        imageUpload={false}
        messages={messages}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        onCommandResult={handleCodeEditResult}
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
                  AIReportAgent.analyzeData(processedDataRef.current, prevVersion.rawConfig || "")
                    .then((analysis) => {
                      setPreviewComponent(<AnalysisResult analysis={analysis} />)
                    })
                    .catch((error) => {
                      message.error("分析数据失败")
                      console.error(error)
                    })
                }
              }}
            >
              {previewComponent}
            </ErrorBoundary>
          )
        }}
        renderDataView={getRenderDataView(
          templateInfoMap,
          currentTemplateIds,
          processedData,
          reportData,
          activeDataTab,
          setActiveDataTab
        )}
        renderCodeView={(version) => {
          if (!previewContent && !version?.rawConfig) {
            return <EmptyCodeState />
          }
          return (
            <pre className='p-4 bg-gray-900 text-gray-100 rounded-lg overflow-auto'>
              <code>{previewContent || version?.rawConfig || ""}</code>
            </pre>
          )
        }}
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
