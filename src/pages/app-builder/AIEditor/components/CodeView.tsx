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

  // ... (保持原有的所有方法不变)

  const handleExportCode = useCallback(() => {
    try {
      appCodeStore.downloadMarkdown()
      message.success("代码导出成功")
    } catch (error) {
      console.error("Error exporting code:", error)
      message.error("代码导出失败")
    }
  }, [])

  if (!showCodeTab || selectedTab !== "code") return null

  return (
    <div className='relative h-[calc(100vh-260px)] rounded-lg overflow-hidden mt-2'>
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
                  <Button
                    size='sm'
                    variant='flat'
                    isIconOnly
                    onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
                  >
                    <Icon
                      icon={isPanelCollapsed ? "mdi:chevron-right" : "mdi:chevron-left"}
                      className='w-4 h-4'
                    />
                  </Button>
                </Tooltip>
                <Tooltip content="导出代码">
                  <Button
                    size='sm'
                    variant='flat'
                    isIconOnly
                    onClick={handleExportCode}
                  >
                    <Icon icon="mdi:download" className='w-4 h-4' />
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