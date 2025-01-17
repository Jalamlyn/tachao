import React, { useRef, useEffect, useState } from "react"
import {
  Input,
  ScrollShadow,
  Tooltip,
  Chip,
  Checkbox,
  Button,
  Card,
  Badge,
  Select,
  SelectItem,
  ButtonGroup,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { motion, AnimatePresence } from "framer-motion"
import { observer } from "mobx-react-lite"
import { appCodeStore } from "../../store/appCodeStore"
import CodeSearch from "./CodeSearch"
import { getCodeTypeIcon, getCodeTypeColor, calculateModuleSize, formatSize, getModuleSizeColor } from "./utils"
import message from "@/components/Message"
import SaveContextModal from "./SaveContextModal"

interface ModuleListProps {
  appId: string
}

export const ModuleList: React.FC<ModuleListProps> = observer(({ appId }) => {
  const [activeSection, setActiveSection] = useState<string>("search")
  const searchRef = useRef<HTMLDivElement>(null)
  const contextRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [showSaveContextModal, setShowSaveContextModal] = useState(false)

  // 加载保存的快捷上下文
  useEffect(() => {
    appCodeStore.loadContextShortcuts()
  }, [])

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

    if (sectionId === "context") {
      const selectedCount = appCodeStore?.viewState?.selectedModules?.length || 0
      const totalCount = appCodeStore.getFilteredCodeItems().length
      const isContextActive = appCodeStore.viewState.useSelectedModulesAsContext

      if (selectedCount === 0) {
        message.info("默认使用所有模块作为上下文，您可以手动选择特定模块")
      } else if (!isContextActive) {
        message.info(`已选择 ${selectedCount}/${totalCount} 个模块，点击激活按钮将其用作上下文`)
      } else {
        message.info(`当前正在使用 ${selectedCount}/${totalCount} 个选中模块作为上下文`)
      }
    }
  }

  const getContextStatus = () => {
    const selectedCount = appCodeStore?.viewState?.selectedModules?.length || 0
    const totalCount = appCodeStore.getFilteredCodeItems().length
    const isContextActive = appCodeStore.viewState.useSelectedModulesAsContext
    const hasSelectedModules = selectedCount > 0

    if (isContextActive && hasSelectedModules) {
      return {
        icon: "material-symbols:contextual-token-add",
        color: "success" as const,
        tooltip: `正在使用 ${selectedCount}/${totalCount} 个选中模块作为上下文`,
      }
    }

    if (hasSelectedModules) {
      return {
        icon: "material-symbols:contextual-token-add-outline-rounded",
        color: "primary" as const,
        tooltip: `已选择 ${selectedCount}/${totalCount} 个模块，点击激活为上下文`,
      }
    }

    return {
      icon: "material-symbols:contextual-token-add-outline-rounded",
      color: "default" as const,
      tooltip: "默认使用所有模块作为上下文",
    }
  }

  const handleDelete = async () => {
    try {
      appCodeStore.viewState.isDeletingModules = true
      message.loading("正在检查模块依赖关系...", 0)

      await appCodeStore.deleteModules(appCodeStore.viewState.selectedModules, (progress) => {
        message.loading(`正在检查依赖 (${progress.current}/${progress.total}): ${progress.status}`, 0)
      })

      message.success("模块删除成功")
      appCodeStore.viewState.showDeleteConfirm = false
    } catch (error) {
      message.error(error.message)
    } finally {
      appCodeStore.viewState.isDeletingModules = false
      message.destroy()
    }
  }

  const handleSaveContextShortcut = () => {
    setShowSaveContextModal(true)
  }

  const contextStatus = getContextStatus()
  const filteredItems = appCodeStore.getFilteredCodeItems()
  const hasSearchContent = appCodeStore.viewState.searchContent.trim() !== ""
  const noResults = hasSearchContent && appCodeStore.viewState.searchResults.length === 0

  return (
    <div className='p-2 h-full flex'>
      <div className='w-8 flex-shrink-0 border-r pr-1 mr-1'>
        <div className='sticky top-0 pt-2 flex flex-col items-center gap-1.5'>
          <Tooltip content='搜索' placement='right'>
            <Button
              isIconOnly
              size='sm'
              variant='light'
              className={`w-6 h-6 min-w-unit-6 ${activeSection === "search" ? "bg-primary/10 text-primary" : ""}`}
              onClick={() => handleNavClick("search")}
            >
              <Icon icon='mdi:magnify' className='w-4 h-4' />
            </Button>
          </Tooltip>

          <Tooltip content={contextStatus.tooltip} placement='right'>
            <Badge
              content={appCodeStore?.viewState?.selectedModules?.length || 0}
              color={contextStatus.color}
              size='sm'
              isInvisible={!appCodeStore?.viewState?.selectedModules?.length}
              className='animate-pulse'
            >
              <Button
                isIconOnly
                size='sm'
                variant='light'
                className={`w-6 h-6 min-w-unit-6 ${activeSection === "context" ? "bg-primary/10 text-primary" : ""}`}
                onClick={() => handleNavClick("context")}
              >
                <Icon
                  icon={contextStatus.icon}
                  className={`w-4 h-4 ${
                    appCodeStore.viewState.useSelectedModulesAsContext &&
                    appCodeStore?.viewState?.selectedModules?.length
                      ? "text-success"
                      : ""
                  }`}
                />
              </Button>
            </Badge>
          </Tooltip>

          <Tooltip content='模块列表' placement='right'>
            <Button
              isIconOnly
              size='sm'
              variant='light'
              className={`w-6 h-6 min-w-unit-6 ${activeSection === "list" ? "bg-primary/10 text-primary" : ""}`}
              onClick={() => handleNavClick("list")}
            >
              <Icon icon='mdi:view-list' className='w-4 h-4' />
            </Button>
          </Tooltip>
        </div>
      </div>

      <div ref={containerRef} className='flex-1 overflow-y-auto'>
        <div ref={searchRef} id='search' className='space-y-2 mb-4'>
          <div className='flex gap-1'>
            <Input
              type='text'
              placeholder='搜索代码内容/模块名...'
              value={appCodeStore.viewState.searchContent}
              onChange={(e) => appCodeStore.setSearchContent(e.target.value)}
              startContent={
                <Icon
                  icon='mdi:code-search'
                  className='text-default-400 transition-transform group-hover:scale-110 w-4 h-4'
                />
              }
              className='w-full group'
              classNames={{
                inputWrapper: "shadow-sm hover:shadow transition-shadow duration-200 h-8",
                input: "text-sm",
              }}
            />
            <CodeSearch appId={appId} />
          </div>
          {hasSearchContent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='text-xs text-default-500 pl-1 flex items-center gap-1'
            >
              <Icon icon='mdi:search-web' className='w-3 h-3' />
              找到 {appCodeStore.viewState.searchResults.length} 个匹配结果
              {noResults && <span className='text-warning'>(无匹配内容)</span>}
            </motion.div>
          )}
        </div>

        {appCodeStore.viewState.useSelectedModulesAsContext && appCodeStore?.viewState?.selectedModules?.length > 0 && (
          <div ref={contextRef} id='context' className='mb-4'>
            <Card className='bg-gradient-to-r from-primary-50 to-primary-100/50 backdrop-blur-sm shadow-sm'>
              <div className='p-2'>
                <span>当前上下文模块</span>
                <div className='text-sm font-medium mb-1.5 flex items-center justify-between'>
                  <div className='flex gap-1'>
                    <Button
                      size='sm'
                      color='primary'
                      variant='light'
                      onClick={handleSaveContextShortcut}
                      startContent={<Icon icon='mdi:bookmark-plus' className='w-3 h-3' />}
                      className='min-w-unit-16 h-6'
                    >
                      保存快捷上下文
                    </Button>
                    <Button
                      size='sm'
                      color='danger'
                      variant='light'
                      onClick={() => appCodeStore.toggleUseSelectedModulesAsContext()}
                      startContent={
                        <Icon icon='material-symbols:contextual-token-add-outline-sharp' className='w-3 h-3' />
                      }
                      className='min-w-unit-16 h-6'
                    >
                      清除上下文
                    </Button>
                  </div>
                </div>
                <div className='flex flex-wrap gap-1'>
                  {appCodeStore.getSelectedModulesInfo().map((module) => (
                    <Chip key={module.id} size='sm' variant='flat' className='transition-transform hover:scale-105 h-5'>
                      <div className='flex items-center gap-1'>
                        <Icon
                          icon={getCodeTypeIcon(module.type)}
                          className={`w-3 h-3 text-${getCodeTypeColor(module.type)}`}
                        />
                        <span className='text-xs'>{module.title || module.name}</span>
                      </div>
                    </Chip>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* 快捷上下文选择器 */}
        {appCodeStore.viewState.contextShortcuts.length > 0 ? (
          <div className='mb-4'>
            <Card className='bg-default-50/80 backdrop-blur-sm shadow-sm'>
              <div className='p-2'>
                <div className='text-sm font-medium mb-2'>快捷上下文</div>
                <Select
                  selectionMode='multiple'
                  isMultiline={true}
                  placeholder='选择快捷上下文'
                  selectedKeys={appCodeStore.viewState.selectedShortcuts}
                  onSelectionChange={(keys) => appCodeStore.applyContextShortcuts(Array.from(keys) as string[])}
                  className='w-full'
                  items={appCodeStore.viewState.contextShortcuts}
                  labelPlacement='outside'
                  classNames={{
                    trigger: "min-h-12 py-2",
                    value: "text-small",
                  }}
                  renderValue={(items) => {
                    return (
                      <div className='flex flex-wrap gap-2'>
                        {items.map((item) => (
                          <Chip
                            key={item.key}
                            variant='flat'
                            color='primary'
                            startContent={<Icon icon='solar:bookmark-square-minimalistic-linear' className='w-3 h-3' />}
                          >
                            {item.data.name}
                            <span className='text-tiny ml-1'>({item.data.moduleIds.length}个模块)</span>
                          </Chip>
                        ))}
                      </div>
                    )
                  }}
                >
                  {(shortcut) => (
                    <SelectItem key={shortcut.id} textValue={shortcut.name}>
                      <div className='flex items-center justify-between w-full'>
                        <div className='flex items-center gap-2'>
                          <div className='w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center'>
                            <Icon icon='solar:bookmark-square-minimalistic-linear' className='w-4 h-4 text-primary' />
                          </div>
                          <div className='flex flex-col'>
                            <span className='text-small'>{shortcut.name}</span>
                            <span className='text-tiny text-default-400'>{shortcut.moduleIds.length} 个模块</span>
                          </div>
                        </div>
                        <Button
                          size='sm'
                          isIconOnly
                          variant='light'
                          color='danger'
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            appCodeStore.deleteContextShortcut(shortcut.id)
                          }}
                        >
                          <Icon icon='mdi:delete' className='w-4 h-4' />
                        </Button>
                      </div>
                    </SelectItem>
                  )}
                </Select>
              </div>
            </Card>
          </div>
        ) : (
          <div className='mb-4'></div>
        )}

        <div ref={listRef} id='list' className='space-y-1.5'>
          {appCodeStore?.viewState?.selectedModules?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className='mb-3'
            >
              <Card className='bg-default-100/80 backdrop-blur-sm shadow-sm'>
                <div className='p-2'>
                  <div className='flex flex-col items-center justify-between'>
                    <div className='text-sm text-left font-medium p-1'>
                      已选择 {appCodeStore?.viewState?.selectedModules?.length} 个模块
                      {!appCodeStore.viewState.useSelectedModulesAsContext && (
                        <span className='text-default-400 text-xs ml-1'>(尚未用作上下文)</span>
                      )}
                    </div>
                    <div className='flex gap-1'>
                      <ButtonGroup>
                        <Button
                          size='sm'
                          color='default' // 使用默认颜色，区分与其他操作
                          variant='flat'
                          onClick={() => {
                            appCodeStore.viewState.selectedModules = []
                          }}
                          startContent={<Icon icon='mdi:selection-remove' className='w-3 h-3' />}
                          className='min-w-unit-16 h-6'
                        >
                          清空
                        </Button>
                        <Button
                          size='sm'
                          color='danger'
                          variant='flat'
                          isLoading={appCodeStore.viewState.isDeletingModules}
                          onClick={() => {
                            appCodeStore.viewState.showDeleteConfirm = true
                          }}
                          startContent={
                            !appCodeStore.viewState.isDeletingModules && <Icon icon='mdi:delete' className='w-3 h-3' />
                          }
                          className='min-w-unit-16 h-6'
                        >
                          {appCodeStore.viewState.isDeletingModules ? "检查依赖中..." : "删除"}
                        </Button>
                        <Button
                          size='sm'
                          color='primary'
                          variant='flat'
                          onClick={() => appCodeStore.toggleUseSelectedModulesAsContext()}
                          startContent={
                            <Icon icon='material-symbols:contextual-token-add-rounded' className='w-3 h-3' />
                          }
                          className='min-w-unit-16 h-6'
                        >
                          {appCodeStore.viewState.useSelectedModulesAsContext ? "取消上下文" : "用作上下文"}
                        </Button>
                      </ButtonGroup>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          <AnimatePresence mode='popLayout'>
            {noResults ? (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className='text-center py-8 text-default-400'
              >
                <Icon icon='mdi:file-search-outline' className='w-12 h-12 mx-auto mb-2 opacity-50' />
                <div className='text-sm'>未找到匹配的模块</div>
              </motion.div>
            ) : (
              filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  whileHover={{ x: 5 }}
                  className={`
                    group relative rounded-lg border border-transparent
                    ${
                      appCodeStore.viewState.selectedCodeId === item.id
                        ? "bg-primary/5 border-primary/10 shadow-sm"
                        : "hover:border-default-100 hover:bg-default-50/50"
                    }
                    t-all duration-300 ease-in-out
                  `}
                >
                  <div className='flex items-center gap-2 px-2 py-2'>
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
                            appCodeStore.viewState.selectedModules = appCodeStore?.viewState?.selectedModules?.filter(
                              (id) => id !== item.id
                            )
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className='transition-transform group-hover:scale-110'
                        classNames={{
                          wrapper: "w-3 h-3",
                        }}
                      />
                    )}

                    <div
                      className='flex-1 flex items-center gap-2 cursor-pointer min-w-0'
                      onClick={() => appCodeStore.handleCodeSelect(item.id)}
                    >
                      <div className='flex-1 min-w-0'>
                        <span className='text-sm font-medium truncate tracking-wide leading-snug block'>
                          {item.title}
                        </span>
                        <div className='flex items-center gap-2 text-xs text-default-400'>
                          <span className='truncate tracking-wide'>{item.name}</span>
                          <span className='flex-shrink-0'>
                            {new Date(item.updatedAt).toLocaleString("zh-CN", {
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>

                      <div className='flex items-center gap-2'>
                        {/* 添加模块大小显示 */}
                        <Tooltip content='模块大小' placement='left'>
                          <Chip
                            size='sm'
                            variant='flat'
                            color={getModuleSizeColor(calculateModuleSize(item.code))}
                            className='transition-transform group-hover:scale-105'
                          >
                            {formatSize(calculateModuleSize(item.code))}
                          </Chip>
                        </Tooltip>

                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                        >
                          <div className='w-5 h-5 rounded-md bg-default-50 flex items-center justify-center flex-shrink-0'>
                            <Icon
                              icon={getCodeTypeIcon(item.type)}
                              className={`w-3 h-3 transition-transform group-hover:scale-110 text-${getCodeTypeColor(
                                item.type
                              )}`}
                            />
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
      <SaveContextModal isOpen={showSaveContextModal} onClose={() => setShowSaveContextModal(false)} />
    </div>
  )
})

export default ModuleList