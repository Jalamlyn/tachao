import React, { Component, ErrorInfo, ReactNode } from "react"
import { Button, Card, CardBody, CardHeader } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { motion } from "framer-motion"

interface Props {
  children: ReactNode
  onReset?: () => void
  fallback?: ReactNode
  onAIFix?: (errorInfo: {
    message: string
    stack?: string
    componentStack?: string
    context?: {
      componentName?: string
      props?: any
      route?: string
    }
  }) => void
}

interface State {
  hasError: boolean
  errors: Array<{
    error: Error
    errorInfo?: ErrorInfo
    timestamp: number
  }>
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errors: [],
  }

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errors: [{
        error,
        timestamp: Date.now()
      }]
    }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo)
    
    this.setState(prevState => {
      const newError = {
        error,
        errorInfo,
        timestamp: Date.now()
      }
      
      // 保持最新的2个错误
      const errors = [newError, ...prevState.errors].slice(0, 2)
      
      return {
        errors
      }
    })
  }

  private handleAIFix = () => {
    if (this.props.onAIFix && this.state.errors.length > 0) {
      // 获取最新的错误信息
      const latestError = this.state.errors[0]
      const errorInfo = {
        message: latestError.error.message,
        stack: latestError.error.stack,
        componentStack: latestError.errorInfo?.componentStack,
        context: {
          componentName: this.getComponentNameFromStack(latestError.errorInfo),
          route: window.location.pathname,
        },
      }
      this.props.onAIFix(errorInfo)
    }
  }

  private getComponentNameFromStack(errorInfo?: ErrorInfo): string {
    if (errorInfo?.componentStack) {
      const match = errorInfo.componentStack.match(/in ([A-Za-z0-9_]+)/)
      return match ? match[1] : "Unknown Component"
    }
    return "Unknown Component"
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className='max-w-[600px] mx-auto my-8 shadow-lg'>
            <CardHeader className='flex gap-3 bg-warning-50 dark:bg-warning-900/20'>
              <div className='relative'>
                <Icon icon='mdi:alert-circle' className='w-8 h-8 text-warning' />
                <motion.div
                  className='absolute inset-0'
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.8, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Icon icon='mdi:alert-circle' className='w-8 h-8 text-warning' />
                </motion.div>
              </div>
              <div className='flex flex-col'>
                <p className='text-lg font-medium text-foreground'>遇到了一些问题</p>
                <p className='text-small text-foreground-500'>别担心,AI助手可以帮您快速修复</p>
              </div>
            </CardHeader>
            <CardBody>
              <div className='space-y-6'>
                {this.state.errors.map((errorItem, index) => (
                  <div key={errorItem.timestamp} className={`p-4 ${index === 0 ? 'bg-warning-50 dark:bg-warning-900/20' : 'bg-gray-50 dark:bg-gray-900/20'} rounded-lg`}>
                    <p className='text-center text-foreground-900'>
                      错误 {index + 1}: 模块 {window["@@moduleId"]} 编译错误
                    </p>
                    <p className='text-center text-foreground-600 mt-2'>
                      {errorItem.error.message || "页面渲染出现了一些问题"}
                    </p>
                    {errorItem.errorInfo && (
                      <p className='text-xs text-foreground-400 mt-1'>
                        {errorItem.errorInfo.componentStack}
                      </p>
                    )}
                  </div>
                ))}

                <div className='flex justify-center'>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size='lg'
                      color='primary'
                      onClick={this.handleAIFix}
                      startContent={<Icon icon='flowbite:fix-tables-outline' width='24' height='24' />}
                      className='px-8 font-medium shadow-lg'
                    >
                      一键修复问题
                    </Button>
                  </motion.div>
                </div>

                <p className='text-center text-small text-foreground-400'>
                  点击上方按钮,AI助手将立即分析并修复问题
                </p>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary