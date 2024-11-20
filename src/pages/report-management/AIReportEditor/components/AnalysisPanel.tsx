import React from "react"
import AIEditor from "@/components/AIEditor"
import { useVersionControl } from "@/hooks/useVersionControl"
import ErrorBoundary from "@/components/ErrorBoundary"
import AnalysisResult from "@/pages/report-management/components/AnalysisResult"

interface AnalysisPanelProps {
  messages: any[]
  previewContent: string
  previewComponent: React.ReactNode
  selectedTab: string
  onTabChange: (tab: string) => void
  onCommandResult: (result: any) => void
  processCommand: (command: string) => Promise<any>
  loading: boolean
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  messages,
  previewContent,
  previewComponent,
  selectedTab,
  onTabChange,
  onCommandResult,
  processCommand,
  loading,
}) => {
  const versionControl = useVersionControl<{
    analysis: any
    code: string | null
  }>()

  return (
    <AIEditor
      messages={messages}
      selectedTab={selectedTab}
      onTabChange={onTabChange}
      onCommandResult={onCommandResult}
      agent={{
        processCommand,
      }}
      versionControl={versionControl}
      renderPreview={(version) => (
        <ErrorBoundary
          onReset={() => {
            const prevVersion = versionControl.rollback()
            if (prevVersion) {
              onCommandResult({
                success: true,
                analysis: prevVersion.analysis,
              })
            }
          }}
        >
          <AnalysisResult analysis={version?.analysis} />
        </ErrorBoundary>
      )}
      renderDataView={() => null}
      renderCodeView={(version) => (
        <pre>
          <code>{previewContent || version?.code || ""}</code>
        </pre>
      )}
      showDataTab
      showCodeTab
      previewTabName='分析报表'
    />
  )
}

export default AnalysisPanel