import React, { useState, useEffect } from "react"
import { Spinner } from "@nextui-org/react"
import { DynamicReportRenderer } from "../DynamicReportRenderer"
import { getMetadata } from "@/service/apis/metadata"
import message from "../Message"

interface ReportRendererWrapperProps {
  reportId: string
}

export const ReportRendererWrapper: React.FC<ReportRendererWrapperProps> = ({ reportId }) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reportData, setReportData] = useState<any>(null)
  const [formData, setFormData] = useState<any[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        // 1. 获取报表配置
        const reportResult = await getMetadata([reportId])
        if (!reportResult.data?.[0]?.value) {
          throw new Error("报表不存在")
        }
        const report = JSON.parse(reportResult.data[0].value)
        setReportData(report)

        // 2. 获取表单数据
        const formResult = await getMetadata([`form_data_${report.templateId}`])
        if (formResult.data?.[0]?.value) {
          const forms = JSON.parse(formResult.data[0].value)
          setFormData(forms)
        }
        
      } catch (err) {
        console.error("Error loading report:", err)
        setError(err instanceof Error ? err.message : "加载失败")
        message.error("加载报表失败")
      } finally {
        setLoading(false)
      }
    }

    if (reportId) {
      loadData()
    }
  }, [reportId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Spinner label="加载中..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-danger-50 rounded-lg">
        <p className="text-danger">{error}</p>
      </div>
    )
  }

  if (!reportData) {
    return null
  }

  return (
    <DynamicReportRenderer
      title={reportData.title}
      code={reportData.code}
      rawData={{
        formData: formData,
        templateInfoMap: reportData.templateInfoMap
      }}
    />
  )
}