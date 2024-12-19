import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { motion } from "framer-motion"
import { useMetadata } from "@/hooks/useMetadata"
import { processReportData } from "@/utils/processReportData"
import { DynamicReportRenderer } from "@/components/DynamicReportRenderer"
import { ScrollShadow, Spinner } from "@nextui-org/react"

const Report: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reportConfig, setReportConfig] = useState<string | null>(null)
  const [formData, setFormData] = useState<any[]>([])
  const [templateInfoMap, setTemplateInfoMap] = useState<Record<string, string>>({})

  const { getDetail: getReportDetail } = useMetadata("report")
  const { loadFilteredDetails: loadFormFilteredDetails } = useMetadata("form")
  const { loadFilteredDetails: loadTemplateFilteredDetails } = useMetadata("template")

  useEffect(() => {
    const loadReportData = async () => {
      if (!reportId) {
        setError("报表ID不能为空")
        setLoading(false)
        return
      }

      try {
        // 1. 加载报表详情
        const reportDetail = await getReportDetail(reportId)
        if (!reportDetail?.data?.rawConfig) {
          throw new Error("报表配置不存在")
        }
        setReportConfig(reportDetail.data.rawConfig)

        // 2. 加载模板信息
        const templateIds = reportDetail.data.templateIds
        const templateDetails = await loadTemplateFilteredDetails((index) => templateIds.includes(index.id))
        const templateMap = templateDetails.reduce(
          (acc, template) => {
            acc[template.id] = template.title
            return acc
          },
          {} as Record<string, string>
        )
        setTemplateInfoMap(templateMap)

        // 3. 加载表单数据
        const formDetails = await loadFormFilteredDetails((index) =>
          templateIds.includes(index.indexFields?.templateId)
        )
        const rawFormData = formDetails.map((detail) => ({
          id: detail.id,
          templateId: detail.indexFields?.templateId,
          ...detail.data,
        }))

        // 4. 处理数据
        const processedData = processReportData(rawFormData, templateMap)
        setFormData(processedData.originalData)
      } catch (error) {
        setError(error instanceof Error ? error.message : "加载报表数据失败")
      } finally {
        setLoading(false)
      }
    }

    loadReportData()
  }, [reportId])

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Spinner label='加载中...' />
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex items-center justify-center min-h-screen text-danger'>
        <p>{error}</p>
      </div>
    )
  }

  if (!reportConfig || !formData.length) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <p>未找到报表数据</p>
      </div>
    )
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
            code={reportConfig}
            rawData={{
              formData,
              templateInfoMap,
            }}
          />
        </ScrollShadow>
      </div>
    </motion.div>
  )
}

export default Report
