import React, { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useLocation } from "react-router-dom"
import { Button, Spinner, ButtonGroup, Tooltip } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { observer } from "mobx-react-lite"
import PageLayout from "@/app/admin/src/components/PageLayout"
import AIEditor from "./AIEditor/AppAIEditor"
import AppAgent from "./AppAgent"
import { AppBuilderMessage, CodeItem } from "./types"
import message from "@/components/Message"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import { appCodeStore } from "./store/appCodeStore"
import { logStore } from "./AIEditor/components/LogStore"
import { ErrorPrompt, PublishModal, PublishTemplateModal, RollbackModal } from "./ErrorPrompt"

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
  const [isCompiling, setIsCompiling] = useState(false)

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

  // ... [保持其他现有代码不变]

  const handleCompileAndUpload = async () => {
    try {
      setIsCompiling(true)
      message.loading("正在编译并上传...", 0)
      const fileUrl = await appCodeStore.compileAndUpload()
      message.destroy()
      message.success("编译成功，文件已上传")
      console.log("Bundle URL:", fileUrl)
      
      // 刷新预览
      refreshPreview()
    } catch (error) {
      message.destroy()
      message.error("编译失败：" + (error instanceof Error ? error.message : "未知错误"))
    } finally {
      setIsCompiling(false)
    }
  }

  const pageActions = (
    <div className='flex items-center gap-2'>
      <ButtonGroup>
        {/* 编译按钮 */}
        <Tooltip content='编译并上传应用代码'>
          <Button
            color='primary'
            variant='flat'
            onClick={handleCompileAndUpload}
            isDisabled={isLoading || publishInProgress || isCompiling}
            isLoading={isCompiling}
            startContent={<Icon icon='mdi:code-braces' className='w-4 h-4' />}
            aria-label='编译应用'
          >
            编译应用
          </Button>
        </Tooltip>

        <Tooltip content='发布为模板供他人使用'>
          <Button
            color='primary'
            onClick={handlePublishTemplate}
            isDisabled={isLoading || publishInProgress || isCompiling}
            isLoading={publishInProgress}
            startContent={<Icon icon='fluent:book-template-20-filled' className='w-4 h-4' />}
            aria-label='发布模板'
          >
            发布模板
          </Button>
        </Tooltip>

        <Tooltip content='发布应用到生产环境'>
          <Button
            color='primary'
            onClick={handlePublish}
            isDisabled={isLoading || publishInProgress || isCompiling}
            isLoading={publishInProgress}
            startContent={<Icon icon='mdi:rocket-launch' className='w-4 h-4' />}
          >
            发布应用
          </Button>
        </Tooltip>
      </ButtonGroup>

      <Tooltip content='回滚到最近一次发布的版本'>
        <Button
          color='warning'
          variant='flat'
          onClick={() => setShowRollbackModal(true)}
          isDisabled={isLoading || !appCodeStore.hasPublishedVersion}
          startContent={<Icon icon='mdi:restore' className='w-4 h-4' />}
        >
          回滚到最近发布
        </Button>
      </Tooltip>
    </div>
  )

  // ... [保持其他现有代码不变]

  return (
    <>
      {moduleError && <ErrorPrompt error={moduleError} onFix={handleFix} />}
      <PageLayout title={`构建应用 - ${appTitle}`} titleIcon='mdi:tools' actions={pageActions}>
        <div className='h-[calc(100vh-140px)]'>
          <AIEditor
            parseConfig={async (code: string) => ({ code })}
            messages={messages}
            setMessages={setMessages}
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

        <PublishModal isOpen={showPublishModal} onClose={() => setShowPublishModal(false)} appId={appId} />
        <PublishTemplateModal isOpen={showPublishTemplateModal} onClose={() => setShowPublishTemplateModal(false)} />
        <RollbackModal
          isOpen={showRollbackModal}
          onClose={() => setShowRollbackModal(false)}
          onConfirm={handleRollbackToLastPublished}
        />
      </PageLayout>
    </>
  )
})

export default AppBuilder