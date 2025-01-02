import React, { useState, useEffect } from "react"
import { AppRender } from "@/app/admin/src/pages/AppBuilder/AppRender"
import { Spinner, Card, CardBody, CardHeader, Button } from "@nextui-org/react"
import message from "@/components/Message"
import { Provider } from "@/provider"
import { AppContext } from "@/contexts/AppContext"
import { PermissionCheck } from "@/app/admin/src/permissions/components/PermissionCheck"
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
import * as recharts from "recharts"

interface PreviewPageProps {
  appId: string
  onAIFix?: (errorInfo: any) => void
}

const PreviewPage: React.FC<PreviewPageProps> = observer(({ appId }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [errorDetails, setErrorDetails] = useState<any>(null)

  useEffect(() => {
    // 添加全局错误处理
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", event.reason)
      setError(`未处理的异步错误: ${event.reason?.message || "未知错误"}`)
      setErrorDetails(event.reason)
    }

    window.addEventListener("unhandledrejection", handleUnhandledRejection)

    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection)
    }
  }, [])

  const handleError = (error: Error) => {
    setError(error.message)
    setErrorDetails(error)
    message.error(`预览错误: ${error.message}`)
  }

  const handleModuleError = (error: Error) => {
    setError(`模块执行错误: ${error.message}`)
    setErrorDetails(error)
    message.error(error.message)
  }

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
        setErrorDetails(null)

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
          recharts,
          api: {
            getMetadata,
            setMetadata,
            getPublicMetaData,
          },
          ai,
          mobx,
        }

        // 4. 执行所有模块
        const results = await appCodeStore.executeModules(context).catch(handleModuleError)

        if (results) {
          const errors = results.filter((r) => !r.success)
          if (errors.length > 0) {
            const errorMessages = errors.map((e) => `${e.name}: ${e.error}`).join("\n")
            handleError(new Error(errorMessages))
            return
          }
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Error initializing preview:", error)
        handleError(error instanceof Error ? error : new Error("初始化预览失败"))
      }
    }

    initializePreview()
  }, [appId])

  const renderErrorUI = () => (
    <div className='p-4'>
      <Card>
        <CardHeader className='bg-warning-50'>
          <div className='flex items-center gap-2'>
            <div className='relative'>
              <Icon icon='mdi:alert-circle' className='w-8 h-8 text-warning' />
              <div
                className='absolute inset-0 animate-pulse'
                style={{
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}
              >
                <Icon icon='mdi:alert-circle' className='w-8 h-8 text-warning opacity-75' />
              </div>
            </div>
            <div>
              <h3 className='text-lg font-semibold'>应用加载失败</h3>
              <p className='text-sm text-warning-600'>{error}</p>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className='space-y-4'>
            <p className='text-center text-sm text-default-600'>
              别担心,AI助手可以帮您快速修复这个问题
            </p>
            <div className='flex justify-center'>
              <Button
                size='lg'
                color='primary'
                className='px-8 font-medium shadow-lg'
                startContent={<Icon icon='mdi:robot' className='w-5 h-5' />}
                onClick={() => {
                  window.parent.postMessage({
                    type: 'AI_FIX_REQUEST',
                    payload: {
                      error: error,
                      stack: errorDetails?.stack,
                      context: {
                        route: window.location.pathname,
                        appId,
                      },
                    }
                  }, '*')
                }}
              >
                一键修复问题
              </Button>
            </div>
            <p className='text-center text-xs text-default-400'>
              点击上方按钮,AI助手将立即分析并修复问题
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  )

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
    return renderErrorUI()
  }

  return (
    <Provider>
      <PermissionCheck resourceType='app' resourceId={appId}>
        <AppContext.Provider value={{ appId }}>
          <AppRender
            appId={appId}
            basename={`/app-preview/${appId}`}
            context={{
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
              recharts,
            }}
            onError={handleError}
          />
        </AppContext.Provider>
      </PermissionCheck>
    </Provider>
  )
})

export default PreviewPage