import React, { useEffect } from "react"
import { useParams } from "react-router-dom"
import { motion } from "framer-motion"
import { aiLog } from "@/utils/AITraceLogger"
import { useReportState } from "@/pages/report/hooks/useReportState"
import { useReportData } from "@/pages/report/hooks/useReportData"
import { ReportError } from "@/pages/report/components/ReportError"
import { ReportLoading } from "@/pages/report/components/ReportLoading"
import { DynamicReportRenderer } from "@/components/DynamicReportRenderer"
import AIReportAgent from "@/service/agents/AIReportAgent"
import { processReportData } from "@/utils/processReportData"
import { ScrollShadow } from "@nextui-org/react"

const Report: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>()
  const [reportState, reportActions] = useReportState()
  const { loadReportData } = useReportData()

  useEffect(() => {
    const initializeReport = async () => {
      const traceId = aiLog.start()
      if (!reportId) {
        reportActions.setError("报表ID不能为空")
        return
      }

      reportActions.setLoading()

      try {
        // 加载报表和表单数据
        const data = await loadReportData(reportId)

        if (!data.rawConfig) {
          throw new Error("报表配置不存在")
        }

        // 配置 AIReportAgent
        AIReportAgent.configure({
          templateInfoMap: data.templateInfoMap,
        })

        // 处理表单数据
        const processedData = processReportData(data.formData)

        // 使用处理后的数据进行分析
        const analysis = await AIReportAgent.analyzeData(processedData, data.rawConfig)

        reportActions.setSuccess({
          reportConfig: data.rawConfig,
          reportData: analysis,
        })
      } catch (error) {
        reportActions.setError(error instanceof Error ? error.message : "加载报表数据失败")
      }
    }

    initializeReport()
  }, [reportId])

  if (reportState.status === "loading") {
    return <ReportLoading />
  }

  if (reportState.status === "error") {
    return <ReportError error={reportState.error!} />
  }

  if (reportState.status === "success" && (!reportState.reportConfig || !reportState.reportData)) {
    return <ReportError error='未找到报表配置或数据' />
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='container mx-auto py-8 px-4'
    >
      <div className='max-w-[1200px] mx-auto'>
        <ScrollShadow className='h-screen pb-8'>
          <DynamicReportRenderer
            code={reportState.reportConfig}
            data={reportState.reportData}
            mode="preview"
          />
        </ScrollShadow>
      </div>
    </motion.div>
  )
}

export default Report