import React, { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { Button, Spinner, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useMetadata } from "@/hooks/useMetadata"
import message from "@/components/Message"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import PageLayout from "@/components/PageLayout"
import ErrorBoundary from "@/components/ErrorBoundary"
import { useVersionControl } from "@/hooks/useVersionControl"
import AIEditor from "@/components/AIEditor"
import { PageRenderer } from "@/components/PageRenderer"
import AIPageAgent from "@/service/agents/AIPageAgent"
import { useAppStore } from "../store/useAppStore"
import { getPageAgent } from "./getPageAgent"
import { getMetadata, setMetadata } from "@/service/apis/metadata"
import { codeStore } from "@/pages/form-temp-manager/components/codeStore"

const PageEditor: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { appId, pageId } = useParams<{ appId: string; pageId?: string }>()
  const { isHome } = location.state || {}
  const { updateBreadcrumbs } = useBreadcrumb()
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [selectedTab, setSelectedTab] = useState("preview")
  const [pageTitle, setPageTitle] = useState("")
  const { update: updateApp } = useMetadata("app")
  const { useApps } = useAppStore()
  const { apps } = useApps()
  const app = apps.find((a) => a.id === appId)

  // 新增状态
  const [isTitleModalOpen, setIsTitleModalOpen] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [tempTitle, setTempTitle] = useState("")
  const [savedPageId, setSavedPageId] = useState<string>("")

  // refs 用于跟踪消息状态
  const accumulatedTextRef = useRef("")
  const currentMessageIdRef = useRef<string | null>(null)

  // 页面状态管理
  const [pageState, setPageState] = useState({
    rawCode: null as string | null,
    previewContent: "",
  })

  // 加载页面详情
  useEffect(() => {
    const loadPageDetail = async () => {
      if (!pageId) return

      try {
        const result = await getMetadata([`${pageId}`])
        if (result.data?.[0]?.value) {
          const pageData = JSON.parse(result.data[0].value)
          setPageTitle(pageData.title)
          setPageState((prev) => ({
            ...prev,
            rawCode: pageData.code,
            previewContent: pageData.code,
          }))
          // 添加初始版本
          versionControl.addVersion({
            rawConfig: pageData.code,
          })
        }
      } catch (error) {
        console.error("Error loading page detail:", error)
        message.error("加载页面详情失败")
      }
    }

    loadPageDetail()
  }, [pageId])

  // 设置预览内容
  const setPreviewContent = useCallback((content: string) => {
    setPageState((prev) => ({
      ...prev,
      previewContent: content,
    }))
  }, [])

  // 处理数据块
  const handleChunk = useCallback((chunk: string) => {
    accumulatedTextRef.current += chunk
    if (accumulatedTextRef.current !== "") {
      updateLastMessage({
        content: accumulatedTextRef.current,
        status: "streaming",
      })
    }
  }, [])

  useEffect(() => {
    updateBreadcrumbs([
      { label: "首页", href: "/admin" },
      { label: "应用管理", href: "/admin/apps" },
      { label: app?.title || "应用", href: "" },
      { label: isHome ? "创建首页" : pageId ? "编辑页面" : "创建页面", href: "" },
    ])
  }, [])

  // 更新最后一条消息
  const updateLastMessage = useCallback((update: Partial<any>) => {
    setMessages((prev) => {
      const messages = [...prev]
      const lastIndex = messages.length - 1
      if (lastIndex >= 0) {
        messages[lastIndex] = {
          ...messages[lastIndex],
          ...update,
        }
      }
      return messages
    })
  }, [])

  // 添加消息
  const addMessage = useCallback((message: any) => {
    setMessages((prev) => [...prev, message])
  }, [])

  // 创建 pageAgent
  const pageAgent = useMemo(() => {
    return getPageAgent(
      addMessage,
      setPreviewContent,
      accumulatedTextRef,
      currentMessageIdRef,
      messages,
      handleChunk,
      pageState,
      updateLastMessage
    )
  }, [messages, pageState, addMessage, setPreviewContent, handleChunk, updateLastMessage])

  // 初始化 versionControl
  const versionControl = useVersionControl({
    initialVersions: [],
    maxVersions: 10,
  })

  const handleSave = async () => {
    if (!appId) return
    setIsTitleModalOpen(true)
    setTempTitle(pageTitle || "")
  }

  const handleTitleConfirm = async () => {
    if (!tempTitle.trim()) {
      message.error("请输入页面标题")
      return
    }

    try {
      setIsLoading(true)
      const currentVersion = versionControl.getCurrentVersion()
      if (!currentVersion?.rawConfig) {
        message.error("请先生成页面代码")
        return
      }

      // 1. 保存页面详情
      const newPageId = pageId || `page_${Date.now()}`
      const pageData = {
        id: newPageId,
        title: tempTitle.trim(),
        code: currentVersion.rawConfig,
        isHome: isHome || false,
        updatedAt: new Date().toISOString(),
        appId,
      }

      // 使用metadata API保存页面详情
      await setMetadata(`${newPageId}`, JSON.stringify(pageData))

      // 2. 获取并更新应用索引
      const appIndexResult = await getMetadata(["app_index"])
      const appList = appIndexResult.data?.[0]?.value ? JSON.parse(appIndexResult.data[0].value) : []

      const currentAppIndex = appList.findIndex((a: any) => a.id === appId)
      if (currentAppIndex === -1) {
        throw new Error("应用不存在")
      }

      const currentApp = appList[currentAppIndex]

      // 只存储页面的索引信息
      const pageIndex = {
        id: newPageId,
        title: tempTitle.trim(),
        updatedAt: pageData.updatedAt,
        isHome: isHome || false,
      }

      // 检查是否是第一个页面，如果是则自动设置为首页
      const isFirstPage = !currentApp.pages || currentApp.pages.length === 0
      if (isFirstPage) {
        pageIndex.isHome = true
      }

      const updatedPages = pageId
        ? (currentApp.pages || []).map((p: any) => (p.id === pageId ? pageIndex : p))
        : [...(currentApp.pages || []), pageIndex]

      // 更新应用信息
      const updatedApp = {
        ...currentApp,
        pages: updatedPages,
        ...(isFirstPage || isHome ? { homePageId: newPageId } : {}),
        updatedAt: new Date().toISOString(),
      }

      // 更新应用列表
      appList[currentAppIndex] = updatedApp

      // 直接使用 setMetadata 更新应用索引
      await setMetadata("app_index", JSON.stringify(appList))

      message.success("保存成功")
      setIsTitleModalOpen(false)
      setSavedPageId(newPageId)
      setIsConfirmModalOpen(true)
    } catch (error) {
      console.error("Save error:", error)
      message.error("保存失败")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditConfirm = (confirmed: boolean) => {
    setIsConfirmModalOpen(false)
    if (confirmed && savedPageId) {
      navigate(`/admin/apps/${appId}/pages/${savedPageId}/edit`)
    }
  }

  const handleClearMessages = () => {
    setMessages([])
    accumulatedTextRef.current = ""
    currentMessageIdRef.current = null
  }

  const handleCommandResult = (result: any) => {
    if (result.success && result.code) {
      setPageState((prev) => ({
        ...prev,
        rawCode: result.code,
        previewContent: result.code,
      }))

      versionControl.addVersion({
        rawConfig: result.code,
      })
      codeStore.code = result.code
    }
  }

  const pageActions = (
    <Button
      color='primary'
      onClick={handleSave}
      isDisabled={isLoading}
      isLoading={isLoading}
      startContent={<Icon icon='mdi:content-save' className='w-4 h-4' />}
    >
      {pageId ? "编辑页面" : "创建页面"}
    </Button>
  )

  if (!appId) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <div className='text-center'>
          <Icon icon='mdi:alert' className='w-12 h-12 text-danger mb-2' />
          <p className='text-danger'>无效的应用ID</p>
        </div>
      </div>
    )
  }

  return (
    <PageLayout
      title={isHome ? "创建首页" : pageId ? "编辑页面" : "创建页面"}
      titleIcon='mdi:file-document-edit'
      actions={pageActions}
    >
      <div className='h-[calc(100vh-140px)] overflow-auto'>
        <AIEditor
          parseConfig={AIPageAgent.parseCode}
          messages={messages}
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
          agent={pageAgent}
          versionControl={versionControl}
          onCommandResult={handleCommandResult}
          renderPreview={(version) => (
            <ErrorBoundary>
              <PageRenderer code={version?.rawConfig} />
            </ErrorBoundary>
          )}
          showCodeTab
          onClearMessages={handleClearMessages}
          previewTabName='页面预览'
        />
      </div>

      {/* 标题编辑 Modal */}
      <Modal isOpen={isTitleModalOpen} onClose={() => setIsTitleModalOpen(false)}>
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>编辑页面标题</ModalHeader>
          <ModalBody>
            <Input
              autoFocus
              label='页面标题'
              placeholder='请输入页面标题'
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant='light' onPress={() => setIsTitleModalOpen(false)}>
              取消
            </Button>
            <Button color='primary' onPress={handleTitleConfirm} isLoading={isLoading}>
              确认
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 确认编辑 Modal */}
      <Modal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)}>
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>保存成功</ModalHeader>
          <ModalBody>
            <p>是否进入编辑页面继续编辑？</p>
          </ModalBody>
          <ModalFooter>
            <Button variant='light' onPress={() => handleEditConfirm(false)}>
              否
            </Button>
            <Button color='primary' onPress={() => handleEditConfirm(true)}>
              是
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </PageLayout>
  )
}

export default PageEditor
