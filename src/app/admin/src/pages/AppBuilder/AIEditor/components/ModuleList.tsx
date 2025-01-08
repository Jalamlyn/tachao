import React from "react"
import { Input, ScrollShadow, Tooltip, Chip, Checkbox, Button } from "@nextui-org/react"
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
      {/* 批量操作按钮 */}
      {appCodeStore?.viewState?.selectedModules?.length > 0 && (
        <div className='mb-2 flex flex-col gap-2 bg-default-100 p-2 rounded-lg'>
          <div className='flex items-center justify-between'>
            <span className='text-sm'>已选择 {appCodeStore?.viewState?.selectedModules?.length} 个模块</span>
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
                color={appCodeStore.viewState.useSelectedModulesAsContext ? 'primary' : 'default'}
                variant={appCodeStore.viewState.useSelectedModulesAsContext ? 'solid' : 'flat'}
                onClick={() => appCodeStore.toggleUseSelectedModulesAsContext()}
                startContent={<Icon icon='mdi:brain' className='w-4 h-4' />}
              >
                用作上下文
              </Button>
            </div>
          </div>
          {appCodeStore.viewState.useSelectedModulesAsContext && (
            <div className='text-xs text-default-500 bg-default-50 p-2 rounded'>
              <div className='font-medium mb-1'>当前上下文模块：</div>
              <div className='flex flex-wrap gap-1'>
                {appCodeStore.getSelectedModulesInfo().map((module) => (
                  <Chip
                    key={module.id}
                    size='sm'
                    variant='flat'
                    color={getCodeTypeColor(module.type)}
                    startContent={<Icon icon={getCodeTypeIcon(module.type)} className='w-3 h-3' />}
                  >
                    {module.title || module.name}
                  </Chip>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 搜索框 */}
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

      {/* 模块列表 */}
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
                  />
                )}

                <div className='flex-1 flex items-center gap-2' onClick={() => appCodeStore.handleCodeSelect(item.id)}>
                  <Icon icon={getCodeTypeIcon(item.type)} className='w-4 h-4 flex-shrink-0' />
                  <Tooltip content={item.title} placement='right'>
                    <div className='flex flex-col flex-1 min-w-0'>
                      <div className='flex items-center gap-2'>
                        <span className='text-sm truncate max-w-[150px]'>{item.title}</span>
                        <Chip size='sm' variant='flat' color={getCodeTypeColor(item.type)} className='text-[10px] h-4'>
                          {item.type}
                        </Chip>
                      </div>
                      <span className='text-xs opacity-70'>{new Date(item.updatedAt).toLocaleString()}</span>
                    </div>
                  </Tooltip>
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