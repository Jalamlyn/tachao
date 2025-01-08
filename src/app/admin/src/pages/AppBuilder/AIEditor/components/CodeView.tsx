import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { observer } from "mobx-react-lite"
import { appCodeStore } from "../../store/appCodeStore"
import ModuleList from "./ModuleList"
import CodeEditor from "./CodeEditor"
import CodeViewModals from "./CodeViewModals"

interface CodeViewProps {
  appId: string
  showCodeTab: boolean
  selectedTab: string
  isFullWidth?: boolean
  onFullWidthChange?: (isFullWidth: boolean) => void
}

export const CodeView: React.FC<CodeViewProps> = observer(
  ({ appId, showCodeTab, selectedTab, isFullWidth = false, onFullWidthChange }) => {
    const [showContent, setShowContent] = useState(!appCodeStore.viewState.isPanelCollapsed)

    useEffect(() => {
      if (appCodeStore.viewState.isPanelCollapsed) {
        setShowContent(false)
      }
    }, [appCodeStore.viewState.isPanelCollapsed])

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
                  <ModuleList appId={appId} />
                </motion.div>
              )}
            </AnimatePresence>

            <CodeEditor isFullWidth={isFullWidth} onFullWidthChange={onFullWidthChange || (() => {})} />
          </div>
        </motion.div>

        <CodeViewModals />
      </div>
    )
  }
)

export default CodeView
