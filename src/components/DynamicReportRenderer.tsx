import React, { useState, useEffect } from "react"
import { transform } from "@babel/standalone"
import ErrorBoundary from "./ErrorBoundary"
import { Spinner } from "@nextui-org/react"
import AnalysisResult from "@/pages/report-management/components/AnalysisResult"

interface DynamicReportRendererProps {
  code: string
  data: any
  templateId?: string
  mode?: "preview" | "edit"
}

export const DynamicReportRenderer: React.FC<DynamicReportRendererProps> = ({ code, ...props }) => {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const createComponent = async () => {
      try {
        setLoading(true)
        // 1. 转换JSX
        const { code: transformedCode } = await transform(code, {
          presets: ["react"],
        })

        // 2. 创建组件
        const componentFn = new Function(
          "React",
          "AnalysisResult",
          `${transformedCode}
           return ReportAnalysis`
        )

        // 3. 获取组件
        const CustomComponent = componentFn(React, AnalysisResult)

        setComponent(() => CustomComponent)
      } catch (err) {
        console.error("Error creating component:", err)
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    if (code) {
      createComponent()
    }
  }, [code])

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[200px]'>
        <Spinner label='加载组件...' />
      </div>
    )
  }

  if (error) {
    return (
      <div className='error-state p-4 bg-danger-50 rounded-lg'>
        <p className='text-danger'>组件加载失败: {error.message}</p>
      </div>
    )
  }

  if (!Component) {
    return null
  }

  return (
    <ErrorBoundary>
      <Component {...props} />
    </ErrorBoundary>
  )
}

export default DynamicReportRenderer