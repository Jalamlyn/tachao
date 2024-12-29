import React, { useState, useEffect, useCallback, useRef } from "react"
import { useParams } from "react-router-dom"
import { Button, Spinner, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import PageLayout from "@/components/PageLayout"
import AIEditor from "./AIEditor"
import AppAgent from "./AppAgent"
import { AppBuilderMessage } from "./types"
import message from "@/components/Message"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import { getMetadata, setMetadata } from "@/service/apis/metadata"
import { versionStore } from "./store/versionStore"
import { CodeItem } from "./AIEditor/type"

// 添加最大消息数量限制
const MAX_MESSAGES = 10

export const extractShataAIFormContent = (content: string): string => {
  if (!content) {
    return ""
  }
  const regex = /<shata-ai-code>([\s\S]*?)<\/shata-ai-code>/
  const match = content?.match(regex)
  return match ? match[1].trim() : content
}

const wrapWithShataAIForm = (content: string): string => {
  return `<shata-ai-code>\n${content}\n</shata-ai-code>`
}

const AppBuilder: React.FC = () => {
  const { appId } = useParams<{ appId: string }>()
  const [isLoading, setIsLoading] = useState(true)
  const [messages, setMessages] = useState<AppBuilderMessage[]>([])
  const [selectedTab, setSelectedTab] = useState("preview")
  const [appTitle, setAppTitle] = useState("")
  const { updateBreadcrumbs } = useBreadcrumb()
  const [showPublishModal, setShowPublishModal] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedCodeId, setSelectedCodeId] = useState<string>("")
  const [codeItems, setCodeItems] = useState<CodeItem[]>([])
  const [content, setContent] = useState(versionStore.getCurrentContent())

  // 添加 refs 用于跟踪消息状态
  const accumulatedTextRef = useRef("")
  const currentMessageIdRef = useRef<string | null>(null)

  useEffect(() => {
    updateBreadcrumbs([
      { label: "首页", href: "/we-chat-app/admin" },
      { label: "应用管理", href: "/we-chat-app/admin/apps" },
      { label: "应用开发", href: "" },
    ])
  }, [])

  // 初始化版本控制
  useEffect(() => {
    if (appId) {
      versionStore.setAppId(appId)
    }
  }, [appId])

  // 订阅版本控制更新
  useEffect(() => {
    const contentUnsubscribe = versionStore.subscribeToContent(setContent)
    const historyUnsubscribe = versionStore.subscribeToHistory(() => {
      refreshPreview()
      updateCodeItems()
    })

    return () => {
      contentUnsubscribe()
      historyUnsubscribe()
    }
  }, [])

  // 其余代码保持不变...
  // 为了保持回答的简洁性，这里省略了未修改的代码部分
  // 实际生成时会包含完整的代码

  return (
    <PageLayout title={`构建应用 - ${appTitle}`} titleIcon='mdi:tools' actions={pageActions}>
      <div className='h-[calc(100vh-140px)] overflow-auto'>
        <AIEditor
          parseConfig={async (code: string) => ({ code })}
          messages={messages}
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
          agent={{
            processCommand,
          }}
          renderPreview={renderPreview}
          onCommandResult={handleCommandResult}
          handleClearMessages={handleClearMessages}
          onStop={handleStop}
          showCodeTab
          previewTabName='应用预览'
          codeItems={codeItems}
          selectedCodeId={selectedCodeId}
          onCodeSelect={setSelectedCodeId}
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
    </PageLayout>
  )
}

export default AppBuilder