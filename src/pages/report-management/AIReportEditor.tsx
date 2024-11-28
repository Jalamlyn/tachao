// 由于文件太长，这里只展示修改的关键部分，完整代码请查看原文件

// 在 const AIReportEditor: React.FC = () => { 内部添加新的状态
const [isVersionSelectModalOpen, setIsVersionSelectModalOpen] = useState(false)
const [pendingVersionSave, setPendingVersionSave] = useState<{
  resolve: (value: void | PromiseLike<void>) => void
  reject: (reason?: any) => void
  save: (useCurrentVersion: boolean) => Promise<void>
} | null>(null)

// 修改 handleSaveReport 函数
const { isLoading: isSaving, handleClick: handleSaveReport } = useAsyncButton(
  async () => {
    if (!reportData || !versionControl.getCurrentVersion()?.rawConfig) {
      message.error("请先生成报表分析")
      return
    }

    try {
      // 检查是否在查看历史版本
      if (versionControl.currentIndex < versionControl.versions.length - 1) {
        return new Promise<void>((resolve, reject) => {
          setPendingVersionSave({
            resolve,
            reject,
            save: async (useCurrentVersion: boolean) => {
              try {
                const versionToSave = useCurrentVersion
                  ? versionControl.getCurrentVersion()
                  : versionControl.versions[versionControl.versions.length - 1].data

                if (!versionToSave) {
                  throw new Error("无效的版本数据")
                }

                const currentVersion = versionToSave
                const reportTitle = title || "新建报表"

                const saveData = {
                  title: reportTitle,
                  status: "active",
                  data: {
                    templateIds: currentTemplateIds,
                    rawConfig: currentVersion.rawConfig,
                  },
                  template:
                    currentTemplateIds.length === 1
                      ? {
                          id: currentTemplateIds[0],
                          title: reportTitle,
                          type: "form",
                        }
                      : undefined,
                  indexFields: {
                    templateIds: currentTemplateIds,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  },
                }

                let result
                if (reportId) {
                  result = await updateReport(reportId, saveData)
                } else {
                  result = await createReport(saveData)
                }

                if (result) {
                  setSavedReportId(result.id)
                  setIsSuccessModalOpen(true)
                  resolve()
                  return result
                } else {
                  throw new Error("保存报表失败")
                }
              } catch (error) {
                reject(error)
              }
            },
          })
          setIsVersionSelectModalOpen(true)
        })
      }

      // 如果不是历史版本，使用当前版本保存
      const currentVersion = versionControl.getCurrentVersion()
      const reportTitle = title || "新建报表"

      const saveData = {
        title: reportTitle,
        status: "active",
        data: {
          templateIds: currentTemplateIds,
          rawConfig: currentVersion?.rawConfig,
        },
        template:
          currentTemplateIds.length === 1
            ? {
                id: currentTemplateIds[0],
                title: reportTitle,
                type: "form",
              }
            : undefined,
        indexFields: {
          templateIds: currentTemplateIds,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }

      let result
      if (reportId) {
        result = await updateReport(reportId, saveData)
      } else {
        result = await createReport(saveData)
      }

      if (result) {
        setSavedReportId(result.id)
        setIsSuccessModalOpen(true)
        return result
      } else {
        throw new Error("保存报表失败")
      }
    } catch (error) {
      console.error("保存报表失败:", error)
      throw error
    }
  },
  {
    errorMessage: "保存报表失败",
  }
)

// 添加版本选择处理函数
const handleVersionSelectConfirm = async (useCurrentVersion: boolean) => {
  if (pendingVersionSave) {
    try {
      await pendingVersionSave.save(useCurrentVersion)
    } catch (error) {
      pendingVersionSave.reject(error)
    }
    setPendingVersionSave(null)
  }
  setIsVersionSelectModalOpen(false)
}

const handleVersionSelectCancel = () => {
  if (pendingVersionSave) {
    pendingVersionSave.reject(new Error("用户取消选择版本"))
    setPendingVersionSave(null)
  }
  setIsVersionSelectModalOpen(false)
}

// 在 return 语句中添加 VersionSelectModal 组件
return (
  <PageLayout title='AI 报表助手' titleIcon='hugeicons:ai-chat-02' className='p-0' actions={pageActions}>
    <AIEditor
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
      renderDataView={renderDataView}
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