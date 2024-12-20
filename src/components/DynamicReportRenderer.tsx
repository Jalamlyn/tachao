import React, { useState, useEffect, useMemo } from "react"
import { transform } from "@/utils/moduleLoader"
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
      return processReportData(rawData.formData, rawData.templateInfoMap)
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

        // 1. 转换代码
        const _code = code.replace("```", "")
        const { code: transformedCode } = transform(_code, {
          presets: ["react"],
        })
        const __code = transformedCode.replace(/export default/, "return")

        // 2. 创建组件工厂函数
        const componentFactory = new Function("React", "AnalysisResult", "data", `${__code}`)

        // 3. 执行工厂函数获取组件函数
        const ComponentFunction = componentFactory(React, AnalysisResult, processedData)

        // 4. 设置组件
        setComponent(() => ComponentFunction)

        // 调试日志
        console.log("Component type:", typeof ComponentFunction)
        console.log("Is valid component:", typeof ComponentFunction === "function")
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