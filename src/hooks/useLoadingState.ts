import { useState, useEffect, useCallback, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

interface LoadingOptions {
  delay?: number
  minDuration?: number
  animate?: boolean
  initialState?: boolean
  suspense?: boolean
}

interface LoadingState {
  loading: boolean
  empty: boolean
  error: Error | null
  animating: boolean
}

interface LoadingStateReturn {
  state: LoadingState
  setLoading: (loading: boolean) => void
  setEmpty: (empty: boolean) => void
  setError: (error: Error | null) => void
  reset: () => void
  withLoading: <T>(promise: Promise<T>) => Promise<T>
}

/**
 * @deprecated 使用 useQueryLoadingState 替代
 * 这是传统的 loading state 实现，建议迁移到新的 React Query 实现
 */
export function useLoadingState(options: LoadingOptions = {}): LoadingStateReturn {
  const {
    delay = 200,
    minDuration = 500,
    animate = true,
    initialState = false
  } = options

  const [state, setState] = useState<LoadingState>({
    loading: initialState,
    empty: false,
    error: null,
    animating: false
  })

  const startTimeRef = useRef<number | null>(null)
  const delayTimerRef = useRef<NodeJS.Timeout>()
  const durationTimerRef = useRef<NodeJS.Timeout>()

  const setLoading = useCallback((loading: boolean) => {
    if (loading) {
      delayTimerRef.current = setTimeout(() => {
        startTimeRef.current = Date.now()
        setState(prev => ({
          ...prev,
          loading: true,
          animating: animate
        }))
      }, delay)
    } else {
      const currentDuration = startTimeRef.current ? Date.now() - startTimeRef.current : 0
      const remainingDuration = Math.max(0, minDuration - currentDuration)

      durationTimerRef.current = setTimeout(() => {
        setState(prev => ({
          ...prev,
          loading: false,
          animating: animate
        }))
        startTimeRef.current = null
      }, remainingDuration)
    }
  }, [delay, minDuration, animate])

  const setEmpty = useCallback((empty: boolean) => {
    setState(prev => ({ ...prev, empty }))
  }, [])

  const setError = useCallback((error: Error | null) => {
    setState(prev => ({ ...prev, error }))
  }, [])

  const reset = useCallback(() => {
    setState({
      loading: false,
      empty: false,
      error: null,
      animating: false
    })
    startTimeRef.current = null
  }, [])

  const withLoading = useCallback(async <T>(promise: Promise<T>): Promise<T> => {
    try {
      setLoading(true)
      const result = await promise
      if (Array.isArray(result)) {
        setEmpty(result.length === 0)
      }
      return result
    } catch (error) {
      setError(error as Error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [setLoading, setEmpty, setError])

  useEffect(() => {
    return () => {
      delayTimerRef.current && clearTimeout(delayTimerRef.current)
      durationTimerRef.current && clearTimeout(durationTimerRef.current)
    }
  }, [])

  return {
    state,
    setLoading,
    setEmpty,
    setError,
    reset,
    withLoading
  }
}

/**
 * 基于 React Query 的新版 loading state 实现
 * 提供更好的数据获取和缓存管理能力
 */
export function useQueryLoadingState<TData = unknown, TError = Error>(
  queryKey: string | readonly unknown[],
  queryFn: () => Promise<TData>,
  options: LoadingOptions = {}
) {
  const {
    delay = 200,
    minDuration = 500,
    animate = true,
    suspense = false
  } = options

  const queryClient = useQueryClient()
  const startTimeRef = useRef<number | null>(null)

  const query = useQuery({
    queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
    queryFn: async () => {
      startTimeRef.current = Date.now()
      await new Promise(resolve => setTimeout(resolve, delay))
      const result = await queryFn()
      const elapsed = Date.now() - (startTimeRef.current || 0)
      const remaining = Math.max(0, minDuration - elapsed)
      if (remaining > 0) {
        await new Promise(resolve => setTimeout(resolve, remaining))
      }
      return result
    },
    suspense
  })

  const state: LoadingState = {
    loading: query.isLoading || query.isFetching,
    empty: Array.isArray(query.data) ? query.data.length === 0 : false,
    error: query.error as Error | null,
    animating: animate && (query.isLoading || query.isFetching)
  }

  const reset = useCallback(() => {
    queryClient.removeQueries({ queryKey: Array.isArray(queryKey) ? queryKey : [queryKey] })
  }, [queryClient, queryKey])

  return {
    state,
    data: query.data,
    refetch: query.refetch,
    reset,
    query
  }
}

// 导出默认的 useLoadingState 以保持兼容性
export default useLoadingState