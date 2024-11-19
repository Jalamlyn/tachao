// ... 前面的 imports 和 interfaces 保持不变

const AIReportEditor: React.FC = () => {
  // ... 其他状态和函数保持不变

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
            <code>{version?.code || ''}</code>
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