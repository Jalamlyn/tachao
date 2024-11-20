import React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import PageLayout from "@/components/PageLayout"
import ErrorBoundary from "@/components/ErrorBoundary"
import AIEditor from "@/components/AIEditor"
import { useAIReport } from "./hooks/useAIReport"
import { useReportData } from "./hooks/useReportData"
import { ReportDataTable } from "./components/ReportDataTable"
import { AIReportTabs, AIReportTab } from "./components/AIReportTabs"
import AnalysisResult from "./components/AnalysisResult"

const AIReportEditor: React.FC = () => {
  const navigate = useNavigate()
  const { reportId, templateId } = useParams<{ reportId: string; templateId: string }>()
  const { updateBreadcrumbs } = useBreadcrumb()

  const {
    messages,
    previewContent,
    previewComponent,
    selectedTab,
    setSelectedTab,
    handleCommandResult,
    reportAgent,
    versionControl,
  } = useAIReport()

  const { resourceData, columns, flattenedData, isLoading } = useReportData(reportId, templateId)

  React.useEffect(() => {
    updateBreadcrumbs([
      { label: "首页", href: "/we-chat-app/admin" },
      { label: "报表管理", href: "/we-chat-app/admin/reports" },
      { label: "AI 报表助手", href: `/we-chat-app/admin/reports/ai/${reportId || templateId}` },
    ])
  }, [reportId, templateId])

  const renderDataTable = () => (
    <ReportDataTable columns={columns} data={flattenedData} isLoading={isLoading} />
  )

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