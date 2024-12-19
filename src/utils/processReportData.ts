import { generateColumns, flattenData } from "./generateColumns"

export interface ProcessedData {
  columns: any[]
  flattenedData: any[]
  originalData: any[]
  // 添加新的数据结构
  groups: {
    [templateId: string]: {
      id: string
      title: string
      data: any[]
    }
  }
  metadata: {
    templateInfoMap: Record<string, string>
    columns: any[]
  }
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
      originalData: [],
      groups: {},
      metadata: {
        templateInfoMap: {},
        columns: [],
      },
    }
  }

  // 为每条数据添加来源标识
  const enhancedData = formData.map((item) => ({
    ...item,
    _sourceTemplateId: item.templateId,
    _sourceTemplateName: templateInfoMap[item.templateId] || `模板 ${item.templateId}`,
  }))

  // 生成原有的数据结构
  const columns = generateColumns(enhancedData)
  const flattenedData = flattenData(enhancedData)

  // 按模板ID分组数据
  const groups = enhancedData.reduce(
    (acc, item) => {
      const templateId = item.templateId
      if (!acc[templateId]) {
        acc[templateId] = {
          id: templateId,
          title: templateInfoMap[templateId] || `模板 ${templateId}`,
          data: [],
        }
      }
      acc[templateId].data.push(item)
      return acc
    },
    {} as ProcessedData["groups"]
  )

  return {
    // 保持原有的数据结构
    columns,
    flattenedData,
    originalData: enhancedData,
    // 添加新的数据结构
    groups,
    metadata: {
      templateInfoMap,
      columns,
    },
  }
}
