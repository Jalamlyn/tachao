import { useState, useCallback } from 'react'
import type { PageConfig } from '../types/page'
import AIPageAgent from '../core/AIPageAgent'

interface UsePageGeneratorResult {
  loading: boolean
  error: string | null
  config: PageConfig | null
  generatePage: (description: string) => Promise<void>
  setConfig: (config: PageConfig | null) => void
}

/**
 * 页面生成 Hook
 */
export const usePageGenerator = (): UsePageGeneratorResult => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [config, setConfig] = useState<PageConfig | null>(null)
  
  const generatePage = useCallback(async (description: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await AIPageAgent.generatePage(description)
      
      if (response.type === 'error') {
        setError(response.error || '生成页面失败')
        setConfig(null)
      } else {
        setConfig(response.data!)
        setError(null)
      }
    } catch (err) {
      setError((err as Error).message)
      setConfig(null)
    } finally {
      setLoading(false)
    }
  }, [])
  
  return {
    loading,
    error,
    config,
    generatePage,
    setConfig
  }
}

export default usePageGenerator