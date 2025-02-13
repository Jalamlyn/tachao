import React, { useState, useEffect, useMemo, useCallback } from "react"
import { AppRender } from "@/app/admin/src/pages/AppBuilder/AppRender"
import {
  Spinner,
  Card,
  CardBody,
  CardHeader,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
} from "@nextui-org/react"
import message from "@/components/Message"
import { calculateActualBalance, Provider } from "@/provider"
import { AppContext } from "@/contexts/AppContext"
import { observer } from "mobx-react-lite"
import { Icon } from "@iconify/react"
import { appCodeStore } from "../store/appCodeStore"
import { context } from "./functionContext"
import { balanceStore } from "@/stores/balanceStore"

// 节流函数
const throttle = <T extends (...args: any[]) => any>(func: T, wait: number): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null
  let lastArgs: Parameters<T> | null = null

  return (...args: Parameters<T>) => {
    lastArgs = args

    if (!timeout) {
      timeout = setTimeout(() => {
        if (lastArgs) {
          func(...lastArgs)
        }
        timeout = null
        lastArgs = null
      }, wait)
    }
  }
}

interface PreviewPageProps {
  appId: string
  onAIFix?: (errorInfo: any) => void
}
let _userOperations = ""

const PreviewPage: React.FC<PreviewPageProps> = observer(({ appId }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [errorDetails, setErrorDetails] = useState<any>(null)
  const [isOperationModalOpen, setIsOperationModalOpen] = useState(false)
  const [userOperations, setUserOperations] = useState("")

  // 使用 useMemo 创建节流后的 handleAIFix
  const throttledHandleAIFix = useMemo(
    () =>
      throttle((errorInfo: any) => {
        window.parent.postMessage(
          {
            type: "AI_FIX_REQUEST",
            payload: {
              error: JSON.stringify(errorInfo.message),
              context: {
                type: "module_error",
                route: window.location.pathname,
                appId,
                moduleName: errorInfo.context?.moduleName,
                userOperations: _userOperations,
              },
            },
          },
          "*"
        )
        setIsOperationModalOpen(true)
      }, 300),
    [appId]
  )

  useEffect(() => {
    const initBalanceStore = async () => {
      const actualBalance = await calculateActualBalance()
      balanceStore.setActualBalance(actualBalance)
    }
    initBalanceStore()
  }, [])

  useEffect(() => {
    // 添加全局错误处理
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", event.reason)
      // 只在没有现有错误时设置新错误
      if (!error) {
        setError(`未处理的异步错误: ${event.reason?.message || "未知错误"}`)
        setErrorDetails(event.reason)
      }
    }

    window.addEventListener("unhandledrejection", handleUnhandledRejection)

    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection)
    }
  }, [error])

  const handleAIFix = useCallback(
    (errorInfo: any) => {
      throttledHandleAIFix(errorInfo)
    },
    [throttledHandleAIFix]
  )

  const handleError = (error: Error) => {
    // 如果是模块未实现错误,直接触发 AI 修复
    if (error.name === "ModuleNotImplementedError") {
      handleAIFix({
        message: error.message,
        type: "module_error",
        context: {
          moduleName: window.__module_import_errors?.[0] || "未知模块",
          route: window.location.pathname,
          appId,
        },
      })
      return
    }

    // 其他错误显示带操作按钮的错误提示
    if (!errorDetails) {
      const errorContent = (
        <div className='flex items-center gap-2'>
          <div>{error.message}</div>
          <Button size='sm' color='primary' onClick={() => setIsOperationModalOpen(true)}>
            AI修复
          </Button>
        </div>
      )
      message.error(errorContent)
    }
  }

  const handleModuleError = (error: Error) => {
    // 如果是模块未实现错误,直接触发 AI 修复
    if (error.name === "ModuleNotImplementedError") {
      handleAIFix({
        message: error.message,
        type: "module_error",
        context: {
          moduleName: window.__module_import_errors?.[0] || "未知模块",
          route: window.location.pathname,
          appId,
        },
      })
      return
    }

    // 其他错误显示错误提示,等待用户操作
    if (!errorDetails) {
      setError(`模块执行错误: ${error.message}`)
      setErrorDetails(error)
      message.error(error.message)
    }
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

        // 4. 执行所有模块
        const results = await appCodeStore.executeModules(context(appId)).catch(handleModuleError)

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
        setError(error instanceof Error ? error.message : "初始化预览失败")
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
                  animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
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
            <p className='text-center text-sm text-default-600'>别担心,AI助手可以帮您快速修复这个问题</p>
            <div className='flex justify-center'>
              <Button
                size='lg'
                color='primary'
                className='px-8 font-medium shadow-lg'
                startContent={<Icon icon='flowbite:fix-tables-outline' className='w-5 h-5' />}
                onClick={() => setIsOperationModalOpen(true)}
              >
                一键修复问题
              </Button>
            </div>
            <p className='text-center text-xs text-default-400'>点击上方按钮,AI助手将立即分析并修复问题</p>
          </div>
        </CardBody>
      </Card>

      {/* 用户操作记录收集对话框 */}
      <Modal isOpen={isOperationModalOpen} onClose={() => setIsOperationModalOpen(false)} size='2xl'>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex flex-col gap-1'>
                <div className='flex items-center gap-2'>
                  <Icon icon='mdi:clipboard-text' className='w-5 h-5' />
                  <span>请描述错误发生前的操作</span>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className='space-y-4'>
                  <p className='text-sm text-default-600'>
                    为了帮助AI更好地定位和修复问题,请详细描述错误发生前您进行了哪些操作。
                  </p>
                  <Textarea
                    label='操作步骤'
                    placeholder='例如:1. 我先点击了xxx按钮&#10;2. 然后输入了xxx内容&#10;3. 最后点击了xxx时出现错误'
                    value={userOperations}
                    onChange={(e) => setUserOperations(e.target.value)}
                    minRows={3}
                    variant='bordered'
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color='danger' variant='light' onPress={onClose}>
                  取消
                </Button>
                <Button color='primary' onPress={handleAIFix}>
                  提交并修复
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
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
    // 如果是模块未实现错误
    if (errorDetails?.name === "ModuleNotImplementedError") {
      // 1. 自动触发修复
      handleAIFix({
        message: errorDetails.message,
        type: "module_error",
        context: {
          moduleName: window.__module_import_errors?.[0] || "未知模块",
          route: window.location.pathname,
          appId,
        },
      })
      // 2. 显示加载中状态
      return (
        <div className='flex items-center justify-center min-h-screen'>
          <Spinner label='AI 正在修复缺失模块...' />
        </div>
      )
    }
    return renderErrorUI()
  }

  return (
    <Provider>
      <AppContext.Provider value={{ appId }}>
        <AppRender onAIFix={handleAIFix} appId={appId} basename={`/app-preview/${appId}`} onError={handleError} />
      </AppContext.Provider>
    </Provider>
  )
})

export default PreviewPage
