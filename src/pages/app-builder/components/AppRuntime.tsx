import React, { useEffect, useState, useCallback } from "react"
import { AppRender } from "@/components/AppRender"
import { Spinner, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react"
import { getMetadata } from "@/service/apis/metadata"
import message from "@/components/Message"
import { Icon } from "@iconify/react"
import { AppContext } from "@/contexts/AppContext"
import { PermissionCheck } from "@/permissions/components/PermissionCheck"

interface AppRuntimeProps {
  appId: string
  permissions?: string[]
  runtimeContext?: {
    user?: any
    api?: any
  }
}

interface AppCache {
  code: string
  version: number
  updatedAt: string
  pages: Record<string, any>
}

export const AppRuntime: React.FC<AppRuntimeProps> = ({ appId, permissions = [], runtimeContext = {} }) => {
  const [appCode, setAppCode] = useState<string | null>(null)
  const [appData, setAppData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [newVersion, setNewVersion] = useState<number | null>(null)

  // 获取缓存的应用数据
  const getCachedApp = useCallback(() => {
    if (!appId) return null
    const cached = localStorage.getItem(`app_runtime_${appId}`)
    return cached ? JSON.parse(cached) : null
  }, [appId])

  // 保存应用缓存
  const saveAppCache = useCallback(
    (data: AppCache) => {
      if (!appId) return
      localStorage.setItem(
        `app_runtime_${appId}`,
        JSON.stringify({
          ...data,
          cachedAt: new Date().toISOString(),
        })
      )
    },
    [appId]
  )

  // 检查应用更新
  const checkForUpdates = useCallback(async () => {
    if (!appId) return

    try {
      const appIndexResult = await getMetadata(["app_index"])
      const apps = appIndexResult.data?.[0]?.value ? JSON.parse(appIndexResult.data[0].value) : []
      const app = apps.find((a: any) => a.id === appId)

      if (!app) {
        throw new Error("应用不存在")
      }

      const cachedApp = getCachedApp()
      if (cachedApp && app.version > cachedApp.version) {
        setNewVersion(app.version)
        setShowUpdateModal(true)
      }
    } catch (error) {
      console.error("Error checking for updates:", error)
    }
  }, [appId, getCachedApp])

  // 加载应用代码
  const loadAppCode = useCallback(
    async (forceFetch: boolean = false) => {
      if (!appId) {
        setError("无效的应用ID")
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // 如果不是强制获取，先尝试使用缓存
        const cachedApp = getCachedApp()
        if (!forceFetch && cachedApp) {
          setAppCode(cachedApp.code)
          setAppData(cachedApp.appData)
          setIsLoading(false)
          // 异步检查更新
          checkForUpdates()
          return
        }

        // 1. 获取应用信息
        const appIndexResult = await getMetadata(["app_index"])
        const apps = appIndexResult.data?.[0]?.value ? JSON.parse(appIndexResult.data[0].value) : []
        const app = apps.find((a: any) => a.id === appId)

        if (!app) {
          throw new Error("应用不存在")
        }

        if (app.status !== "active") {
          throw new Error("应用未发布或已停用")
        }

        setAppData(app)

        // 2. 获取应用代码
        const result = await getMetadata([`app_${appId}`])
        if (!result.data?.[0]?.value) {
          throw new Error("应用代码不存在")
        }

        const appData = JSON.parse(result.data[0].value)
        setAppCode(appData.code)

        // 3. 预加载所有页面代码
        const pages: Record<string, any> = {}
        const pagePromises = (app.pages || []).map(async (page: any) => {
          const pageResult = await getMetadata([page.id])
          if (pageResult.data?.[0]?.value) {
            const pageData = JSON.parse(pageResult.data[0].value)
            pages[page.id] = pageData
          }
        })

        await Promise.all(pagePromises)

        // 4. 保存到缓存
        saveAppCache({
          code: appData.code,
          version: app.version,
          updatedAt: app.updatedAt,
          pages,
          appData: app,
        })
      } catch (error) {
        console.error("Error loading app:", error)
        setError(error instanceof Error ? error.message : "加载应用失败")
      } finally {
        setIsLoading(false)
      }
    },
    [appId, checkForUpdates, getCachedApp, saveAppCache]
  )

  // 处理更新应用
  const handleUpdate = async () => {
    try {
      await loadAppCode(true) // 强制重新获取
      setShowUpdateModal(false)
      message.success("应用已更新到最新版本")
    } catch (error) {
      console.error("Error updating app:", error)
      message.error("更新失败")
    }
  }

  useEffect(() => {
    loadAppCode()
  }, [loadAppCode])

  const handleError = (error: Error) => {
    console.error("Runtime error:", error)
    message.error(`运行错误: ${error.message}`)
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Spinner label='加载中...' />
      </div>
    )
  }

  if (error || !appCode) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen gap-4'>
        <Icon icon='mdi:alert-circle' className='w-16 h-16 text-danger' />
        <div className='p-4 bg-danger-50 rounded-lg'>
          <p className='text-danger text-center'>{error || "应用加载失败"}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <PermissionCheck resourceType="app" resourceId={appId}>
        <AppContext.Provider value={{ appId, runtimeContext }}>
          <AppRender
            basename={`/app-run/${appId}`}
            code={appCode}
            context={runtimeContext}
            onError={handleError}
            appId={appId}
          />
        </AppContext.Provider>
      </PermissionCheck>

      <Modal isOpen={showUpdateModal} onClose={() => setShowUpdateModal(false)}>
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>发现新版本</ModalHeader>
          <ModalBody>
            <div className='flex items-center gap-2'>
              <Icon icon='mdi:update' className='w-6 h-6 text-primary' />
              <p>应用有新的版本可用（v{newVersion}），是否立即更新？</p>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant='light' onPress={() => setShowUpdateModal(false)}>
              稍后更新
            </Button>
            <Button color='primary' onPress={handleUpdate}>
              立即更新
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default AppRuntime