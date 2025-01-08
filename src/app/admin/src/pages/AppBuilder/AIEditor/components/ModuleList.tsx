import React from "react"
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
  return (
    <div className='p-2'>
      {/* 批量操作按钮 - 使用固定定位确保始终可见 */}
      {appCodeStore?.viewState?.selectedModules?.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className='sticky top-0 z-10 mb-2'
        >
          <Card className='bg-default-100/80 backdrop-blur-sm shadow-sm'>
            <div className='p-3 flex flex-col gap-2'>
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
                    className='transition-transform hover:scale-105 active:scale-95'
                  >
                    删除
                  </Button>
                  <Button
                    size='sm'
                    color={appCodeStore.viewState.useSelectedModulesAsContext ? 'primary' : 'default'}
                    variant={appCodeStore.viewState.useSelectedModulesAsContext ? 'solid' : 'flat'}
                    onClick={() => appCodeStore.toggleUseSelectedModulesAsContext()}
                    startContent={<Icon icon='mdi:brain' className='w-4 h-4' />}
                    className='transition-transform hover:scale-105 active:scale-95'
                  >
                    用作上下文
                  </Button>
                </div>
              </div>
              {appCodeStore.viewState.useSelectedModulesAsContext && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className='text-xs bg-default-50/80 backdrop-blur-sm p-3 rounded-lg'
                >
                  <div className='font-medium mb-2'>当前上下文模块：</div>
                  <div className='flex flex-wrap gap-1'>
                    {appCodeStore.getSelectedModulesInfo().map((module) => (
                      <Chip
                        key={module.id}
                        size='sm'
                        variant='flat'
                        color={getCodeTypeColor(module.type)}
                        startContent={<Icon icon={getCodeTypeIcon(module.type)} className='w-3 h-3' />}
                        className='transition-transform hover:scale-105'
                      >
                        {module.title || module.name}
                      </Chip>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </Card>
        </motion.div>
      )}

      {/* 搜索区域 - 添加搜索建议和高级筛选 */}
      <div className='space-y-2 mb-4'>
        <div className='flex gap-2'>
          <Input
            type='text'
            placeholder='搜索代码内容...'
            value={appCodeStore.viewState.searchContent}
            onChange={(e) => appCodeStore.setSearchContent(e.target.value)}
            startContent={
              <Icon 
                icon='mdi:code-search' 
                className='text-default-400 transition-transform group-hover:scale-110'
              />
            }
            className='w-full group'
            classNames={{
              inputWrapper: 'shadow-sm hover:shadow transition-shadow duration-200',
              input: 'text-sm',
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

      {/* 模块列表 - 添加网格布局选项 */}
      <ScrollShadow className='h-[calc(100vh-400px)]'>
        <div className='space-y-2'>
          <AnimatePresence mode='popLayout'>
            {appCodeStore.getFilteredCodeItems().map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                whileHover={{ x: 5, backgroundColor: 'rgba(0,0,0,0.02)' }}
                className={`
                  group relative rounded-xl border border-transparent
                  ${appCodeStore.viewState.selectedCodeId === item.id 
                    ? 'bg-primary/5 border-primary/20 shadow-sm' 
                    : 'hover:border-default-200'
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
                        className={`w-5 h-5 transition-transform group-hover:scale-110
                          ${appCodeStore.viewState.selectedCodeId === item.id ? 'text-primary' : 'text-default-600'}
                        `}
                      />
                    </div>

                    <Tooltip content={item.title} placement='right'>
                      <div className='flex flex-col flex-1 min-w-0'>
                        <div className='flex items-center gap-2'>
                          <span className='text-sm font-medium truncate max-w-[150px]'>{item.title}</span>
                          <Chip 
                            size='sm' 
                            variant='flat' 
                            color={getCodeTypeColor(item.type)} 
                            className='text-[10px] h-4'
                          >
                            {item.type}
                          </Chip>
                        </div>
                        <span className='text-xs text-default-400'>
                          {new Date(item.updatedAt).toLocaleString()}
                        </span>
                      </div>
                    </Tooltip>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollShadow>
    </div>
  )
})

export default ModuleList