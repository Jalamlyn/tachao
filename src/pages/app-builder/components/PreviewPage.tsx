import React, { useState, useEffect } from "react"
import { AppRender } from "@/components/AppRender"
import { Spinner } from "@nextui-org/react"
import message from "@/components/Message"

const PreviewPage: React.FC = () => {
  const [appCode, setAppCode] = useState<string | null>(null)
  const [appId, setAppId] = useState<string | null>(null)

  // 加载应用代码
  const loadAppCode = () => {
    if (!appId) return

    const cached = localStorage.getItem(`app_cache_${appId}`)
    if (cached) {
      const appCache = JSON.parse(cached)
      setAppCode(appCache.appCode)
    }
  }

  // 初始加载 - 从 URL 参数获取 appId
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get('appId')
    if (id) {
      setAppId(id)
    }
  }, [])

  // 当 appId 变化时加载代码
  useEffect(() => {
    if (appId) {
      loadAppCode()
    }
  }, [appId])

  // 监听 localStorage 变化
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (!appId) return
      
      // 检查是否是当前应用的缓存更新
      if (e.key === `app_cache_${appId}`) {
        loadAppCode()
      }
    }

    // 添加事件监听
    window.addEventListener('storage', handleStorageChange)

    // 清理函数
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [appId])

  const handleError = (error: Error) => {
    console.error("Preview error:", error)
    message.error(`预览错误: ${error.message}`)
  }

  // 预览专用上下文
  const previewContext = {
    mockData: {},
    api: {
      getMetadata: async () => ({ data: [] }),
      setMetadata: async () => true,
    },
  }

  if (!appCode || !appId) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Spinner label='加载中...' />
      </div>
    )
  }

  return (
    <AppRender 
      code={appCode} 
      context={previewContext} 
      onError={handleError}
      basename={`/preview/${appId}`}
    />
  )
}

export default PreviewPage