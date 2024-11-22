import { useCallback } from 'react'
import { useMetadata } from '@/hooks/useMetadata'
import { aiLog } from '@/utils/AITraceLogger'
import { ReportData } from '../types'

export const useReportData = () => {
  const { getDetail: getReportDetail } = useMetadata("report", { public: true })

  const loadReportData = useCallback(async (reportId: string): Promise<ReportData> => {
    const traceId = aiLog.start()
    aiLog.log("[useReportData] Start loading report data", { reportId })

    try {
      const reportDetail = await getReportDetail(reportId)
      if (!reportDetail) {
        throw new Error("未找到报表数据")
      }

      return {
        id: reportDetail.id,
        title: reportDetail.title,
        data: reportDetail.data,
        rawConfig: reportDetail.data?.rawConfig,
      }
    } catch (error) {
      aiLog.log("[useReportData] Error loading report data", { error })
      throw error
    }
  }, [getReportDetail])

  return { loadReportData }
}