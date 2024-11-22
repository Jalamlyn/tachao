import React, { useState, useEffect, useCallback, useRef } from "react"
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom"
import { useMetadata } from "@/hooks/useMetadata"
import message from "@/components/Message"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import PageLayout from "@/components/PageLayout"
import AIReportAgent from "@/service/agents/AIReportAgent"
import AnalysisResult from "./components/AnalysisResult"
import ErrorBoundary from "@/components/ErrorBoundary"
import { useVersionControl } from "@/hooks/useVersionControl"
import AIEditor from "@/components/AIEditor"
import { Icon } from "@iconify/react"
import { useAsyncButton } from "@/hooks/useAsyncButton"
import { Button, Tabs, Tab } from "@nextui-org/react"
import { generateColumns, flattenData, extractShataAICode } from "./utils/generateColumns"
import { processReportData } from "./utils/processReportData"
import { Message } from "./types"
import DataTable from "./components/DataTable"
import SuccessModal from "./components/SuccessModal"

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

  const accumulatedTextRef = useRef("")
  const { getDetail: getReportDetail, loadFilteredDetails } = useMetadata("report")
  const { loadFilteredDetails: loadFormFilteredDetails } = useMetadata("form")
  const { create: createReport, update: updateReport } = useMetadata("report")

  // 添加版本控制
  const versionControl = useVersionControl<{
    rawConfig: string | null
  }>()

  useEffect(() => {
    const loadData = async () => {
      try {
        if (reportId) {
          // 1. 先获取报表信息
          const report = await getReportDetail(reportId)

          // 2. 从报表中获取 templateId
          const reportTemplateIds = report?.data?.templateIds || [report?.data?.templateId]

          if (!reportTemplateIds?.length) {
            throw new Error("报表模板ID不存在")
          }

          setCurrentTemplateIds(reportTemplateIds)

          // 3. 使用 templateIds 获取最新的表单数据
          const formDetails = await loadFormFilteredDetails(
            (index) => reportTemplateIds.includes(index.indexFields?.templateId)
          )

          if (formDetails.length > 0) {
            const formData = formDetails.map((detail) => ({
              id: detail.id,
              templateId: detail.indexFields?.templateId,
              ...detail.data,
            }))

            // 4. 设置最新数据
            setReportData(formData)
            const processed = processReportData(formData)
            setProcessedData(processed)
            processedDataRef.current = processed
          }

          // 5. 加载已有的分析结果
          if (report?.data?.rawConfig) {
            versionControl.addVersion({
              rawConfig: report.data.rawConfig,
            })

            // 使用 rawConfig 重新分析数据
            const analysis = await AIReportAgent.analyzeData(processedDataRef.current, report.data.rawConfig)

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
            setPreviewContent(report.data.rawConfig)
          }
        } else {
          // 处理创建新报表的场景
          const templateIds = searchParams.get('templateIds')?.split(',') || [templateId]
          setCurrentTemplateIds(templateIds)

          const formDetails = await loadFormFilteredDetails(
            (index) => templateIds.includes(index.indexFields?.templateId)
          )

          if (formDetails.length > 0) {
            const formData = formDetails.map((detail) => ({
              id: detail.id,
              templateId: detail.indexFields?.templateId,
              ...detail.data,
            }))

            setReportData(formData)
            const processed = processReportData(formData)
            setProcessedData(processed)
            processedDataRef.current = processed
          }
        }
      } catch (error) {
        console.error("[loadData] Error loading data:", error)
        message.error("数据加载失败")
        navigate("/we-chat-app/admin/reports")
      }
    }

    loadData()
  }, [reportId, templateId, searchParams])

  useEffect(() => {
    updateBreadcrumbs([
      { label: "首页", href: "/we-chat-app/admin" },
      { label: "报表管理", href: "/we-chat-app/admin/reports" },
      { label: "AI 报表助手", href: `/we-chat-app/admin/reports/ai/${reportId || templateId}` },
    ])
  }, [])

  useEffect(() => {
    const currentVersion = versionControl.getCurrentVersion()
    if (currentVersion?.rawConfig) {
      setPreviewContent(currentVersion.rawConfig)
      AIReportAgent.analyzeData(processedDataRef.current, currentVersion.rawConfig)
        .then((analysis) => {
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
        })
        .catch((error) => {
          message.error("分析数据失败")
          console.error(error)
        })
    }
  }, [versionControl.currentIndex])

  const handleChunk = useCallback((chunk: string) => {
    accumulatedTextRef.current += chunk

    if (accumulatedTextRef.current.includes("<shata-ai-code>") && !previewContent) {
      setMessages((prev) => {
        const lastMessage = prev[prev.length - 1]
        return [
          ...prev.slice(0, -1),
          {
            ...lastMessage,
            content: (
              <div className='flex items-center gap-3 text-primary'>
                <Icon icon='eos-icons:three-dots-loading' className='w-10 h-10' />
                <div className='flex flex-col'>
                  <span className='font-medium text-sm'>AI 正在生成分析代码</span>
                </div>
              </div>
            ),
          },
        ]
      })

      setSelectedTab("code")
    }

    if (previewContent || accumulatedTextRef.current.includes("<shata-ai-code>")) {
      const newContent = accumulatedTextRef.current
      setPreviewContent(newContent)

      if (accumulatedTextRef.current.includes("</shata-ai-code>")) {
        const code = extractShataAICode(accumulatedTextRef.current)
        if (code) {
          setPreviewContent(code)
        }
      }
    } else {
      setMessages((prev) => {
        const lastMessage = prev[prev.length - 1]
        return [
          ...prev.slice(0, -1),
          {
            ...lastMessage,
            content: lastMessage.content + chunk,
          },
        ]
      })
    }
  }, [])

  const reportAgent = {
    processCommand: async (command: string) => {
      try {
        accumulatedTextRef.current = ""
        setPreviewContent("")

        const userMessage: Message = {
          role: "user",
          content: command,
          id: Date.now().toString(),
          timestamp: new Date().toLocaleTimeString(),
        }
        setMessages((prev) => [...prev, userMessage])

        const assistantMessage: Message = {
          role: "assistant",
          content: "正在分析您的数据...",
          id: (Date.now() + 1).toString(),
          timestamp: new Date().toLocaleTimeString(),
        }
        setMessages((prev) => [...prev, assistantMessage])

        // 获取当前版本的配置
        const currentVersion = versionControl.getCurrentVersion()

        const result = await AIReportAgent.processCommand({
          data: processedData,
          command: command,
          onChunk: handleChunk,
          // 如果是更新模式(有 reportId)且有现有配置,则传入 rawConfig
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

  const handleCommandResult = useCallback(
    async (result) => {
      if (result.success) {
        if (result.rawConfig) {
          // 保存新版本
          versionControl.addVersion({
            rawConfig: result.rawConfig,
          })

          // 使用 rawConfig 分析数据
          const analysis = await AIReportAgent.analyzeData(processedDataRef.current, result.rawConfig)

          // 设置预览组件
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

          // 更新消息状态
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

          // 切换到预览标签
          setSelectedTab("preview")
        }
      }
    },
    [processedData, versionControl]
  )

  const { isLoading: isSaving, handleClick: handleSaveReport } = useAsyncButton(
    async () => {
      if (!reportData || !versionControl.getCurrentVersion()?.rawConfig) {
        message.error("请先生成报表分析")
        return
      }

      try {
        const currentVersion = versionControl.getCurrentVersion()
        const reportTitle = title || "新建报表"

        const saveData = {
          title: reportTitle,
          status: "active",
          data: {
            templateIds: currentTemplateIds,
            rawConfig: currentVersion?.rawConfig,
          },
          template: currentTemplateIds.length === 1
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

  const handleViewReport = () => {
    if (savedReportId) {
      window.open(`/report/${savedReportId}`, "_blank")
    }
  }

  const handleGoToReports = () => {
    navigate("/we-chat-app/admin/reports")
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

  const renderDataView = () => {
    if (currentTemplateIds.length <= 1) {
      // 单模板场景 - 保持原有展示方式
      return (
        <DataTable
          columns={processedData.columns}
          flattenedData={processedData.flattenedData}
          isLoading={!processedData.columns.length || !processedData.flattenedData.length}
        />
      )
    }

    // 多模板场景 - 使用 Tabs 展示
    const templateData = reportData.reduce((acc, item) => {
      const templateId = item.templateId
      if (!acc[templateId]) {
        acc[templateId] = []
      }
      acc[templateId].push(item)
      return acc
    }, {})

    return (
      <Tabs 
        selectedKey={activeDataTab} 
        onSelectionChange={(key) => setActiveDataTab(key as string)}
      >
        <Tab key="all" title="全部数据">
          <DataTable
            columns={processedData.columns}
            flattenedData={processedData.flattenedData}
            isLoading={!processedData.columns.length || !processedData.flattenedData.length}
          />
        </Tab>
        {Object.entries(templateData).map(([templateId, data]) => {
          const processed = processReportData(data as any[])
          return (
            <Tab key={templateId} title={`模板 ${templateId}`}>
              <DataTable
                columns={processed.columns}
                flattenedData={processed.flattenedData}
                isLoading={!processed.columns.length || !processed.flattenedData.length}
              />
            </Tab>
          )
        })}
      </Tabs>
    )
  }

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
        renderDataView={renderDataView}
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