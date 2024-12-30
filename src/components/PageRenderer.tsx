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
import { ai } from "@/service/ai"
import { extractShataAICode } from "@/utils/generateColumns"
import * as mobx from "mobx"
import { observer } from "mobx-react-lite"
import wpm from "@wpm-js/core"

interface PageRendererProps {
  code?: string
  pageId?: string // 新增：页面ID
  appId?: string // 新增：应用ID
}

export const PageRenderer: React.FC<PageRendererProps> = ({ code, pageId, appId }) => {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const createComponent = async () => {
      if (!code && pageId && appId) {
        // 如果没有直接提供代码，但有pageId和appId，尝试从缓存或服务器获取
        try {
          const cached = localStorage.getItem(`app_cache_${appId}`)
          if (cached) {
            const appCache = JSON.parse(cached)
            if (appCache.pages[pageId]) {
              code = appCache.pages[pageId].code
            }
          }

          if (!code) {
            // 如果缓存中没有，从服务器获取
            const pageResult = await getMetadata([pageId])
            if (pageResult.data?.[0]?.value) {
              const pageData = JSON.parse(pageResult.data[0].value)
              code = pageData.code
            }
          }
        } catch (error) {
          console.error("Error loading page code:", error)
          setError(error as Error)
          return
        }
      }

      if (!code) return
      const _code = extractShataAICode(code)
      try {
        // 转换代码
        const { code: transformedCode } = transform(_code, {
          presets: ["react"],
        })

        // 创建上下文对象
        const context = {
          React,
          NextUI,
          ReactRouterDom,
          FramerMotion,
          Icon,
          message,
          api: { getMetadata, setMetadata },
          FormRenderer: FormRendererWrapper,
          ReportRenderer: ReportRendererWrapper,
          ai,
          appId,
          mobx,
          wpm,
          observer,
        }

        // 创建组件
        const componentFn = new Function("context", `${transformedCode.replace(/export default/, "return")}`)

        setComponent(() => componentFn(context))
        setError(null)
      } catch (err) {
        console.error("Error creating component:", err)
        setError(err as Error)
        setComponent(null)
      }
    }

    createComponent()
  }, [code, pageId, appId])

  if (!code && !pageId) {
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
