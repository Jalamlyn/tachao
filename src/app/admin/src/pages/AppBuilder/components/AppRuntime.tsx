import React, { useState, useEffect } from "react"
import { AppRender } from "@/app/admin/src/pages/AppBuilder/AppRender"
import { Spinner, Chip, Button } from "@nextui-org/react"
import message from "@/components/Message"
import { Provider } from "@/provider"
import { AppContext } from "@/contexts/AppContext"
import { observer } from "mobx-react-lite"
import { appCodeStore } from "../store/appCodeStore"
import { context } from "./functionContext"
import { PermissionCheck } from "@/app/admin/src/permissions/components/PermissionCheck"
import { localDB } from "@/utils/localDB"
import { getMetadata, getPublicMetaData } from "@/service/apis/metadata"

interface AppRuntimeProps {
  appId: string
}

const AppRuntime: React.FC<AppRuntimeProps> = observer(({ appId }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [appInfo, setAppInfo] = useState<any>(null)

  useEffect(() => {
    if (!appId) {
      setError("无效的应用ID")
      setIsLoading(false)
      return
    }

    const initializeApp = async () => {
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

        setAppInfo(version.app)

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
        console.error("Error initializing app:", error)
        setError(error instanceof Error ? error.message : "应用初始化失败")
        setIsLoading(false)
      }
    }

    initializeApp()
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
        <div className='p-6 bg-danger-50 rounded-lg max-w-[600px] text-center space-y-4'>
          <h3 className='text-xl font-medium text-danger'>应用运行出错</h3>
          <p className='text-danger-600'>{error}</p>
          <p className='text-small text-foreground-500'>
            如果问题持续存在，请联系网站管理员进行修复
          </p>
          <Button
            color="primary"
            variant="flat"
            onClick={() => window.location.reload()}
          >
            重新加载
          </Button>
        </div>
      </div>
    )
  }

  const BrandMark = () => (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        userSelect: 'none',
        opacity: 0.95,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      }}
      onClick={() => window.open('https://www.mobenai.com.cn', '_blank')}
      onMouseEnter={(e) => {
        const el = e.currentTarget
        el.style.transform = 'scale(1.05) translateY(-2px)'
        el.style.opacity = '1'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.transform = 'scale(1) translateY(0)'
        el.style.opacity = '0.95'
      }}
    >
      <Chip
        variant="shadow"
        classNames={{
          base: "bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 border-small border-white/50 shadow-purple-500/30",
          content: "drop-shadow shadow-black text-white font-medium tracking-wider",
        }}
        startContent={
          <div className="w-2 h-2 rounded-full bg-white animate-pulse mr-1" />
        }
      >
        Made By 即想 AI
      </Chip>
    </div>
  )

  const content = (
    <>
      <Provider>
        <AppContext.Provider value={{ appId }}>
          <AppRender
            appId={appId}
            basename={`/app-run/${appId}`}
            onError={(error) => {
              console.error("Runtime error:", error)
              message.error(`运行错误: ${error.message}`)
            }}
          />
        </AppContext.Provider>
      </Provider>
      <BrandMark />
    </>
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

export default AppRuntime