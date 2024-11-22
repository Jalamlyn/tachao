import { useState, useEffect } from "react"
import { useVersionControl } from "@/hooks/useVersionControl"
import AIReportAgent from "@/service/agents/AIReportAgent"
import message from "@/components/Message"
import AnalysisResult from "../components/AnalysisResult"
import ErrorBoundary from "@/components/ErrorBoundary"
import React from "react"

export function usePreviewContent() {
  const [previewContent, setPreviewContent] = useState<string>("")
  const [previewComponent, setPreviewComponent] = useState<React.ReactNode>(null)
  const [selectedTab, setSelectedTab] = useState("data")

  const versionControl = useVersionControl<{
    rawConfig: string | null
  }>()

  useEffect(() => {
    const currentVersion = versionControl.getCurrentVersion()
    if (currentVersion?.rawConfig) {
      setPreviewContent(currentVersion.rawConfig)
      AIReportAgent.analyzeData(null, currentVersion.rawConfig)
        .then((analysis) => {
          setPreviewComponent(
            <ErrorBoundary
              onReset={() => {
                const prevVersion = versionControl.rollback()
                if (prevVersion) {
                  setPreviewContent(prevVersion.rawConfig || "")
                  AIReportAgent.analyzeData(null, prevVersion.rawConfig || "")
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

  return {
    previewContent,
    setPreviewContent,
    previewComponent,
    setPreviewComponent,
    selectedTab,
    setSelectedTab,
    versionControl,
  }
}