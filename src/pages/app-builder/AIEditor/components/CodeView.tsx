import React, { useState, useEffect, useCallback } from "react"
import { Select, SelectItem, Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import Editor from "@monaco-editor/react"
import { appCodeStore } from "../../store/appCodeStore"
import message from "@/components/Message"
import { CodeItem } from "../type"

interface CodeViewProps {
  appId: string
  showCodeTab: boolean
  selectedTab: string
}

export const CodeView: React.FC<CodeViewProps> = ({
  appId,
  showCodeTab,
  selectedTab,
}) => {
  const [selectedCodeId, setSelectedCodeId] = useState<string>("app_entry")
  const [editedCode, setEditedCode] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [codeItems, setCodeItems] = useState<CodeItem[]>([])

  // 更新代码项列表
  const updateCodeItems = useCallback(() => {
    const currentVersion = appCodeStore.currentVersion
    if (!currentVersion) return

    const items: CodeItem[] = []

    // App Entry
    if (currentVersion.app) {
      const entryModuleId = `${appId}_app_entry`
      const entryModule = currentVersion.modules[entryModuleId]
      if (entryModule) {
        items.push({
          id: "app_entry",
          title: "应用入口 (App Entry)",
          type: "app",
          code: entryModule.data.code,
          updatedAt: entryModule.updatedAt
        })
      }
    }

    // 其他模块
    Object.entries(currentVersion.modules).forEach(([moduleId, moduleWrapper]) => {
      const moduleData = moduleWrapper.data
      if (moduleData.type !== "app") {
        items.push({
          id: moduleId,
          title: moduleData.title || moduleData.name,
          type: moduleData.type,
          name: moduleData.name,
          code: moduleData.code,
          updatedAt: moduleWrapper.updatedAt
        })
      }
    })

    setCodeItems(items)
  }, [appId])

  // 加载代码
  useEffect(() => {
    if (selectedCodeId) {
      const currentVersion = appCodeStore.currentVersion
      if (!currentVersion) return

      const moduleId = selectedCodeId === "app_entry" 
        ? `${appId}_app_entry` 
        : selectedCodeId

      const moduleWrapper = currentVersion.modules[moduleId]
      if (moduleWrapper) {
        setEditedCode(moduleWrapper.data.code || "")
      } else {
        setEditedCode("")
      }
    }
  }, [selectedCodeId, appCodeStore.currentIndex, appId])

  // 监听版本变化更新列表
  useEffect(() => {
    updateCodeItems()
  }, [updateCodeItems, appCodeStore.currentVersion])

  // 处理代码选择
  const handleCodeSelect = useCallback((moduleId: string) => {
    setSelectedCodeId(moduleId)
    
    const currentVersion = appCodeStore.currentVersion
    if (!currentVersion) return

    const actualModuleId = moduleId === "app_entry" 
      ? `${appId}_app_entry` 
      : moduleId

    const moduleWrapper = currentVersion.modules[actualModuleId]
    if (moduleWrapper) {
      setEditedCode(moduleWrapper.data.code || "")
      setIsEditing(false)
    }
  }, [appId])

  // 保存代码
  const handleSaveEdit = async () => {
    try {
      if (!selectedCodeId) return

      const moduleId = selectedCodeId === "app_entry" 
        ? `${appId}_app_entry` 
        : selectedCodeId

      const newVersion = await appCodeStore.addModules({
        [moduleId]: editedCode
      })
      debugger
      appCodeStore.addVersion(newVersion)

      setIsEditing(false)
      message.success("保存成功")
    } catch (error) {
      console.error("Error saving edit:", error)
      message.error("保存失败，请检查代码格式")
    }
  }

  // 取消编辑
  const handleCancelEdit = () => {
    const currentVersion = appCodeStore.currentVersion
    if (!currentVersion || !selectedCodeId) return

    const moduleId = selectedCodeId === "app_entry" 
      ? `${appId}_app_entry` 
      : selectedCodeId

    const moduleWrapper = currentVersion.modules[moduleId]
    if (moduleWrapper) {
      setEditedCode(moduleWrapper.data.code || "")
    }
    setIsEditing(false)
  }

  // 获取代码类型图标
  const getCodeTypeIcon = (type: string) => {
    switch (type) {
      case "app": return "mdi:application"
      case "page": return "mdi:file-code"
      case "store": return "mdi:database"
      case "service": return "mdi:api"
      case "module": return "mdi:puzzle"
      case "schema": return "mdi:json"
      default: return "mdi:code-tags"
    }
  }

  if (!showCodeTab || selectedTab !== "code") return null

  return (
    <div className="relative h-[calc(100vh-260px)] rounded-lg overflow-hidden mt-2">
      <div className="absolute top-2 left-2 right-2 z-10 flex justify-between items-center">
        <Select
          size="sm"
          className="max-w-xs bg-white/80 backdrop-blur-sm"
          selectedKeys={selectedCodeId ? [selectedCodeId] : []}
          onChange={(e) => handleCodeSelect(e.target.value)}
        >
          {codeItems?.map((item) => (
            <SelectItem
              key={item.id}
              value={item.id}
              startContent={<Icon icon={getCodeTypeIcon(item.type)} className="w-4 h-4" />}
            >
              {item.title}
              {item.type !== "app" && item.type !== "page" && item.name && (
                <span className="ml-2 text-xs text-default-400">({item.name})</span>
              )}
            </SelectItem>
          ))}
        </Select>

        {isEditing ? (
          <div className="space-x-2">
            <Button
              size="sm"
              color="primary"
              onClick={handleSaveEdit}
              startContent={<Icon icon="mdi:content-save" className="w-4 h-4" />}
            >
              保存
            </Button>
            <Button
              size="sm"
              variant="flat"
              onClick={handleCancelEdit}
              startContent={<Icon icon="mdi:close" className="w-4 h-4" />}
            >
              取消
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            color="primary"
            onClick={() => setIsEditing(true)}
            startContent={<Icon icon="mdi:pencil" className="w-4 h-4" />}
          >
            编辑
          </Button>
        )}
      </div>
      <div className="h-full pt-14 pb-2 px-2">
        <Editor
          height="100%"
          width="100%"
          language="javascript"
          value={editedCode}
          options={{
            readOnly: !isEditing,
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            wordWrap: "on",
            automaticLayout: true,
          }}
          theme="vs-dark"
          onChange={(value) => {
            if (isEditing) {
              setEditedCode(value || "")
            }
          }}
        />
      </div>
    </div>
  )
}