import React, { useState, useEffect } from "react"
import { transform } from "@babel/standalone"
import DynamicForm from "./common/DynamicForm"
import ErrorBoundary from "./ErrorBoundary"
import { Spinner } from "@nextui-org/react"

// 导入 shadcn UI 组件
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"

// 导入 NextUI Button
import { Button } from "@nextui-org/react"

// UI组件映射
const uiComponents = {
  Alert,
  AlertTitle,
  AlertDescription,
  Button,
  Card,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Calendar,
}

interface DynamicComponentRendererProps {
  code: string
  templateId?: string
  formId?: string
  initialValues?: any
  mode?: "create" | "edit" | "preview"
  onSubmit?: (values: any) => Promise<void>
}

export const DynamicComponentRenderer: React.FC<DynamicComponentRendererProps> = ({ code, ...props }) => {
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
          "DynamicForm",
          ...Object.keys(uiComponents),
          `${transformedCode}
           return CustomForm`
        )

        // 3. 获取组件
        const CustomComponent = componentFn(React, DynamicForm, ...Object.values(uiComponents))

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