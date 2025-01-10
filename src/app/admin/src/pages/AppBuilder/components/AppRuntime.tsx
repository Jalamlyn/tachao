import React, { useState, useEffect } from "react"
import { AppRender } from "@/app/admin/src/pages/AppBuilder/AppRender"
import { Spinner } from "@nextui-org/react"
import message from "@/components/Message"
import { Provider } from "@/provider"
import { AppContext } from "@/contexts/AppContext"
import { observer } from "mobx-react-lite"
import { appCodeStore } from "../store/appCodeStore"
import { context } from "./functionContext"
import { PermissionCheck } from "@/app/admin/src/permissions/components/PermissionCheck"
import { localDB } from "@/utils/localDB"
import { getMetadata, getPublicMetaData } from "@/service/apis/metadata"

interface PreviewPageProps {
  appId: string
}

const PreviewPage: React.FC<PreviewPageProps> = observer(({ appId }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [appInfo, setAppInfo] = useState<any>(null)

  useEffect(() => {
    if (!appId) {
      setError("无效的应用ID")
      setIsLoading(false)
      return
    }

    const initializePreview = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const pAppId = appId.split("_")[2]
        const organizationId = appId.split("_")[1]
        localDB.setAppId({ id: pAppId, organizationId })
        // 1. 先设置 appId
        appCodeStore.setAppId(appId)
        // 2. 加载应用数据
        const version = await appCodeStore.loadApp(appId)
        if (!version) {
          throw new Error("Failed to load app")
        }

        setAppInfo(appInfo)

        // 3. 准备执行上下文
        // 4. 执行所有模块
        const results = await appCodeStore.executeModules(context(appId))

        // 5. 检查执行结果
        const errors = results.filter((r) => !r.success)
        if (errors.length > 0) {
          console.error("Module execution errors:", errors)
          setError("模块执行失败")
          return
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Error initializing preview:", error)
        setError(error instanceof Error ? error.message : "初始化预览失败")
        setIsLoading(false)
      }
    }

    initializePreview()
  }, [appId])

  if (!appId) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <p className='text-danger'>无效的应用ID</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Spinner label='加载中...' />
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='p-4 bg-danger-50 rounded-lg'>
          <p className='text-danger'>{error}</p>
        </div>
      </div>
    )
  }

  const content = (
    <Provider>
      <AppContext.Provider value={{ appId }}>
        <AppRender
          appId={appId}
          basename={`/app-run/${appId}`}
          onError={(error) => {
            console.error("Preview error:", error)
            message.error(`预览错误: ${error.message}`)
          }}
        />
      </AppContext.Provider>
    </Provider>
  )

  // 根据accessControl决定是否需要权限检查
  if (appInfo?.accessControl?.isPublic || appInfo?.accessControl?.requireAuth) {
    return content
  }

  // 其他情况使用权限检查组件
  return (
    <PermissionCheck resourceType='app' resourceId={appId}>
      {content}
    </PermissionCheck>
  )
})

export default PreviewPage
