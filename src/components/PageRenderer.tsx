import React, { useState, useEffect } from "react"
import { transform } from "@/utils/moduleLoader"
import ErrorBoundary from "./ErrorBoundary"
import * as NextUI from "@nextui-org/react"
import * as ReactRouterDom from "react-router-dom"
import * as FramerMotion from "framer-motion"
import { Icon } from "@iconify/react"
import message from "./Message"

interface PageRendererProps {
  code?: string
}

export const PageRenderer: React.FC<PageRendererProps> = ({ code }) => {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const createComponent = async () => {
      if (!code) return

      try {
        // 提取实际代码
        const codeMatch = code.match(/<shata-ai-code>([\s\S]*?)<\/shata-ai-code>/)
        if (!codeMatch) {
          throw new Error("Invalid code format")
        }

        const actualCode = codeMatch[1].trim()

        // 转换代码
        const { code: transformedCode } = transform(actualCode, {
          presets: ["react"]
        })

        // 创建上下文对象
        const context = {
          React,
          ReactDOM: React,
          NextUI,
          Router: ReactRouterDom,
          Motion: FramerMotion,
          Icon,
          message,
          // 解构所有 hooks
          useState: React.useState,
          useEffect: React.useEffect,
          useCallback: React.useCallback,
          useMemo: React.useMemo,
          useRef: React.useRef,
          // 解构路由 hooks
          useNavigate: ReactRouterDom.useNavigate,
          useParams: ReactRouterDom.useParams,
          useLocation: ReactRouterDom.useLocation,
          // 动画相关
          motion: FramerMotion.motion,
          AnimatePresence: FramerMotion.AnimatePresence
        }

        // 创建组件
        const componentFn = new Function(
          'context',
          `with (context) {
            ${transformedCode.replace(/export default/, 'return')}
          }`
        )

        setComponent(() => componentFn(context))
        setError(null)
      } catch (err) {
        console.error("Error creating component:", err)
        setError(err as Error)
        setComponent(null)
      }
    }

    createComponent()
  }, [code])

  if (!code) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[400px] bg-default-50'>
        <Icon icon='mdi:file-document-plus' className='w-16 h-16 text-default-300' />
        <p className='mt-4 text-default-500'>开始创建页面</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className='p-4 bg-danger-50 rounded-lg'>
        <p className='text-danger'>页面渲染失败: {error.message}</p>
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
      <Component />
    </ErrorBoundary>
  )
}