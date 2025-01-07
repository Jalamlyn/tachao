import React, { useState, useEffect, useCallback, useMemo } from "react"
import {
  Button,
  Tabs,
  Tab,
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
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import Editor from "@monaco-editor/react"
import { appCodeStore } from "../../store/appCodeStore"
import message from "@/components/Message"
import { CodeItem } from "../type"
import { observer } from "mobx-react-lite"
import { motion, AnimatePresence } from "framer-motion"
import { useHotkeys } from "react-hotkeys-hook"
import CodeSearch from "./CodeSearch"  // 添加导入

interface CodeViewProps {
  appId: string
  showCodeTab: boolean
  selectedTab: string
  isFullWidth?: boolean
  onFullWidthChange?: (isFullWidth: boolean) => void
}

export const CodeView: React.FC<CodeViewProps> = observer(
  ({ appId, showCodeTab, selectedTab, isFullWidth = false, onFullWidthChange }) => {
    // ... 保持原有的 state 和 ref 定义 ...

    return (
      <div className='relative h-[calc(100vh-200px)] rounded-lg overflow-hidden mt-2'>
        <motion.div
          initial={false}
          animate={{ width: appCodeStore.viewState.isPanelCollapsed ? "40px" : "calc(100%-80px)" }}
          className='bg-white/80 backdrop-blur-sm rounded-lg shadow-sm h-full'
        >
          <div className='flex h-full'>
            <AnimatePresence>
              {!appCodeStore.viewState.isPanelCollapsed && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "300px", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className='border-r'
                >
                  <div className='p-2'>
                    <div className='space-y-2 mb-2'>
                      <div className="flex gap-2 items-center">
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
                    {/* ... 保持原有的代码列表渲染逻辑 ... */}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ... 保持原有的代码编辑器和其他功能 ... */}
          </div>
        </motion.div>

        {/* ... 保持原有的 Modal 组件 ... */}
      </div>
    )
  }
)

CodeView.displayName = "CodeView"

export default CodeView