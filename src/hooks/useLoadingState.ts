import { useState, useEffect, useCallback } from 'react'

interface LoadingOptions {
  /**
   * 延迟显示loading的时间(ms)
   * 如果加载在这个时间内完成,则不显示loading状态
   */
  delay?: number
  /**
   * loading状态的最小显示时间(ms)
   * 确保loading状态至少显示这么长时间
   */
  minDuration?: number
  /**
   * 是否启用动画效果
   */
  animate?: boolean
  /**
   * 初始loading状态
   */
  initialState?: boolean
}

interface LoadingState {
  /**
   * 是否显示loading状态
   */
  loading: boolean
  /**
   * 是否为空状态
   */
  empty: boolean
  /**
   * 错误信息
   */
  error: Error | null
  /**
   * 是否处于动画过渡中
   */
  animating: boolean
}

interface LoadingStateReturn {
  /**
   * 状态对象
   */
  state: LoadingState
  /**
   * 设置loading状态
   */
  setLoading: (loading: boolean) => void
  /**
   * 设置空状态
   */
  setEmpty: (empty: boolean) => void
  /**
   * 设置错误状态
   */
  setError: (error: Error | null) => void
  /**
   * 重置所有状态
   */
  reset: () => void
  /**
   * 包装异步函数，自动处理loading状态
   */
  withLoading: <T>(promise: Promise<T>) => Promise<T>
}

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
      // 延迟显示loading
      delayTimerRef.current = setTimeout(() => {
        startTimeRef.current = Date.now()
        setState(prev => ({
          ...prev,
          loading: true,
          animating: animate
        }))
      }, delay)
    } else {
      // 确保最小显示时间
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
      // 自动处理空状态
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

  // 清理定时器
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