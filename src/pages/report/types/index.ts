export interface ReportState {
  status: 'idle' | 'loading' | 'error' | 'success'
  error: string | null
  reportConfig: any | null
  reportData: any | null
}

export interface ReportActions {
  setLoading: () => void
  setError: (error: string) => void
  setSuccess: (data: { reportConfig: any; reportData: any }) => void
  reset: () => void
}

export interface ReportData {
  id: string
  title: string
  templateIds: string[]  // 修改为数组支持多模板
  formData: any[]
  rawConfig: string
  templateInfoMap: Record<string, string>  // 添加模板信息映射
  [key: string]: any
}

export interface ReportDetail {
  id: string
  type: string
  title: string
  status: string
  data: {
    templateIds: string[]  // 支持多模板
    rawConfig: string
  }
  versionCode: string
  modifiedBy: string
  createdAt: string
  updatedAt: string
  indexFields: {
    templateIds: string[]  // 支持多模板
    createdAt: string
    updatedAt: string
    [key: string]: any
  }
}