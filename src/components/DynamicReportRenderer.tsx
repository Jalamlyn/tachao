import React, { useState, useEffect, useMemo } from "react"
import { transform } from "@babel/standalone"
import ErrorBoundary from "./ErrorBoundary"
import { Spinner } from "@nextui-org/react"
import AnalysisResult from "@/pages/report-management/components/AnalysisResult"
import { processReportData } from "@/utils/processReportData"

interface DynamicReportRendererProps {
  code: string
  rawData: {
    formData: any[]
    templateInfoMap?: Record<string, string>
  }
}

export const DynamicReportRenderer: React.FC<DynamicReportRendererProps> = ({ code, rawData }) => {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(true)

  // 处理数据
  const processedData = useMemo(() => {
    if (!rawData?.formData) return null
    try {
      return processReportData(rawData.formData)
    } catch (err) {
      console.error("Error processing data:", err)
      setError(err as Error)
      return null
    }
  }, [rawData])

  useEffect(() => {
    const createComponent = async () => {
      try {
        setLoading(true)
        setError(null)

        // 1. 转换JSX
        const { code: transformedCode } = await transform(code, {
          presets: ["react"],
        })

        // 2. 创建组件
        const componentFn = new Function(
          "React",
          "AnalysisResult",
          "data",
          `${transformedCode}
           return ReportAnalysis`
        )

        // 3. 获取组件，传入处理后的数据
        const CustomComponent = componentFn(React, AnalysisResult, processedData)
        setComponent(() => CustomComponent)
      } catch (err) {
        console.error("Error creating component:", err)
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    if (code && processedData) {
      createComponent()
    }
  }, [code, processedData])

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
      <Component />
    </ErrorBoundary>
  )
}

export default DynamicReportRenderer