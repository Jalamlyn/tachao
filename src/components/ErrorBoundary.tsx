import React, { Component, ErrorInfo, ReactNode } from "react"
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { motion } from "framer-motion"

// 节流函数
const throttle = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  let lastArgs: Parameters<T> | null = null;

  return (...args: Parameters<T>) => {
    lastArgs = args;

    if (!timeout) {
      timeout = setTimeout(() => {
        if (lastArgs) {
          func(...lastArgs);
        }
        timeout = null;
        lastArgs = null;
      }, wait);
    }
  };
};

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
      userSteps?: string
    }
  }) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  isModalOpen: boolean
  userSteps: string
}

let userOperations = ""

class ErrorBoundary extends Component<Props, State> {
  private throttledAIFix: (errorInfo: any) => void;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isModalOpen: false,
      userSteps: "",
    }
    
    // 初始化节流函数
    this.throttledAIFix = throttle((errorInfo: any) => {
      if (this.props.onAIFix) {
        this.props.onAIFix(errorInfo);
        this.handleModalClose();
      }
    }, 5000);
  }

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      isModalOpen: false,
      userSteps: "",
    }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo)
    errorInfo.moduleName = window.__module_import_errors ? window.__module_import_errors[0] : "未知模块"
    
    // 检查是否是模块未实现错误
    if (error.name === 'ModuleNotImplementedError' || (error.message && error.message.includes('模块') && error.message.includes('未实现'))) {
      if (this.props.onAIFix) {
        // 使用节流函数触发 AI 修复
        this.throttledAIFix({
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          context: {
            componentName: errorInfo.moduleName,
            route: window.location.pathname,
            type: 'module_error'
          }
        });
      }
      // 不设置状态,因为不需要显示错误 UI
      return
    }

    this.setState({
      errorInfo,
    })
  }

  private handleModalOpen = () => {
    this.setState({ isModalOpen: true })
  }

  private handleModalClose = () => {
    this.setState({ isModalOpen: false })
  }

  private handleUserStepsChange = (value: string) => {
    this.setState({ userSteps: value })
    userOperations = value
  }

  private handleAIFix = () => {
    if (this.state.error) {
      const errorInfo = {
        message: this.state.error.message,
        stack: this.state.error.stack,
        componentStack: this.state.errorInfo?.componentStack,
        context: {
          componentName: window.__module_import_errors ? window.__module_import_errors[0] : "未知模块",
          route: window.location.pathname,
          userOperations,
        },
      }
      this.throttledAIFix(errorInfo);
    }
  }

  public render() {
    if (this.state.hasError) {
      // 如果是模块未实现错误,不显示错误 UI
      if (
        this.state.error?.name === 'ModuleNotImplementedError' ||
        (this.state.error?.message && this.state.error.message.includes('模块') && this.state.error.message.includes('未实现'))
      ) {
        return null
      }

      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <>
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
                  <p className='text-lg font-medium text-foreground'>遇到了一点小问题</p>
                  <p className='text-small text-foreground-500'>别担心,AI助手可以帮您快速修复</p>
                </div>
              </CardHeader>
              <CardBody>
                <div className='space-y-6'>
                  <p className='text-center text-foreground-600'>
                    {this.state.error?.message || "页面渲染出现了一些问题"}
                  </p>

                  <div className='flex justify-center'>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        size='lg'
                        color='primary'
                        onClick={this.handleModalOpen}
                        startContent={<Icon icon='flowbite:fix-tables-outline' width='24' height='24' />}
                        className='px-8 font-medium shadow-lg'
                      >
                        一键修复问题
                      </Button>
                    </motion.div>
                  </div>

                  <p className='text-center text-small text-foreground-400'>点击上方按钮,AI助手将立即分析并修复问题</p>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          <Modal isOpen={this.state.isModalOpen} onClose={this.handleModalClose} size='lg'>
            <ModalContent>
              <ModalHeader className='flex flex-col gap-1'>
                <h3>帮助AI更好地定位问题</h3>
                <p className='text-small text-foreground-500'>请描述发生错误前您进行了哪些操作</p>
              </ModalHeader>
              <ModalBody>
                <Textarea
                  placeholder='例如:1. 我点击了XX按钮 2. 输入了XX内容 3. 选择了XX选项...'
                  value={this.state.userSteps}
                  onValueChange={this.handleUserStepsChange}
                  minRows={3}
                  maxRows={6}
                />
              </ModalBody>
              <ModalFooter>
                <Button variant='light' onPress={this.handleModalClose}>
                  取消
                </Button>
                <Button color='primary' onPress={this.handleAIFix}>
                  提交并修复
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary