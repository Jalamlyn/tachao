import React, { useRef, useEffect, useState } from "react"
import { Input, ScrollShadow, Tooltip, Chip, Checkbox, Button, Card } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { motion, AnimatePresence } from "framer-motion"
import { observer } from "mobx-react-lite"
import { appCodeStore } from "../../store/appCodeStore"
import CodeSearch from "./CodeSearch"
import { getCodeTypeIcon, getCodeTypeColor } from "./utils"

interface ModuleListProps {
  appId: string
}

export const ModuleList: React.FC<ModuleListProps> = observer(({ appId }) => {
  const [activeSection, setActiveSection] = useState<string>("search")
  const searchRef = useRef<HTMLDivElement>(null)
  const contextRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 监听滚动位置更新活动区域
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      const scrollPosition = container.scrollTop
      const sections = [
        { id: "search", ref: searchRef },
        { id: "context", ref: contextRef },
        { id: "list", ref: listRef },
      ]

      for (const section of sections) {
        if (!section.ref.current) continue
        const offsetTop = section.ref.current.offsetTop
        if (scrollPosition >= offsetTop - 100) {
          setActiveSection(section.id)
        }
      }
    }

    container.addEventListener("scroll", handleScroll)
    return () => container.removeEventListener("scroll", handleScroll)
  }, [])

  // 处理导航点击
  const handleNavClick = (sectionId: string) => {
    const sectionRef = {
      search: searchRef,
      context: contextRef,
      list: listRef,
    }[sectionId]

    if (sectionRef?.current) {
      containerRef.current?.scrollTo({
        top: sectionRef.current.offsetTop - 20,
        behavior: "smooth",
      })
    }
  }

  return (
    <div className='p-2 h-full flex'>
      {/* 左侧导航栏 */}
      <div className='w-10 flex-shrink-0 border-r mr-2'>
        <div className='sticky top-0 pt-2 flex flex-col items-center gap-2'>
          <Tooltip content='搜索' placement='right'>
            <Button
              isIconOnly
              size='sm'
              variant='light'
              className={`w-8 h-8 ${activeSection === "search" ? "bg-primary/10 text-primary" : ""}`}
              onClick={() => handleNavClick("search")}
            >
              <Icon icon='mdi:magnify' className='w-5 h-5' />
            </Button>
          </Tooltip>

          <Tooltip content='上下文' placement='right'>
            <Button
              isIconOnly
              size='sm'
              variant='light'
              className={`w-8 h-8 ${activeSection === "context" ? "bg-primary/10 text-primary" : ""}`}
              onClick={() => handleNavClick("context")}
            >
              <Icon icon='mdi:brain' className='w-5 h-5' />
            </Button>
          </Tooltip>

          <Tooltip content='模块列表' placement='right'>
            <Button
              isIconOnly
              size='sm'
              variant='light'
              className={`w-8 h-8 ${activeSection === "list" ? "bg-primary/10 text-primary" : ""}`}
              onClick={() => handleNavClick("list")}
            >
              <Icon icon='mdi:view-list' className='w-5 h-5' />
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* 主内容区域 */}
      <div ref={containerRef} className='flex-1 overflow-y-auto'>
        {/* 搜索区域 */}
        <div ref={searchRef} id='search' className='space-y-2 mb-6'>
          <div className='flex gap-2'>
            <Input
              type='text'
              placeholder='搜索代码内容...'
              value={appCodeStore.viewState.searchContent}
              onChange={(e) => appCodeStore.setSearchContent(e.target.value)}
              startContent={
                <Icon icon='mdi:code-search' className='text-default-400 transition-transform group-hover:scale-110' />
              }
              className='w-full group'
              classNames={{
                inputWrapper: "shadow-sm hover:shadow transition-shadow duration-200",
                input: "text-sm",
              }}
            />
            <CodeSearch appId={appId} />
          </div>
          {appCodeStore.viewState.searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='text-xs text-default-500 pl-2 flex items-center gap-2'
            >
              <Icon icon='mdi:search-web' className='w-4 h-4' />
              找到 {appCodeStore.viewState.searchResults.length} 个匹配结果
            </motion.div>
          )}
        </div>

        {/* 独立的上下文区域 */}
        {appCodeStore.viewState.useSelectedModulesAsContext && (
          <div ref={contextRef} id='context' className='mb-6'>
            <Card className='bg-default-50/80 backdrop-blur-sm shadow-sm'>
              <div className='p-3'>
                <div className='font-medium mb-2 flex items-center justify-between'>
                  <span>当前上下文模块</span>
                  <Button
                    size='sm'
                    color='primary'
                    variant='light'
                    onClick={() => appCodeStore.toggleUseSelectedModulesAsContext()}
                    startContent={<Icon icon='mdi:brain' className='w-4 h-4' />}
                  >
                    清除上下文
                  </Button>
                </div>
                <div className='flex flex-wrap gap-1'>
                  {appCodeStore.getSelectedModulesInfo().map((module) => (
                    <Chip
                      key={module.id}
                      size='sm'
                      variant='flat'
                      className='transition-transform hover:scale-105'
                    >
                      <div className='flex items-center gap-1'>
                        <Icon
                          icon={getCodeTypeIcon(module.type)}
                          className={`w-3 h-3 text-${getCodeTypeColor(module.type)}`}
                        />
                        <span>{module.title || module.name}</span>
                      </div>
                    </Chip>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* 模块列表 */}
        <div ref={listRef} id='list' className='space-y-2'>
          {appCodeStore?.viewState?.selectedModules?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className='mb-4'
            >
              <Card className='bg-default-100/80 backdrop-blur-sm shadow-sm'>
                <div className='p-3'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium'>
                      已选择 {appCodeStore?.viewState?.selectedModules?.length} 个模块
                    </span>
                    <div className='flex gap-2'>
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
                      <Button
                        size='sm'
                        color='primary'
                        variant='flat'
                        onClick={() => appCodeStore.toggleUseSelectedModulesAsContext()}
                        startContent={<Icon icon='mdi:brain' className='w-4 h-4' />}
                      >
                        用作上下文
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          <AnimatePresence mode='popLayout'>
            {appCodeStore.getFilteredCodeItems().map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                whileHover={{ x: 5, backgroundColor: "rgba(0,0,0,0.02)" }}
                className={`
                  group relative rounded-xl border border-transparent
                  ${
                    appCodeStore.viewState.selectedCodeId === item.id
                      ? "bg-primary/5 border-primary/20 shadow-sm"
                      : "hover:border-default-200"
                  }
                  transition-all duration-200
                `}
              >
                <div className='flex items-center gap-3 p-3'>
                  {item.type !== "app" && (
                    <Checkbox
                      size='sm'
                      isSelected={appCodeStore?.viewState?.selectedModules?.includes(item.id)}
                      onValueChange={(checked) => {
                        if (checked) {
                          appCodeStore.viewState.selectedModules = [...appCodeStore.viewState.selectedModules, item.id]
                        } else {
                          appCodeStore.viewState.selectedModules = appCodeStore?.viewState?.selectedModules?.filter(
                            (id) => id !== item.id
                          )
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className='transition-transform group-hover:scale-110'
                    />
                  )}

                  <div
                    className='flex-1 flex items-center gap-3 cursor-pointer'
                    onClick={() => appCodeStore.handleCodeSelect(item.id)}
                  >
                    <div className='w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center'>
                      <Icon
                        icon={getCodeTypeIcon(item.type)}
                        className={`w-5 h-5 transition-transform group-hover:scale-110 text-${getCodeTypeColor(
                          item.type
                        )}`}
                      />
                    </div>

                    <div className='flex flex-col flex-1 min-w-0'>
                      <span className='text-sm font-medium truncate'>{item.title}</span>
                      <span className='text-xs text-default-400'>{new Date(item.updatedAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
})

export default ModuleList