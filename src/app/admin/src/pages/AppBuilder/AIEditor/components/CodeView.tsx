import React, { useState, useEffect, useCallback } from "react"
import { Button, Tabs, Tab, Tooltip, ScrollShadow, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Textarea, Chip, Divider } from "@nextui-org/react"
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
  const [showImportModal, setShowImportModal] = useState(false)
  const [importContent, setImportContent] = useState("")
  const [isImporting, setIsImporting] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [pendingImportContent, setPendingImportContent] = useState("")
  const [showVersionInfo, setShowVersionInfo] = useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleExportCode = useCallback(() => {
    try {
      appCodeStore.downloadMarkdown()
      message.success("代码导出成功")
    } catch (error) {
      console.error("Error exporting code:", error)
      message.error("代码导出失败")
    }
  }, [])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.md')) {
      message.error("请上传 Markdown 文件")
      return
    }

    try {
      const content = await file.text()
      setImportContent(content)
    } catch (error) {
      console.error("Error reading file:", error)
      message.error("读取文件失败")
    }
  }

  const handleImport = async () => {
    if (!importContent.trim()) {
      message.error("请输入或上传要导入的代码")
      return
    }

    setPendingImportContent(importContent)
    setShowConfirmModal(true)
  }

  const handleConfirmImport = async () => {
    setIsImporting(true)
    try {
      const result = await appCodeStore.importFromMarkdown(pendingImportContent)
      if (result.success) {
        message.success("代码导入成功")
        setShowImportModal(false)
        setShowConfirmModal(false)
        updateCodeItems()
        setSelectedCodeId("app_entry")
      } else {
        message.error("导入失败: " + (result.errors || []).join(", "))
      }
    } catch (error) {
      console.error("Error importing code:", error)
      message.error("导入失败: " + (error instanceof Error ? error.message : "未知错误"))
    } finally {
      setIsImporting(false)
      setImportContent("")
      setPendingImportContent("")
    }
  }

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

  useEffect(() => {
    updateCodeItems()
  }, [updateCodeItems, appCodeStore.currentVersion])

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

  const getCodeTypeColor = (type: string) => {
    switch (type) {
      case "app":
        return "primary"
      case "page":
        return "success"
      case "store":
        return "warning"
      case "service":
        return "danger"
      case "module":
        return "secondary"
      default:
        return "default"
    }
  }

  const filteredCodeItems = codeItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!showCodeTab || selectedTab !== "code") return null

  return (
    <div className='relative h-[calc(100vh-200px)] rounded-lg overflow-hidden mt-2'>
      <div className='absolute top-2 left-2 right-2 z-10 flex justify-between items-center'>
        <motion.div
          initial={false}
          animate={{ width: isPanelCollapsed ? "40px" : "calc(100% - 120px)" }}
          className='bg-white/80 backdrop-blur-sm rounded-lg shadow-sm'
        >
          <div className='flex h-full'>
            <AnimatePresence>
              {!isPanelCollapsed && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "250px", opacity: 1 }}
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
                              <div className='flex items-center gap-2'>
                                <span className='text-sm truncate'>{item.title}</span>
                                <Chip
                                  size="sm"
                                  variant="flat"
                                  color={getCodeTypeColor(item.type)}
                                  className='text-[10px] h-4'
                                >
                                  {item.type}
                                </Chip>
                              </div>
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
              <div className='absolute top-2 left-2 z-20 flex items-center gap-2'>
                <Tooltip content={isPanelCollapsed ? "展开文件面板" : "收起文件面板"}>
                  <Button size='sm' variant='flat' isIconOnly onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}>
                    <Icon icon={isPanelCollapsed ? "mdi:chevron-right" : "mdi:chevron-left"} className='w-4 h-4' />
                  </Button>
                </Tooltip>
                <Divider orientation="vertical" className="h-6" />
                <Tooltip content='导出代码'>
                  <Button size='sm' variant='flat' isIconOnly onClick={handleExportCode}>
                    <Icon icon='mdi:download' className='w-4 h-4' />
                  </Button>
                </Tooltip>
                <Tooltip content='导入代码'>
                  <Button size='sm' variant='flat' isIconOnly onClick={() => setShowImportModal(true)}>
                    <Icon icon='mdi:upload' className='w-4 h-4' />
                  </Button>
                </Tooltip>
                <Divider orientation="vertical" className="h-6" />
                <Tooltip content='版本信息'>
                  <Button 
                    size='sm' 
                    variant='flat' 
                    isIconOnly 
                    onClick={() => setShowVersionInfo(true)}
                  >
                    <Icon icon='mdi:history' className='w-4 h-4' />
                  </Button>
                </Tooltip>
                <Divider orientation="vertical" className="h-6" />
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

      {/* 导入 Modal */}
      <Modal 
        isOpen={showImportModal} 
        onClose={() => {
          setShowImportModal(false)
          setImportContent("")
        }}
        size="2xl"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            导入代码
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <div className="flex justify-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".md"
                  onChange={handleFileUpload}
                />
                <Button
                  color="primary"
                  variant="flat"
                  startContent={<Icon icon="mdi:file-upload" className="w-4 h-4" />}
                  onClick={() => fileInputRef.current?.click()}
                >
                  上传 Markdown 文件
                </Button>
              </div>
              <div className="text-center text-small text-default-500">
                或者
              </div>
              <Textarea
                label="粘贴 Markdown 内容"
                placeholder="在此粘贴要导入的 Markdown 内容..."
                value={importContent}
                onChange={(e) => setImportContent(e.target.value)}
                minRows={10}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              onPress={() => {
                setShowImportModal(false)
                setImportContent("")
              }}
            >
              取消
            </Button>
            <Button
              color="primary"
              onPress={handleImport}
              isLoading={isImporting}
            >
              导入
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 确认对话框 */}
      <Modal 
        isOpen={showConfirmModal} 
        onClose={() => setShowConfirmModal(false)}
        size="sm"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            确认导入
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-2">
              <p className="text-danger">警告：导入将会覆盖当前所有代码！</p>
              <p className="text-default-500">此操作不可撤销，是否确认继续？</p>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              onPress={() => setShowConfirmModal(false)}
            >
              取消
            </Button>
            <Button
              color="danger"
              onPress={handleConfirmImport}
              isLoading={isImporting}
            >
              确认覆盖
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 版本信息 Modal */}
      <Modal 
        isOpen={showVersionInfo} 
        onClose={() => setShowVersionInfo(false)}
        size="lg"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            版本信息
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-small font-semibold">当前版本</p>
                  <p className="text-tiny text-default-500">
                    {appCodeStore.currentVersion?.timestamp
                      ? new Date(appCodeStore.currentVersion.timestamp).toLocaleString()
                      : "无"}
                  </p>
                </div>
                <Chip
                  color={appCodeStore.isViewingHistory ? "warning" : "success"}
                  variant="flat"
                >
                  {appCodeStore.isViewingHistory ? "历史版本" : "最新版本"}
                </Chip>
              </div>
              <Divider />
              <div>
                <p className="text-small font-semibold mb-2">版本历史</p>
                <ScrollShadow className="h-[300px]">
                  <div className="space-y-2">
                    {appCodeStore.versions.map((version, index) => (
                      <div
                        key={version.timestamp}
                        className={`p-3 rounded-lg transition-colors ${
                          index === appCodeStore.currentIndex
                            ? "bg-primary text-white"
                            : "bg-default-100 hover:bg-default-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-small">版本 {index + 1}</p>
                            <p className="text-tiny opacity-80">
                              {new Date(version.timestamp).toLocaleString()}
                            </p>
                          </div>
                          {index === appCodeStore.currentIndex && (
                            <Icon icon="mdi:check-circle" className="w-5 h-5" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollShadow>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              onPress={() => setShowVersionInfo(false)}
            >
              关闭
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
})