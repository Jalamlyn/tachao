import React, { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { AppRender } from "@/components/AppRender"
import { Spinner } from "@nextui-org/react"
import message from "@/components/Message"

const PreviewPage: React.FC = () => {
  const [appCode, setAppCode] = useState<string | null>(null)
  const { appId } = useParams<{ appId: string }>()

  useEffect(() => {
    if (!appId) return

    const cached = localStorage.getItem(`app_cache_${appId}`)
    if (cached) {
      const appCache = JSON.parse(cached)
      setAppCode(appCache.appCode)
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

  if (!appCode) {
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