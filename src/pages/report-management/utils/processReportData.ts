import { generateColumns, flattenData } from "./generateColumns"

export interface ProcessedData {
  columns: any[]
  flattenedData: any[]
  originalData: any[]
}

/**
 * 统一处理报表数据
 * @param formData 原始表单数据
 * @param templateInfoMap 模板信息映射
 * @returns 处理后的数据结构
 */
export function processReportData(formData: any[], templateInfoMap: Record<string, string> = {}): ProcessedData {
  if (!formData || !Array.isArray(formData)) {
    return {
      columns: [],
      flattenedData: [],
      originalData: []
    }
  }
  // 为每条数据添加来源标识
  const enhancedData = formData.map(item => ({
    ...item,
    _sourceTemplateId: item.templateId,
    _sourceTemplateName: templateInfoMap[item.templateId] || `模板 ${item.templateId}`
  }))

  const columns = generateColumns(enhancedData)
  const flattenedData = flattenData(enhancedData)

  return {
    columns,
    flattenedData,
    originalData: enhancedData
  }
}