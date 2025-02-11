import React, { useState, useEffect, useCallback, useRef } from "react"
import AICommandInput from "./components/AICommandInput"
import mo2 from "/assets/mo-2.png"
import user from "/assets/user.png"
import pm from "/assets/pm.png"
import { Tabs, Tab, Button, ScrollShadow, Avatar, Spinner, Modal, ModalContent, Chip } from "@nextui-org/react"
import { useClipboard } from "@nextui-org/use-clipboard"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"
import { AI_LEVELS, AIEditorProps } from "./type"
import { observer } from "mobx-react-lite"
import { appCodeStore } from "../store/appCodeStore"
import { CodeView } from "./components/CodeView"
import { motion } from "framer-motion"
import LogViewer from "./components/LogViewer"
import KnowledgeModal from "./components/KnowledgeModal"
import RequestView from "./components/RequestView"
import BalanceDisplay from "./components/BalanceDisplay"

const AIEditor: React.FC<AIEditorProps> = observer(
  ({
    onStop,
    messages,
    selectedTab,
    onTabChange,
    setMessages,
    onCommandResult,
    handleClearMessages,
    agent,
    renderPreview,
    renderDataView,
    showDataTab = false,
    showCodeTab = false,
    appId,
    onVersionChange,
  }) => {
    // 保留原有的所有状态和引用...

    return (
      <>
        <div className='flex w-full h-full'>
          <motion.div
            animate={{ width: isFullWidth ? "0%" : "35%" }}
            transition={{ duration: 0.3 }}
            className='h-full'
            style={{ overflow: isFullWidth ? "hidden" : "visible" }}
          >
            <div className='h-full flex flex-col'>
              <div className='flex justify-between items-center p-2 border-b mb-2'>
                <div className='flex items-center gap-4'>
                  <BalanceDisplay /> {/* 添加余额显示组件 */}
                </div>
                <div className='flex items-center gap-2'>
                  {!shouldAutoScroll && (
                    <Button
                      size='sm'
                      variant='light'
                      onClick={() => {
                        setShouldAutoScroll(true)
                        scrollToBottom()
                      }}
                      startContent={<Icon icon='mdi:arrow-down' className='w-4 h-4' />}
                    >
                      滚动到底部
                    </Button>
                  )}
                  <Button
                    size='sm'
                    variant='light'
                    color='primary'
                    onClick={() => setIsKnowledgeModalOpen(true)}
                    startContent={<Icon icon='solar:book-linear' className='w-4 h-4' />}
                  >
                    知识库
                  </Button>

                  <Button
                    size='sm'
                    variant='light'
                    color='primary'
                    onClick={handleClearMessages}
                    startContent={<Icon icon='mdi:refresh' className='w-4 h-4' />}
                  >
                    新对话
                  </Button>
                </div>
              </div>
              {/* 保留原有的其他组件和功能... */}
            </div>
          </motion.div>
          {/* 保留原有的右侧内容... */}
        </div>
        {/* 保留原有的模态框和其他组件... */}
      </>
    )
  }
)

AIEditor.displayName = "AIEditor"

export default AIEditor