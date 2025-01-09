import React, { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useLocation } from "react-router-dom"
import {
  Button,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ButtonGroup,
  Tooltip,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { observer } from "mobx-react-lite"
import PageLayout from "@/app/admin/src/component/PageLayout"
import AIEditor from "./AIEditor/AppAIEditor"
import AppAgent from "./AppAgent"
import { AppBuilderMessage, CodeItem } from "./types"
import message from "@/components/Message"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import { appCodeStore } from "./store/appCodeStore"
import { logStore } from "./AIEditor/components/LogStore"

// 改进的错误提示组件
const ErrorPrompt = ({ error, onFix }) => {
  // 解析错误信息
  const parseError = (error) => {
    if (error.moduleErrors) {
      return {
        missingModules: error.moduleErrors.missingModules,
        dependentModules: error.moduleErrors.dependentModules,
      }
    }
    return null
  }

  const errorInfo = parseError(error)
  if (!errorInfo) return null

  return (
    <div className='p-4 bg-danger-50 rounded-lg mb-4'>
      <div className='flex items-start gap-3'>
        <Icon icon='mdi:alert-circle' className='w-5 h-5 text-danger mt-0.5' />
        <div className='flex-1'>
          <h4 className='font-medium text-danger'>检测到缺失模块</h4>
          <div className='mt-2 space-y-1 text-sm text-danger-600'>
            <p>缺失模块:</p>
            <ul className='list-disc pl-4'>
              {errorInfo.missingModules.map((module, index) => (
                <li key={index}>
                  <code>{module}</code>
                </li>
              ))}
            </ul>
            <p>依赖这些模块的组件:</p>
            <ul className='list-disc pl-4'>
              {errorInfo.dependentModules.map((module, index) => (
                <li key={index}>
                  <code>{module}</code>
                </li>
              ))}
            </ul>
          </div>
          <Button
            color='primary'
            variant='flat'
            size='sm'
            className='mt-3'
            startContent={<Icon icon='mdi:wrench' className='w-4 h-4' />}
            onClick={() => onFix(errorInfo)}
          >
            修复此问题
          </Button>
        </div>
      </div>
    </div>
  )
}

const MAX_MESSAGES = 10

const AppBuilder: React.FC = observer(() => {
  const { appId } = useParams<{ appId: string }>()
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(true)
  const [messages, setMessages] = useState<AppBuilderMessage[]>([])
  const [selectedTab, setSelectedTab] = useState("preview")
  const [appTitle, setAppTitle] = useState("")
  const { updateBreadcrumbs } = useBreadcrumb()
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [showPublishTemplateModal, setShowPublishTemplateModal] = useState(false)
  const [showRollbackModal, setShowRollbackModal] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [publishInProgress, setPublishInProgress] = useState(false)
  const [publishError, setPublishError] = useState<string | null>(null)
  const [moduleError, setModuleError] = useState(null)

  const accumulatedTextRef = useRef("")
  const currentMessageIdRef = useRef<string | null>(null)

  useEffect(() => {
    updateBreadcrumbs([
      { label: "首页", href: "/admin" },
      { label: "应用管理", href: "/admin/apps" },
      { label: "应用开发", href: "" },
    ])
  }, [])

  useEffect(() => {
    return () => {
      appCodeStore.clearViewState()
    }
  }, [])

  // 添加日志消息监听
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "AI_FIX_REQUEST") {
        const errorInfo = event.data.payload

        const fixPrompt = `请帮我修复以下错误:
          错误信息: ${errorInfo.error}
          路由路径: ${errorInfo.context?.route}
          堆栈信息: ${errorInfo.stack}
          ${errorInfo.context?.type === "module_error" ? "这是一个模块执行错误。" : ""}
          
          请分析错误原因并生成修复后的完整代码, 每个模块的代码都必须完整, 不能省略任何部分。`

        processCommand(fixPrompt)
      } else if (event.data.type === 'LOG') {
        const { level, message, details } = event.data
        logStore[level](message, details)
      } else if (event.data.type === 'LOG_CLEAR') {
        logStore.clear()
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [])

  // ... 保持其他代码不变 ...

  return (
    <>
      {moduleError && <ErrorPrompt error={moduleError} onFix={handleFix} />}
      <PageLayout title={`构建应用 - ${appTitle}`} titleIcon='mdi:tools' actions={pageActions}>
        <div className='h-[calc(100vh-140px)]'>
          <AIEditor
            parseConfig={async (code: string) => ({ code })}
            messages={messages}
            selectedTab={selectedTab}
            onTabChange={setSelectedTab}
            agent={{
              processCommand,
            }}
            renderPreview={renderPreview}
            handleClearMessages={handleClearMessages}
            onStop={handleStop}
            showCodeTab
            appId={appId}
            onVersionChange={refreshPreview}
          />
        </div>

        <Modal isOpen={showPublishModal} onClose={() => setShowPublishModal(false)}>
          <ModalContent>
            <ModalHeader className='flex flex-col gap-1'>发布成功</ModalHeader>
            <ModalBody>
              <p>应用已成功发布！您可以通过以下链接访问：</p>
              <div className='flex items-center gap-2 p-2 bg-default-100 rounded'>
                <code className='text-sm'>/app-run/{appId}</code>
                <Button
                  size='sm'
                  variant='flat'
                  onClick={() => window.open(`/app-run/${appId}`, "_blank")}
                  startContent={<Icon icon='mdi:open-in-new' className='w-4 h-4' />}
                >
                  查看应用
                </Button>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color='primary' onPress={() => setShowPublishModal(false)}>
                关闭
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Modal isOpen={showPublishTemplateModal} onClose={() => setShowPublishTemplateModal(false)}>
          <ModalContent>
            <ModalHeader className='flex flex-col gap-1'>发布模板成功</ModalHeader>
            <ModalBody>
              <p>模板已成功发布到平台！其他用户现在可以使用此模板创建新应用。</p>
            </ModalBody>
            <ModalFooter>
              <Button color='primary' onPress={() => setShowPublishTemplateModal(false)}>
                关闭
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Modal isOpen={showRollbackModal} onClose={() => setShowRollbackModal(false)}>
          <ModalContent>
            <ModalHeader className='flex flex-col gap-1'>确认回滚</ModalHeader>
            <ModalBody>
              <p>确定要回滚到最近一次发布的版本吗？此操作将丢失当前未发布的更改。</p>
            </ModalBody>
            <ModalFooter>
              <Button color='default' variant='light' onPress={() => setShowRollbackModal(false)}>
                取消
              </Button>
              <Button color='warning' onPress={handleRollbackToLastPublished}>
                确认回滚
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </PageLayout>
    </>
  )
})

export default AppBuilder