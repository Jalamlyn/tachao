import React, { useState, useEffect } from "react"
import { AppRender } from "@/components/AppRender"
import { Spinner } from "@nextui-org/react"
import message from "@/components/Message"
import { Provider } from "@/provider"
import { AppContext } from "@/contexts/AppContext"
import { PermissionCheck } from "@/permissions/components/PermissionCheck"
import wpm from "@wpm-js/core"
import * as ReactRouterDom from "react-router-dom"
import * as FramerMotion from "framer-motion"
import { ai } from "@/service/ai"
import * as NextUI from "@nextui-org/react"
import { observer } from "mobx-react-lite"
import * as mobx from "mobx"
import { Icon } from "@iconify/react"
import { appCodeStore } from "../store/appCodeStore"
import { getMetadata, getPublicMetaData, setMetadata } from "@/service/apis/metadata"

interface PreviewPageProps {
  appId: string
}

const PreviewPage: React.FC<PreviewPageProps> = observer(({ appId }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

        // 1. 先设置 appId
        appCodeStore.setAppId(appId)

        // 2. 加载应用数据
        await appCodeStore.loadApp(appId)

        // 3. 准备执行上下文
        const context = {
          wpm,
          React,
          observer,
          Icon,
          NextUI,
          ReactRouterDom,
          FramerMotion,
          message,
          appId,
          api: {
            getMetadata,
            setMetadata,
            getPublicMetaData,
          },
          ai,
          mobx,
        }

        // 4. 执行所有模块
        const results = await appCodeStore.executeModules(context)
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
  }, [appId]) // 监听版本变化

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

  return (
    <Provider>
      <PermissionCheck resourceType='app' resourceId={appId}>
        <AppContext.Provider value={{ appId }}>
          <AppRender
            appId={appId}
            basename={`/app-preview/${appId}`}
            onError={(error) => {
              console.error("Preview error:", error)
              message.error(`预览错误: ${error.message}`)
            }}
          />
        </AppContext.Provider>
      </PermissionCheck>
    </Provider>
  )
})

export default PreviewPage
