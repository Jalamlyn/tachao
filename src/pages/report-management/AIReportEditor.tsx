import React, { useState, useEffect, useCallback, useRef } from "react"
import { Spinner } from "@nextui-org/react"
import { useNavigate, useParams } from "react-router-dom"
import { useMetadata } from "@/hooks/useMetadata"
import message from "@/components/Message"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import PageLayout from "@/components/PageLayout"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import AIReportAgent from "@/service/agents/AIReportAgent"
import AnalysisResult from "./components/AnalysisResult"
import ErrorBoundary from "@/components/ErrorBoundary"
import { useVersionControl } from "@/hooks/useVersionControl"
import AIEditor from "@/components/AIEditor"
import { Icon } from "@iconify/react"
import { useAsyncButton } from "@/hooks/useAsyncButton"
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react"
import { generateColumns, flattenData, extractShataAICode } from "./utils/generateColumns"
import { Message } from "./types"

const AIReportEditor: React.FC = () => {
  const navigate = useNavigate()
  const { reportId, templateId } = useParams<{ reportId: string; templateId: string }>()
  const { updateBreadcrumbs } = useBreadcrumb()
  const [messages, setMessages] = useState<Message[]>([])
  const [reportData, setReportData] = useState<any[]>([])
  const [columns, setColumns] = useState<any[]>([])
  const [previewContent, setPreviewContent] = useState<string>("")
  const [previewComponent, setPreviewComponent] = useState<React.ReactNode>(null)
  const [selectedTab, setSelectedTab] = useState("data")
  const [flattenedData, setFlattenedData] = useState<any[]>([])
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [savedReportId, setSavedReportId] = useState<string | null>(null)
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null)

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
          const reportTemplateId = report?.data?.templateId

          if (!reportTemplateId) {
            throw new Error("报表模板ID不存在")
          }

          setCurrentTemplateId(reportTemplateId)

          // 3. 使用 templateId 获取最新的表单数据
          const formDetails = await loadFormFilteredDetails(
            (index) => index.indexFields?.templateId === reportTemplateId
          )

          if (formDetails.length > 0) {
            const formData = formDetails.map((detail) => ({
              id: detail.id,
              ...detail.data,
            }))

            // 4. 设置最新数据
            setReportData(formData)
            const cols = generateColumns(formData)
            const flattened = flattenData(formData)
            setColumns(cols)
            setFlattenedData(flattened)
          }

          // 5. 加载已有的分析结果
          if (report?.data?.rawConfig) {
            versionControl.addVersion({
              rawConfig: report.data.rawConfig,
            })

            // 使用 rawConfig 重新分析数据
            const analysis = await AIReportAgent.analyzeData(reportData, report.data.rawConfig)

            setPreviewComponent(
              <ErrorBoundary
                onReset={() => {
                  const prevVersion = versionControl.rollback()
                  if (prevVersion) {
                    setPreviewContent(prevVersion.rawConfig || "")
                    // 重新分析并设置预览
                    AIReportAgent.analyzeData(reportData, prevVersion.rawConfig || "")
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
        } else if (templateId) {
          setCurrentTemplateId(templateId)
          const formDetails = await loadFormFilteredDetails((index) => index.indexFields?.templateId === templateId)

          if (formDetails.length > 0) {
            const formData = formDetails.map((detail) => ({
              id: detail.id,
              ...detail.data,
            }))

            setReportData(formData)
            const cols = generateColumns(formData)
            const flattened = flattenData(formData)
            setColumns(cols)
            setFlattenedData(flattened)
          }
        }
      } catch (error) {
        console.error("[loadData] Error loading data:", error)
        message.error("数据加载失败")
        navigate("/we-chat-app/admin/reports")
      }
    }

    loadData()
  }, [reportId, templateId])

  useEffect(() => {
    updateBreadcrumbs([
      { label: "首页", href: "/we-chat-app/admin" },
      { label: "报表管理", href: "/we-chat-app/admin/reports" },
      { label: "AI 报表助手", href: `/we-chat-app/admin/reports/ai/${reportId || templateId}` },
    ])
  }, [])

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

        const result = await AIReportAgent.processCommand({
          data: reportData,
          command: command,
          onChunk: handleChunk,
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
          const analysis = await AIReportAgent.analyzeData(reportData, result.rawConfig)

          // 设置预览组件
          setPreviewComponent(
            <ErrorBoundary
              onReset={() => {
                const prevVersion = versionControl.rollback()
                if (prevVersion) {
                  setPreviewContent(prevVersion.rawConfig || "")
                  AIReportAgent.analyzeData(reportData, prevVersion.rawConfig || "")
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
                            AIReportAgent.analyzeData(reportData, prevVersion.rawConfig || "")
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
    [reportData, versionControl]
  )

  const { isLoading: isSaving, handleClick: handleSaveReport } = useAsyncButton(
    async () => {
      if (!reportData || !versionControl.getCurrentVersion()?.rawConfig) {
        message.error("请先生成报表分析")
        return
      }

      try {
        const currentVersion = versionControl.getCurrentVersion()
        // 使用 rawConfig 重新分析数据获取标题
        const analysis = await AIReportAgent.analyzeData(reportData, currentVersion?.rawConfig || "")
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

  const handleViewReport = () => {
    if (savedReportId) {
      navigate(`/report-preview/${savedReportId}`)
    }
  }

  const handleGoToReports = () => {
    navigate("/we-chat-app/admin/reports")
  }

  const renderDataTable = () => {
    if (!columns.length || !flattenedData.length) {
      return (
        <div className='text-center py-12 text-gray-500 h-full flex flex-col justify-center items-center'>
          <Spinner label='加载中...' />
        </div>
      )
    }

    return (
      <div className='bg-white rounded-lg shadow'>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead className='min-w-24 bg-slate-50' key={column.accessorKey}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {flattenedData.map((row: any, rowIndex: number) => (
              <TableRow key={rowIndex}>
                {columns.map((column) => (
                  <TableCell key={`${rowIndex}-${column.accessorKey}`}>
                    {column.cell(row[column.accessorKey])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
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
                  // 重新分析并设置预览
                  AIReportAgent.analyzeData(reportData, prevVersion.rawConfig || "")
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
        renderDataView={renderDataTable}
        renderCodeView={(version) => (
          <pre>
            <code>{previewContent || version?.rawConfig || ""}</code>
          </pre>
        )}
        showDataTab
        showCodeTab
        previewTabName='分析报表'
      />

      <Modal isOpen={isSuccessModalOpen} onClose={() => setIsSuccessModalOpen(false)} size='lg' placement='center'>
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>
            <div className='flex items-center gap-2'>
              <Icon icon='mdi:check-circle' className='w-6 h-6 text-success' />
              <span>报表{reportId ? "更新" : "保存"}成功</span>
            </div>
          </ModalHeader>
          <ModalBody>
            <div className='space-y-4'>
              <p className='text-gray-600'>恭喜！您的报表已经{reportId ? "更新" : "保存"}成功。现在您可以：</p>
              <div className='flex flex-col gap-2'>
                <div className='p-4 border rounded-lg bg-gray-50'>
                  <h3 className='font-medium mb-2'>查看报表</h3>
                  <p className='text-sm text-gray-500 mb-4'>立即查看生成的报表内容和分析结果。</p>
                  <Button
                    color='primary'
                    onClick={handleViewReport}
                    startContent={<Icon icon='mdi:file-document-plus' className='w-4 h-4' />}
                  >
                    查看报表
                  </Button>
                </div>
                <div className='p-4 border rounded-lg'>
                  <h3 className='font-medium mb-2'>返回报表管理</h3>
                  <p className='text-sm text-gray-500 mb-4'>返回报表列表查看或管理您的所有报表。</p>
                  <Button
                    variant='bordered'
                    onClick={handleGoToReports}
                    startContent={<Icon icon='mdi:format-list-bulleted' className='w-4 h-4' />}
                  >
                    查看所有报表
                  </Button>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant='light' onPress={() => setIsSuccessModalOpen(false)}>
              关闭
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </PageLayout>
  )
}

export default AIReportEditor