import { useCallback } from "react"
import { useMetadata } from "@/hooks/useMetadata"
import { aiLog } from "@/utils/AITraceLogger"
import { ReportData, ReportDetail } from "@/pages/report/types"
import { processReportData } from "@/utils/processReportData"

export const useReportData = () => {
  const { getDetail: getReportDetail } = useMetadata("report")
  const { loadFilteredDetails: loadFormFilteredDetails } = useMetadata("form")
  const { loadFilteredDetails: loadTemplateFilteredDetails } = useMetadata("template")

  const loadReportData = useCallback(
    async (reportId: string): Promise<ReportData> => {
      const traceId = aiLog.start()
      aiLog.log("[useReportData] Start loading report data", { reportId })

      try {
        // 1. 加载报表详情
        const reportDetail = (await getReportDetail(reportId)) as ReportDetail
        if (!reportDetail) {
          throw new Error("未找到报表数据")
        }

        // 2. 获取模板ID数组
        const templateIds = reportDetail.data?.templateIds
        if (!templateIds?.length) {
          throw new Error("未找到模板ID")
        }

        // 3. 加载模板信息
        const templateDetails = await loadTemplateFilteredDetails((index) => templateIds.includes(index.id))
        const templateInfoMap = templateDetails.reduce(
          (acc, template) => {
            acc[template.id] = template.title
            return acc
          },
          {} as Record<string, string>
        )

        // 4. 加载所有模板的表单数据
        const formDetails = await loadFormFilteredDetails((index) =>
          templateIds.includes(index.indexFields?.templateId)
        )

        // 5. 处理表单数据
        const formData = formDetails.map((detail) => ({
          id: detail.id,
          templateId: detail.indexFields?.templateId,
          ...detail.data,
        }))

        // 6. 使用 processReportData 处理数据
        const processedData = processReportData(formData, templateInfoMap)

        aiLog.log("[useReportData] Data loaded successfully", {
          templateCount: templateIds.length,
          formCount: formData.length,
        })

        // 7. 返回处理后的数据结构
        return {
          id: reportDetail.id,
          title: reportDetail.title,
          templateIds: templateIds,
          formData: processedData.originalData, // 使用处理后的原始数据
          rawConfig: reportDetail.data?.rawConfig,
          templateInfoMap: templateInfoMap
        }
      } catch (error) {
        aiLog.log("[useReportData] Error loading report data", { error })
        throw error
      }
    },
    [getReportDetail, loadFormFilteredDetails, loadTemplateFilteredDetails]
  )

  return { loadReportData }
}