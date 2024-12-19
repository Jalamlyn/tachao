// ... 其他 import 保持不变 ...

const AIReportEditor: React.FC = () => {
  // ... 其他状态和 hooks 保持不变 ...

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
                code={result.rawConfig}
                rawData={{
                  formData: reportData,
                  templateInfoMap: templateInfoMap
                }}
              />
            </ErrorBoundary>
          )

          // 更新消息状态
          setMessages((prev) => {
            const lastMessage = prev[prev.length - 1]
            if (lastMessage.role === "assistant") {
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

  // ... 其他代码保持不变 ...

  return (
    <PageLayout title='AI 报表开发' titleIcon='mdi:form-select' className='p-0' actions={pageActions}>
      <AIEditor
        parseConfig={async (code) => {
          // 使用 DynamicReportRenderer 来解析配置
          const processedData = processReportData(reportData)
          return new Promise((resolve) => {
            resolve({
              code,
              data: processedData
            })
          })
        }}
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