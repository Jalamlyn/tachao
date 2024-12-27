import React, { useState, useEffect } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { Button, Spinner } from "@nextui-org/react"
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

const PageEditor: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { appId } = useParams<{ appId: string }>()
  const { isHome } = location.state || {}
  const { updateBreadcrumbs } = useBreadcrumb()
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [selectedTab, setSelectedTab] = useState("preview")
  const versionControl = useVersionControl()
  const { update: updateApp } = useMetadata("app")
  const { useApps } = useAppStore()
  const { apps } = useApps()
  const app = apps.find(a => a.id === appId)

  useEffect(() => {
    updateBreadcrumbs([
      { label: "首页", href: "/we-chat-app/admin" },
      { label: "应用管理", href: "/we-chat-app/admin/apps" },
      { label: app?.title || "应用", href: `/we-chat-app/admin/apps/${appId}` },
      { label: isHome ? "创建首页" : "创建页面", href: "" },
    ])
  }, [appId, app, isHome])

  const handleSave = async () => {
    if (!appId) return
    
    try {
      setIsLoading(true)
      const currentVersion = versionControl.getCurrentVersion()
      if (!currentVersion?.code) {
        message.error("请先生成页面代码")
        return
      }

      // 更新应用配置
      await updateApp(appId, {
        pages: [{
          id: `page_${Date.now()}`,
          code: currentVersion.code,
          isHome: isHome || false
        }]
      })

      message.success("保存成功")
      navigate(`/apps/${appId}`)
    } catch (error) {
      console.error("Save error:", error)
      message.error("保存失败")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCommandResult = (result: any) => {
    if (result.success && result.code) {
      versionControl.addVersion({
        code: result.code
      })
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
      保存页面
    </Button>
  )

  return (
    <PageLayout 
      title={isHome ? '创建首页' : '创建页面'} 
      titleIcon='mdi:file-document-edit' 
      actions={pageActions}
    >
      <div className='h-[calc(100vh-200px)] overflow-auto'>
        <AIEditor
          parseConfig={AIPageAgent.parseCode}
          messages={messages}
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
          agent={AIPageAgent}
          versionControl={versionControl}
          onCommandResult={handleCommandResult}
          renderPreview={(version) => (
            <ErrorBoundary>
              <PageRenderer code={version?.code} />
            </ErrorBoundary>
          )}
          showCodeTab
          previewTabName='页面预览'
        />
      </div>
    </PageLayout>
  )
}

export default PageEditor