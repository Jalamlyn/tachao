import React, { useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Spinner } from "@nextui-org/react"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import PageLayout from "@/components/PageLayout"
import { useReportData } from "@/pages/report-management/AIReportEditor/hooks/useReportData"
import { useAIAnalysis } from "@/pages/report-management/AIReportEditor/hooks/useAIAnalysis"
import DataPanel from "@/pages/report-management/AIReportEditor/components/DataPanel"
import AnalysisPanel from "@/pages/report-management/AIReportEditor/components/AnalysisPanel"

const AIReportEditor: React.FC = () => {
  const navigate = useNavigate()
  const { reportId, templateId } = useParams<{ reportId: string; templateId: string }>()
  const { updateBreadcrumbs } = useBreadcrumb()

  const {
    reportData,
    columns,
    flattenedData,
    loading: dataLoading,
    loadData,
  } = useReportData()

  const {
    messages,
    previewContent,
    previewComponent,
    selectedTab,
    loading: aiLoading,
    handleCommandResult,
    processCommand,
    setSelectedTab,
  } = useAIAnalysis()

  useEffect(() => {
    updateBreadcrumbs([
      { label: "首页", href: "/we-chat-app/admin" },
      { label: "报表管理", href: "/we-chat-app/admin/reports" },
      { label: "AI 报表助手", href: `/we-chat-app/admin/reports/ai/${reportId || templateId}` },
    ])
  }, [reportId, templateId])

  useEffect(() => {
    loadData(templateId, reportId)
  }, [templateId, reportId])

  if (dataLoading) {
    return (
      <div className='text-center py-12 text-gray-500 h-full flex flex-col justify-center items-center'>
        <Spinner label='加载中...' />
      </div>
    )
  }

  return (
    <PageLayout title='AI 报表助手' titleIcon='hugeicons:ai-chat-02' className='p-0'>
      <div className='flex flex-col h-full'>
        <DataPanel 
          columns={columns}
          flattenedData={flattenedData}
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
        />
        <AnalysisPanel
          messages={messages}
          previewContent={previewContent}
          previewComponent={previewComponent}
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
          onCommandResult={handleCommandResult}
          processCommand={processCommand}
          loading={aiLoading}
        />
      </div>
    </PageLayout>
  )
}

export default AIReportEditor