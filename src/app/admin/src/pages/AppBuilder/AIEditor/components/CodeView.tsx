// ... (前面的import保持不变)

export const CodeView: React.FC<CodeViewProps> = observer(
  ({ appId, showCodeTab, selectedTab, isFullWidth = false, onFullWidthChange }) => {
    // ... (保持原有的状态和ref定义)

    // 新增批量删除相关的UI处理函数
    const handleDeleteSelected = async () => {
      if (!appCodeStore.viewState.selectedModules.length) return
      
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

    // ... (保持原有的其他函数不变)

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
                    {appCodeStore.viewState.selectedModules.length > 0 && (
                      <div className='mb-2 flex items-center justify-between bg-danger-50 p-2 rounded-lg'>
                        <span className='text-sm text-danger'>
                          已选择 {appCodeStore.viewState.selectedModules.length} 个模块
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
                              {item.type !== 'app' && (
                                <Checkbox
                                  size="sm"
                                  isSelected={appCodeStore.viewState.selectedModules.includes(item.id)}
                                  onValueChange={(checked) => {
                                    if (checked) {
                                      appCodeStore.viewState.selectedModules = [
                                        ...appCodeStore.viewState.selectedModules,
                                        item.id
                                      ]
                                    } else {
                                      appCodeStore.viewState.selectedModules = 
                                        appCodeStore.viewState.selectedModules.filter(id => id !== item.id)
                                    }
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              )}
                              
                              <div 
                                className="flex-1 flex items-center gap-2"
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

            {/* 保持原有的编辑器部分不变 */}
            <div className='flex-1 relative mt-2'>
              {/* ... 原有的编辑器代码 ... */}
            </div>
          </div>
        </motion.div>

        {/* 新增: 删除确认对话框 */}
        <Modal
          isOpen={appCodeStore.viewState.showDeleteConfirm}
          onClose={() => appCodeStore.viewState.showDeleteConfirm = false}
          size='sm'
        >
          <ModalContent>
            <ModalHeader className='flex flex-col gap-1'>确认删除</ModalHeader>
            <ModalBody>
              <div className='flex flex-col gap-2'>
                <p className='text-danger'>警告：此操作将删除选中的 {appCodeStore.viewState.selectedModules.length} 个模块！</p>
                <p className='text-default-500'>删除后可以通过版本回退恢复，是否确认继续？</p>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button 
                variant='flat' 
                onPress={() => appCodeStore.viewState.showDeleteConfirm = false}
              >
                取消
              </Button>
              <Button 
                color='danger' 
                onPress={handleDeleteSelected}
              >
                确认删除
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* 保持原有的其他Modal组件不变 */}
        {/* ... */}
      </div>
    )
  }
)