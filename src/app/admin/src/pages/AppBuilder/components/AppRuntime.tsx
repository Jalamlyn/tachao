import React, { useState, useEffect } from "react"
import { AppRender } from "@/app/admin/src/pages/AppBuilder/AppRender"
import { Spinner, Chip, Button } from "@nextui-org/react"
import message from "@/components/Message"
import { AppContext } from "@/contexts/AppContext"
import { observer } from "mobx-react-lite"
import { context } from "./functionContext"
import { localDB } from "@/utils/localDB"
import { getPublicMetaData } from "@/service/apis/metadata"

interface AppRuntimeProps {
  appId: string
}

const AppRuntime: React.FC<AppRuntimeProps> = observer(({ appId }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [appInfo, setAppInfo] = useState<any>(null)

  // 新增：动态加载bundle的函数
  const loadBundles = async (urls: string[]): Promise<void> => {
    try {
      await Promise.all(
        urls.map((url) => {
          const script = document.createElement("script")
          script.src = url
          return new Promise((resolve, reject) => {
            script.onload = resolve
            script.onerror = reject
            document.head.appendChild(script)
          })
        })
      )
    } catch (error) {
      throw new Error(`Failed to load bundles: ${error}`)
    }
  }

  // 新增：执行应用函数
  const executeApp = async (modules: any, appContext: any): Promise<void> => {
    modules.forEach(({ id }) => {
      const appFunction = window[`__MO_MODULE_${id}`]
      if (!appFunction) {
        throw new Error("App function not found")
      }
      const runner = appFunction(appContext)
      runner()
    })
  }

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

        // 尝试新的加载方式
        try {
          // 1. 获取应用元数据
          const appResult = await getPublicMetaData([appId])
          if (!appResult.data?.[0]?.value) {
            throw new Error("App metadata not found")
          }

          const appData = JSON.parse(appResult.data[0].value)
          setAppInfo(appData.app)

          // 2. 检查是否有bundle URLs
          if (appData.app.bundles?.[0]?.urls) {
            // 使用新的bundle加载方式
            await loadBundles(appData.app.bundles[0].urls)
            await executeApp(appData.app.bundles[0].modules, context(appId, "runtime"))
            setIsLoading(false)
            return
          }
        } catch (bundleError) {
          console.warn("Bundle loading failed, falling back to legacy mode:", bundleError)
        }
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
          <p className='text-small text-foreground-500'>如果问题持续存在，请联系网站管理员进行修复</p>
          <Button color='primary' variant='flat' onClick={() => window.location.reload()}>
            重新加载
          </Button>
        </div>
      </div>
    )
  }

  const BrandMark = () => (
    <div
      style={{
        position: "fixed",
        bottom: "6px",
        right: "2px",
        zIndex: 9999,
        userSelect: "none",
        opacity: 0.95,
        cursor: "pointer",
        transition: "all 0.3s ease",
      }}
      onClick={() => window.open("https://www.mobenai.com.cn", "_blank")}
      onMouseEnter={(e) => {
        const el = e.currentTarget
        el.style.transform = "scale(1.05) translateY(-2px)"
        el.style.opacity = "1"
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.transform = "scale(1) translateY(0)"
        el.style.opacity = "0.95"
      }}
    >
      <Chip
        variant='shadow'
        classNames={{
          base: "bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 border-small border-white/50 shadow-purple-500/30",
          content: "drop-shadow shadow-black text-white font-medium tracking-wider",
        }}
        startContent={<div className='w-2 h-2 rounded-full bg-white animate-pulse mr-1' />}
      >
        By MoAI
      </Chip>
    </div>
  )

  return (
    <>
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
      <BrandMark />
    </>
  )
})

export default AppRuntime
