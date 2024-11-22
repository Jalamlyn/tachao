import { useState } from 'react'
import { ReportState, ReportActions } from '../types'

export const useReportState = (): [ReportState, ReportActions] => {
  const [state, setState] = useState<ReportState>({
    status: 'idle',
    error: null,
    reportConfig: null,
    reportData: null
  })

  const actions: ReportActions = {
    setLoading: () => setState(prev => ({ ...prev, status: 'loading', error: null })),
    setError: (error) => setState(prev => ({ ...prev, status: 'error', error })),
    setSuccess: (data) => setState(prev => ({
      ...prev,
      status: 'success',
      ...data,
      error: null
    })),
    reset: () => setState({
      status: 'idle',
      error: null,
      reportConfig: null,
      reportData: null
    })
  }

  return [state, actions]
}