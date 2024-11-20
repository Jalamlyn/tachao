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
   * 是否处于动画过渡中
   */
  animating: boolean
  /**
   * 手动设置loading状态
   */
  setLoading: (loading: boolean) => void
  /**
   * 包装异步函数,自动处理loading状态
   */
  withLoading: <T>(promise: Promise<T>) => Promise<T>
}

export function useLoadingState(options: LoadingOptions = {}): LoadingState {
  const {
    delay = 200,
    minDuration = 500,
    animate = true,
    initialState = false
  } = options

  const [loading, setLoadingState] = useState(initialState)
  const [displayLoading, setDisplayLoading] = useState(initialState)
  const [animating, setAnimating] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)

  // 处理loading状态变化
  useEffect(() => {
    let delayTimer: NodeJS.Timeout
    let durationTimer: NodeJS.Timeout

    if (loading) {
      // 延迟显示loading
      delayTimer = setTimeout(() => {
        setStartTime(Date.now())
        setDisplayLoading(true)
        if (animate) {
          setAnimating(true)
          setTimeout(() => setAnimating(false), 300) // 动画持续时间
        }
      }, delay)
    } else {
      // 确保最小显示时间
      const currentDuration = startTime ? Date.now() - startTime : 0
      const remainingDuration = Math.max(0, minDuration - currentDuration)

      durationTimer = setTimeout(() => {
        setDisplayLoading(false)
        setStartTime(null)
        if (animate) {
          setAnimating(true)
          setTimeout(() => setAnimating(false), 300) // 动画持续时间
        }
      }, remainingDuration)
    }

    return () => {
      clearTimeout(delayTimer)
      clearTimeout(durationTimer)
    }
  }, [loading, delay, minDuration, animate, startTime])

  // 包装异步函数
  const withLoading = useCallback(async <T>(promise: Promise<T>): Promise<T> => {
    try {
      setLoadingState(true)
      return await promise
    } finally {
      setLoadingState(false)
    }
  }, [])

  return {
    loading: displayLoading,
    animating,
    setLoading: setLoadingState,
    withLoading
  }
}