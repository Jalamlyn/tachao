import { useState, useCallback } from "react"
import { PageConfig } from "@/components/common/DynamicPage"
import message from "@/components/Message"

interface PageState {
  pageConfig: PageConfig | null
  selectedDevice: string
  isLoading: boolean
  error: string | null
}

export const usePageState = () => {
  const [state, setState] = useState<PageState>({
    pageConfig: null,
    selectedDevice: "desktop",
    isLoading: false,
    error: null
  })

  const setPageConfig = useCallback((config: PageConfig | null) => {
    setState(prev => ({ ...prev, pageConfig: config }))
  }, [])

  const setSelectedDevice = useCallback((device: string) => {
    setState(prev => ({ ...prev, selectedDevice: device }))
  }, [])

  const startLoading = useCallback(() => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
  }, [])

  const stopLoading = useCallback(() => {
    setState(prev => ({ ...prev, isLoading: false }))
  }, [])

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error, isLoading: false }))
    if (error) {
      message.error(error)
    }
  }, [])

  const resetState = useCallback(() => {
    setState({
      pageConfig: null,
      selectedDevice: "desktop",
      isLoading: false,
      error: null
    })
  }, [])

  return {
    state,
    setPageConfig,
    setSelectedDevice,
    startLoading,
    stopLoading,
    setError,
    resetState
  }
}