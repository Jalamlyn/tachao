import { useCallback } from 'react'
import { useMetadata } from '@/hooks/useMetadata'
import { aiLog } from '@/utils/AITraceLogger'
import { ReportData, ReportDetail } from '@/pages/report/types'

export const useReportData = () => {
  const { getDetail: getReportDetail } = useMetadata("report", { public: true })
  const { loadFilteredDetails: loadFormFilteredDetails } = useMetadata("form", { public: true })

  const loadReportData = useCallback(async (reportId: string): Promise<ReportData> => {
    const traceId = aiLog.start()
    aiLog.log("[useReportData] Start loading report data", { reportId })

    try {
      // 1. 加载报表详情
      const reportDetail = await getReportDetail(reportId) as ReportDetail
      if (!reportDetail) {
        throw new Error("未找到报表数据")
      }

      // 2. 获取模板ID数组
      const templateIds = reportDetail.data?.templateIds
      if (!templateIds?.length) {
        throw new Error("未找到模板ID")
      }

      // 3. 加载所有模板的表单数据
      const formDetails = await loadFormFilteredDetails(
        (index) => templateIds.includes(index.indexFields?.templateId)
      )

      // 4. 处理表单数据
      const formData = formDetails.map((detail) => ({
        id: detail.id,
        templateId: detail.indexFields?.templateId, // 保留模板ID用于数据源识别
        ...detail.data,
      }))

      aiLog.log("[useReportData] Data loaded successfully", {
        templateCount: templateIds.length,
        formCount: formData.length
      })

      return {
        id: reportDetail.id,
        title: reportDetail.title,
        templateIds: templateIds,
        formData: formData,
        rawConfig: reportDetail.data?.rawConfig,
      }
    } catch (error) {
      aiLog.log("[useReportData] Error loading report data", { error })
      throw error
    }
  }, [getReportDetail, loadFormFilteredDetails])

  return { loadReportData }
}