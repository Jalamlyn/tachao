import React, { Component, ErrorInfo, ReactNode } from "react"
import { Button, Card, CardBody, CardHeader, Collapse } from "@nextui-org/react"
import { Icon } from "@iconify/react"

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
  error: Error | null
  errorInfo: ErrorInfo | null
  isExpanded: boolean
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    isExpanded: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error,
      errorInfo: null,
      isExpanded: false
    }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo)
    this.setState({
      errorInfo
    })
  }

  private handleAIFix = () => {
    if (this.props.onAIFix && this.state.error) {
      const errorInfo = {
        message: this.state.error.message,
        stack: this.state.error.stack,
        componentStack: this.state.errorInfo?.componentStack,
        context: {
          componentName: this.getComponentNameFromStack(),
          route: window.location.pathname
        }
      }
      this.props.onAIFix(errorInfo)
    }
  }

  private getComponentNameFromStack(): string {
    if (this.state.errorInfo?.componentStack) {
      const match = this.state.errorInfo.componentStack.match(/in ([A-Za-z0-9_]+)/)
      return match ? match[1] : 'Unknown Component'
    }
    return 'Unknown Component'
  }

  private formatErrorStack(stack?: string): string {
    if (!stack) return 'No stack trace available'
    return stack.split('\n').map(line => line.trim()).join('\n')
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Card className="max-w-[800px] mx-auto my-4">
          <CardHeader className="flex gap-3 bg-danger/10">
            <Icon icon="mdi:alert-circle" className="w-6 h-6 text-danger"/>
            <div className="flex flex-col">
              <p className="text-lg font-semibold text-danger">渲染出错</p>
              <p className="text-small text-danger-500">
                {this.state.error?.message || "未知错误"}
              </p>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {/* 错误详情 */}
              <Collapse isOpen={this.state.isExpanded}>
                <div className="space-y-2 text-sm font-mono bg-danger-50 p-4 rounded-lg overflow-auto max-h-[400px]">
                  <div>
                    <div className="font-semibold text-danger-600">错误堆栈:</div>
                    <pre className="whitespace-pre-wrap text-danger-800">
                      {this.formatErrorStack(this.state.error?.stack)}
                    </pre>
                  </div>
                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <div className="font-semibold text-danger-600 mt-4">组件堆栈:</div>
                      <pre className="whitespace-pre-wrap text-danger-800">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </Collapse>

              {/* 操作按钮 */}
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="flat"
                  color="primary"
                  onClick={() => this.setState(prev => ({ isExpanded: !prev.isExpanded }))}
                  startContent={
                    <Icon 
                      icon={this.state.isExpanded ? "mdi:chevron-up" : "mdi:chevron-down"} 
                      className="w-4 h-4"
                    />
                  }
                >
                  {this.state.isExpanded ? "隐藏详情" : "查看详情"}
                </Button>

                {this.props.onAIFix && (
                  <Button
                    size="sm"
                    color="primary"
                    onClick={this.handleAIFix}
                    startContent={<Icon icon="mdi:robot" className="w-4 h-4" />}
                  >
                    AI修复
                  </Button>
                )}

                {this.props.onReset && (
                  <Button
                    size="sm"
                    color="danger"
                    variant="flat"
                    onClick={() => {
                      this.setState({ hasError: false, error: null })
                      this.props.onReset?.()
                    }}
                    startContent={<Icon icon="mdi:restore" className="w-4 h-4" />}
                  >
                    回退到上一个版本
                  </Button>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary