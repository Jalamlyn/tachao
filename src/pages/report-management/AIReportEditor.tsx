import React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useMetadata } from "@/hooks/useMetadata"
import message from "@/components/Message"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import PageLayout from "@/components/PageLayout"
import AIReportAgent from "@/service/agents/AIReportAgent"
import AnalysisResult from "./components/AnalysisResult"
import ErrorBoundary from "@/components/ErrorBoundary"
import AIEditor from "@/components/AIEditor"
import { Icon } from "@iconify/react"
import { useAsyncButton } from "@/hooks/useAsyncButton"
import { Button } from "@nextui-org/react"
import DataTable from "./components/DataTable"
import SuccessModal from "./components/SuccessModal"
import { useReportData } from "./hooks/useReportData"
import { usePreviewContent } from "./hooks/usePreviewContent"
import { useMessageHandling } from "./hooks/useMessageHandling"
import { useSuccessModal } from "./hooks/useSuccessModal"
import { useEffect } from "react"

const AIReportEditor: React.FC = () => {
  const { reportId, templateId } = useParams<{ reportId: string; templateId: string }>()
  const { updateBreadcrumbs } = useBreadcrumb()
  const { create: createReport, update: updateReport } = useMetadata("report")

  const { reportData, processedData, processedDataRef, currentTemplateId } = useReportData(reportId, templateId)
  const { previewContent, setPreviewContent, previewComponent, setPreviewComponent, selectedTab, setSelectedTab, versionControl } = usePreviewContent()
  const { messages, setMessages, handleChunk } = useMessageHandling()
  const { isSuccessModalOpen, setIsSuccessModalOpen, savedReportId, setSavedReportId, handleViewReport, handleGoToReports } = useSuccessModal()

  useEffect(() => {
    updateBreadcrumbs([
      { label: "首页", href: "/we-chat-app/admin" },
      { label: "报表管理", href: "/we-chat-app/admin/reports" },
      { label: "AI 报表助手", href: `/we-chat-app/admin/reports/ai/${reportId || templateId}` },
    ])
  }, [])

  const reportAgent = {
    processCommand: async (command: string) => {
      try {
        setPreviewContent("")

        const userMessage = {
          role: "user",
          content: command,
          id: Date.now().toString(),
          timestamp: new Date().toLocaleTimeString(),
        }
        setMessages((prev) => [...prev, userMessage])

        const assistantMessage = {
          role: "assistant",
          content: "正在分析您的数据...",
          id: (Date.now() + 1).toString(),
          timestamp: new Date().toLocaleTimeString(),
        }
        setMessages((prev) => [...prev, assistantMessage])

        const currentVersion = versionControl.getCurrentVersion()

        const result = await AIReportAgent.processCommand({
          data: processedData,
          command: command,
          onChunk: (chunk) => handleChunk(chunk, previewContent, setPreviewContent, setSelectedTab),
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

  const handleCommandResult = async (result) => {
    if (result.success) {
      if (result.rawConfig) {
        versionControl.addVersion({
          rawConfig: result.rawConfig,
        })

        const analysis = await AIReportAgent.analyzeData(processedDataRef.current, result.rawConfig)

        setPreviewComponent(
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
            <AnalysisResult analysis={analysis} />
          </ErrorBoundary>
        )

        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1]
          if (lastMessage.role === "assistant") {
            return [
              ...prev.slice(0, -1),
              {
                ...lastMessage,
                content: (
                  <div className='flex items-center gap-2 text-success'>
                    <Icon icon='line-md:check-all' className='w-5 h-5' />
                    <span>分析完成</span>
                  </div>
                ),
                status: "success",
                code: {
                  preview: (
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
                      <AnalysisResult analysis={analysis} />
                    </ErrorBoundary>
                  ),
                  content: result.rawConfig,
                },
              },
            ]
          }
          return prev
        })

        setSelectedTab("preview")
      }
    }
  }

  const { isLoading: isSaving, handleClick: handleSaveReport } = useAsyncButton(
    async () => {
      if (!reportData || !versionControl.getCurrentVersion()?.rawConfig) {
        message.error("请先生成报表分析")
        return
      }

      try {
        const currentVersion = versionControl.getCurrentVersion()
        const analysis = await AIReportAgent.analyzeData(processedDataRef.current, currentVersion?.rawConfig || "")
        const reportTitle = analysis?.title || "新建报表"

        const saveData = {
          title: reportTitle,
          status: "active",
          data: {
            templateId: currentTemplateId,
            rawConfig: currentVersion?.rawConfig,
          },
          template: currentTemplateId
            ? {
                id: currentTemplateId,
                title: "模板报表",
                type: "form",
              }
            : undefined,
          indexFields: {
            templateId: currentTemplateId,
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
        messages={messages}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        onCommandResult={handleCommandResult}
        agent={reportAgent}
        versionControl={versionControl}
        renderPreview={(version) => {
          if (!version?.rawConfig) return null
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
        renderDataView={() => (
          <DataTable
            columns={processedData.columns}
            flattenedData={processedData.flattenedData}
            isLoading={!processedData.columns.length || !processedData.flattenedData.length}
          />
        )}
        renderCodeView={(version) => (
          <pre>
            <code>{previewContent || version?.rawConfig || ""}</code>
          </pre>
        )}
        showDataTab
        showCodeTab
        previewTabName='分析报表'
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