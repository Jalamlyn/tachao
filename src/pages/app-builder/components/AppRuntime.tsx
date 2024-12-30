import React, { useEffect, useState, useCallback } from "react"
import { AppRender } from "@/components/AppRender"
import { Spinner, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react"
import { getMetadata } from "@/service/apis/metadata"
import message from "@/components/Message"
import { Icon } from "@iconify/react"
import { AppContext } from "@/contexts/AppContext"
import { PermissionCheck } from "@/permissions/components/PermissionCheck"
import { AppCache, CacheConfig, VersionInfo } from "../types"

const CACHE_CONFIG: CacheConfig = {
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
  version: "1.0.0",
  prefix: "app_runtime_",
}

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
  const [appData, setAppData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [newVersion, setNewVersion] = useState<VersionInfo | null>(null)
  const [codeCache, setCodeCache] = useState<AppCache | null>(null)

  // 获取缓存的应用数据
  const getCachedApp = useCallback(() => {
    if (!appId) return null
    try {
      const cacheKey = `${CACHE_CONFIG.prefix}${appId}`
      const cached = localStorage.getItem(cacheKey)
      if (!cached) return null

      const parsedCache = JSON.parse(cached)

      // 检查缓存版本
      if (parsedCache.version !== CACHE_CONFIG.version) {
        localStorage.removeItem(cacheKey)
        return null
      }

      // 检查缓存是否过期
      const now = Date.now()
      if (now - new Date(parsedCache.cachedAt).getTime() > CACHE_CONFIG.maxAge) {
        localStorage.removeItem(cacheKey)
        return null
      }

      return parsedCache
    } catch (error) {
      console.error("Error reading cache:", error)
      return null
    }
  }, [appId])

  // 保存应用缓存
  const saveAppCache = useCallback(
    (data: Omit<AppCache[string], "cachedAt">) => {
      if (!appId) return
      try {
        const cacheKey = `${CACHE_CONFIG.prefix}${appId}`
        const cacheData = {
          ...data,
          version: CACHE_CONFIG.version,
          cachedAt: new Date().toISOString(),
        }
        localStorage.setItem(cacheKey, JSON.stringify(cacheData))
        setCodeCache(cacheData)
      } catch (error) {
        console.error("Error saving cache:", error)
      }
    },
    [appId]
  )

  // 清理过期缓存
  const clearOutdatedCache = useCallback(() => {
    const now = Date.now()
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(CACHE_CONFIG.prefix)) {
        try {
          const cached = JSON.parse(localStorage.getItem(key) || "")
          const isOutdated =
            cached.version !== CACHE_CONFIG.version || now - new Date(cached.cachedAt).getTime() > CACHE_CONFIG.maxAge

          if (isOutdated) {
            localStorage.removeItem(key)
          }
        } catch (error) {
          console.error("Error cleaning cache:", error)
          localStorage.removeItem(key)
        }
      }
    })
  }, [])

  // 检查应用更新
  const checkForUpdates = useCallback(async () => {
    if (!appId || !codeCache) return

    try {
      const appIndexResult = await getMetadata(["app_index"])
      const apps = appIndexResult.data?.[0]?.value ? JSON.parse(appIndexResult.data[0].value) : []
      const app = apps.find((a: any) => a.id === appId)

      if (!app) {
        throw new Error("应用不存在")
      }

      const versionInfo: VersionInfo = {
        version: app.version,
        updatedAt: app.updatedAt,
        lastPublishedAt: app.lastPublishedAt,
        status: app.status,
      }

      if (app.version > codeCache.version) {
        setNewVersion(versionInfo)
        setShowUpdateModal(true)
      }
    } catch (error) {
      console.error("Error checking for updates:", error)
    }
  }, [appId, codeCache])

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
          setAppCode(cachedApp.appCode)
          setAppData(cachedApp)
          setCodeCache(cachedApp)
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

        // 3. 预加载所有代码
        const pages: Record<string, any> = {}
        const stores: Record<string, any> = {}
        const services: Record<string, any> = {}
        const modules: Record<string, any> = {}
        const schemas: Record<string, any> = {}

        // 加载页面代码
        const pagePromises = (app.pages || []).map(async (page: any) => {
          const pageResult = await getMetadata([page.id])
          if (pageResult.data?.[0]?.value) {
            const pageData = JSON.parse(pageResult.data[0].value)
            pages[page.id] = pageData
          }
        })

        // 加载其他类型的代码
        const codeTypes = [
          { type: "store", container: stores },
          { type: "service", container: services },
          { type: "module", container: modules },
          { type: "schema", container: schemas },
        ]

        const otherPromises = codeTypes.map(async ({ type, container }) => {
          const typeResult = await getMetadata([`${appId}_${type}s`])
          if (typeResult.data?.[0]?.value) {
            const typeData = JSON.parse(typeResult.data[0].value)
            Object.assign(container, typeData)
          }
        })

        await Promise.all([...pagePromises, ...otherPromises])

        // 4. 保存到缓存
        const cacheData = {
          appCode: appData.code,
          version: app.version,
          updatedAt: app.updatedAt,
          pages,
          stores,
          services,
          modules,
          schemas,
        }

        saveAppCache(cacheData)
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

  // 初始化时清理过期缓存
  useEffect(() => {
    clearOutdatedCache()
  }, [clearOutdatedCache])

  // 加载应用代码
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

  // 构建完整的运行时上下文
  const fullRuntimeContext = {
    ...runtimeContext,
    appId,
    stores: codeCache?.stores || {},
    services: codeCache?.services || {},
    modules: codeCache?.modules || {},
    schemas: codeCache?.schemas || {},
  }

  return (
    <>
      <PermissionCheck resourceType='app' resourceId={appId}>
        <AppContext.Provider value={{ appId, runtimeContext: fullRuntimeContext }}>
          <AppRender
            basename={`/app-run/${appId}`}
            code={appCode}
            context={fullRuntimeContext}
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
              <p>应用有新的版本可用（v{newVersion?.version}），是否立即更新？</p>
            </div>
            {newVersion?.lastPublishedAt && (
              <p className='text-sm text-default-500'>
                最后发布时间: {new Date(newVersion.lastPublishedAt).toLocaleString()}
              </p>
            )}
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
