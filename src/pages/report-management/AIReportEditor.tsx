// ... 其他 import 保持不变 ...

const AIReportEditor: React.FC = () => {
  // ... 其他状态和 hooks 保持不变 ...

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
                  templateInfoMap: templateInfoMap
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

      {/* ... 其他组件保持不变 ... */}
    </PageLayout>
  )
}

export default AIReportEditor