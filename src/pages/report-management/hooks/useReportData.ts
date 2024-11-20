import { useState, useEffect } from "react"
import { useMetadata } from "@/hooks/useMetadata"
import message from "@/components/Message"

// 生成列配置
const generateColumns = (data: any[]) => {
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
}

// 扁平化数据
const flattenData = (data: any[]) => {
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
}

export function useReportData(reportId?: string, templateId?: string) {
  const [resourceData, setResourceData] = useState<any[]>([])
  const [columns, setColumns] = useState<any[]>([])
  const [flattenedData, setFlattenedData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const { getDetail: getResourceDetail, loadFilteredDetails } = useMetadata("report")
  const { loadFilteredDetails: loadFormFilteredDetails } = useMetadata("form")

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        if (templateId) {
          const formDetails = await loadFormFilteredDetails((index) => index.indexFields?.templateId === templateId)

          if (formDetails.length > 0) {
            const formData = formDetails.map((detail) => ({
              id: detail.id,
              ...detail.data,
            }))

            setResourceData(formData)

            const cols = generateColumns(formData)
            const flattened = flattenData(formData)
            setColumns(cols)
            setFlattenedData(flattened)
          }
        } else if (reportId) {
          const resource = await getResourceDetail(reportId)
          if (resource && resource.data) {
            setResourceData(resource.data.data)
            if (Array.isArray(resource.data.data) && resource.data.data.length > 0) {
              const cols = generateColumns(resource.data.data)
              const flattened = flattenData(resource.data.data)
              setColumns(cols)
              setFlattenedData(flattened)
            }
          } else {
            message.error("表格加载失败")
          }
        }
      } catch (error) {
        console.error("[loadData] Error loading data:", error)
        message.error("数据加载失败")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [reportId, templateId])

  return {
    resourceData,
    columns,
    flattenedData,
    isLoading,
  }
}