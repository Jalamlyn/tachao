import { useState, useCallback } from "react"
import { useMetadata } from "@/hooks/useMetadata"
import message from "@/components/Message"

export function useReportData() {
  const [reportData, setReportData] = useState<any[]>([])
  const [columns, setColumns] = useState<any[]>([])
  const [flattenedData, setFlattenedData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const { getDetail: getReportDetail, loadFilteredDetails } = useMetadata("report")
  const { loadFilteredDetails: loadFormFilteredDetails } = useMetadata("form")

  // 生成列配置
  const generateColumns = useCallback((data: any[]) => {
    if (!data || data.length === 0) return []

    const firstItem = data[0]
    const columns: any[] = []

    const processObject = (obj: any, prefix = "") => {
      Object.entries(obj).forEach(([key, value]) => {
        if (value === null || value === undefined || Array.isArray(value)) return

        if (typeof value === "object") {
          processObject(value, prefix ? `${prefix}.${key}` : key)
          return
        }

        const accessorKey = prefix ? `${prefix}.${key}` : key

        columns.push({
          header: accessorKey,
          accessorKey,
          cell: (value: any) => {
            if (value === null || value === undefined) return "-"
            if (typeof value === "boolean") return value ? "true" : "false"
            if (typeof value === "number") return value.toString()
            return value
          },
        })
      })
    }

    processObject(firstItem)
    return columns
  }, [])

  // 扁平化数据
  const flattenData = useCallback((data: any[]) => {
    return data.map((item) => {
      const flatItem: any = {}

      const flatten = (obj: any, prefix = "") => {
        Object.entries(obj).forEach(([key, value]) => {
          if (value === null || value === undefined || Array.isArray(value)) return

          if (typeof value === "object") {
            flatten(value, prefix ? `${prefix}.${key}` : key)
            return
          }

          const accessorKey = prefix ? `${prefix}.${key}` : key
          flatItem[accessorKey] = value
        })
      }

      flatten(item)
      return flatItem
    })
  }, [])

  const loadData = useCallback(async (templateId?: string, reportId?: string) => {
    try {
      setLoading(true)
      if (templateId) {
        const formDetails = await loadFormFilteredDetails((index) => index.indexFields?.templateId === templateId)

        if (formDetails.length > 0) {
          const formData = formDetails.map((detail) => ({
            id: detail.id,
            ...detail.data,
          }))

          setReportData(formData)
          setColumns(generateColumns(formData))
          setFlattenedData(flattenData(formData))
        }
      } else if (reportId) {
        const report = await getReportDetail(reportId)
        if (report && report.data) {
          setReportData(report.data.data)
          if (Array.isArray(report.data.data) && report.data.data.length > 0) {
            setColumns(generateColumns(report.data.data))
            setFlattenedData(flattenData(report.data.data))
          }
        } else {
          message.error("报表加载失败")
        }
      }
    } catch (error) {
      console.error("[loadData] Error loading data:", error)
      message.error("数据加载失败")
    } finally {
      setLoading(false)
    }
  }, [getReportDetail, loadFormFilteredDetails, generateColumns, flattenData])

  return {
    reportData,
    columns,
    flattenedData,
    loading,
    loadData,
  }
}