import React, { useState, useEffect } from "react"
import { transform } from "@/utils/moduleLoader"
import ErrorBoundary from "./ErrorBoundary"
import * as NextUI from "@nextui-org/react"
import * as ReactRouterDom from "react-router-dom"
import * as FramerMotion from "framer-motion"
import { Icon } from "@iconify/react"
import message from "./Message"
import { getMetadata, setMetadata } from "@/service/apis/metadata"
import { FormRendererWrapper } from "./renderers/FormRendererWrapper"
import { ReportRendererWrapper } from "./renderers/ReportRendererWrapper"
import { PageWrapper } from "@/pages/app-builder/components/PageWrapper"
import { ai } from "@/service/ai"

interface AppRenderProps {
  code: string
  context?: Record<string, any>
  onError?: (error: Error) => void
  basename: string
  appId: string
}

export const AppRender: React.FC<AppRenderProps> = (props) => {
  const { code, context: extraContext, onError, appId } = props
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null)
  const [error, setError] = useState<Error | null>(null)
  useEffect(() => {
    const createComponent = async () => {
      if (!code) return

      try {
        // 转换代码
        const { code: transformedCode } = transform(code, {
          presets: ["react"],
        })

        // 创建基础上下文对象
        const baseContext = {
          React,
          NextUI,
          ReactRouterDom,
          FramerMotion,
          Icon,
          message,
          api: { getMetadata, setMetadata },
          FormRenderer: FormRendererWrapper,
          ReportRenderer: ReportRendererWrapper,
          PageWrapper,
          ai,
          appId,
        }

        // 合并额外的上下文
        const context = {
          ...baseContext,
          ...extraContext,
        }

        // 创建组件
        const componentFn = new Function("context", `${transformedCode.replace(/export default/, "return")}`)

        setComponent(() => componentFn(context))
        setError(null)
      } catch (err) {
        console.error("Error creating app component:", err)
        const error = err as Error
        setError(error)
        onError?.(error)
        setComponent(null)
      }
    }

    createComponent()
  }, [code, extraContext, onError])

  if (!code) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[400px] bg-default-50'>
        <Icon icon='mdi:apps' className='w-16 h-16 text-default-300' />
        <p className='mt-4 text-default-500'>开始创建应用</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className='p-4 bg-danger-50 rounded-lg'>
        <p className='text-danger'>应用渲染失败: {error.message}</p>
      </div>
    )
  }

  if (!Component) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <NextUI.Spinner label='加载中...' />
      </div>
    )
  }
  return (
    <ErrorBoundary>
      <Component {...props} />
    </ErrorBoundary>
  )
}
