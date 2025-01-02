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
  onAIFix?: (errorInfo: any) => void // 保留但标记为可选
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

    // 发送错误信息到父窗口
    window.parent.postMessage({
      type: 'AI_FIX_REQUEST',
      payload: {
        error: error.message,
        stack: error.stack,
        context: {
          route: window.location.pathname,
          appId
        }
      }
    }, '*')
  }

  const handleModuleError = (error: Error) => {
    setError(`模块执行错误: ${error.message}`)
    setErrorDetails(error)
    message.error(error.message)

    // 发送模块错误信息到父窗口
    window.parent.postMessage({
      type: 'AI_FIX_REQUEST',
      payload: {
        error: error.message,
        stack: error.stack,
        context: {
          route: window.location.pathname,
          appId,
          type: 'module_error'
        }
      }
    }, '*')
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
        <CardHeader className='bg-danger-50'>
          <div className='flex items-center gap-2'>
            <Icon icon='mdi:alert-circle' className='text-danger w-6 h-6' />
            <div>
              <h3 className='text-lg font-semibold'>应用加载失败</h3>
              <p className='text-sm text-danger'>{error}</p>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className='space-y-4'>
            <p className='text-sm'>应用在加载过程中遇到错误。这可能是由于：</p>
            <ul className='list-disc pl-4 text-sm'>
              <li>模块加载失败</li>
              <li>代码执行错误</li>
              <li>缺少必要的依赖</li>
            </ul>
            {errorDetails?.stack && (
              <div className='mt-4'>
                <p className='text-sm font-semibold mb-2'>错误详情：</p>
                <pre className='text-xs bg-danger-50 p-4 rounded-lg overflow-auto max-h-[200px]'>
                  {errorDetails.stack}
                </pre>
              </div>
            )}
            <div className='flex gap-2'>
              <Button
                color='primary'
                onClick={() => window.location.reload()}
                startContent={<Icon icon='mdi:refresh' className='w-4 h-4' />}
              >
                重新加载
              </Button>
              <Button
                variant='flat'
                color='secondary'
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
                startContent={<Icon icon='mdi:robot' className='w-4 h-4' />}
              >
                AI 修复
              </Button>
            </div>
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