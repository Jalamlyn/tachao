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
  data: any
  rawConfig: string
  [key: string]: any
}