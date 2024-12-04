import ErrorBoundary from "@/components/ErrorBoundary"
import message from "@/components/Message"
import AIReportAgent from "@/service/agents/AIReportAgent"
import { useCallback, useEffect } from "react"
import { Icon } from "@iconify/react"

export const useCommandResult = (
  versionControl,
  processedDataRef,
  setPreviewComponent,
  setPreviewContent,
  AnalysisResult,
  setMessages,
  setSelectedTab,
  processedData
) => {
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

  return useCallback(
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
                  status: result.status || "success",
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
}
