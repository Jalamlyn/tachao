import React, { useState, useEffect } from "react"
import { AppRender } from "@/components/AppRender"
import { Spinner } from "@nextui-org/react"
import message from "@/components/Message"
import { Provider } from "@/provider"
import { AppContext } from "@/contexts/AppContext"
import { PermissionCheck } from "@/permissions/components/PermissionCheck"

interface PreviewPageProps {
  appId: string
}

const PreviewPage: React.FC<PreviewPageProps> = ({ appId }) => {
  const [appCode, setAppCode] = useState<string | null>(null)

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
      <PermissionCheck resourceType="app" resourceId={appId}>
        <AppContext.Provider value={{ appId, runtimeContext: previewContext }}>
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
      </PermissionCheck>
    </Provider>
  )
}

export default PreviewPage