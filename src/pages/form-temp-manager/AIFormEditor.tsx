// ... 前面的 imports 和其他代码保持不变

const AIFormEditor: React.FC = () => {
  // ... 其他状态和函数保持不变

  return (
    <PageLayout title='AI 智能表单助手' titleIcon='mdi:form-select' actions={pageActions}>
      <AIEditor
        messages={messages}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        onCommandResult={handleCommandResult}
        agent={formAgent}
        versionControl={versionControl}
        renderPreview={(version) => (
          <ErrorBoundary
            onReset={() => {
              const prevVersion = versionControl.rollback()
              if (prevVersion) {
                setFormConfig(prevVersion.formConfig)
                setRawConfig(prevVersion.rawConfig)
                setPreviewContent(prevVersion.rawConfig)
              }
            }}
          >
            <FormPreview previewMode config={version?.formConfig} />
          </ErrorBoundary>
        )}
        renderCodeView={(version) => (
          <pre>
            <code>{version?.rawConfig || ''}</code>
          </pre>
        )}
        showCodeTab
        previewTabName='表单预览'
      />
    </PageLayout>
  )
}

export default AIFormEditor