import { useState, useRef, useEffect } from "react"
import { useMetadata } from "@/hooks/useMetadata"
import { processReportData } from "../utils/processReportData"
import message from "@/components/Message"
import { useNavigate } from "react-router-dom"

export function useReportData(reportId: string | undefined, templateId: string | undefined) {
  const navigate = useNavigate()
  const [reportData, setReportData] = useState<any[]>([])
  const [processedData, setProcessedData] = useState<ReturnType<typeof processReportData>>({
    columns: [],
    flattenedData: [],
    originalData: [],
  })
  const processedDataRef = useRef(null)
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null)

  const { getDetail: getReportDetail, loadFilteredDetails } = useMetadata("report")
  const { loadFilteredDetails: loadFormFilteredDetails } = useMetadata("form")

  useEffect(() => {
    const loadData = async () => {
      try {
        if (reportId) {
          const report = await getReportDetail(reportId)
          const reportTemplateId = report?.data?.templateId

          if (!reportTemplateId) {
            throw new Error("报表模板ID不存在")
          }

          setCurrentTemplateId(reportTemplateId)

          const formDetails = await loadFormFilteredDetails(
            (index) => index.indexFields?.templateId === reportTemplateId
          )

          if (formDetails.length > 0) {
            const formData = formDetails.map((detail) => ({
              id: detail.id,
              ...detail.data,
            }))

            setReportData(formData)
            const processed = processReportData(formData)
            setProcessedData(processed)
            processedDataRef.current = processed
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
  }, [reportId, templateId])

  return {
    reportData,
    processedData,
    processedDataRef,
    currentTemplateId,
  }
}