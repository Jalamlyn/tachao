import React, { useContext, useEffect, useState } from "react"
import { Spinner } from "@nextui-org/react"
import { PageRenderer } from "@/components/PageRenderer"
import { getMetadata, setMetadata } from "@/service/apis/metadata"
import { AppContext } from "@/contexts/AppContext"
import { Icon } from "@iconify/react"

interface PageWrapperProps {
  pageId: string
}

export const PageWrapper: React.FC<PageWrapperProps> = ({ pageId }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pageCode, setPageCode] = useState<string | null>(null)
  const { appId } = useContext(AppContext)

  useEffect(() => {
    const initializePage = async () => {
      try {
        setIsLoading(true)
        setError(null)

        if (!appId) {
          throw new Error("应用ID未定义")
        }

        // 检查是否在预览模式
        const isPreviewMode = window.parent !== window

        if (isPreviewMode) {
          // 在预览模式下，通过消息通信获取页面代码
          const handleMessage = (event: MessageEvent) => {
            if (event.data.type === "update_page_code" && event.data.pageId === pageId && event.data.appId === appId) {
              setPageCode(event.data.code)
              setIsLoading(false)
            }
          }

          window.addEventListener("message", handleMessage)

          // 请求页面代码
          window.parent.postMessage(
            {
              type: "request_page_code",
              appId,
              pageId,
            },
            "*"
          )

          return () => window.removeEventListener("message", handleMessage)
        } else {
          // 正常模式下的逻辑
          const pageResult = await getMetadata([pageId])
          if (!pageResult.data?.[0]?.value) {
            // 页面不存在，需要初始化
            const appIndexResult = await getMetadata(["app_index"])
            const apps = appIndexResult.data?.[0]?.value ? JSON.parse(appIndexResult.data[0].value) : []
            const app = apps.find((a: any) => a.id === appId)

            if (!app) {
              throw new Error("应用不存在")
            }

            // 初始化页面
            const pageData = {
              id: pageId,
              title: "新页面",
              code: `
export default (props) => {
  const {React, NextUI} = context
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">新页面</h1>
    </div>
  )
}
`,
              appId,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }

            await setMetadata(pageId, JSON.stringify(pageData))
          }
          setIsLoading(false)
        }
      } catch (error) {
        console.error("Error initializing page:", error)
        setError(error instanceof Error ? error.message : "初始化页面失败")
        setIsLoading(false)
      }
    }

    initializePage()
  }, [appId, pageId])

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Spinner label='加载中...' />
      </div>
    )
  }

  if (error) {
    return (
      <div className='p-4 bg-danger-50 rounded-lg'>
        <p className='text-danger'>{error}</p>
      </div>
    )
  }

  if (!appId) {
    return (
      <div className='p-4 bg-danger-50 rounded-lg'>
        <p className='text-danger'>应用ID未定义</p>
      </div>
    )
  }

  return <PageRenderer pageId={pageId} appId={appId} code={pageCode} />
}

export default PageWrapper
