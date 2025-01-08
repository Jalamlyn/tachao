import React, { useState, useEffect, useCallback, useMemo, useRef } from "react"
import {
  Button,
  Tooltip,
  ScrollShadow,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  Chip,
  Divider,
  Input,
  Checkbox,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import Editor from "@monaco-editor/react"
import { appCodeStore } from "../../store/appCodeStore"
import message from "@/components/Message"
import { CodeItem } from "../type"
import { observer } from "mobx-react-lite"
import { motion, AnimatePresence } from "framer-motion"
import { useHotkeys } from "react-hotkeys-hook"
import CodeSearch from "./CodeSearch"

interface CodeViewProps {
  appId: string
  showCodeTab: boolean
  selectedTab: string
  isFullWidth?: boolean
  onFullWidthChange?: (isFullWidth: boolean) => void
}

export const CodeView: React.FC<CodeViewProps> = observer(
  ({ appId, showCodeTab, selectedTab, isFullWidth = false, onFullWidthChange }) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null)
    const searchInputRef = React.useRef<HTMLInputElement>(null)
    const editorRef = useRef<any>(null)
    const lastClickTimeRef = useRef<number>(0)
    const lastClickLineRef = useRef<number>(0)

    // 添加内容显示状态
    const [showContent, setShowContent] = useState(!appCodeStore.viewState.isPanelCollapsed)

    // 监听面板状态变化
    useEffect(() => {
      if (appCodeStore.viewState.isPanelCollapsed) {
        setShowContent(false)
      }
    }, [appCodeStore.viewState.isPanelCollapsed])

    // 添加快捷键支持
    useHotkeys("ctrl+f, cmd+f", (e) => {
      e.preventDefault()
      searchInputRef.current?.focus()
    })

    useHotkeys("esc", () => {
      appCodeStore.setSearchQuery("")
      appCodeStore.setSearchContent("")
    })
    const handleDeleteSelected = async () => {
      if (!appCodeStore?.viewState?.selectedModules?.length) return

      try {
        await appCodeStore.deleteModules(appCodeStore.viewState.selectedModules)
        message.success("模块删除成功")
        // 清空选择
        appCodeStore.viewState.selectedModules = []
        appCodeStore.viewState.showDeleteConfirm = false
      } catch (error) {
        message.error("删除失败: " + (error instanceof Error ? error.message : "未知错误"))
      }
    }
    // 处理行号双击事件
    const handleLineNumberDoubleClick = useCallback((lineNumber: number) => {
      if (!editorRef.current) return

      const model = editorRef.current.getModel()
      if (!model) return

      const line = model.getLineContent(lineNumber)
      const indentation = line.match(/^\s*/)?.[0] || ""

      // 检查是否已有 debugger 语句
      // 在 handleLineNumberDoubleClick 函数中修改删除逻辑
      if (line.trim().startsWith("debugger;")) {
        // 删除 debugger 语句和换行符
        const range = {
          startLineNumber: lineNumber,
          startColumn: 1,
          endLineNumber: lineNumber + 1, // 扩展到下一行
          endColumn: 1, // 到下一行的开始
        }

        // 只保留缩进
        const newLine = indentation

        model.pushEditOperations(
          [],
          [
            {
              range,
              text: newLine, // 直接替换为缩进,不添加换行符
            },
          ],
          null
        )
      } else {
        // 添加 debugger 语句
        const range = {
          startLineNumber: lineNumber,
          startColumn: 1,
          endLineNumber: lineNumber,
          endColumn: 1,
        }
        const debuggerLine = `${indentation}debugger;\n${indentation}`
        model.pushEditOperations(
          [],
          [
            {
              range,
              text: debuggerLine,
            },
          ],
          null
        )
      }
    }, [])

    // 处理编辑器加载完成
    const handleEditorDidMount = (editor: any) => {
      editorRef.current = editor

      // 添加行号点击事件监听
      editor.onMouseDown((e: any) => {
        if (e.target.type === monaco.editor.MouseTargetType.GUTTER_LINE_NUMBERS) {
          const lineNumber = e.target.position.lineNumber
          const now = Date.now()

          if (now - lastClickTimeRef.current < 300 && lastClickLineRef.current === lineNumber) {
            handleLineNumberDoubleClick(lineNumber)
          }

          lastClickTimeRef.current = now
          lastClickLineRef.current = lineNumber
        }
      })
    }

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

      if (!file.name.endsWith(".md")) {
        message.error("请上传 Markdown 文件")
        return
      }

      try {
        const content = await file.text()
        appCodeStore.viewState.importContent = content
      } catch (error) {
        console.error("Error reading file:", error)
        message.error("读取文件失败")
      }
    }

    const handleImport = async () => {
      if (!appCodeStore.viewState.importContent.trim()) {
        message.error("请输入或上传要导入的代码")
        return
      }

      appCodeStore.viewState.pendingImportContent = appCodeStore.viewState.importContent
      appCodeStore.viewState.showConfirmModal = true
    }

    const handleConfirmImport = async () => {
      appCodeStore.viewState.isImporting = true
      try {
        const result = await appCodeStore.importFromMarkdown(appCodeStore.viewState.pendingImportContent)
        if (result.success) {
          message.success("代码导入成功")
          appCodeStore.viewState.showImportModal = false
          appCodeStore.viewState.showConfirmModal = false
          appCodeStore.handleCodeSelect("app_entry")
        } else {
          message.error("导入失败: " + (result.errors || []).join(", "))
        }
      } catch (error) {
        console.error("Error importing code:", error)
        message.error("导入失败: " + (error instanceof Error ? error.message : "未知错误"))
      } finally {
        appCodeStore.viewState.isImporting = false
        appCodeStore.viewState.importContent = ""
        appCodeStore.viewState.pendingImportContent = ""
      }
    }

    if (!showCodeTab || selectedTab !== "code") return null

    return (
      <div className='relative h-[calc(100vh-200px)] rounded-lg overflow-hidden mt-2'>
        <motion.div
          initial={false}
          animate={{ width: appCodeStore.viewState.isPanelCollapsed ? "40px" : "calc(100%-80px)" }}
          transition={{
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1],
            type: "tween",
          }}
          onAnimationComplete={() => {
            if (!appCodeStore.viewState.isPanelCollapsed) {
              setShowContent(true)
            }
          }}
          className='bg-white/80 backdrop-blur-sm rounded-lg shadow-sm h-full'
          layout
        >
          <div className='flex h-full'>
            <AnimatePresence mode='wait'>
              {!appCodeStore.viewState.isPanelCollapsed && showContent && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{
                    duration: 0.2,
                    delay: 0.1,
                  }}
                  className='border-r w-[300px]'
                >
                  <div className='p-2'>
                    {/* 新增: 批量操作按钮 */}
                    {appCodeStore?.viewState?.selectedModules?.length > 0 && (
                      <div className='mb-2 flex items-center justify-between bg-danger-50 p-2 rounded-lg'>
                        <span className='text-sm text-danger'>
                          已选择 {appCodeStore?.viewState?.selectedModules?.length} 个模块
                        </span>
                        <Button
                          size='sm'
                          color='danger'
                          variant='flat'
                          onClick={() => {
                            appCodeStore.viewState.showDeleteConfirm = true
                          }}
                          startContent={<Icon icon='mdi:delete' className='w-4 h-4' />}
                        >
                          删除
                        </Button>
                      </div>
                    )}

                    {/* 保持原有的搜索框 */}
                    <div className='space-y-2 mb-2'>
                      <div className='flex'>
                        <Input
                          type='text'
                          placeholder='搜索代码内容...'
                          value={appCodeStore.viewState.searchContent}
                          onChange={(e) => appCodeStore.setSearchContent(e.target.value)}
                          startContent={<Icon icon='mdi:code-search' className='text-default-400' />}
                          className='w-full'
                        />
                        <CodeSearch appId={appId} />
                      </div>
                      {appCodeStore.viewState.searchResults.length > 0 && (
                        <div className='text-xs text-default-500 pl-2'>
                          找到 {appCodeStore.viewState.searchResults.length} 个匹配结果
                        </div>
                      )}
                    </div>

                    <ScrollShadow className='h-[calc(100vh-400px)]'>
                      <div className='space-y-1'>
                        <AnimatePresence>
                          {appCodeStore.getFilteredCodeItems().map((item) => (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              transition={{ duration: 0.2 }}
                              whileHover={{ x: 5 }}
                              className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${
                                appCodeStore.viewState.selectedCodeId === item.id
                                  ? "bg-primary text-white"
                                  : "hover:bg-default-100 text-default-600"
                              }`}
                            >
                              {/* 新增: 复选框 */}
                              {item.type !== "app" && (
                                <Checkbox
                                  size='sm'
                                  isSelected={appCodeStore?.viewState?.selectedModules?.includes(item.id)}
                                  onValueChange={(checked) => {
                                    if (checked) {
                                      appCodeStore.viewState.selectedModules = [
                                        ...appCodeStore.viewState.selectedModules,
                                        item.id,
                                      ]
                                    } else {
                                      appCodeStore.viewState.selectedModules =
                                        appCodeStore?.viewState?.selectedModules?.filter((id) => id !== item.id)
                                    }
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              )}

                              <div
                                className='flex-1 flex items-center gap-2'
                                onClick={() => appCodeStore.handleCodeSelect(item.id)}
                              >
                                <Icon icon={getCodeTypeIcon(item.type)} className='w-4 h-4 flex-shrink-0' />
                                <Tooltip content={item.title} placement='right'>
                                  <div className='flex flex-col flex-1 min-w-0'>
                                    <div className='flex items-center gap-2'>
                                      <span className='text-sm truncate max-w-[150px]'>{item.title}</span>
                                      <Chip
                                        size='sm'
                                        variant='flat'
                                        color={getCodeTypeColor(item.type)}
                                        className='text-[10px] h-4'
                                      >
                                        {item.type}
                                      </Chip>
                                    </div>
                                    <span className='text-xs opacity-70'>
                                      {new Date(item.updatedAt).toLocaleString()}
                                    </span>
                                  </div>
                                </Tooltip>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </ScrollShadow>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className='flex-1 relative mt-2'>
              <div className='flex items-center gap-2'>
                <Tooltip content='导出代码'>
                  <Button className='ml-2' size='sm' variant='flat' isIconOnly onPress={handleExportCode}>
                    <Icon icon='mdi:download' className='w-4 h-4' />
                  </Button>
                </Tooltip>
                <Tooltip content='导入代码'>
                  <Button
                    size='sm'
                    variant='flat'
                    isIconOnly
                    onClick={() => (appCodeStore.viewState.showImportModal = true)}
                  >
                    <Icon icon='mdi:upload' className='w-4 h-4' />
                  </Button>
                </Tooltip>
                <Divider orientation='vertical' className='h-6' />
                <Tooltip content='版本信息'>
                  <Button
                    size='sm'
                    variant='flat'
                    isIconOnly
                    onClick={() => (appCodeStore.viewState.showVersionInfo = true)}
                  >
                    <Icon icon='mdi:history' className='w-4 h-4' />
                  </Button>
                </Tooltip>
                <Divider orientation='vertical' className='h-6' />
                <Tooltip content={isFullWidth ? "退出全屏" : "全屏编辑"}>
                  <Button size='sm' variant='flat' isIconOnly onClick={() => onFullWidthChange?.(!isFullWidth)}>
                    <Icon icon={isFullWidth ? "mdi:fullscreen-exit" : "mdi:fullscreen"} className='w-4 h-4' />
                  </Button>
                </Tooltip>
                <Divider orientation='vertical' className='h-6' />
                {appCodeStore.viewState.isEditing ? (
                  <div className='space-x-2'>
                    <Button
                      size='sm'
                      color='primary'
                      onClick={() => appCodeStore.handleSaveEdit()}
                      startContent={<Icon icon='mdi:content-save' className='w-4 h-4' />}
                    >
                      保存
                    </Button>
                    <Button
                      size='sm'
                      variant='flat'
                      onClick={() => appCodeStore.handleCancelEdit()}
                      startContent={<Icon icon='mdi:close' className='w-4 h-4' />}
                    >
                      取消
                    </Button>
                  </div>
                ) : (
                  <Button
                    size='sm'
                    color='primary'
                    onClick={() => appCodeStore.setEditMode(true)}
                    startContent={<Icon icon='mdi:pencil' className='w-4 h-4' />}
                    isDisabled={!appCodeStore.viewState.selectedCodeId}
                  >
                    编辑
                  </Button>
                )}
              </div>

              <div className='h-[calc(100vh-250px)] pt-4'>
                <Editor
                  height='100%'
                  width='100%'
                  language='javascript'
                  value={appCodeStore.viewState.editedCode}
                  options={{
                    readOnly: !appCodeStore.viewState.isEditing,
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
                    find: {
                      addExtraSpaceOnTop: false,
                      autoFindInSelection: "never",
                      seedSearchStringFromSelection: "never",
                    },
                  }}
                  theme='vs-dark'
                  onChange={(value) => {
                    if (appCodeStore.viewState.isEditing) {
                      appCodeStore.updateEditedCode(value || "")
                    }
                  }}
                  onMount={handleEditorDidMount}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* 保持所有现有的 Modal 组件不变 */}
        <Modal
          isOpen={appCodeStore.viewState.showImportModal}
          onClose={() => {
            appCodeStore.viewState.showImportModal = false
            appCodeStore.viewState.importContent = ""
          }}
          size='2xl'
        >
          <ModalContent>
            <ModalHeader className='flex flex-col gap-1'>导入代码</ModalHeader>
            <ModalBody>
              <div className='flex flex-col gap-4'>
                <div className='flex justify-center'>
                  <input type='file' ref={fileInputRef} className='hidden' accept='.md' onChange={handleFileUpload} />
                  <Button
                    color='primary'
                    variant='flat'
                    startContent={<Icon icon='mdi:file-upload' className='w-4 h-4' />}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    上传 Markdown 文件
                  </Button>
                </div>
                <div className='text-center text-small text-default-500'>或者</div>
                <Textarea
                  label='粘贴 Markdown 内容'
                  placeholder='在此粘贴要导入的 Markdown 内容...'
                  value={appCodeStore.viewState.importContent}
                  onChange={(e) => (appCodeStore.viewState.importContent = e.target.value)}
                  minRows={10}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                variant='flat'
                onPress={() => {
                  appCodeStore.viewState.showImportModal = false
                  appCodeStore.viewState.importContent = ""
                }}
              >
                取消
              </Button>
              <Button color='primary' onPress={handleImport} isLoading={appCodeStore.viewState.isImporting}>
                导入
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Modal
          isOpen={appCodeStore.viewState.showConfirmModal}
          onClose={() => (appCodeStore.viewState.showConfirmModal = false)}
          size='sm'
        >
          <ModalContent>
            <ModalHeader className='flex flex-col gap-1'>确认导入</ModalHeader>
            <ModalBody>
              <div className='flex flex-col gap-2'>
                <p className='text-danger'>警告：导入将会覆盖当前所有代码！</p>
                <p className='text-default-500'>此操作不可撤销，是否确认继续？</p>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant='flat' onPress={() => (appCodeStore.viewState.showConfirmModal = false)}>
                取消
              </Button>
              <Button color='danger' onPress={handleConfirmImport} isLoading={appCodeStore.viewState.isImporting}>
                确认覆盖
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Modal
          isOpen={appCodeStore.viewState.showVersionInfo}
          onClose={() => (appCodeStore.viewState.showVersionInfo = false)}
          size='lg'
        >
          <ModalContent>
            <ModalHeader className='flex flex-col gap-1'>版本信息</ModalHeader>
            <ModalBody>
              <div className='flex flex-col gap-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-small font-semibold'>当前版本</p>
                    <p className='text-tiny text-default-500'>
                      {appCodeStore.currentVersion?.timestamp
                        ? new Date(appCodeStore.currentVersion.timestamp).toLocaleString()
                        : "无"}
                    </p>
                  </div>
                  <Chip color={appCodeStore.isViewingHistory ? "warning" : "success"} variant='flat'>
                    {appCodeStore.isViewingHistory ? "历史版本" : "最新版本"}
                  </Chip>
                </div>
                <Divider />
                <div>
                  <p className='text-small font-semibold mb-2'>版本历史</p>
                  <ScrollShadow className='h-[300px]'>
                    <div className='space-y-2'>
                      {appCodeStore.versions.map((version, index) => (
                        <div
                          key={version.timestamp}
                          className={`p-3 rounded-lg transition-colors ${
                            index === appCodeStore.currentIndex
                              ? "bg-primary text-white"
                              : "bg-default-100 hover:bg-default-200"
                          }`}
                        >
                          <div className='flex items-center justify-between'>
                            <div>
                              <p className='text-small'>版本 {index + 1}</p>
                              <p className='text-tiny opacity-80'>{new Date(version.timestamp).toLocaleString()}</p>
                            </div>
                            {index === appCodeStore.currentIndex && (
                              <Icon icon='mdi:check-circle' className='w-5 h-5' />
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
              <Button variant='flat' onPress={() => (appCodeStore.viewState.showVersionInfo = false)}>
                关闭
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        {/* 新增: 删除确认对话框 */}
        <Modal
          isOpen={appCodeStore.viewState.showDeleteConfirm}
          onClose={() => (appCodeStore.viewState.showDeleteConfirm = false)}
          size='sm'
        >
          <ModalContent>
            <ModalHeader className='flex flex-col gap-1'>确认删除</ModalHeader>
            <ModalBody>
              <div className='flex flex-col gap-2'>
                <p className='text-danger'>
                  警告：此操作将删除选中的 {appCodeStore?.viewState?.selectedModules?.length} 个模块！
                </p>
                <p className='text-default-500'>删除后可以通过版本回退恢复，是否确认继续？</p>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant='flat' onPress={() => (appCodeStore.viewState.showDeleteConfirm = false)}>
                取消
              </Button>
              <Button color='danger' onPress={handleDeleteSelected}>
                确认删除
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    )
  }
)

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
