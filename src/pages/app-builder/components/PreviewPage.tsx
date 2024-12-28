import React, { useState, useEffect } from "react"
import { AppRender } from "@/components/AppRender"
import { Spinner } from "@nextui-org/react"
import message from "@/components/Message"
import { Provider } from "@/provider"

export const AppContext = React.createContext(null)

const PreviewPage: React.FC = () => {
  const [appCode, setAppCode] = useState<string | null>(null)

  // 从 URL 获取 appId
  const getAppIdFromUrl = () => {
    try {
      const url = new URL(window.location.href)
      const pathSegments = url.pathname.split("/")
      const previewIndex = pathSegments.indexOf("app-preview")
      if (previewIndex !== -1 && pathSegments[previewIndex + 1]) {
        return pathSegments[previewIndex + 1]
      }
      return null
    } catch (error) {
      console.error("Error parsing URL:", error)
      return null
    }
  }

  const appId = getAppIdFromUrl()

  useEffect(() => {
    if (!appId) {
      message.error("无效的应用ID")
      return
    }

    const cached = localStorage.getItem(`app_cache_${appId}`)
    if (cached) {
      const appCache = JSON.parse(cached)
      setAppCode(appCache.appCode)
    }
  }, [appId])

  // 预览专用上下文
  const previewContext = {
    mockData: {},
    api: {
      getMetadata: async () => ({ data: [] }),
      setMetadata: async () => true,
    },
  }

  if (!appId) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <p className='text-danger'>无效的应用ID</p>
      </div>
    )
  }

  if (!appCode) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Spinner label='加载中...' />
      </div>
    )
  }

  return (
    <Provider>
      <AppContext.Provider value={{ appId }}>
        <AppRender
          appId={appId}
          basename={`/app-preview/${appId}`}
          code={appCode}
          context={previewContext}
          onError={(error) => {
            console.error("Preview error:", error)
            message.error(`预览错误: ${error.message}`)
          }}
        />
      </AppContext.Provider>
    </Provider>
  )
}

export default PreviewPage
