import React from "react"
import { AppRender } from "@/components/AppRender"
import { MemoryRouter } from "react-router-dom"
import message from "@/components/Message"

interface AppPreviewProps {
  code: string
  onUpdate?: () => void
  previewContext?: {
    mockData?: any
    mockApi?: any
    baseUrl?: string
  }
}

export const AppPreview: React.FC<AppPreviewProps> = ({ code, onUpdate, previewContext = {} }) => {
  const handleError = (error: Error) => {
    message.error(`预览错误: ${error.message}`)
  }

  // 创建预览专用上下文
  const previewSpecificContext = {
    // 添加预览专用的API和功能
    api: {
      getMetadata: async (keys: string[]) => {
        // 在预览模式下，优先使用模拟数据
        if (previewContext.mockData?.[keys[0]]) {
          return { data: [{ value: previewContext.mockData[keys[0]] }] }
        }
        // 否则使用真实API
        return { data: [] }
      },
      setMetadata: async (key: string, value: any) => {
        console.log("Preview mode: setMetadata called", { key, value })
        return true
      },
    },
    // 其他预览专用功能
    ...previewContext,
  }

  return (
    <div className="preview-container border rounded-lg overflow-hidden">
      <MemoryRouter>
        <AppRender
          code={code}
          context={previewSpecificContext}
          onError={handleError}
        />
      </MemoryRouter>
    </div>
  )
}

export default AppPreview