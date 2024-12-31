import React, { useState, useEffect, useCallback } from "react"
import { Button, Tabs, Tab, Tooltip, ScrollShadow } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import Editor from "@monaco-editor/react"
import { appCodeStore } from "../../store/appCodeStore"
import message from "@/components/Message"
import { CodeItem } from "../type"
import { observer } from "mobx-react-lite"
import { motion, AnimatePresence } from "framer-motion"

interface CodeViewProps {
  appId: string
  showCodeTab: boolean
  selectedTab: string
}

export const CodeView: React.FC<CodeViewProps> = observer(({ appId, showCodeTab, selectedTab }) => {
  const [selectedCodeId, setSelectedCodeId] = useState<string>("app_entry")
  const [editedCode, setEditedCode] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [codeItems, setCodeItems] = useState<CodeItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false)

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
          updatedAt: entryModule.updatedAt,
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
          updatedAt: moduleWrapper.updatedAt,
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

      const moduleId = selectedCodeId === "app_entry" ? `${appId}_app_entry` : selectedCodeId

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
  const handleCodeSelect = useCallback(
    (moduleId: string) => {
      setSelectedCodeId(moduleId)

      const currentVersion = appCodeStore.currentVersion
      if (!currentVersion) return

      const actualModuleId = moduleId === "app_entry" ? `${appId}_app_entry` : moduleId

      const moduleWrapper = currentVersion.modules[actualModuleId]
      if (moduleWrapper) {
        setEditedCode(moduleWrapper.data.code || "")
        setIsEditing(false)
      }
    },
    [appId]
  )

  // 保存代码
  const handleSaveEdit = async () => {
    try {
      if (!selectedCodeId) return

      const moduleId = selectedCodeId === "app_entry" ? `${appId}_app_entry` : selectedCodeId

      const newVersion = await appCodeStore.addModules({
        [moduleId]: editedCode,
      })

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

    const moduleId = selectedCodeId === "app_entry" ? `${appId}_app_entry` : selectedCodeId

    const moduleWrapper = currentVersion.modules[moduleId]
    if (moduleWrapper) {
      setEditedCode(moduleWrapper.data.code || "")
    }
    setIsEditing(false)
  }

  // 获取代码类型图标
  const getCodeTypeIcon = (type: string) => {
    switch (type) {
      case "app":
        return "mdi:application"
      case "page":
        return "mdi:file-code"
      case "store":
        return "mdi:database"
      case "service":
        return "mdi:api"
      case "module":
        return "mdi:puzzle"
      case "schema":
        return "mdi:json"
      default:
        return "mdi:code-tags"
    }
  }

  // 过滤文件列表
  const filteredCodeItems = codeItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!showCodeTab || selectedTab !== "code") return null

  return (
    <div className='relative h-[calc(100vh-260px)] rounded-lg overflow-hidden mt-2'>
      <div className='absolute top-2 left-2 right-2 z-10 flex justify-between items-center'>
        <motion.div
          initial={false}
          animate={{ width: isPanelCollapsed ? "40px" : "calc(100% - 40px)" }}
          className='bg-white/80 backdrop-blur-sm rounded-lg shadow-sm'
        >
          <div className='flex h-full'>
            <AnimatePresence>
              {!isPanelCollapsed && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "150px", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className='border-r'
                >
                  <div className='p-2'>
                    <div className='relative mb-2'>
                      <input
                        type='text'
                        placeholder='搜索文件...'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className='w-full px-3 py-1.5 pr-8 rounded-md bg-default-100 border-none focus:ring-2 focus:ring-primary'
                      />
                      <Icon
                        icon='mdi:magnify'
                        className='absolute right-2 top-1/2 transform -translate-y-1/2 text-default-400'
                      />
                    </div>
                    <ScrollShadow className='h-[calc(100vh-400px)]'>
                      <div className='space-y-1'>
                        {filteredCodeItems.map((item) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            whileHover={{ x: 5 }}
                            className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${
                              selectedCodeId === item.id
                                ? "bg-primary text-white"
                                : "hover:bg-default-100 text-default-600"
                            }`}
                            onClick={() => handleCodeSelect(item.id)}
                          >
                            <Icon icon={getCodeTypeIcon(item.type)} className='w-4 h-4 flex-shrink-0' />
                            <div className='flex flex-col flex-1 min-w-0'>
                              <span className='text-sm truncate'>{item.title}</span>
                              <span className='text-xs opacity-70'>{new Date(item.updatedAt).toLocaleString()}</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </ScrollShadow>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className='flex-1 relative'>
              <div className='absolute top-2 right-2 z-20 flex items-center gap-2'>
                <Tooltip content={isPanelCollapsed ? "展开文件面板" : "收起文件面板"}>
                  <Button size='sm' variant='flat' isIconOnly onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}>
                    <Icon icon={isPanelCollapsed ? "mdi:chevron-right" : "mdi:chevron-left"} className='w-4 h-4' />
                  </Button>
                </Tooltip>
                {isEditing ? (
                  <div className='space-x-2'>
                    <Button
                      size='sm'
                      color='primary'
                      onClick={handleSaveEdit}
                      startContent={<Icon icon='mdi:content-save' className='w-4 h-4' />}
                    >
                      保存
                    </Button>
                    <Button
                      size='sm'
                      variant='flat'
                      onClick={handleCancelEdit}
                      startContent={<Icon icon='mdi:close' className='w-4 h-4' />}
                    >
                      取消
                    </Button>
                  </div>
                ) : (
                  <Button
                    size='sm'
                    color='primary'
                    onClick={() => setIsEditing(true)}
                    startContent={<Icon icon='mdi:pencil' className='w-4 h-4' />}
                    isDisabled={!selectedCodeId}
                  >
                    编辑
                  </Button>
                )}
              </div>

              <div className='h-full pt-14'>
                <Editor
                  height='100%'
                  width='100%'
                  language='javascript'
                  value={editedCode}
                  options={{
                    readOnly: !isEditing,
                    minimap: { enabled: true },
                    fontSize: 14,
                    lineNumbers: "on",
                    wordWrap: "on",
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    smoothScrolling: true,
                    cursorBlinking: "smooth",
                    cursorSmoothCaretAnimation: true,
                    formatOnPaste: true,
                    formatOnType: true,
                  }}
                  theme='vs-dark'
                  onChange={(value) => {
                    if (isEditing) {
                      setEditedCode(value || "")
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
})
