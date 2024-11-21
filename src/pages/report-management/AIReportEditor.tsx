import React, { useEffect } from "react"
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
import AIEditor from "@/components/AIEditor"
import { Icon } from "@iconify/react"
import { useAsyncButton } from "@/hooks/useAsyncButton"
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react"
import { useAIReport } from "./hooks/useAIReport"

const AIReportEditor: React.FC = () => {
  const navigate = useNavigate()
  const { reportId, templateId } = useParams<{ reportId: string; templateId: string }>()
  const { updateBreadcrumbs } = useBreadcrumb()
  const { create: createReport, update: updateReport } = useMetadata("report")

  const {
    messages,
    reportData,
    columns,
    previewContent,
    previewComponent,
    selectedTab,
    flattenedData,
    isSuccessModalOpen,
    savedReportId,
    currentTemplateId,
    versionControl,
    setMessages,
    setIsSuccessModalOpen,
    handleChunk,
    handleCommandResult,
    loadData,
  } = useAIReport()

  useEffect(() => {
    loadData(reportId, templateId)
  }, [reportId, templateId, loadData])

  useEffect(() => {
    updateBreadcrumbs([
      { label: "首页", href: "/we-chat-app/admin" },
      { label: "报表管理", href: "/we-chat-app/admin/reports" },
      { label: "AI 报表助手", href: `/we-chat-app/admin/reports/ai/${reportId || templateId}` },
    ])
  }, [updateBreadcrumbs, reportId, templateId])

  const reportAgent = {
    processCommand: async (command: string) => {
      try {
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

  const { isLoading: isSaving, handleClick: handleSaveReport } = useAsyncButton(
    async () => {
      if (!reportData || !versionControl.getCurrentVersion()?.analysis) {
        message.error("请先生成报表分析")
        return
      }

      try {
        const currentVersion = versionControl.getCurrentVersion()
        const reportTitle = currentVersion?.analysis?.title || "新建报表"

        const saveData = {
          title: reportTitle,
          status: "active",
          data: {
            templateId: currentTemplateId,
            analysis: currentVersion?.analysis,
            rawConfig: currentVersion?.code,
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
      isDisabled={!versionControl.getCurrentVersion()?.analysis || isSaving}
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
        renderPreview={(version) => (
          <ErrorBoundary
            onReset={() => {
              const prevVersion = versionControl.rollback()
              if (prevVersion) {
                setPreviewContent(prevVersion.code || "")
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
            <code>{previewContent || version?.code || ""}</code>
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