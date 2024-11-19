import React, { Component, ErrorInfo, ReactNode } from "react"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"

interface Props {
  children: ReactNode
  onReset?: () => void
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className='p-4 border rounded-lg bg-danger-50 text-danger'>
          <div className='flex items-center gap-2 mb-2'>
            <Icon icon='mdi:alert-circle' className='w-5 h-5' />
            <h3 className='font-medium'>渲染出错</h3>
          </div>
          <p className='text-sm mb-4'>{this.state.error?.message}</p>
          {this.props.onReset && (
            <Button
              size='sm'
              color='primary'
              variant='flat'
              onClick={() => {
                this.setState({ hasError: false, error: null })
                this.props.onReset?.()
              }}
            >
              <Icon icon='mdi:restore' className='w-4 h-4 mr-1' />
              回退到上一个版本
            </Button>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
