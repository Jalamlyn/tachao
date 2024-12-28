import React, { useEffect, useState } from "react"
import { AppRender } from "@/components/AppRender"
import { BrowserRouter } from "react-router-dom"
import { Spinner } from "@nextui-org/react"
import { getMetadata } from "@/service/apis/metadata"
import message from "@/components/Message"

interface AppRuntimeProps {
  appId: string
  permissions?: string[]
  runtimeContext?: {
    user?: any
    api?: any
  }
}

export const AppRuntime: React.FC<AppRuntimeProps> = ({ appId, permissions = [], runtimeContext = {} }) => {
  const [appCode, setAppCode] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadAppCode = async () => {
      try {
        setIsLoading(true)
        // 尝试从缓存加载
        const cached = localStorage.getItem(`app_cache_${appId}`)
        if (cached) {
          const appCache = JSON.parse(cached)
          setAppCode(appCache.appCode)
          setIsLoading(false)
          return
        }

        // 从服务器加载
        const result = await getMetadata([`app_${appId}`])
        if (result.data?.[0]?.value) {
          const appData = JSON.parse(result.data[0].value)
          setAppCode(appData.code)
        } else {
          throw new Error("应用代码不存在")
        }
      } catch (error) {
        console.error("Error loading app code:", error)
        setError(error instanceof Error ? error.message : "加载应用失败")
      } finally {
        setIsLoading(false)
      }
    }

    loadAppCode()
  }, [appId])

  const handleError = (error: Error) => {
    message.error(`运行错误: ${error.message}`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner label="加载中..." />
      </div>
    )
  }

  if (error || !appCode) {
    return (
      <div className="p-4 bg-danger-50 rounded-lg">
        <p className="text-danger">{error || "应用加载失败"}</p>
      </div>
    )
  }

  // 创建运行时上下文
  const runtimeSpecificContext = {
    // 添加运行时专用的API和功能
    permissions,
    user: runtimeContext.user,
    api: {
      ...runtimeContext.api,
      getMetadata,
    },
  }

  return (
    <BrowserRouter>
      <AppRender
        code={appCode}
        context={runtimeSpecificContext}
        onError={handleError}
      />
    </BrowserRouter>
  )
}

export default AppRuntime