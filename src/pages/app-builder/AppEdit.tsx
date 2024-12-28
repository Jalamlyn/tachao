import React, { useState, useEffect, useCallback } from "react"
import { useParams } from "react-router-dom"
import { Button, Spinner } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import PageLayout from "@/components/PageLayout"
import AIEditor from "@/components/AIEditor"
import AppAgent from "./AppAgent"
import { AppBuilderMessage } from "./types"
import message from "@/components/Message"
import { getMetadata, setMetadata } from "@/service/apis/metadata"

const AppBuilder: React.FC = () => {
  const { appId } = useParams<{ appId: string }>()
  const [isLoading, setIsLoading] = useState(true)
  const [messages, setMessages] = useState<AppBuilderMessage[]>([])
  const [selectedTab, setSelectedTab] = useState("preview")
  const [appTitle, setAppTitle] = useState("")

  // 加载应用数据
  useEffect(() => {
    const loadAppData = async () => {
      if (!appId) return
      try {
        setIsLoading(true)
        await AppAgent.loadAppCache(appId)
        
        // 获取应用标题
        const result = await getMetadata(["app_index"])
        const apps = result.data?.[0]?.value ? JSON.parse(result.data[0].value) : []
        const app = apps.find((a: any) => a.id === appId)
        if (app) {
          setAppTitle(app.title)
        }
      } catch (error) {
        console.error("Error loading app data:", error)
        message.error("加载应用数据失败")
      } finally {
        setIsLoading(false)
      }
    }

    loadAppData()
  }, [appId])

  const handleCommandResult = useCallback((result: any) => {
    if (!result.success) {
      message.error(result.error || "操作失败")
      return
    }

    const appCache = AppAgent.getAppCache(appId!)
    if (!appCache) return

    // 更新页面代码
    if (result.pages) {
      const updatedPages = { ...appCache.pages }
      Object.entries(result.pages).forEach(([pageId, code]) => {
        if (updatedPages[pageId]) {
          updatedPages[pageId] = {
            ...updatedPages[pageId],
            code: code as string,
            updatedAt: new Date().toISOString(),
          }
        }
      })

      // 更新缓存
      AppAgent.setAppCache(appId!, {
        ...appCache,
        pages: updatedPages,
        appCode: result.appCode || appCache.appCode,
        version: appCache.version + 1,
        updatedAt: new Date().toISOString(),
      })
    }

    message.success("更新成功")
  }, [appId])

  const handleSave = async () => {
    if (!appId) return
    try {
      setIsLoading(true)
      const appCache = AppAgent.getAppCache(appId)
      if (!appCache) {
        throw new Error("应用缓存不存在")
      }

      // 1. 更新所有页面
      for (const [pageId, page] of Object.entries(appCache.pages)) {
        await setMetadata(pageId, JSON.stringify({
          id: pageId,
          title: page.title,
          code: page.code,
          appId,
          updatedAt: page.updatedAt,
        }))
      }

      // 2. 更新应用索引
      const appIndexResult = await getMetadata(["app_index"])
      const apps = appIndexResult.data?.[0]?.value ? JSON.parse(appIndexResult.data[0].value) : []
      const appIndex = apps.findIndex((a: any) => a.id === appId)
      if (appIndex === -1) throw new Error("应用不存在")

      const updatedApps = [...apps]
      updatedApps[appIndex] = {
        ...updatedApps[appIndex],
        updatedAt: new Date().toISOString(),
      }

      await setMetadata("app_index", JSON.stringify(updatedApps))
      message.success("保存成功")
    } catch (error) {
      console.error("Error saving app:", error)
      message.error("保存失败")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearMessages = () => {
    setMessages([])
  }

  if (!appId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Icon icon="mdi:alert" className="w-12 h-12 text-danger mb-2" />
          <p className="text-danger">无效的应用ID</p>
        </div>
      </div>
    )
  }

  const pageActions = (
    <Button
      color="primary"
      onClick={handleSave}
      isDisabled={isLoading}
      isLoading={isLoading}
      startContent={<Icon icon="mdi:content-save" className="w-4 h-4" />}
    >
      保存应用
    </Button>
  )

  return (
    <PageLayout
      title={`构建应用 - ${appTitle}`}
      titleIcon="mdi:tools"
      actions={pageActions}
    >
      <div className="h-[calc(100vh-140px)] overflow-auto">
        <AIEditor
          parseConfig={async (code: string) => ({ code })}
          messages={messages}
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
          agent={{
            processCommand: (command: string) =>
              AppAgent.processCommand(appId, messages, command),
          }}
          versionControl={{
            versions: [],
            currentIndex: 0,
            rollback: () => null,
            forward: () => null,
            canRollback: false,
            canForward: false,
            getCurrentVersion: () => null,
            addVersion: () => {},
          }}
          renderPreview={() => <div>预览区域</div>}
          onCommandResult={handleCommandResult}
          onClearMessages={handleClearMessages}
          showCodeTab
          previewTabName="应用预览"
        />
      </div>
    </PageLayout>
  )
}

export default AppBuilder