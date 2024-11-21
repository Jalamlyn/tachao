import { generateColumns, flattenData } from "/Users/jalam/Works/mo-repo/shata-ai-front/src/pages/report-management/utils/generateColumns"

export interface ProcessedData {
  columns: any[]
  flattenedData: any[]
  originalData: any[]
}

/**
 * 统一处理报表数据
 * @param formData 原始表单数据
 * @returns 处理后的数据结构
 */
export function processReportData(formData: any[]): ProcessedData {
  if (!formData || !Array.isArray(formData)) {
    return {
      columns: [],
      flattenedData: [],
      originalData: []
    }
  }

  const columns = generateColumns(formData)
  const flattenedData = flattenData(formData)

  return {
    columns,
    flattenedData,
    originalData: formData
  }
}